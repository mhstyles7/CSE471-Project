const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || "mongodb+srv://mh_db_user:Ewc4kcG8KA3Ciih4@cluster7.i3akwjx.mongodb.net/?appName=Cluster7";
const client = new MongoClient(uri);

async function seedPosts() {
    try {
        await client.connect();
        const db = client.db("travel_db");

        // 1. Get Users to link posts to them
        const users = await db.collection("users").find({
            email: {
                $in: [
                    "tasnim@example.com",
                    "sabrina@example.com",
                    "rafiq@example.com",
                    "fahim@example.com"
                ]
            }
        }).toArray();

        if (users.length === 0) {
            console.log("No test users found! Run seed_users.js first.");
            return;
        }

        const userMap = {};
        users.forEach(u => userMap[u.email] = u);

        const posts = [
            {
                user: { name: userMap["tasnim@example.com"].name, avatar: userMap["tasnim@example.com"].avatar, role: "traveler" },
                type: "trip",
                content: "Just returned from an amazing trip to Cox's Bazar! The sunset was breathtaking.",
                image: "https://images.unsplash.com/photo-1595304383794-6725227d825f?q=80&w=1000&auto=format&fit=crop",
                destination: "Cox's Bazar",
                rating: 5,
                userId: userMap["tasnim@example.com"]._id,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
            },
            {
                user: { name: userMap["sabrina@example.com"].name, avatar: userMap["sabrina@example.com"].avatar, role: "traveler" },
                type: "review",
                content: "The boat ride in Sundarbans was thrilling but a bit scary!",
                destination: "Sundarbans",
                rating: 4,
                userId: userMap["sabrina@example.com"]._id,
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
            },
            {
                user: { name: userMap["fahim@example.com"].name, avatar: userMap["fahim@example.com"].avatar, role: "traveler" },
                type: "post",
                content: "Anyone planning a trip to Sajek Valley next month? Looking for travel buddies.",
                userId: userMap["fahim@example.com"]._id,
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
            },
            {
                user: { name: userMap["rafiq@example.com"].name, avatar: userMap["rafiq@example.com"].avatar, role: "traveler" },
                type: "post",
                content: "Found this hidden gem in Sylhet. The tea gardens are greener than ever!",
                image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=1000&auto=format&fit=crop",
                destination: "Sylhet",
                userId: userMap["rafiq@example.com"]._id,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
            },
            {
                user: { name: userMap["tasnim@example.com"].name, avatar: userMap["tasnim@example.com"].avatar, role: "traveler" },
                type: "recommendation",
                content: "Highly recommend 'Hill View Resort' if you are visiting Bandarban.",
                destination: "Bandarban",
                userId: userMap["tasnim@example.com"]._id,
                createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 mins ago
            }
        ];

        // Clear existing posts for these users to avoid duplicates (optional, but good for demo)
        const userIds = users.map(u => u._id);
        await db.collection("posts").deleteMany({ userId: { $in: userIds } });

        await db.collection("posts").insertMany(posts);
        console.log(`Successfully seeded ${posts.length} activities for the demo!`);

    } catch (err) {
        console.error("Error seeding posts:", err);
    } finally {
        await client.close();
    }
}

seedPosts();
