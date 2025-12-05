import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const socialLogin = async (provider) => {
        // Placeholder for social login logic
        console.log(`Social login with ${provider} not implemented yet.`);
    };

    const updateProfile = async (updates) => {
        // Placeholder for update profile logic
        console.log('Update profile not implemented yet.');
    };

    const forgotPassword = async (email) => {
        // Placeholder for forgot password logic
        console.log('Forgot password not implemented yet.');
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout,
        socialLogin,
        updateProfile,
        forgotPassword
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
