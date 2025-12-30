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

<<<<<<< HEAD
export const usePageParams = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('usePageParams must be used within a NavigationProvider');
    }
    return context.pageParams || {};
};

export const NavigationProvider = ({ children, navigate, currentPage, pageParams }) => {
    return (
        <NavigationContext.Provider value={{ navigate, currentPage, pageParams }}>
=======
export const NavigationProvider = ({ children, navigate, currentPage }) => {
    return (
        <NavigationContext.Provider value={{ navigate, currentPage }}>
>>>>>>> origin/Tashu
            {children}
        </NavigationContext.Provider>
    );
};
