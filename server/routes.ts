import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameScoreSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all cricket players
  app.get("/api/cricket-players", async (req, res) => {
    try {
      const players = await storage.getAllCricketPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cricket players" });
    }
  });

  // Save game score
  app.post("/api/game-scores", async (req, res) => {
    try {
      const validatedData = insertGameScoreSchema.parse(req.body);
      const score = await storage.saveGameScore(validatedData);
      res.json(score);
    } catch (error) {
      res.status(400).json({ message: "Invalid score data" });
    }
  });

  // Get top scores
  app.get("/api/top-scores", async (req, res) => {
    try {
      const scores = await storage.getTopScores();
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top scores" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
