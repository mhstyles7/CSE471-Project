const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const uri = process.env.MONGODB_URI || "mongodb+srv://mh_db_user:Ewc4kcG8KA3Ciih4@cluster7.i3akwjx.mongodb.net/?appName=Cluster7";
const client = new MongoClient(uri);

const users = [
    { name: "Ahanaf Rivan", email: "rivan@example.com", password: "password123", role: "traveler", gender: "male" },
    { name: "Tasnim Rahman", email: "tasnim@example.com", password: "password123", role: "traveler", gender: "female" },
    { name: "Sabrina Khan", email: "sabrina@example.com", password: "password123", role: "traveler", gender: "female" },
    { name: "Alimool Razi", email: "razi@agency.com", password: "password123", role: "agency", gender: "male" },
    { name: "Zarin Raisa", email: "zarin@example.com", password: "password123", role: "traveler", gender: "female" },
    { name: "Fahim Ahmed", email: "fahim@example.com", password: "password123", role: "traveler", gender: "male" },
    { name: "Rafiq Ahmed", email: "rafiq@example.com", password: "password123", role: "traveler", gender: "male" }
];

async function seedUsers() {
    try {
        await client.connect();
        const db = client.db("travel_db");
        const collection = db.collection("users");

        console.log("Connected to MongoDB...");

        // Clear existing users to avoid duplicates and fix password hashes
        await collection.deleteMany({});

        const usersToInsert = [];
        const credentials = [];

        for (const u of users) {
            // Check if user already exists
            const existing = await collection.findOne({ email: u.email });
            if (existing) {
                console.log(`User ${u.email} already exists, skipping...`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(u.password, 10);
            usersToInsert.push({
                name: u.name,
                email: u.email,
                password: hashedPassword,
                role: u.role,
                points: Math.floor(Math.random() * 1000),
                tier: "Bronze",
                isPremium: false,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`,
                friends: [], // Initialize empty friends array
                joinedDate: new Date().toISOString()
            });
            credentials.push({ email: u.email, password: u.password });
        }

        if (usersToInsert.length > 0) {
            await collection.insertMany(usersToInsert);
            console.log(`Successfully added ${usersToInsert.length} users!`);
        } else {
            console.log("No new users to add.");
        }

        console.log("\nSaved Credentials (COPY THESE):");
        console.log("------------------------------------------------");
        credentials.forEach(c => {
            console.log(`Email: ${c.email.padEnd(25)} | Password: ${c.password}`);
        });
        console.log("------------------------------------------------");

    } catch (err) {
        console.error("Error seeding users:", err);
    } finally {
        await client.close();
    }
}

seedUsers();
