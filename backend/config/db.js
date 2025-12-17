const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("travel_db");
        console.log("Successfully connected to MongoDB.");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

function getDb() {
    if (!db) {
        throw new Error("Database not initialized. Call connectDB first.");
    }
    return db;
}

module.exports = { connectDB, getDb };
