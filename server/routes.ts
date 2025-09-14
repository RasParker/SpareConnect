import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertDealerSchema,
  insertPartSchema,
  insertSearchSchema,
  insertReviewSchema,
  insertContactSchema,
} from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import path from 'path';

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

  // Dealer routes
  app.get("/api/dealers", async (req, res) => {
    try {
      const dealers = await storage.getAllDealers();
      res.json(dealers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/dealers/:id", async (req, res) => {
    try {
      const dealer = await storage.getDealer(req.params.id);
      if (!dealer) {
        return res.status(404).json({ message: "Dealer not found" });
      }
      
      const parts = await storage.getPartsByDealerId(dealer.id);
      const user = await storage.getUser(dealer.userId);
      
      res.json({
        ...dealer,
        parts,
        user: user ? { username: user.username, email: user.email } : null
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/dealers", async (req, res) => {
    try {
      const dealerData = insertDealerSchema.parse(req.body);
      const dealer = await storage.createDealer(dealerData);
      res.json(dealer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/dealers/:id", async (req, res) => {
    try {
      const updates = req.body;
      const dealer = await storage.updateDealer(req.params.id, updates);
      if (!dealer) {
        return res.status(404).json({ message: "Dealer not found" });
      }
      res.json(dealer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/dealers/:id/verify", async (req, res) => {
    try {
      const dealer = await storage.verifyDealer(req.params.id);
      if (!dealer) {
        return res.status(404).json({ message: "Dealer not found" });
      }
      res.json(dealer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/dealers/pending/verification", async (req, res) => {
    try {
      const dealers = await storage.getPendingDealers();
      res.json(dealers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Part routes
  app.get("/api/parts", async (req, res) => {
    try {
      const { dealerId } = req.query;
      if (dealerId) {
        const parts = await storage.getPartsByDealerId(dealerId as string);
        return res.json(parts);
      }
      
      // Return all parts if no dealer specified
      const dealers = await storage.getAllDealers();
      const allParts = [];
      for (const dealer of dealers) {
        const parts = await storage.getPartsByDealerId(dealer.id);
        allParts.push(...parts);
      }
      res.json(allParts);
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

  app.get("/api/reviews/:dealerId", async (req, res) => {
    try {
      const reviews = await storage.getDealerReviews(req.params.dealerId);
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

  const httpServer = createServer(app);
  return httpServer;
}
