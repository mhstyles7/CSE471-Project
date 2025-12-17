import { API_URL } from '../config';

const getHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };
    const user = localStorage.getItem('user');
    if (user) {
        // If you implement JWT later, add Authorization header here
        // const { token } = JSON.parse(user);
        // headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const apiService = {
    // Generic fetch wrapper
    request: async (endpoint, options = {}) => {
        const url = `${API_URL}/api${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...getHeaders(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    },

    get: (endpoint) => apiService.request(endpoint, { method: 'GET' }),
    post: (endpoint, data) => apiService.request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: (endpoint, data) => apiService.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (endpoint) => apiService.request(endpoint, { method: 'DELETE' }),
};
