import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  users, 
  sellers, 
  parts, 
  reviews, 
  searches, 
  contacts,
  type InsertUser,
  type InsertSeller,
  type InsertPart,
  type InsertReview,
  type InsertSearch,
  type InsertContact
} from "@shared/schema";

// Sample data for seeding the database
const sampleUsers: InsertUser[] = [
  {
    username: "admin",
    password: "admin123",
    email: "admin@partsmarketplace.com",
    role: "admin"
  },
  {
    username: "john_buyer",
    password: "password123",
    email: "john@email.com",
    role: "buyer"
  },
  {
    username: "autoparts_pro",
    password: "seller123",
    email: "contact@autopartspro.com",
    role: "seller"
  },
  {
    username: "quickparts",
    password: "quick123",
    email: "info@quickparts.com",
    role: "seller"
  },
  {
    username: "carzone_parts",
    password: "carzone123",
    email: "sales@carzone.com",
    role: "seller"
  },
  {
    username: "engine_experts",
    password: "engine123",
    email: "parts@engineexperts.com",
    role: "seller"
  },
  {
    username: "sarah_buyer",
    password: "password123",
    email: "sarah@email.com",
    role: "buyer"
  }
];

const sampleSellers: Omit<InsertSeller, 'userId'>[] = [
  {
    shopName: "AutoParts Pro",
    description: "Premium quality auto parts for all makes and models. Over 20 years of experience in the industry.",
    address: "123 Industrial Ave, Auto District, Mumbai 400001",
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    location: { lat: 19.0760, lng: 72.8777 }
  },
  {
    shopName: "QuickParts Express",
    description: "Fast delivery, genuine parts, competitive prices. Your one-stop shop for automotive needs.",
    address: "456 Speed Lane, Car Market, Delhi 110002",
    phone: "+91 98765 43211",
    whatsapp: "+91 98765 43211",
    location: { lat: 28.6139, lng: 77.2090 }
  },
  {
    shopName: "CarZone Parts",
    description: "Specializing in European and Japanese car parts. Quality guaranteed.",
    address: "789 Motor Street, Parts Hub, Bangalore 560001",
    phone: "+91 98765 43212",
    whatsapp: "+91 98765 43212",
    location: { lat: 12.9716, lng: 77.5946 }
  },
  {
    shopName: "Engine Experts",
    description: "Engine parts specialists. From small components to complete engine rebuilds.",
    address: "321 Engine Road, Mechanic Colony, Chennai 600001",
    phone: "+91 98765 43213",
    whatsapp: "+91 98765 43213",
    location: { lat: 13.0827, lng: 80.2707 }
  }
];

// Additional data for updating sellers after creation
const sellerUpdates = [
  { verified: true, rating: "4.5", reviewCount: "28" },
  { verified: true, rating: "4.2", reviewCount: "45" },
  { verified: false, rating: "0", reviewCount: "0" },
  { verified: true, rating: "4.8", reviewCount: "67" }
];

