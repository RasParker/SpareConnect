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
  type SearchResult,
  users,
  dealers,
  parts,
  searches,
  reviews,
  contacts
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, count, avg } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  constructor() {
    // Database storage - no initialization needed
  }


  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Dealer operations
  async getDealer(id: string): Promise<Dealer | undefined> {
    const [dealer] = await db.select().from(dealers).where(eq(dealers.id, id)).limit(1);
    return dealer;
  }

  async getDealerByUserId(userId: string): Promise<Dealer | undefined> {
    const [dealer] = await db.select().from(dealers).where(eq(dealers.userId, userId)).limit(1);
    return dealer;
  }

  async createDealer(insertDealer: InsertDealer): Promise<Dealer> {
    const [dealer] = await db.insert(dealers).values(insertDealer).returning();
    return dealer;
  }

  async updateDealer(id: string, updates: Partial<Dealer>): Promise<Dealer | undefined> {
    const [dealer] = await db.update(dealers)
      .set(updates)
      .where(eq(dealers.id, id))
      .returning();
    return dealer;
  }

  async getAllDealers(): Promise<Dealer[]> {
    return await db.select().from(dealers);
  }

  async getPendingDealers(): Promise<Dealer[]> {
    return await db.select().from(dealers).where(eq(dealers.verified, false));
  }

  async verifyDealer(id: string): Promise<Dealer | undefined> {
    return this.updateDealer(id, { verified: true });
  }

  // Part operations
  async getPart(id: string): Promise<Part | undefined> {
    const [part] = await db.select().from(parts).where(eq(parts.id, id)).limit(1);
    return part;
  }

  async getPartsByDealerId(dealerId: string): Promise<Part[]> {
    return await db.select().from(parts).where(eq(parts.dealerId, dealerId));
  }

  async createPart(insertPart: InsertPart): Promise<Part> {
    const [part] = await db.insert(parts).values({
      ...insertPart,
      availability: insertPart.availability || 'in_stock'
    }).returning();
    return part;
  }

  async updatePart(id: string, updates: Partial<Part>): Promise<Part | undefined> {
    const [part] = await db.update(parts)
      .set(updates)
      .where(eq(parts.id, id))
      .returning();
    return part;
  }

  async deletePart(id: string): Promise<boolean> {
    const result = await db.delete(parts).where(eq(parts.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchParts(criteria: {
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string;
    partName?: string;
  }): Promise<SearchResult[]> {
    // Build WHERE conditions dynamically
    const conditions = [];
    if (criteria.vehicleMake) {
      conditions.push(ilike(parts.vehicleMake, `%${criteria.vehicleMake}%`));
    }
    if (criteria.vehicleModel) {
      conditions.push(ilike(parts.vehicleModel, `%${criteria.vehicleModel}%`));
    }
    if (criteria.vehicleYear) {
      conditions.push(ilike(parts.vehicleYear, `%${criteria.vehicleYear}%`));
    }
    if (criteria.partName) {
      conditions.push(ilike(parts.name, `%${criteria.partName}%`));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
    const matchingParts = await db.select().from(parts)
      .where(whereCondition);

    const dealerPartsMap = new Map<string, { dealer: DealerWithParts; matchingParts: Part[] }>();

    for (const part of matchingParts) {
      const dealer = await this.getDealer(part.dealerId);
      if (!dealer) continue;

      const user = await this.getUser(dealer.userId);
      if (!user) continue;

      const allDealerParts = await this.getPartsByDealerId(dealer.id);
      const dealerWithParts: DealerWithParts = {
        ...dealer,
        parts: allDealerParts,
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

    return Array.from(dealerPartsMap.values());
  }

  // Search operations
  async createSearch(insertSearch: InsertSearch): Promise<Search> {
    const [search] = await db.insert(searches).values(insertSearch).returning();
    return search;
  }

  async getUserSearches(userId: string): Promise<Search[]> {
    return await db.select().from(searches).where(eq(searches.userId, userId));
  }

  // Review operations
  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    
    // Update dealer rating
    await this.updateDealerRating(insertReview.dealerId);
    
    return review;
  }

  async getDealerReviews(dealerId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.dealerId, dealerId));
  }

  async updateDealerRating(dealerId: string): Promise<void> {
    const dealerReviews = await this.getDealerReviews(dealerId);
    if (dealerReviews.length === 0) return;

    const totalRating = dealerReviews.reduce((sum, review) => sum + parseFloat(review.rating.toString()), 0);
    const avgRating = totalRating / dealerReviews.length;

    await this.updateDealer(dealerId, {
      rating: avgRating.toFixed(2),
      reviewCount: dealerReviews.length.toString()
    });
  }

  // Contact operations
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async getDealerContacts(dealerId: string): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.dealerId, dealerId));
  }

  // Analytics
  async getAnalytics(): Promise<{
    totalDealers: number;
    totalParts: number;
    totalSearches: number;
    pendingVerifications: number;
  }> {
    const [{ totalDealers }] = await db.select({ totalDealers: count() }).from(dealers);
    const [{ totalParts }] = await db.select({ totalParts: count() }).from(parts);
    const [{ totalSearches }] = await db.select({ totalSearches: count() }).from(searches);
    const [{ pendingVerifications }] = await db.select({ pendingVerifications: count() })
      .from(dealers).where(eq(dealers.verified, false));

    return {
      totalDealers,
      totalParts,
      totalSearches,
      pendingVerifications
    };
  }
}

export const storage = new DatabaseStorage();
