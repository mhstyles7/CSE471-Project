// Simulated delay to mimic network requests
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class MockAuthService {
    constructor() {
        this.usersKey = 'travel_app_users';
        this.currentUserKey = 'travel_app_current_user';
    }

    // Helper to get users from local storage
    getUsers() {
        const users = localStorage.getItem(this.usersKey);
        return users ? JSON.parse(users) : [];
    }

    // Helper to save users to local storage
    saveUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    async login(email, password) {
        await delay(800); // Simulate network delay

        const users = this.getUsers();
        const user = users.find((u) => u.email === email && u.password === password);

        if (user) {
            const { password, ...userWithoutPassword } = user;
            localStorage.setItem(this.currentUserKey, JSON.stringify(userWithoutPassword));
            return userWithoutPassword;
        }

        throw new Error('Invalid email or password');
    }

    async register(name, email, password, role = 'traveler') {
        await delay(1000);

        const users = this.getUsers();
        if (users.find((u) => u.email === email)) {
            throw new Error('Email already exists');
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
            memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            tier: 'Bronze Member',
            bio: 'New traveler ready to explore the world!',
            trips: 0,
            friends: 0,
            points: 0,
            role: role
        };

        users.push(newUser);
        this.saveUsers(users);

        const { password: _, ...userWithoutPassword } = newUser;
        localStorage.setItem(this.currentUserKey, JSON.stringify(userWithoutPassword));

        return userWithoutPassword;
    }

    async logout() {
        await delay(500);
        localStorage.removeItem(this.currentUserKey);
    }

    async getCurrentUser() {
        // No delay for checking current user on load to avoid flash
        const user = localStorage.getItem(this.currentUserKey);
        return user ? JSON.parse(user) : null;
    }

    async updateProfile(userId, updates) {
        await delay(800);

        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) throw new Error('User not found');

        const updatedUser = { ...users[userIndex], ...updates };
        users[userIndex] = updatedUser;
        this.saveUsers(users);

        const { password, ...userWithoutPassword } = updatedUser;
        localStorage.setItem(this.currentUserKey, JSON.stringify(userWithoutPassword));

        return userWithoutPassword;
    }

    async forgotPassword(email) {
        await delay(1000);
        const users = this.getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            // For security, we often don't want to reveal if an email exists, 
            // but for this mock we'll throw to show the UI handling
            throw new Error('Email not found');
        }

        return true; // Email "sent"
    }

    async socialLogin(provider) {
        await delay(1000);
        // Mock successful social login
        const mockUser = {
            id: `social-${Date.now()}`,
            name: `Demo ${provider} User`,
            email: `demo.${provider.toLowerCase()}@example.com`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
            memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            tier: 'Silver Member',
            bio: `Logged in via ${provider}`,
            trips: 0,
            friends: 0,
            points: 100
        };

        localStorage.setItem(this.currentUserKey, JSON.stringify(mockUser));
        return mockUser;
    }
}

export const authService = new MockAuthService();
