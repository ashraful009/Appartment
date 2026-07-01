const { MongoClient } = require("mongodb");
const knex = require("knex");
const knexConfig = require("../../knexfile");

// Knex Instance
const db = knex(knexConfig.development);

// In-memory ID mappings (MongoDB ObjectId string -> PostgreSQL integer ID)
const idMap = {
  users: {},
  properties: {}
};

async function migrateData() {
  console.log("Connecting to MongoDB...");
  const client = await MongoClient.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017");
  const mongoDb = client.db("appartment_db");

  console.log("Migrating Users...");
  const users = await mongoDb.collection("users").find().toArray();
  for (const user of users) {
    const [inserted] = await db("users").insert({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password_hash: user.password,
      roles: JSON.stringify(user.roles || []),
      is_guest: user.isGuest || false,
      wishlist: JSON.stringify(user.wishlist || []),
      profile_photo: user.profilePhoto || "",
      referral_code: user.referralCode || "",
      created_at: user.createdAt || new Date(),
      updated_at: user.updatedAt || new Date()
    }).returning("id");
    
    idMap.users[user._id.toString()] = inserted.id;
  }

  console.log("Updating User References (referred_by)...");
  for (const user of users) {
    if (user.referredBy && idMap.users[user.referredBy.toString()]) {
      await db("users").where({ id: idMap.users[user._id.toString()] }).update({
        referred_by: idMap.users[user.referredBy.toString()]
      });
    }
  }

  console.log("Migrating Properties...");
  const properties = await mongoDb.collection("properties").find().toArray();
  for (const prop of properties) {
    const [inserted] = await db("properties").insert({
      name: prop.name,
      title: prop.title,
      description: prop.description,
      location: prop.location,
      address: prop.address,
      status: prop.status,
      handover_time: prop.handoverTime || "",
      main_image: prop.mainImage,
      gallery: JSON.stringify(prop.gallery || []),
      min_price: prop.minPrice || 0,
      max_price: prop.maxPrice || 0,
      total_units: prop.totalUnits || 0,
      available_units: prop.availableUnits || 0,
      facilities: JSON.stringify(prop.facilities || []),
      floor_plans: JSON.stringify(prop.floorPlans || []),
      documents: JSON.stringify(prop.documents || []),
      map_url: prop.mapUrl || "",
      display_order: prop.displayOrder || 0,
      created_at: prop.createdAt || new Date(),
      updated_at: prop.updatedAt || new Date()
    }).returning("id");
    
    idMap.properties[prop._id.toString()] = inserted.id;
  }

  // Follow the same pattern for other collections...
  
  console.log("Data migration completed successfully.");
  await client.close();
  process.exit(0);
}

migrateData().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
