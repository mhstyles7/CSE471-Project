const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function seedEvents() {
    try {
        await client.connect();
        const db = client.db("travel_db");
        console.log("Connected to MongoDB...");

        // 1. Get Users
        const users = await db.collection("users").find({}).toArray();
        if (users.length === 0) {
            console.log("No users found. Run seed_users.js first.");
            return;
        }

        const rivan = users.find(u => u.email === "rivan@example.com") || users[0];
        const tasnim = users.find(u => u.email === "tasnim@example.com") || users[1];
        const razi = users.find(u => u.email === "razi@agency.com");

        if (!rivan) {
            console.log("Rivan (organizer) not found!");
            return;
        }

        // 2. Define Events
        const events = [
            {
                name: "Cox's Bazar Sunset Ride",
                date: "2025-02-15",
                location: "Cox's Bazar",
                description: "Join us for a relaxing sunset bike ride along the marine drive.",
                maxParticipants: 15,
                organizer: rivan.name,
                organizerId: rivan._id.toString(), // Store as string for consistency with frontend expectations
                participants: [
                    { userId: rivan._id.toString(), userName: rivan.name, userImage: rivan.avatar }
                ],
                invitedFriends: [], // User IDs
                tasks: [],
                polls: [],
                itinerary: [],
                createdAt: new Date().toISOString()
            },
            {
                name: "Sajek Valley Weekend",
                date: "2025-03-10",
                location: "Sajek Valley",
                description: "A weekend getaway above the clouds. Photography and campfire.",
                maxParticipants: 8,
                organizer: tasnim ? tasnim.name : "Tasnim",
                organizerId: tasnim ? tasnim._id.toString() : new ObjectId().toString(),
                participants: [],
                invitedFriends: [],
                createdAt: new Date().toISOString()
            }
        ];

        // 3. Clear existing events (optional, maybe keep old ones? No, user IDs mismatch)
        // Let's clear to be safe and clean.
        await db.collection("events").deleteMany({});

        // 4. Insert
        await db.collection("events").insertMany(events);
        console.log(`✅ Successfully seeded ${events.length} group events!`);

        // 5. Seed Invitations?
        if (tasnim && rivan) {
            const invites = [
                {
                    fromUserId: rivan._id,
                    toUserId: tasnim._id,
                    eventId: events[0]._id, // Note: this ID won't work because insertMany generates IDs.
                    // We need to fetch inserted IDs or do one by one.
                }
            ];
            // Actually, insertMany returns keys.
            // But simpler to just skip invites for now, or fetch events back.
        }

    } catch (err) {
        console.error("Error seeding events:", err);
    } finally {
        await client.close();
    }
}

seedEvents();
