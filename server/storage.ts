import { 
  type User, 
  type InsertUser, 
  type Dealer, 
  type InsertDealer,
  type Part, 
  type InsertPart,
  type Search, 
  type InsertSearch,
  type Review, 
  type InsertReview,
  type Contact, 
  type InsertContact,
  type DealerWithParts,
  type SearchResult
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Dealer operations
  getDealer(id: string): Promise<Dealer | undefined>;
  getDealerByUserId(userId: string): Promise<Dealer | undefined>;
  createDealer(dealer: InsertDealer): Promise<Dealer>;
  updateDealer(id: string, updates: Partial<Dealer>): Promise<Dealer | undefined>;
  getAllDealers(): Promise<Dealer[]>;
  getPendingDealers(): Promise<Dealer[]>;
  verifyDealer(id: string): Promise<Dealer | undefined>;
  
  // Part operations
  getPart(id: string): Promise<Part | undefined>;
  getPartsByDealerId(dealerId: string): Promise<Part[]>;
  createPart(part: InsertPart): Promise<Part>;
  updatePart(id: string, updates: Partial<Part>): Promise<Part | undefined>;
  deletePart(id: string): Promise<boolean>;
  searchParts(criteria: {
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string;
    partName?: string;
  }): Promise<SearchResult[]>;
  
  // Search operations
  createSearch(search: InsertSearch): Promise<Search>;
  getUserSearches(userId: string): Promise<Search[]>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getDealerReviews(dealerId: string): Promise<Review[]>;
  updateDealerRating(dealerId: string): Promise<void>;
  
  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  getDealerContacts(dealerId: string): Promise<Contact[]>;
  
  // Analytics
  getAnalytics(): Promise<{
    totalDealers: number;
    totalParts: number;
    totalSearches: number;
    pendingVerifications: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private dealers: Map<string, Dealer>;
  private parts: Map<string, Part>;
  private searches: Map<string, Search>;
  private reviews: Map<string, Review>;
  private contacts: Map<string, Contact>;

  constructor() {
    this.users = new Map();
    this.dealers = new Map();
    this.parts = new Map();
    this.searches = new Map();
    this.reviews = new Map();
    this.contacts = new Map();
    
    // Initialize with some demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo admin user
    const adminId = randomUUID();
    const admin: User = {
      id: adminId,
      username: "admin",
      password: "admin123",
      email: "admin@partsfinder.com",
      role: "admin",
      createdAt: new Date()
    };
    this.users.set(adminId, admin);

    // Create demo dealer users and dealers
    const dealer1UserId = randomUUID();
    const dealer1User: User = {
      id: dealer1UserId,
      username: "autopartsghana",
      password: "dealer123",
      email: "contact@autopartsghana.com",
      role: "dealer",
      createdAt: new Date()
    };
    this.users.set(dealer1UserId, dealer1User);

    const dealer1Id = randomUUID();
    const dealer1: Dealer = {
      id: dealer1Id,
      userId: dealer1UserId,
      shopName: "Auto Parts Ghana",
      description: "Specializing in Toyota and Honda parts since 2015",
      address: "Shop 45, Abossey Okai Market",
      phone: "+233201234567",
      whatsapp: "+233201234567",
      location: { lat: 5.5777, lng: -0.2309 },
      verified: true,
      rating: "4.8",
      reviewCount: "124",
      createdAt: new Date()
    };
    this.dealers.set(dealer1Id, dealer1);

    // Create demo parts
    const part1Id = randomUUID();
    const part1: Part = {
      id: part1Id,
      dealerId: dealer1Id,
      name: "Brake Pad Set - Front",
      description: "High quality brake pads for Toyota Camry",
      price: "180.00",
      vehicleMake: "Toyota",
      vehicleModel: "Camry",
      vehicleYear: "2020-2023",
      availability: "in_stock",
      imageUrl: "/uploads/image-1757875127652-621218824.jpg",
      createdAt: new Date()
    };
    this.parts.set(part1Id, part1);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || "buyer",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Dealer operations
  async getDealer(id: string): Promise<Dealer | undefined> {
    return this.dealers.get(id);
  }

  async getDealerByUserId(userId: string): Promise<Dealer | undefined> {
    return Array.from(this.dealers.values()).find(dealer => dealer.userId === userId);
  }

  async createDealer(insertDealer: InsertDealer): Promise<Dealer> {
    const id = randomUUID();
    const dealer: Dealer = {
      ...insertDealer,
      id,
      description: insertDealer.description || null,
      whatsapp: insertDealer.whatsapp || null,
      location: insertDealer.location || null,
      verified: false,
      rating: "0",
      reviewCount: "0",
      createdAt: new Date()
    };
    this.dealers.set(id, dealer);
    return dealer;
  }

  async updateDealer(id: string, updates: Partial<Dealer>): Promise<Dealer | undefined> {
    const dealer = this.dealers.get(id);
    if (!dealer) return undefined;
    
    const updatedDealer = { ...dealer, ...updates };
    this.dealers.set(id, updatedDealer);
    return updatedDealer;
  }

  async getAllDealers(): Promise<Dealer[]> {
    return Array.from(this.dealers.values());
  }

  async getPendingDealers(): Promise<Dealer[]> {
    return Array.from(this.dealers.values()).filter(dealer => !dealer.verified);
  }

  async verifyDealer(id: string): Promise<Dealer | undefined> {
    return this.updateDealer(id, { verified: true });
  }

  // Part operations
  async getPart(id: string): Promise<Part | undefined> {
    return this.parts.get(id);
  }

  async getPartsByDealerId(dealerId: string): Promise<Part[]> {
    return Array.from(this.parts.values()).filter(part => part.dealerId === dealerId);
  }

  async createPart(insertPart: InsertPart): Promise<Part> {
    const id = randomUUID();
    const part: Part = {
      ...insertPart,
      id,
      description: insertPart.description || null,
      price: insertPart.price || null,
      vehicleMake: insertPart.vehicleMake || null,
      vehicleModel: insertPart.vehicleModel || null,
      vehicleYear: insertPart.vehicleYear || null,
      imageUrl: insertPart.imageUrl || null,
      createdAt: new Date()
    };
    this.parts.set(id, part);
    return part;
  }

  async updatePart(id: string, updates: Partial<Part>): Promise<Part | undefined> {
    const part = this.parts.get(id);
    if (!part) return undefined;
    
    const updatedPart = { ...part, ...updates };
    this.parts.set(id, updatedPart);
    return updatedPart;
  }

  async deletePart(id: string): Promise<boolean> {
    return this.parts.delete(id);
  }

  async searchParts(criteria: {
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string;
    partName?: string;
  }): Promise<SearchResult[]> {
    const parts = Array.from(this.parts.values()).filter(part => {
      if (criteria.vehicleMake && part.vehicleMake?.toLowerCase() !== criteria.vehicleMake.toLowerCase()) {
        return false;
      }
      if (criteria.vehicleModel && part.vehicleModel?.toLowerCase() !== criteria.vehicleModel.toLowerCase()) {
        return false;
      }
      if (criteria.vehicleYear && !part.vehicleYear?.includes(criteria.vehicleYear)) {
        return false;
      }
      if (criteria.partName && !part.name.toLowerCase().includes(criteria.partName.toLowerCase())) {
        return false;
      }
      return true;
    });

    const dealerPartsMap = new Map<string, { dealer: Dealer; matchingParts: Part[] }>();

    for (const part of parts) {
      const dealer = this.dealers.get(part.dealerId);
      if (!dealer) continue;

      const user = this.users.get(dealer.userId);
      if (!user) continue;

      const dealerWithParts: DealerWithParts = {
        ...dealer,
        parts: await this.getPartsByDealerId(dealer.id),
        user: { username: user.username, email: user.email }
      };

      if (dealerPartsMap.has(dealer.id)) {
        dealerPartsMap.get(dealer.id)!.matchingParts.push(part);
      } else {
        dealerPartsMap.set(dealer.id, {
          dealer: dealerWithParts,
          matchingParts: [part]
        });
      }
    }

    return Array.from(dealerPartsMap.values()).map(({ dealer, matchingParts }) => ({
      dealer,
      matchingParts
    }));
  }

  // Search operations
  async createSearch(insertSearch: InsertSearch): Promise<Search> {
    const id = randomUUID();
    const search: Search = {
      ...insertSearch,
      id,
      userId: insertSearch.userId || null,
      vehicleMake: insertSearch.vehicleMake || null,
      vehicleModel: insertSearch.vehicleModel || null,
      vehicleYear: insertSearch.vehicleYear || null,
      partName: insertSearch.partName || null,
      imageUrl: insertSearch.imageUrl || null,
      createdAt: new Date()
    };
    this.searches.set(id, search);
    return search;
  }

  async getUserSearches(userId: string): Promise<Search[]> {
    return Array.from(this.searches.values()).filter(search => search.userId === userId);
  }

  // Review operations
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      comment: insertReview.comment || null,
      createdAt: new Date()
    };
    this.reviews.set(id, review);
    
    // Update dealer rating
    await this.updateDealerRating(insertReview.dealerId);
    
    return review;
  }

  async getDealerReviews(dealerId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.dealerId === dealerId);
  }

  async updateDealerRating(dealerId: string): Promise<void> {
    const reviews = await this.getDealerReviews(dealerId);
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + parseFloat(review.rating.toString()), 0);
    const avgRating = totalRating / reviews.length;

    await this.updateDealer(dealerId, {
      rating: avgRating.toFixed(2),
      reviewCount: reviews.length.toString()
    });
  }

  // Contact operations
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt: new Date()
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getDealerContacts(dealerId: string): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(contact => contact.dealerId === dealerId);
  }

  // Analytics
  async getAnalytics(): Promise<{
    totalDealers: number;
    totalParts: number;
    totalSearches: number;
    pendingVerifications: number;
  }> {
    return {
      totalDealers: this.dealers.size,
      totalParts: this.parts.size,
      totalSearches: this.searches.size,
      pendingVerifications: Array.from(this.dealers.values()).filter(d => !d.verified).length
    };
  }
}

export const storage = new MemStorage();
