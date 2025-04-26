import { users, type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  getAllPosts(): Promise<Post[]>;
  getPostsByAuthor(authorId: number): Promise<Post[]>;
  getPostsByCategory(category: string): Promise<Post[]>;
  searchPosts(query: string): Promise<Post[]>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: number): Promise<Comment[]>;
  deleteComment(id: number): Promise<boolean>;
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  currentUserId: number;
  currentPostId: number;
  currentCommentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.currentUserId = 1;
    this.currentPostId = 1;
    this.currentCommentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Create admin user
    this.users.set(1, {
      id: 1,
      username: "admin",
      password: "admin",
      fullName: "Admin User",
      isAdmin: true,
    });
    this.currentUserId++;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Post methods
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const now = new Date();
    const post: Post = { 
      ...insertPost, 
      id, 
      createdAt: now 
    };
    this.posts.set(id, post);
    return post;
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async updatePost(id: number, postUpdate: Partial<InsertPost>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...postUpdate };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }

  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values());
  }

  async getPostsByAuthor(authorId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      (post) => post.authorId === authorId
    );
  }

  async getPostsByCategory(category: string): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      (post) => post.category === category
    );
  }

  async searchPosts(query: string): Promise<Post[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.posts.values()).filter(
      (post) => 
        post.title.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery) ||
        post.tags?.toLowerCase().includes(lowerQuery)
    );
  }

  // Comment methods
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const now = new Date();
    const comment: Comment = { 
      ...insertComment, 
      id,
      createdAt: now
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.postId === postId
    );
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }
}

export const storage = new MemStorage();
