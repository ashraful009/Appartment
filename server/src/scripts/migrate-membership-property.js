const mongoose = require("mongoose");
const path = require("path");
// Load environment variables from server/.env
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("MONGO_URI environment variable is missing.");
  process.exit(1);
}

const runMigration = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;

    // 1. Drop the single-property unique index on userId (if it exists) in the memberships collection
    console.log("Dropping unique index 'userId_1' on memberships collection (if it exists)...");
    try {
      await db.collection("memberships").dropIndex("userId_1");
      console.log("Dropped 'userId_1' index successfully.");
    } catch (err) {
      if (err.codeName === "IndexNotFound" || err.message.includes("index not found")) {
        console.log("Index 'userId_1' was not found (maybe already dropped or doesn't exist). Proceeding...");
      } else {
        throw err;
      }
    }

    // 2. Set propertyId: null to any existing memberships that don't have a propertyId
    console.log("Updating memberships: setting default propertyId to null...");
    const memUpdate = await db.collection("memberships").updateMany(
      { propertyId: { $exists: false } },
      { $set: { propertyId: null } }
    );
    console.log(`Updated ${memUpdate.modifiedCount} memberships.`);

    // 3. Set propertyId: null to any existing investmentledger entries that don't have a propertyId
    console.log("Updating investmentledgers: setting default propertyId to null...");
    const ledgerUpdate = await db.collection("investmentledgers").updateMany(
      { propertyId: { $exists: false } },
      { $set: { propertyId: null } }
    );
    console.log(`Updated ${ledgerUpdate.modifiedCount} ledger entries.`);

    // 4. Create new compound unique index on { userId: 1, propertyId: 1 } in memberships
    console.log("Creating compound unique index { userId: 1, propertyId: 1 } on memberships...");
    await db.collection("memberships").createIndex(
      { userId: 1, propertyId: 1 },
      { unique: true }
    );
    console.log("Compound unique index created successfully.");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

runMigration();
