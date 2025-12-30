const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || "mongodb+srv://mh_db_user:Ewc4kcG8KA3Ciih4@cluster7.i3akwjx.mongodb.net/?appName=Cluster7";
const client = new MongoClient(uri);

async function seedFriends() {
    try {
        await client.connect();
        const db = client.db("travel_db");

        console.log("Connected to MongoDB...");

        // 1. Fetch Users
        const users = await db.collection("users").find({}).toArray();
        if (users.length < 2) {
            console.log("Not enough users to create friends!");
            return;
        }

        const rivan = users.find(u => u.email === "rivan@example.com");
        const tasnim = users.find(u => u.email === "tasnim@example.com");
        const sabrina = users.find(u => u.email === "sabrina@example.com");
        const fahim = users.find(u => u.email === "fahim@example.com");

        if (!rivan || !tasnim) {
            console.log("Key users (Rivan/Tasnim) not found. Run seed_users.js first.");
            return;
        }

        const friendsData = [
            // Rivan <-> Tasnim
            {
                user1Id: rivan._id,
                user1Name: rivan.name,
                user1Avatar: rivan.avatar,
                user2Id: tasnim._id,
                user2Name: tasnim.name,
                user2Avatar: tasnim.avatar,
                status: 'accepted',
                createdAt: new Date().toISOString()
            },
            // Rivan <-> Sabrina
            {
                user1Id: rivan._id,
                user1Name: rivan.name,
                user1Avatar: rivan.avatar,
                user2Id: sabrina._id,
                user2Name: sabrina.name,
                user2Avatar: sabrina.avatar,
                status: 'accepted',
                createdAt: new Date().toISOString()
            },
            // Fahim -> Rivan (Request Pending)
            {
                user1Id: fahim._id,
                user1Name: fahim.name,
                user1Avatar: fahim.avatar,
                user2Id: rivan._id,
                user2Name: rivan.name,
                user2Avatar: rivan.avatar,
                status: 'pending',
                createdAt: new Date().toISOString()
            }
        ];

        // Clear existing friends for these users
        await db.collection("friends").deleteMany({});

        // Insert Friends
        if (friendsData.length > 0) {
            // Note: Your app logic might require two documents (A->B and B->A) or one.
            // Assuming bidirectional or the app queries params.
            // Based on typical schema, we might need to update Users collection 'friends' array too?

            // Let's Insert into 'friends' collection first
            await db.collection("friends").insertMany(friendsData);

            // UPDATE USERS 'friends' ARRAY (Many apps use this for quick access)
            // Rivan has Tasnim and Sabrina
            await db.collection("users").updateOne(
                { _id: rivan._id },
                { $set: { friends: [tasnim._id, sabrina._id] } }
            );
            // Tasnim has Rivan
            await db.collection("users").updateOne(
                { _id: tasnim._id },
                { $set: { friends: [rivan._id] } }
            );
            // Sabrina has Rivan
            await db.collection("users").updateOne(
                { _id: sabrina._id },
                { $set: { friends: [rivan._id] } }
            );

            console.log(`✅ Successfully seeded ${friendsData.length} friend connections!`);
        } else {
            console.log("No friend data to seed.");
        }

    } catch (err) {
        console.error("Error seeding friends:", err);
    } finally {
        await client.close();
    }
}

seedFriends();
