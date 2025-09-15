import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertSellerSchema,
  insertPartSchema,
  insertSearchSchema,
  insertReviewSchema,
  insertContactSchema,
} from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import path from 'path';
import express from 'express';
import { seedDatabase } from './seed';

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve uploaded images statically
  app.use('/uploads', express.static(path.resolve('uploads')));
  
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, you'd use proper session management
      res.json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Seller routes
  app.get("/api/sellers", async (req, res) => {
    try {
      const sellers = await storage.getAllSellers();
      res.json(sellers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sellers/:id", async (req, res) => {
    try {
      const seller = await storage.getSeller(req.params.id);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }
      
      const parts = await storage.getPartsBySellerId(seller.id);
      const user = await storage.getUser(seller.userId);
      
      res.json({
        ...seller,
        parts,
        user: user ? { username: user.username, email: user.email } : null
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sellers", async (req, res) => {
    try {
      const sellerData = insertSellerSchema.parse(req.body);
      const seller = await storage.createSeller(sellerData);
      res.json(seller);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/sellers/:id", async (req, res) => {
    try {
      const updates = req.body;
      const seller = await storage.updateSeller(req.params.id, updates);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }
      res.json(seller);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sellers/:id/verify", async (req, res) => {
    try {
      const seller = await storage.verifySeller(req.params.id);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }
      res.json(seller);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sellers/pending/verification", async (req, res) => {
    try {
      const sellers = await storage.getPendingSellers();
      res.json(sellers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Part routes
  app.get("/api/parts", async (req, res) => {
    try {
      const { sellerId } = req.query;
      if (sellerId) {
        const parts = await storage.getPartsBySellerId(sellerId as string);
        return res.json(parts);
      }
      
      // Return all parts with seller information if no seller specified
      const partsWithSeller = await storage.getAllPartsWithSeller();
      res.json(partsWithSeller);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/parts", upload.single('image'), async (req, res) => {
    try {
      const partData = insertPartSchema.parse({
        ...req.body,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null
      });
      const part = await storage.createPart(partData);
      res.json(part);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/parts/:id", upload.single('image'), async (req, res) => {
    try {
      const updates = {
        ...req.body,
        ...(req.file && { imageUrl: `/uploads/${req.file.filename}` })
      };
      const part = await storage.updatePart(req.params.id, updates);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }
      res.json(part);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/parts/:id", async (req, res) => {
    try {
      const success = await storage.deletePart(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Part not found" });
      }
      res.json({ message: "Part deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Search routes
  app.post("/api/search", async (req, res) => {
    try {
      const searchCriteria = req.body;
      
      // Create search record if user is logged in
      if (searchCriteria.userId) {
        const searchData = insertSearchSchema.parse(searchCriteria);
        await storage.createSearch(searchData);
      }
      
      const results = await storage.searchParts({
        vehicleMake: searchCriteria.vehicleMake,
        vehicleModel: searchCriteria.vehicleModel,
        vehicleYear: searchCriteria.vehicleYear,
        partName: searchCriteria.partName,
      });
      
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/searches/:userId", async (req, res) => {
    try {
      const searches = await storage.getUserSearches(req.params.userId);
      res.json(searches);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Review routes
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/reviews/:sellerId", async (req, res) => {
    try {
      const reviews = await storage.getSellerReviews(req.params.sellerId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Contact routes
  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.json(contact);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // File upload route for search images
  app.post("/api/upload/search-image", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      res.json({ imageUrl: `/uploads/${req.file.filename}` });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Database seeding route (for development)
  app.post("/api/seed", async (req, res) => {
    try {
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Seeding only allowed in development" });
      }
      
      const stats = await seedDatabase();
      res.json({ 
        message: "Database seeded successfully", 
        stats 
      });
    } catch (error: any) {
      console.error("Seeding error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
