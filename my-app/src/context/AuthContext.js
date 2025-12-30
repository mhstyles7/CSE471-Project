<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
=======
import React, { createContext, useContext, useState, useEffect } from 'react';
>>>>>>> origin/Tashu
import { API_URL } from '../config';

const AuthContext = createContext(null);

<<<<<<< HEAD
const SESSION_TIMEOUT_HOURS = 24;

=======
>>>>>>> origin/Tashu
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

<<<<<<< HEAD
    // Check session validity on app load
    const validateSession = useCallback(async () => {
        const storedUser = localStorage.getItem('user');
        const loginTime = localStorage.getItem('loginTime');

        if (!storedUser || !loginTime) {
            setLoading(false);
            return;
        }

        try {
            const userData = JSON.parse(storedUser);

            // Check if session expired locally first
            const loginDate = new Date(loginTime);
            const now = new Date();
            const hoursDiff = (now - loginDate) / (1000 * 60 * 60);

            if (hoursDiff > SESSION_TIMEOUT_HOURS) {
                // Session expired
                logout();
                setError('Session expired. Please login again.');
                setLoading(false);
                return;
            }

            // Validate with server
            const response = await fetch(`${API_URL}/api/auth/validate-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userData._id, loginTime }),
            });

            const data = await response.json();

            if (data.valid) {
                setUser(data.user);
            } else {
                logout();
                if (data.message === 'Session expired') {
                    setError('Session expired. Please login again.');
                }
            }
        } catch (err) {
            // If server is down, still use local session if not expired
            const userData = JSON.parse(storedUser);
            const loginDate = new Date(loginTime);
            const now = new Date();
            const hoursDiff = (now - loginDate) / (1000 * 60 * 60);

            if (hoursDiff <= SESSION_TIMEOUT_HOURS) {
                setUser(userData);
            } else {
                logout();
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        validateSession();
    }, [validateSession]);
=======
    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        };
        initAuth();
    }, []);
>>>>>>> origin/Tashu

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');

            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
<<<<<<< HEAD
            localStorage.setItem('loginTime', data.loginTime || new Date().toISOString());
=======
>>>>>>> origin/Tashu
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password, role) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Registration failed');

            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
<<<<<<< HEAD
            localStorage.setItem('loginTime', data.loginTime || new Date().toISOString());
=======
>>>>>>> origin/Tashu
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

<<<<<<< HEAD
    const logout = () => {
        setUser(null);
        setError(null);
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');
    };

    // Google OAuth Login
    const googleLogin = async (googleData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: googleData.email,
                    name: googleData.name,
                    googleId: googleData.googleId || googleData.sub,
                    avatar: googleData.picture || googleData.avatar
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Google login failed');

            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('loginTime', data.loginTime || new Date().toISOString());
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Demo Google Login (for testing without actual OAuth)
    const demoGoogleLogin = async () => {
        const demoGoogleData = {
            email: `demo.user.${Date.now()}@gmail.com`,
            name: 'Demo Google User',
            googleId: `google_${Date.now()}`,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser'
        };
        return googleLogin(demoGoogleData);
    };

    const forgotPassword = async (email) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Request failed');

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (token, newPassword) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Password reset failed');

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
=======
    const logout = async () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const socialLogin = async (provider) => {
        // Placeholder for social login logic
        console.log(`Social login with ${provider} not implemented yet.`);
>>>>>>> origin/Tashu
    };

    const updateProfile = async (updates) => {
        setLoading(true);
<<<<<<< HEAD
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/users/${user._id}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Profile update failed');

            // Preserve loginTime when updating user
            const loginTime = localStorage.getItem('loginTime');
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            if (loginTime) localStorage.setItem('loginTime', loginTime);

            return data;
=======
        try {
            // Use functional update to get the latest user state (avoids stale closure)
            let updatedUser;
            setUser(currentUser => {
                updatedUser = { ...currentUser, ...updates };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                return updatedUser;
            });

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            return updatedUser;
>>>>>>> origin/Tashu
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

<<<<<<< HEAD
    // Refresh user data from server
    const refreshUser = async () => {
        if (!user?._id) return;
        try {
            const response = await fetch(`${API_URL}/api/users/${user._id}`);
            if (response.ok) {
                const data = await response.json();
                const loginTime = localStorage.getItem('loginTime');
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
                if (loginTime) localStorage.setItem('loginTime', loginTime);
            }
        } catch (err) {
            console.error('Failed to refresh user:', err);
=======
    const forgotPassword = async (email) => {
        // Placeholder for forgot password logic
        console.log('Forgot password not implemented yet.');
    };

    const refreshUser = async () => {
        if (!user?.email) return;
        try {
            const response = await fetch(`${API_URL}/api/auth/profile/${user.email}`);
            if (response.ok) {
                const freshUserData = await response.json();
                setUser(freshUserData);
                localStorage.setItem('user', JSON.stringify(freshUserData));
                return freshUserData;
            }
        } catch (err) {
            console.error('Error refreshing user:', err);
>>>>>>> origin/Tashu
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        error,
<<<<<<< HEAD
        setError,
        login,
        register,
        logout,
        googleLogin,
        demoGoogleLogin,
        forgotPassword,
        resetPassword,
        updateProfile,
=======
        login,
        register,
        logout,
        socialLogin,
        updateProfile,
        forgotPassword,
>>>>>>> origin/Tashu
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
<<<<<<< HEAD

=======
>>>>>>> origin/Tashu
