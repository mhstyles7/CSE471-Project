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
            const routes = await db.collection('routes').find({}).toArray(); // Filtering by date would be better efficiently with DB query

            // Note: Our mock 'routes' collection might not have strict dates on all items in this dev env, 
            // but we will filter what we can or assume recent for demo if date is missing.

            routes.forEach(route => {
                // In a real app, check route.date >= startDate
                // For demo, we count all to ensure visual data

                // Weight: 1 trip = 5 points
                if (route.from) heatScores[route.from] = (heatScores[route.from] || 0) + 5;
                if (route.to) heatScores[route.to] = (heatScores[route.to] || 0) + 5;

                // Track purely for counts
                if (route.to) districtCounts[route.to] = (districtCounts[route.to] || 0) + 1;
            });
        }

        // 2. Aggregating POSTS
        if (type === 'all' || type === 'posts') {
            const posts = await db.collection('posts').find({
                createdAt: { $gte: startDate.toISOString() }
            }).toArray();

            posts.forEach(post => {
                // Posts usually have a 'location' or 'district' string. 
                // If specific field missing, we might skip.
                if (post.location) {
                    // Try to match basic slug convention (lowercase)
                    const slug = post.location.toLowerCase();
                    heatScores[slug] = (heatScores[slug] || 0) + 3; // 1 post = 3 points
                }
            });
        }

        // --- INJECT DYNAMIC DUMMY DATA FOR DEMO ---
        // Ensure we have some hot zones for visualization if data is sparse, but make it REACT to filters
        if (Object.keys(heatScores).length < 5) {

            // 1. Define BASE Activity (represents a typical Week)
            let baseScores = { ...heatScores };

            // Differentiate by TYPE for Base Logic
            if (type === 'trips') {
                baseScores['coxs-bazar'] = (baseScores['coxs-bazar'] || 0) + 50;
                baseScores['sylhet'] = (baseScores['sylhet'] || 0) + 40;
                baseScores['bandarban'] = (baseScores['bandarban'] || 0) + 30;
                baseScores['dhaka'] = (baseScores['dhaka'] || 0) + 15;
            } else if (type === 'posts') {
                baseScores['dhaka'] = (baseScores['dhaka'] || 0) + 60;
                baseScores['chittagong'] = (baseScores['chittagong'] || 0) + 40;
                baseScores['khulna'] = (baseScores['khulna'] || 0) + 30;
                baseScores['coxs-bazar'] = (baseScores['coxs-bazar'] || 0) + 20;
            } else {
                // ALL
                baseScores['dhaka'] = (baseScores['dhaka'] || 0) + 55;
                baseScores['coxs-bazar'] = (baseScores['coxs-bazar'] || 0) + 50;
                baseScores['sylhet'] = (baseScores['sylhet'] || 0) + 35;
                baseScores['chittagong'] = (baseScores['chittagong'] || 0) + 30;
            }

            // Inject Trending Events (applies to ALL timeframes that cover this week)
            // e.g. "Barisal" has a sudden spike this week
            baseScores['barisal'] = (baseScores['barisal'] || 0) + 25;

            // 2. Scale by TIME PERIOD (Accumulate)
            let multiplier = 1.0;
            let randomNoise = 0.1;

            if (period === 'week') {
                multiplier = 1.0;
                randomNoise = 0.2; // High variance in short term
            } else if (period === 'month') {
                multiplier = 4.0; // Month = ~4 Weeks
                randomNoise = 0.1;
            } else if (period === 'year') {
                multiplier = 48.0; // Year = ~48-52 Weeks
                randomNoise = 0.05; // Smooths out over year
            }

            // Apply Multiplier to create Final HeatScores
            // We overwrite heatScores with the scaled values
            heatScores = {}; // Reset to build from base
            Object.keys(baseScores).forEach(key => {
                const flux = 1.0 + (Math.random() * randomNoise * 2 - randomNoise); // +/- noise
                heatScores[key] = Math.round(baseScores[key] * multiplier * flux);
            });
        }
        // ----------------------------------

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
