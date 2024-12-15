// TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
// Refer to the Next.js Docs on how to read the Request body: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// Refer to the Groq SDK here on how to use an LLM: https://www.npmjs.com/package/groq-sdk
// Refer to the Cheerio docs here on how to parse HTML: https://cheerio.js.org/docs/basics/loading
// Refer to Puppeteer docs here: https://pptr.dev/guides/what-is-puppeteer


// With Groq API Key and web crawler
import { Groq } from "groq-sdk";
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

async function crawlWebsite(url: string, depth: number = 2, maxLinksPerPage: number = 5): Promise<string> {
  if (depth <= 0) return '';

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 60000 // 60 seconds timeout
    });
    
    const html = await page.content();
    await browser.close();
    
    const $ = cheerio.load(html);
    let content = $('body').text().trim();

    // Extract links
    const links = $('a')
      .map((_, element) => $(element).attr('href'))
      .get()
      .filter(href => href && href.startsWith('http'))
      .slice(0, maxLinksPerPage);

    // Recursively crawl linked pages
    for (const link of links) {
      content += await crawlWebsite(link, depth - 1, maxLinksPerPage);
    }

    return content;
  } catch (error) {
    console.error('Error crawling website:', error);
    return `Error crawling website: ${error}`;
  }
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const urls = extractUrls(message);
    const cleanMessage = message.replace(new RegExp(urls.join('|'), 'g'), '').trim();

    let scrapedText = '';
    if (urls.length > 0) {
      for (const url of urls) {
        scrapedText += await crawlWebsite(url);
      }
      scrapedText = scrapedText.slice(0, 5000); // Limit context size
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant. If URLs were provided, use the scraped content to inform your answers." },
        { role: "user", content: `${cleanMessage}\n\n${urls.length > 0 ? `Context from URLs: ${scrapedText}` : ''}` }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 500,
    });

    const response = chatCompletion.choices[0]?.message?.content || "No response generated.";

    return new Response(JSON.stringify({ response }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error || 'An error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}



/*
// With Groq API Key, web crawler and URLs images (for URLs images don't works very well)
import { Groq } from "groq-sdk";
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

function extractUrls(text: string): { webUrls: string[], imageUrls: string[] } {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const allUrls = text.match(urlRegex) || [];
  const imageUrls = allUrls.filter(url => url.match(/\.(jpeg|jpg|gif|png)$/i));
  const webUrls = allUrls.filter(url => !imageUrls.includes(url));
  return { webUrls, imageUrls };
}

async function crawlWebsite(url: string, depth: number = 2, maxLinksPerPage: number = 5): Promise<string> {
   // ... (keep the existing crawlWebsite function unchanged)
  
  if (depth <= 0) return '';

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 60000 // 60 seconds timeout
    });
    
    const html = await page.content();
    await browser.close();
    
    const $ = cheerio.load(html);
    let content = $('body').text().trim();

    // Extract links
    const links = $('a')
      .map((_, element) => $(element).attr('href'))
      .get()
      .filter(href => href && href.startsWith('http'))
      .slice(0, maxLinksPerPage);

    // Recursively crawl linked pages
    for (const link of links) {
      content += await crawlWebsite(link, depth - 1, maxLinksPerPage);
    }

    return content;
  } catch (error) {
    console.error('Error crawling website:', error);
    return `Error crawling website: ${error}`;
  }
}


export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const { webUrls, imageUrls } = extractUrls(message);
    const cleanMessage = message.replace(new RegExp([...webUrls, ...imageUrls].join('|'), 'g'), '').trim();

    let scrapedText = '';
    if (webUrls.length > 0) {
      for (const url of webUrls) {
        scrapedText += await crawlWebsite(url);
      }
      scrapedText = scrapedText.slice(0, 5000); // Limit context size
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    let fullContent = cleanMessage;
    if (scrapedText) {
      fullContent += `\n\nContext from URLs: ${scrapedText}`;
    }
    if (imageUrls.length > 0) {
      fullContent += `\n\nImage URLs found:\n${imageUrls.join('\n')}`;

    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant. If URLs were provided, use the scraped content to inform your answers or if is URLs images make a description of images." },
        { role: "user", content: `${fullContent}\n\n${webUrls.length > 0?`Context from URLs: ${scrapedText}` : ''}` },
        
      ],
      model: "llama-3.3-70b-versatile",//model: "llama-3.2-11b-vision-preview",  // model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 500,
    });

    const response = chatCompletion.choices[0]?.message?.content || "No response generated.";

    return new Response(JSON.stringify({ response }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error || 'An error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
*/


/*
// some functions imports from utils folder
import { NextResponse } from "next/server";
import { getGroqResponse } from "@/app/utils/groqClient";
import { scrapeUrl, urlPattern } from "@/app/utils/scraper";


export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    //console.log("message received:", message);
    //console.log("messages received:", messages);
    
    const url = message.match(urlPattern); 

    let scrapedContent = "";

    if (url) {
      //console.log("Url found", url);
      const scraperResponse = await scrapeUrl(url);
      console.log("Scraped content", scrapedContent); 
      if (scraperResponse) {
        scrapedContent = scraperResponse.content;
      }
    }

     // Extract the user's query by removing the URL if present
    const userQuery = message.replace(url ? url[0] : '', '').trim();

    const prompt = 
       `Answer my question: "${userQuery}"

        Based on the following content:
        <content>
        ${scrapedContent}
        </content>`;
    
    //console.log("PROMPT:", prompt);
    
    const response = await getGroqResponse(prompt);

    return NextResponse.json({ message: response });

  } catch (error) {
    return NextResponse.json({ error });
    // return NextResponse.json({ message: "Error" });
  }
}
*/

/*
// if you want to use message and messages for json, decomment or use 
// body: JSON.stringify({ message, messages}), in src/app/page.tsx and use 
// const { message, messages} = await req.json(); in src/app/api/chat/route.ts and use 
// src/app/utils/groqClient.ts for 
// export async function getGroqResponse(chatMessages: ChatMessage[]) {..., ...[... ...chatMessages], ...} 
// some functions imports from utils folder
import { NextResponse } from "next/server";
import { getGroqResponse } from "@/app/utils/groqClient";
import { scrapeUrl, urlPattern } from "@/app/utils/scraper";


export async function POST(req: Request) {
  try {
    const { message, messages } = await req.json();
    
    //console.log("message received:", message);
    //console.log("messages received:", messages);
    
    const url = message.match(urlPattern); 

    let scrapedContent = "";

    if (url) {
      //console.log("Url found", url);
      const scraperResponse = await scrapeUrl(url);
      console.log("Scraped content", scrapedContent); 
      if (scraperResponse) {
        scrapedContent = scraperResponse.content;
      }
    }

     // Extract the user's query by removing the URL if present
    const userQuery = message.replace(url ? url[0] : '', '').trim();

    const userPrompt = 
       `Answer my question: "${userQuery}"

        Based on the following content:
        <content>
        ${scrapedContent}
        </content>`;
    

    const llmMessages = [
    ...messages,
    {
        role: "user",
        content: userPrompt,
      },
    ];

    //console.log("route.ts", llmMessages); 
    //console.log("userPROMPT:", userPrompt); 
    
    const response = await getGroqResponse(llmMessages);

    //console.log("In route.ts post response");

    return NextResponse.json({ message: response });

  } catch (error) {
    console.log(error);
    return NextResponse.json({ error });
    // return NextResponse.json({ message: "Error" });
  }
}

*/


/*
// With Groq API Key
import { Groq } from "groq-sdk";
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';


function extractUrl(text: string): string | null {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
}

async function scrapeWebsite(url: string) {
  try {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL provided');
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 60000 // 60 seconds timeout
    });
    
    const html = await page.content();
    await browser.close();
    
    const $ = cheerio.load(html);
    return $('body').text().trim();
  } catch (error) {
    console.error('Error scraping website:', error);
    return `Error scraping website: ${error.message}`;
  }
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const url = extractUrl(message);
    const cleanMessage = message.replace(url, '').trim();

    let scrapedText = '';
    if (url) {
      scrapedText = await scrapeWebsite(url);
      scrapedText = scrapedText.slice(0, 2000); // Limit context size
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant. If a URL was provided, use the scraped content to inform your answers." },
        { role: "user", content: `${cleanMessage}\n\n${url ? `Context from URL (${url}): ${scrapedText}` : ''}` }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 500,
    });

    const response = chatCompletion.choices[0]?.message?.content || "No response generated.";

    return new Response(JSON.stringify({ response }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'An error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

*/

/*
//With Google API Key and web crawler
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

async function crawlWebsite(url: string, depth: number = 1, maxDepth: number = 3): Promise<{ content: string, urls: string[] }> {
  if (depth > maxDepth) {
    return { content: '', urls: [] };
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    const pageContent = $('body').text().trim();
    const links = $('a').map((_, el) => $(el).attr('href')).get();
    const validLinks = links.filter(link => link && link.startsWith('http')).slice(0, 5);

    let allContent = pageContent;
    let allUrls = [url, ...validLinks];

    for (const link of validLinks) {
      const { content, urls } = await crawlWebsite(link, depth + 1, maxDepth);
      allContent += '\n\n' + content;
      allUrls = [...allUrls, ...urls];
    }

    return { content: allContent, urls: [...new Set(allUrls)] };
  } catch (error) {
    console.error('Error crawling website:', error);
    return { content: `Error crawling website: ${error.message}`, urls: [] };
  }
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const urls = extractUrls(message);
    const cleanMessage = message.replace(new RegExp(urls.join('|'), 'g'), '').trim();

    let crawledContent = '';
    let crawledUrls: string[] = [];

    if (urls.length > 0) {
      const { content, urls: crawledUrlsList } = await crawlWebsite(urls[0]);
      crawledContent = content.slice(0, 5000); // Limit context size
      crawledUrls = crawledUrlsList;
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are a helpful assistant. Use the following crawled content to inform your answers if relevant:
      ${crawledContent}

      User's message: ${cleanMessage}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return new Response(JSON.stringify({ response, crawledUrls }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'An error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
*/



/*
/ TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
// Refer to the Next.js Docs on how to read the Request body: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// Refer to the Groq SDK here on how to use an LLM: https://www.npmjs.com/package/groq-sdk
// Refer to the Cheerio docs here on how to parse HTML: https://cheerio.js.org/docs/basics/loading
// Refer to Puppeteer docs here: https://pptr.dev/guides/what-is-puppeteer

export async function POST(req: Request) {
  try {


  } catch (error) {


  }
}
*/