import { IStorage } from "./storage";
import type { User, InsertUser, Crop, Inventory, Task } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private crops: Map<number, Crop>;
  private inventory: Map<number, Inventory>;  
  private tasks: Map<number, Task>;
  sessionStore: session.Store;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.crops = new Map();
    this.inventory = new Map();
    this.tasks = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCropsByUserId(userId: number): Promise<Crop[]> {
    return Array.from(this.crops.values()).filter(
      (crop) => crop.userId === userId,
    );
  }

  async createCrop(userId: number, crop: Omit<Crop, "id" | "userId">): Promise<Crop> {
    const id = this.currentId++;
    const newCrop = { ...crop, id, userId };
    this.crops.set(id, newCrop);
    return newCrop;
  }

  async getInventoryByUserId(userId: number): Promise<Inventory[]> {
    return Array.from(this.inventory.values()).filter(
      (item) => item.userId === userId,
    );
  }

  async createInventoryItem(userId: number, item: Omit<Inventory, "id" | "userId">): Promise<Inventory> {
    const id = this.currentId++;
    const newItem = { ...item, id, userId };
    this.inventory.set(id, newItem);
    return newItem;
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId,
    );
  }

  async createTask(userId: number, task: Omit<Task, "id" | "userId">): Promise<Task> {
    const id = this.currentId++;
    const newTask = { ...task, id, userId };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async completeTask(userId: number, taskId: number): Promise<Task | undefined> {
    const task = this.tasks.get(taskId);
    if (!task || task.userId !== userId) return undefined;
    const updatedTask = { ...task, completed: true };
    this.tasks.set(taskId, updatedTask);
    return updatedTask;
  }
}

export const storage = new MemStorage();
