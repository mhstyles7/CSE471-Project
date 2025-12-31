const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');

// Helper to get date based on period
const getStartDate = (period) => {
    const now = new Date();
    if (period === 'week') return new Date(now.setDate(now.getDate() - 7));
    if (period === 'month') return new Date(now.setMonth(now.getMonth() - 1));
    if (period === 'year') return new Date(now.setFullYear(now.getFullYear() - 1));
    return new Date(0); // All time
};

router.get('/', async (req, res) => {
    try {
        const { period = 'month', type = 'all' } = req.query;
        const db = getDb();
        const startDate = getStartDate(period);

        // Initialize heat map data structure
        // Key: District Slug, Value: Score
        let heatScores = {};
        const districtCounts = {};

        // 1. Aggregating TRIPS
        if (type === 'all' || type === 'trips') {
            // Correct collection is 'trips', not 'routes'
            const trips = await db.collection('trips').find({
                startDate: { $gte: startDate.toISOString() }
            }).toArray();

            trips.forEach(trip => {
                // Trips schema typically has 'destinationName', or 'from'/'to' if detailed.
                // Score Destination
                if (trip.destinationName) {
                    const slug = trip.destinationName.toLowerCase().replace(/ /g, '-').replace(/'/g, '');
                    heatScores[slug] = (heatScores[slug] || 0) + 5; // 1 trip = 5 points
                } else if (trip.to) {
                    heatScores[trip.to] = (heatScores[trip.to] || 0) + 5;
                }

                // Score Origin (Starting Point) - Re-enabled as per user request
                if (trip.from) {
                    heatScores[trip.from] = (heatScores[trip.from] || 0) + 5;
                }
            });
        }

        // 2. Aggregating POSTS
        if (type === 'all' || type === 'posts') {
            const posts = await db.collection('posts').find({
                createdAt: { $gte: startDate.toISOString() }
            }).toArray();

            // Fetch destinations for text-mining content
            const allDestinations = await db.collection('destinations').find().toArray();
            // Sort by name length desc to match "Cox's Bazar" before "Cox"
            const sortedDestNames = allDestinations
                .map(d => ({ name: d.name.toLowerCase(), slug: d.slug || d.name.toLowerCase().replace(/ /g, '-').replace(/'/g, '') }))
                .sort((a, b) => b.name.length - a.name.length);

            posts.forEach(post => {
                let slug = null;

                // 1. Try explicit destination field first
                // User requirement: "For the destination that is not null, use those"
                if (post.destination) {
                    slug = post.destination.toLowerCase().replace(/ /g, '-').replace(/'/g, '');
                } else if (post.location) {
                    slug = post.location.toLowerCase().replace(/ /g, '-').replace(/'/g, '');
                }

                // 2. If no explicit location, scan CONTENT for mentions/hashtags
                if (!slug && post.content) {
                    const contentLower = post.content.toLowerCase();

                    for (const dest of sortedDestNames) {
                        // Check for hashtag (#dhaka) or plain word (dhaka)
                        // Simple check: does content include the name? 
                        // We use regex to ensure word boundary for short names, but loose check for others.
                        if (contentLower.includes(dest.name)) {
                            slug = dest.slug;
                            break; // Stop at first strong match (longest due to sort)
                        }
                    }
                }

                if (slug) {
                    heatScores[slug] = (heatScores[slug] || 0) + 3; // 1 post = 3 points
                }
            });
        }



        // Normalize Scores (0-100) for Heatmap intensity
        // Find max
        let maxScore = 0;
        Object.values(heatScores).forEach(s => {
            if (s > maxScore) maxScore = s;
        });

        const normalizedHeatmap = {};
        Object.keys(heatScores).forEach(slug => {
            // Avoid division by zero
            normalizedHeatmap[slug] = maxScore > 0 ? Math.round((heatScores[slug] / maxScore) * 100) : 0;
        });

        // Generate Insights
        // Simple logic: Find top 3 districts
        const sortedDistricts = Object.entries(heatScores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

        const insights = sortedDistricts.map(([slug, score], index) => {
            return {
                district: slug,
                rank: index + 1,
                trend: 'rising', // Mock trend logic
                message: index === 0
                    ? `Highest activity zone with score ${score}.`
                    : `High traffic detected.`
            };
        });

        res.json({
            heatmap: normalizedHeatmap,
            rawScores: heatScores,
            insights: insights,
            period: period
        });

    } catch (err) {
        console.error("Heatmap Error:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
