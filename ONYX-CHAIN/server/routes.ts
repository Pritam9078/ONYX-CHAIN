import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertFileSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if wallet address already exists
      const existingUser = await storage.getUserByWalletAddress(userData.walletAddress);
      if (existingUser) {
        return res.status(200).json(existingUser);
      }
      
      // Create a new user with the wallet address
      const user = await storage.createUser({
        ...userData,
        username: userData.walletAddress, // Use wallet address as username
        password: "", // Password not needed for Web3 auth
      });
      
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: fromZodError(error).message 
        });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/wallet/:address", async (req: Request, res: Response) => {
    try {
      const walletAddress = req.params.address;
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      const user = await storage.getUserByWalletAddress(walletAddress);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update user profile
  app.patch("/api/users/profile/:address", async (req: Request, res: Response) => {
    try {
      const walletAddress = req.params.address;
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      // Get the current user
      const user = await storage.getUserByWalletAddress(walletAddress);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Extract the updatable fields from the request body
      const { displayName, profileImage } = req.body;
      
      // Update the user profile
      const updatedUser = await storage.updateUser(walletAddress, { 
        displayName, 
        profileImage 
      });
      
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update user preferences
  app.patch("/api/users/preferences/:address", async (req: Request, res: Response) => {
    try {
      const walletAddress = req.params.address;
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      // Get the current user
      const user = await storage.getUserByWalletAddress(walletAddress);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Extract preferences from the request body
      const { darkMode, animations, notifications } = req.body;
      
      // Create preferences object and convert to JSON string
      const preferences = JSON.stringify({
        darkMode: darkMode !== undefined ? darkMode : true,
        animations: animations !== undefined ? animations : true,
        notifications: notifications !== undefined ? notifications : true
      });
      
      // Update the user preferences
      const updatedUser = await storage.updateUser(walletAddress, { preferences });
      
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // File routes
  app.post("/api/files", async (req: Request, res: Response) => {
    try {
      const fileData = insertFileSchema.parse(req.body);
      const file = await storage.createFile(fileData);
      return res.status(201).json(file);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: fromZodError(error).message 
        });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/files/:walletAddress", async (req: Request, res: Response) => {
    try {
      const walletAddress = req.params.walletAddress;
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      const files = await storage.getFiles(walletAddress);
      return res.status(200).json(files);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/files/detail/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }
      
      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      return res.status(200).json(file);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/files/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }
      
      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      const success = await storage.deleteFile(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete file" });
      }
      
      return res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
