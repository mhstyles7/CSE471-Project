const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seed() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("MONGODB_URI is not defined in .env");
        process.exit(1);
    }
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('travel_db');

        console.log('Connected to DB: travel_db');

        // 1. Create/Update an Approved Guide
        const guideEmail = 'guide@example.com';
        const hashedPassword = await bcrypt.hash('password123', 10);
        const guideUser = {
            name: 'Local Expert Rahim',
            email: guideEmail,
            password: hashedPassword,
            role: 'user',
            guideStatus: 'approved',
            trips: 15,
            isPremium: true
        };

        await db.collection('users').updateOne(
            { email: guideEmail },
            { $set: guideUser },
            { upsert: true }
        );
        console.log('Guide user seeded');

        // 2. Create Guide Posts
        const posts = [
            {
                guideName: 'Local Expert Rahim',
                guideEmail: guideEmail,
                content: 'The hidden waterfalls of Sylhet are at their peak this season! DM me for a private tour.',
                guideImage: 'https://via.placeholder.com/150',
                type: 'update',
                createdAt: new Date().toISOString(),
                comments: [],
                reactions: []
            },
            {
                guideName: 'Local Expert Rahim',
                guideEmail: guideEmail,
                content: 'Best street food in Old Dhaka? It\'s not what you think. Join me this Friday to find out!',
                guideImage: 'https://via.placeholder.com/150',
                type: 'update',
                createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                comments: [],
                reactions: []
            }
        ];

        // Delete existing posts by this guide to avoid duplicates
        await db.collection('guide_posts').deleteMany({ guideEmail: guideEmail });

        await db.collection('guide_posts').insertMany(posts);
        console.log('Guide posts seeded');

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

seed();
