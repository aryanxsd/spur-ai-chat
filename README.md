# Tech Stack
Frontend

SvelteKit

TypeScript

Fetch API

LocalStorage for session persistence

# Backend

Node.js + TypeScript

Express.js

SQLite (via better-sqlite3)

CORS enabled

LLM

Groq API

Model: LLaMA 3 (70B)

Prompted as a customer support agent

Deployment

Backend: Render (with persistent disk for SQLite)

Frontend: Vercel

# Project Structure
spur-ai-chat/
├── src/
│   ├── backend/
│   │   ├── db/              # SQLite setup & schema
│   │   ├── routes/          # Express routes
│   │   ├── services/        # LLM integration
│   │   └── server.ts        # App entry point
│   └── frontend/
│       └── src/routes/
│           └── +page.svelte # Chat UI
├── dist/                    # Compiled backend (tsc)
├── package.json
└── README.md

# How to Run Locally (Step by Step)
1️⃣ Clone the Repository
git clone https://github.com/aryanxsd/spur-ai-chat.git
cd spur-ai-chat

2️⃣ Install Dependencies
npm install

3️⃣ Configure Environment Variables

Create a .env file in the project root:

GROQ_API_KEY=your_groq_api_key_here


# Run the Backend
npm run dev


Backend will run on:

http://localhost:3001


# Test quickly:

curl -X POST http://localhost:3001/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Do you ship to USA?"}'

# Run the Frontend
cd src/frontend
npm install
npm run dev


Frontend will run on:

http://localhost:5173

# Database Setup

Database: SQLite

Automatically initialized on backend startup

No manual migrations required

Tables
conversations

id

createdAt

messages

id

conversationId

sender (user | ai)

text

createdAt

SQLite file location:

Local: ./data/chat.db

Production (Render): /var/data/chat.db (persistent disk)

# Backend API Endpoints
POST /chat/message

Request:

{
  "message": "What is your return policy?",
  "sessionId": 1
}


Response:

{
  "reply": "We offer a 30-day return policy...",
  "sessionId": 1
}

GET /chat/history?sessionId=1

Response:

{
  "messages": [
    { "sender": "user", "text": "Hi", "createdAt": "..." },
    { "sender": "ai", "text": "Hello!", "createdAt": "..." }
  ]
}

# LLM Notes

Provider: Groq

Model: LLaMA 3 (70B)

Prompting Strategy:

System prompt defines the AI as a helpful e-commerce support agent

Conversation history is passed for contextual replies

Guardrails included for graceful error handling

# Example system prompt:

You are a helpful customer support agent for a small e-commerce store.
Answer clearly and concisely.

# Architecture Overview
Backend

Routes layer: Handles HTTP input & validation

Services layer: Encapsulates LLM calls

DB layer: Manages persistence & schema

Clear separation of concerns for extensibility (e.g. WhatsApp, IG)

Frontend

Stateless UI

Session handled via localStorage

Auto-loads chat history on refresh

Graceful UI states (loading, typing indicator)

# Design Decisions & Trade-offs

SQLite chosen for simplicity and speed (sufficient for MVP)

Single conversation per browser session (no auth required)

No streaming responses to keep implementation simple

Explicit backend URLs instead of proxy for deployment clarity
