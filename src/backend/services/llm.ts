import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export type Message = {
  sender: "user" | "ai";
  text: string;
};

export async function generateReply(
  history: Message[],
  userMessage: string
): Promise<string> {
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful customer support agent for a small e-commerce store. Answer clearly and concisely.",
    },
    ...history.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    })),
    { role: "user", content: userMessage },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama3-70b-8192", // ✅ NOT deprecated
    messages: messages as any,
  });

  return completion.choices[0]?.message?.content ?? "Sorry, something went wrong.";
}
