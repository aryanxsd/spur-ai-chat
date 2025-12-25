import { Router } from "express";
import { db } from "../db/database";

const router = Router();

router.get("/:sessionId", (req, res) => {
  const sessionId = Number(req.params.sessionId);

  if (!sessionId) {
    return res.status(400).json({ error: "Invalid sessionId" });
  }

  const conversation = db
    .prepare(`SELECT id FROM conversations WHERE id = ?`)
    .get(sessionId);

  if (!conversation) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  const messages = db
    .prepare(
      `
      SELECT sender, text
      FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
      `
    )
    .all(sessionId);

  return res.json({ messages });
});

export default router;
