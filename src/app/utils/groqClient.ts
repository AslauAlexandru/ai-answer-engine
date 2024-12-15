import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function getGroqResponse(message: string) {
  const messages: ChatMessage[] = [
    { role: "system", content: "You are a helpful assistant. If a URL was provided, use the scraped content to inform your answers." },
    { role: "user", content: message },
  ];

  //console.log("Starting groq api request");
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
  });
  
  //console.log("Received groq api request", response);

  return response.choices[0].message.content;

}

/*
// Only if you use in src/app/api/chat/route.ts const { message, messages} = await req.json(); and
// body: JSON.stringify({ message, messages}), in src/app/page.tsx

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function getGroqResponse(chatMessages: ChatMessage[]) {
  const messages: ChatMessage[] = [
    { role: "system", 
      content: "You are a helpful assistant. If a URL was provided, use the scraped content to inform your answers." 
    },
    ...chatMessages
  ];

   //console.log("messages", messages);
  //console.log("Starting groq api request");
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
  });
  
  //console.log("Received groq api request", response);

  return response.choices[0].message.content;

}

*/