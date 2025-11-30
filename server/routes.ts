import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { userAnswerSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/questions", async (req, res) => {
    try {
      const questions = await storage.getQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  app.post("/api/validate", async (req, res) => {
    try {
      const validatedAnswer = userAnswerSchema.parse(req.body);
      const result = await storage.validateAnswer(validatedAnswer);
      res.json(result);
    } catch (error) {
      console.error("Error validating answer:", error);
      res.status(400).json({ error: "Invalid answer format" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
