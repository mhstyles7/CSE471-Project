const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function seedDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB...");

        const db = client.db("travel_db");

        // Read the dummy data file
        const dataPath = path.join(__dirname, 'data', 'dummy_db.json');
        const rawData = fs.readFileSync(dataPath);
        const data = JSON.parse(rawData);

        // Iterate over each collection in the JSON file
        for (const [collectionName, documents] of Object.entries(data)) {
            if (documents.length > 0) {
                const collection = db.collection(collectionName);

                // Clear existing data before seeding
                await collection.deleteMany({});
                console.log(`Cleared collection: ${collectionName}`);

                // Insert new data
                await collection.insertMany(documents);
                console.log(`Seeded ${documents.length} documents into ${collectionName}`);
            }
        }

        console.log("\n✅ Database seeding completed successfully!");

    } catch (err) {
        console.error("Error seeding database:", err);
    } finally {
        await client.close();
    }
}

seedDatabase();
