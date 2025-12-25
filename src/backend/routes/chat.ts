import { Router } from "express";
import { db } from "../db/database";
import { generateReply, Message } from "../services/llm";

const router = Router();

/* ---------------- POST /chat/message ---------------- */
router.post("/message", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    let conversationId: number;

    if (sessionId) {
      const convo = db
        .prepare("SELECT id FROM conversations WHERE id = ?")
        .get(sessionId);

      if (!convo) {
        return res.status(400).json({ error: "Invalid sessionId" });
      }

      conversationId = sessionId;
    } else {
      const result = db.prepare(
        "INSERT INTO conversations DEFAULT VALUES"
      ).run();
      conversationId = Number(result.lastInsertRowid);
    }

    const history = db
      .prepare(
        `SELECT sender, text FROM messages
         WHERE conversationId = ?
         ORDER BY createdAt ASC`
      )
      .all(conversationId) as Message[];

    db.prepare(
      `INSERT INTO messages (conversationId, sender, text)
       VALUES (?, 'user', ?)`
    ).run(conversationId, message);

    let reply = "Sorry, something went wrong.";
    try {
      reply = await generateReply(history, message);
    } catch (e) {
      console.error("LLM error:", e);
    }

    const aiResult = db.prepare(
      `INSERT INTO messages (conversationId, sender, text)
       VALUES (?, 'ai', ?)`
    ).run(conversationId, reply);

    const aiMessage = db.prepare(
      `SELECT text, createdAt FROM messages WHERE id = ?`
    ).get(aiResult.lastInsertRowid) as { text: string; createdAt: string } | undefined;

    if (!aiMessage || typeof aiMessage.text !== "string" || typeof aiMessage.createdAt !== "string") {
      return res.status(500).json({ error: "Failed to retrieve AI message" });
    }

    return res.json({
      reply: aiMessage.text,
      createdAt: aiMessage.createdAt,
      sessionId: conversationId,
    });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/* ---------------- GET /chat/history ---------------- */
router.get("/history", (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId" });
  }

  try {
    const messages = db.prepare(
      `SELECT sender, text, createdAt
       FROM messages
       WHERE conversationId = ?
       ORDER BY createdAt ASC`
    ).all(Number(sessionId));

    return res.json({ messages });
  } catch (err) {
    console.error("History error:", err);
    return res.status(500).json({ error: "Failed to load history" });
  }
});

export default router;
