import { 
  type User, 
  type InsertUser, 
  type Seller, 
  type InsertSeller,
  type Part, 
  type InsertPart,
  type Search, 
  type InsertSearch,
  type Review, 
  type InsertReview,
  type Contact, 
  type InsertContact,
  type SellerWithParts,
  type SearchResult,
  users,
  sellers,
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
  
  // Seller operations
  getSeller(id: string): Promise<Seller | undefined>;
  getSellerByUserId(userId: string): Promise<Seller | undefined>;
  createSeller(seller: InsertSeller): Promise<Seller>;
  updateSeller(id: string, updates: Partial<Seller>): Promise<Seller | undefined>;
  getAllSellers(): Promise<Seller[]>;
  getPendingSellers(): Promise<Seller[]>;
  verifySeller(id: string): Promise<Seller | undefined>;
  
  // Part operations
  getPart(id: string): Promise<Part | undefined>;
  getPartsBySellerId(sellerId: string): Promise<Part[]>;
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
  getSellerReviews(sellerId: string): Promise<Review[]>;
  updateSellerRating(sellerId: string): Promise<void>;
  
  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  getSellerContacts(sellerId: string): Promise<Contact[]>;
  
  // Analytics
  getAnalytics(): Promise<{
    totalSellers: number;
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

  // Seller operations
  async getSeller(id: string): Promise<Seller | undefined> {
    const [seller] = await db.select().from(sellers).where(eq(sellers.id, id)).limit(1);
    return seller;
  }

  async getSellerByUserId(userId: string): Promise<Seller | undefined> {
    const [seller] = await db.select().from(sellers).where(eq(sellers.userId, userId)).limit(1);
    return seller;
  }

  async createSeller(insertSeller: InsertSeller): Promise<Seller> {
    const [seller] = await db.insert(sellers).values(insertSeller).returning();
    return seller;
  }

  async updateSeller(id: string, updates: Partial<Seller>): Promise<Seller | undefined> {
    const [seller] = await db.update(sellers)
      .set(updates)
      .where(eq(sellers.id, id))
      .returning();
    return seller;
  }

  async getAllSellers(): Promise<Seller[]> {
    return await db.select().from(sellers);
  }

  async getPendingSellers(): Promise<Seller[]> {
    return await db.select().from(sellers).where(eq(sellers.verified, false));
  }

  async verifySeller(id: string): Promise<Seller | undefined> {
    return this.updateSeller(id, { verified: true });
  }

  // Part operations
  async getPart(id: string): Promise<Part | undefined> {
    const [part] = await db.select().from(parts).where(eq(parts.id, id)).limit(1);
    return part;
  }

  async getPartsBySellerId(sellerId: string): Promise<Part[]> {
    return await db.select().from(parts).where(eq(parts.sellerId, sellerId));
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

    const sellerPartsMap = new Map<string, { seller: SellerWithParts; matchingParts: Part[] }>();

    for (const part of matchingParts) {
      const seller = await this.getSeller(part.sellerId);
      if (!seller) continue;

      const user = await this.getUser(seller.userId);
      if (!user) continue;

      const allSellerParts = await this.getPartsBySellerId(seller.id);
      const sellerWithParts: SellerWithParts = {
        ...seller,
        parts: allSellerParts,
        user: { username: user.username, email: user.email }
      };

      if (sellerPartsMap.has(seller.id)) {
        sellerPartsMap.get(seller.id)!.matchingParts.push(part);
      } else {
        sellerPartsMap.set(seller.id, {
          seller: sellerWithParts,
          matchingParts: [part]
        });
      }
    }

    return Array.from(sellerPartsMap.values());
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
    
    // Update seller rating
    await this.updateSellerRating(insertReview.sellerId);
    
    return review;
  }

  async getSellerReviews(sellerId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.sellerId, sellerId));
  }

  async updateSellerRating(sellerId: string): Promise<void> {
    const sellerReviews = await this.getSellerReviews(sellerId);
    if (sellerReviews.length === 0) return;

    const totalRating = sellerReviews.reduce((sum, review) => sum + parseFloat(review.rating.toString()), 0);
    const avgRating = totalRating / sellerReviews.length;

    await this.updateSeller(sellerId, {
      rating: avgRating.toFixed(2),
      reviewCount: sellerReviews.length.toString()
    });
  }

  // Contact operations
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async getSellerContacts(sellerId: string): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.sellerId, sellerId));
  }

  // Analytics
  async getAnalytics(): Promise<{
    totalSellers: number;
    totalParts: number;
    totalSearches: number;
    pendingVerifications: number;
  }> {
    const [{ totalSellers }] = await db.select({ totalSellers: count() }).from(sellers);
    const [{ totalParts }] = await db.select({ totalParts: count() }).from(parts);
    const [{ totalSearches }] = await db.select({ totalSearches: count() }).from(searches);
    const [{ pendingVerifications }] = await db.select({ pendingVerifications: count() })
      .from(sellers).where(eq(sellers.verified, false));

    return {
      totalSellers,
      totalParts,
      totalSearches,
      pendingVerifications
    };
  }
}

export const storage = new DatabaseStorage();
