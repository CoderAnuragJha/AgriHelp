import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertCropSchema, insertInventorySchema, insertTaskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Crops
  app.get("/api/crops", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const crops = await storage.getCropsByUserId(req.user!.id);
    res.json(crops);
  });

  app.post("/api/crops", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const validated = insertCropSchema.parse(req.body);
    const crop = await storage.createCrop(req.user!.id, validated);
    res.status(201).json(crop);
  });

  // Inventory
  app.get("/api/inventory", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const items = await storage.getInventoryByUserId(req.user!.id);
    res.json(items);
  });

  app.post("/api/inventory", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const validated = insertInventorySchema.parse(req.body);
    const item = await storage.createInventoryItem(req.user!.id, validated);
    res.status(201).json(item);
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tasks = await storage.getTasksByUserId(req.user!.id);
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const validated = insertTaskSchema.parse(req.body);
    const task = await storage.createTask(req.user!.id, validated);
    res.status(201).json(task);
  });

  app.patch("/api/tasks/:id/complete", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const taskId = parseInt(req.params.id);
    const task = await storage.completeTask(req.user!.id, taskId);
    if (!task) return res.sendStatus(404);
    res.json(task);
  });

  const httpServer = createServer(app);
  return httpServer;
}
