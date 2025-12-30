const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pothchola';

async function seedUsers() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('travel_db');
        const usersCollection = db.collection('users');

        // Hash passwords
        const adminPassword = await bcrypt.hash('admin123', 10);
        const guidePassword = await bcrypt.hash('guide123', 10);

        // Admin User
        const adminUser = {
            name: 'Admin User',
            email: 'admin@pothchola.com',
            password: adminPassword,
            role: 'admin',
            points: 1000,
            tier: 'Gold',
            isPremium: true,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
            joinedDate: new Date().toISOString()
        };

        // Verified Guide User
        const guideUser = {
            name: 'Rahim Khan',
            email: 'guide@pothchola.com',
            password: guidePassword,
            role: 'traveler',
            guideStatus: 'approved',
            points: 500,
            tier: 'Silver',
            isPremium: false,
            trips: 7, // More than 5, so will have trusted badge
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RahimKhan',
            joinedDate: new Date().toISOString()
        };

        // Check if users already exist
        const existingAdmin = await usersCollection.findOne({ email: adminUser.email });
        const existingGuide = await usersCollection.findOne({ email: guideUser.email });

        if (existingAdmin) {
            console.log('Admin user already exists. Updating...');
            await usersCollection.updateOne(
                { email: adminUser.email },
                { $set: { ...adminUser, password: adminPassword } }
            );
        } else {
            await usersCollection.insertOne(adminUser);
            console.log('Admin user created!');
        }

        if (existingGuide) {
            console.log('Guide user already exists. Updating...');
            await usersCollection.updateOne(
                { email: guideUser.email },
                { $set: { ...guideUser, password: guidePassword } }
            );
        } else {
            await usersCollection.insertOne(guideUser);
            console.log('Guide user created!');
        }

        console.log('\n========================================');
        console.log('DUMMY ACCOUNTS CREATED SUCCESSFULLY!');
        console.log('========================================\n');
        console.log('ADMIN LOGIN:');
        console.log('  Email: admin@pothchola.com');
        console.log('  Password: admin123');
        console.log('');
        console.log('VERIFIED GUIDE LOGIN:');
        console.log('  Email: guide@pothchola.com');
        console.log('  Password: guide123');
        console.log('  (Has 7 trips - Trusted Guide Badge)');
        console.log('========================================\n');

    } catch (error) {
        console.error('Error seeding users:', error);
    } finally {
        await client.close();
    }
}

seedUsers();
