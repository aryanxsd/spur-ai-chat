import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat";

const app = express();

/**
 * ✅ VERY IMPORTANT
 * Allow frontend (5173) to talk to backend (3001)
 */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

app.use("/chat", chatRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
