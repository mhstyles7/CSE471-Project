import React, { createContext, useContext } from 'react';

const NavigationContext = createContext();

export const useNavigate = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigate must be used within a NavigationProvider');
    }
    return context.navigate;
};

export const useNavigationState = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigationState must be used within a NavigationProvider');
    }
    return context.currentPage;
};

// Alias for useNavigationState
export const useCurrentPage = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useCurrentPage must be used within a NavigationProvider');
    }
    return context.currentPage;
};

export const NavigationProvider = ({ children, navigate, currentPage }) => {
    return (
        <NavigationContext.Provider value={{ navigate, currentPage }}>
            {children}
        </NavigationContext.Provider>
    );
};
