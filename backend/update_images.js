const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("Please set MONGODB_URI in .env");
    process.exit(1);
}

const client = new MongoClient(uri);

const updates = [
    {
        collection: 'destinations',
        filter: { slug: 'coxsbazar' },
        update: { $set: { images: ["https://images.unsplash.com/photo-1594191494411-bd56a81bf6d7?auto=format&fit=crop&w=800"] } }
    },
    {
        collection: 'destinations',
        filter: { slug: 'sylhet' },
        update: { $set: { images: ["https://images.unsplash.com/photo-1599407335272-b7a48dbe559d?auto=format&fit=crop&w=800"] } }
    },
    {
        collection: 'destinations',
        filter: { slug: 'dhaka' },
        update: { $set: { images: ["https://images.unsplash.com/photo-1606216065532-618451996720?auto=format&fit=crop&w=800"] } }
    },
    {
        collection: 'destinations',
        filter: { slug: 'chittagong' },
        update: { $set: { images: ["https://images.unsplash.com/photo-1587216694668-3058a97e682e?auto=format&fit=crop&w=800"] } }
    },
    {
        collection: 'cultural_foods',
        filter: { name: 'Panta Ilish' },
        update: { $set: { image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800" } }
    },
    {
        collection: 'cultural_foods',
        filter: { name: 'Seven Layer Tea' },
        update: { $set: { image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800" } }
    }
];

async function run() {
    try {
        await client.connect();
        console.log("Connected to DB");
        const db = client.db('travel_db');

        for (const op of updates) {
            const res = await db.collection(op.collection).updateOne(op.filter, op.update);
            console.log(`Updated ${op.filter.slug || op.filter.name}: ${res.modifiedCount} docs`);
        }

        console.log("Image update complete!");
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
