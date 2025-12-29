const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');

// Get all routes
router.get('/', async (req, res) => {
    try {
        const db = getDb();

        // 1. Fetch Trips (Sorted by Date)
        const trips = await db.collection('trips')
            .find({})
            .sort({ startDate: 1 })
            .toArray();

        // 2. Fetch Destinations for Lookup
        const destinations = await db.collection('destinations').find().toArray();
        const destMap = {};
        const nameToSlug = {}; // Lookup for Name -> Slug

        destinations.forEach(d => {
            // GENERATE SLUG IF MISSING (Fix for existing DB data)
            const slug = d.slug || (d.name ? d.name.toLowerCase().replace(/ /g, '-').replace(/'/g, '') : null);

            if (slug) {
                d.slug = slug; // Ensure object has it
                destMap[slug] = d;

                if (d.name) {
                    // Create normalized lookup key
                    nameToSlug[d.name.toLowerCase()] = slug;
                    // Also partial match if simple name
                    nameToSlug[slug.replace(/-/g, ' ')] = slug;
                }
            }
        });

        // Helper to slugify names if not stored (Fallback)
        const toSlug = (name) => name.toLowerCase().replace(/ /g, '-').replace(/'/g, '');

        // Helper to map Risk/Comfort strings to numbers (1-10)
        const mapRisk = (r) => {
            if (!r) return 5;
            const val = r.toLowerCase();
            if (val === 'low') return 2;
            if (val === 'medium') return 5;
            if (val === 'high') return 8;
            return 5;
        };

        const mapComfort = (c) => {
            if (!c) return 5;
            const val = c.toLowerCase();
            if (val === 'high') return 9;
            if (val === 'medium') return 6;
            if (val === 'low') return 3;
            return 5;
        };

        // 3. Chain Logic
        let previousDestSlug = 'dhaka'; // Default Start
        const chainedTrips = trips.map((trip) => {
            // Try to find real slug from DB Name match first
            const normalizedName = trip.destinationName ? trip.destinationName.toLowerCase() : '';
            // Try explicit match, then fallback to generator
            const currentDestSlug = nameToSlug[normalizedName] || toSlug(trip.destinationName || '');

            const destDetails = destMap[currentDestSlug];

            const enrichedTrip = {
                id: trip._id.toString(),
                from: previousDestSlug,
                to: currentDestSlug,
                date: trip.startDate.split('T')[0], // YYYY-MM-DD
                // Look up from Destination DB, fallback to defaults
                risk: destDetails ? mapRisk(destDetails.risk) : 5,
                comfort: destDetails ? mapComfort(destDetails.comfort) : 5,
                type: 'trip',
                ...trip
            };

            previousDestSlug = currentDestSlug; // Update for next iteration
            return enrichedTrip;
        });

        res.json(chainedTrips);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
