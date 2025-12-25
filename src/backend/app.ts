import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat";

const app = express();

// ✅ ALLOW FRONTEND
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

app.use("/chat", chatRoutes);

export default app;
