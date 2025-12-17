const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Search for a location string and return coordinates.
 * @param {string} query - The address to search for.
 * @returns {Promise<Array>} List of location matches.
 */
export const searchLocation = async (query) => {
    if (!query) return [];
    try {
        const response = await fetch(`${NOMINATIM_BASE_URL}?q=${encodeURIComponent(query)}&format=json&limit=5`);
        if (!response.ok) {
            throw new Error('Geocoding service unavailable');
        }
        return await response.json();
    } catch (error) {
        console.error("Geocoding Error:", error);
        return [];
    }
};

/**
 * Fetch route estimates from our backend.
 * @param {Object} start - { lat, lng }
 * @param {Object} end - { lat, lng }
 * @returns {Promise<Object>} Backend response with estimates.
 */
export const getRouteEstimates = async (start, end) => {
    try {
        const response = await fetch('http://localhost:5000/api/route-estimator/estimate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ start, end }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch estimates');
        }
        return await response.json();
    } catch (error) {
        console.error("Route Estimate Error:", error);
        throw error;
    }
};
