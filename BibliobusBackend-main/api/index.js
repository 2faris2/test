import express from "express";
import cors from "cors";
import routes from "../routes/index.js";
import { logger } from "../middleware/logger.middleware.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(logger);
app.use("/", routes);

// 404 handler
app.get("/ping", async (req, res) => {
  res.send("pong");
});
app.use((req, res) => {
  res.status(404).send("Route not found");
});

// Export za Vercel serverless
export default (req, res) => app(req, res);
