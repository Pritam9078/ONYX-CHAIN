import { 
  users, type User, type InsertUser,
  files, type File, type InsertFile
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(walletAddress: string, updates: Partial<User>): Promise<User | undefined>;
  
  getFiles(walletAddress: string): Promise<File[]>;
  getFile(id: number): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  deleteFile(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private files: Map<number, File>;
  private userIdCounter: number;
  private fileIdCounter: number;

  constructor() {
    this.users = new Map();
    this.files = new Map();
    this.userIdCounter = 1;
    this.fileIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(walletAddress: string, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.getUserByWalletAddress(walletAddress);
    if (!user) {
      return undefined;
    }
    
    // Update the user with the new data, excluding the ID and wallet address
    const { id, walletAddress: _, ...updatableFields } = updates;
    const updatedUser: User = { ...user, ...updatableFields };
    
    // Save the updated user
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }

  async getFiles(walletAddress: string): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.walletAddress === walletAddress,
    );
  }

  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.fileIdCounter++;
    const now = new Date();
    const file: File = { ...insertFile, id, uploadTimestamp: now };
    this.files.set(id, file);
    return file;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }
}

export const storage = new MemStorage();