const sampleParts: Omit<InsertPart, 'sellerId'>[] = [
  // AutoParts Pro inventory
  {
    name: "Brake Pads Set - Front",
    description: "High-quality ceramic brake pads for superior stopping power and reduced noise.",
    price: "2500.00",
    vehicleMake: "Honda",
    vehicleModel: "City",
    vehicleYear: "2020",
    availability: "in_stock"
  },
  {
    name: "Air Filter",
    description: "Premium air filter for improved engine performance and fuel efficiency.",
    price: "850.00",
    vehicleMake: "Honda",
    vehicleModel: "City",
    vehicleYear: "2020",
    availability: "in_stock"
  },
  {
    name: "Headlight Assembly - Right",
    description: "OEM quality headlight assembly with LED technology.",
    price: "8500.00",
    vehicleMake: "Honda",
    vehicleModel: "Civic",
    vehicleYear: "2019",
    availability: "low_stock"
  },
  
  // QuickParts Express inventory  
  {
    name: "Engine Oil Filter",
    description: "High-efficiency oil filter for optimal engine protection.",
    price: "450.00",
    vehicleMake: "Maruti",
    vehicleModel: "Swift",
    vehicleYear: "2021",
    availability: "in_stock"
  },
  {
    name: "Spark Plugs Set",
    description: "Iridium spark plugs for better ignition and fuel economy.",
    price: "1200.00",
    vehicleMake: "Maruti",
    vehicleModel: "Swift",
    vehicleYear: "2021",
    availability: "in_stock"
  },
  {
    name: "Radiator",
    description: "High-performance radiator for efficient cooling system.",
    price: "6500.00",
    vehicleMake: "Hyundai",
    vehicleModel: "i20",
    vehicleYear: "2020",
    availability: "in_stock"
  },
  
  // Engine Experts inventory
  {
    name: "Turbocharger Assembly",
    description: "Remanufactured turbocharger with 12-month warranty.",
    price: "35000.00",
    vehicleMake: "Volkswagen",
    vehicleModel: "Polo",
    vehicleYear: "2018",
    availability: "low_stock"
  },
  {
    name: "Timing Belt Kit",
    description: "Complete timing belt kit including tensioner and water pump.",
    price: "4500.00",
    vehicleMake: "Toyota",
    vehicleModel: "Corolla",
    vehicleYear: "2019",
    availability: "in_stock"
  },
  {
    name: "Cylinder Head Gasket",
    description: "Multi-layer steel head gasket for superior sealing.",
    price: "2800.00",
    vehicleMake: "Toyota",
    vehicleModel: "Innova",
    vehicleYear: "2020",
    availability: "in_stock"
  },
  
  // CarZone Parts inventory
  {
    name: "Suspension Strut - Front Left",
    description: "Gas-filled suspension strut for smooth ride quality.",
    price: "7500.00",
    vehicleMake: "BMW",
    vehicleModel: "3 Series",
    vehicleYear: "2017",
    availability: "out_of_stock"
  },
  {
    name: "Brake Disc Rotor - Front",
    description: "Ventilated brake disc for improved heat dissipation.",
    price: "3500.00",
    vehicleMake: "Audi",
    vehicleModel: "A4",
    vehicleYear: "2018",
    availability: "in_stock"
  }
];

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");
  
  try {
    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await db.delete(contacts);
    await db.delete(reviews);
    await db.delete(searches);
    await db.delete(parts);
    await db.delete(sellers);
    await db.delete(users);
    
    // Insert users
    console.log("👥 Creating users...");
    const createdUsers = await db.insert(users).values(sampleUsers).returning();
    console.log(`✅ Created ${createdUsers.length} users`);
    
    // Insert sellers (mapping to seller user accounts)
    console.log("🏪 Creating sellers...");
    const sellersWithUserIds = sampleSellers.map((seller, index) => ({
      ...seller,
      userId: createdUsers[index + 2].id // Skip admin and first buyer
    }));
    
    const createdSellers = await db.insert(sellers).values(sellersWithUserIds).returning();
    console.log(`✅ Created ${createdSellers.length} sellers`);
    
    // Update sellers with verification status and ratings
    console.log("🔄 Updating seller verification and ratings...");
    for (let i = 0; i < createdSellers.length; i++) {
      await db.update(sellers)
        .set(sellerUpdates[i])
        .where(eq(sellers.id, createdSellers[i].id));
    }
    
    // Insert parts (mapping to sellers)
    console.log("🔧 Creating parts...");
    const partsWithSellerIds: InsertPart[] = [];
    
    // Distribute parts among sellers
    sampleParts.forEach((part, index) => {
      const sellerIndex = Math.floor(index / 3); // 3 parts per seller roughly
      if (sellerIndex < createdSellers.length) {
        partsWithSellerIds.push({
          ...part,
          sellerId: createdSellers[sellerIndex].id
        });
      }
    });
    
    const createdParts = await db.insert(parts).values(partsWithSellerIds).returning();
    console.log(`✅ Created ${createdParts.length} parts`);
    
    // Insert sample reviews
    console.log("⭐ Creating reviews...");
    const sampleReviews: InsertReview[] = [
      {
        userId: createdUsers[1].id, // john_buyer
        sellerId: createdSellers[0].id, // AutoParts Pro
        rating: "5.0",
        comment: "Excellent quality parts and fast delivery. Highly recommended!"
      },
      {
        userId: createdUsers[6].id, // sarah_buyer
        sellerId: createdSellers[0].id, // AutoParts Pro
        rating: "4.0",
        comment: "Good parts but slightly expensive. Quick service though."
      },
      {
        userId: createdUsers[1].id, // john_buyer
        sellerId: createdSellers[1].id, // QuickParts Express
        rating: "4.5",
        comment: "Very fast delivery as promised. Parts fit perfectly."
      },
      {
        userId: createdUsers[6].id, // sarah_buyer
        sellerId: createdSellers[3].id, // Engine Experts
        rating: "5.0",
        comment: "Outstanding expertise and quality. Fixed my engine issue completely."
      }
    ];
    
    const createdReviews = await db.insert(reviews).values(sampleReviews).returning();
    console.log(`✅ Created ${createdReviews.length} reviews`);
    
    // Insert sample searches
    console.log("🔍 Creating sample searches...");
    const sampleSearches: InsertSearch[] = [
      {
        userId: createdUsers[1].id,
        vehicleMake: "Honda",
        vehicleModel: "City",
        vehicleYear: "2020",
        partName: "brake pads"
      },
      {
        userId: createdUsers[6].id,
        vehicleMake: "Toyota",
        vehicleModel: "Corolla",
        vehicleYear: "2019",
        partName: "timing belt"
      }
    ];
    
    const createdSearches = await db.insert(searches).values(sampleSearches).returning();
    console.log(`✅ Created ${createdSearches.length} searches`);
    
    // Insert sample contacts
    console.log("📞 Creating contact logs...");
    const sampleContacts: InsertContact[] = [
      {
        userId: createdUsers[1].id,
        sellerId: createdSellers[0].id,
        type: "whatsapp"
      },
      {
        userId: createdUsers[6].id,
        sellerId: createdSellers[1].id,
        type: "call"
      },
      {
        userId: createdUsers[1].id,
        sellerId: createdSellers[3].id,
        type: "profile_view"
      }
    ];
    
    const createdContacts = await db.insert(contacts).values(sampleContacts).returning();
    console.log(`✅ Created ${createdContacts.length} contacts`);
    
    console.log("🎉 Database seeding completed successfully!");
    
    return {
      users: createdUsers.length,
      sellers: createdSellers.length,
      parts: createdParts.length,
      reviews: createdReviews.length,
      searches: createdSearches.length,
      contacts: createdContacts.length
    };
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Allow running this script directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then((stats) => {
      console.log("📊 Seeding statistics:", stats);
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}