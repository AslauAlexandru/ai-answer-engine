# Week 7 Headstarter Accelerator Project 7 AI Answer Engine
# AI Answer Engine

## Getting Started

First, clone the repository and install the dependencies:
```bash
git clone https://github.com/team-headstart/ai-answer-engine.git
```
or
```bash
git clone https://github.com/AslauAlexandru/ai-answer-engine
```


Navigate to the project directory:
```bash
cd ai-answer-engine
```

Then, install the dependencies:

```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tasks

- Take a look at the TODOs throughout the repo, namely:

    - `src/app/page.tsx`: Update the UI and handle the API response as needed
 
    - `src/app/api/chat/route.ts`: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
 
    - `src/middleware.ts`: Implement the code here to add rate limiting with Redis


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.


## From challenges
**From challenges I have done this**: Implement a hierarchical web crawler that starts at a given URL and identifies 
all relevant links on the page (e.g., hyperlinks, embedded media links, 
and scrapes the content from those links as well.
You can check [here](https://github.com/AslauAlexandru/ai-answer-engine/blob/main/src/app/api/chat/route.ts).

# Project Statement 

AI Answer Engine
​For this project, you will be building an AI Answer Engine with Next.js and 
TypeScript to help answer questions that are based on sources.


​For this project, you will be building an AI Answer Engine with Next.js 
and TypeScript that can scrape content from websites and mitigates 
hallucinations by citing its sources when providing answers. 
This project is inspired by Perplexity.ai https://www.perplexity.ai/, 
a company currently valued at over $9 Billion.

​Here is an example of what you can expect to build: https://www.webchat.so/

**Getting Started**

- Clone this [GitHub Repository](https://github.com/team-headstart/ai-answer-engine)
- Take a look at the TODOs throughout the repo, namely:
  - src/app/page.tsx: Update the UI and handle the API response as needed
  - src/app/api/chat/route.ts: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
  - src/middleware.ts: Implement the code here to add rate limiting with Redis

**Project Submission Requirements**

A chat interface where a user can:

- Paste in a set of URLs and get a response back with the context of all the URLs through an LLM
- Ask a question and get an answer with sources cited
- Share their conversation with others, and let them continue with their conversation

**Challenges (Attempt these after you have finished the requirements above)**

- Build a comprehensive solution to extract content from any kind of URL or data source, 
such as YouTube videos, PDFs, CSV files, and images
- Generate visualizations from the data such as bar charts, line charts, histograms, etc.
- Implement a hierarchical web crawler that starts at a given URL and identifies 
all relevant links on the page (e.g., hyperlinks, embedded media links, 
and scrapes the content from those links as well 



**Resources:**

[How to Build a Web Scraper API with Puppeteer](https://www.youtube.com/watch?v=kOdIzhPfLuo)

[API Routes with Next.js](https://www.youtube.com/watch?v=gEB3ckYeZF4)

[Rate Limiting your Nextjs 14 APIs using ‪Upstash‬](https://www.youtube.com/watch?v=6QhLdQlyZJc)

[How to use Redis Caching](https://www.youtube.com/watch?v=-5RTyEim384)




