---
title: About this site and this assistant
tags: this site, website, portfolio, how built, how does this work, assistant, ai, chatbot, rag, langgraph, groq, break my ai, planet, 3d
---
## How this assistant works
I'm a retrieval-augmented assistant. Your question goes through a small LangGraph pipeline on the server: a guard checks for prompt injection, a fast model rewrites follow-up questions into a standalone search, BM25 retrieval finds the most relevant notes in Farhan's knowledge base, Llama 3.3 on Groq writes the answer only from those notes, and an output check makes sure nothing private or made-up gets through. If the notes don't cover a question, I say so and point you to Farhan's email.

## How this site is built
The portfolio is a small 3D planet you walk around: React and Vite with three.js for the scene, Lenis for smooth scrolling and serverless functions on Vercel for the AI features, which run on Groq's Llama 3.3.

## Break my AI
The "Break my AI" section is a live challenge: the AI guards a harmless secret code behind four layers of defence based on the OWASP LLM Top 10, and visitors try to get it out with prompt injection and jailbreaks. So far the secret has never leaked.
