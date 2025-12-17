import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider } from './context/NavigationContext';
import Navbar from './components/layout/Navbar';
import ChatBot from './components/chatbot/ChatBot';
import HomePage from './components/pages/HomePage';
import DestinationsPage from './components/pages/DestinationsPage';
import FriendsPage from './components/pages/FriendsPage';
import CommunityPage from './components/pages/CommunityPage';
import MyTripsPage from './components/pages/MyTripsPage';
import GroupEventsPage from './components/pages/GroupEventsPage';
import RewardsPage from './components/pages/RewardsPage';
import AboutPage from './components/pages/AboutPage';
import ProfilePage from './components/pages/ProfilePage';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import DashboardPage from './components/pages/DashboardPage';
import AgencyDashboard from './components/pages/AgencyDashboard';
import InteractiveMap from './components/maps/InteractiveMap';
import Heatmap from './components/maps/Heatmap';
import RoutePlanner from './components/maps/RoutePlanner';
import LocalGuidePage from './components/pages/LocalGuidePage';
import CulturePage from './components/pages/CulturePage';
import TripPlannerPage from './components/pages/TripPlannerPage';
import GuideDashboard from './components/pages/GuideDashboard';
import PremiumPage from './components/pages/PremiumPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const { user, isAuthenticated, logout } = useAuth();

  // List of routes that require authentication
  const protectedRoutes = [
    'my-trips',
    'profile',
    'dashboard',
    'friends',
    'rewards',
    'group-events',
    'agency',
    'trip-planner',
    'guide-dashboard',
    'premium'
  ];

  // Render the appropriate page based on currentPage state
  const renderPage = () => {
    // Check if route is protected and user is not logged in
    if (protectedRoutes.includes(currentPage) && !isAuthenticated) {
      return <Login />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'destinations':
        return <DestinationsPage />;
      case 'friends':
        return <FriendsPage />;
      case 'community':
        return <CommunityPage />;
      case 'my-trips':
        return <MyTripsPage />;
      case 'group-events':
        return <GroupEventsPage />;
      case 'rewards':
        return <RewardsPage />;
      case 'about':
        return <AboutPage />;
      case 'profile':
        return <ProfilePage user={user} />;
      // New Routes
      case 'login':
        return <Login />;
      case 'register':
        return <Register />;
      case 'forgot-password':
        return <ForgotPassword />;
      case 'dashboard':
        return <DashboardPage user={user} />;
      case 'agency':
        return <AgencyDashboard />;
      case 'map':
        return <InteractiveMap />;
      case 'heatmap':
        return <Heatmap />;
      case 'route-planner':
        return <RoutePlanner />;
      case 'local-guides':
        return <LocalGuidePage />;
      case 'culture':
        return <CulturePage />;
      case 'trip-planner':
        return <TripPlannerPage />;
      case 'guide-dashboard':
        return <GuideDashboard />;
      case 'premium':
        return <PremiumPage />;
      default:
        return <HomePage />;
    }
  };

  // Handle logout - clear state and redirect to login
  const handleLogout = async () => {
    await logout();
    setCurrentPage('login');
  };

  return (
    <NavigationProvider navigate={setCurrentPage} currentPage={currentPage}>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 25%, #f0fdfa 50%, #e0f2fe 75%, #f0fdf4 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        position: 'relative'
      }}>
        {/* Subtle Pattern Overlay */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(5, 150, 105, 0.03) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Navigation */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <Navbar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={handleLogout}
          />
        </div>

        {/* Main Content */}
        <main style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '40px 32px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
            {renderPage()}
          </div>
        </main>

        {/* AI Chatbot - Fixed Bottom Right */}
        <ChatBot />

        {/* Add gradient animation */}
        <style>{`
          @keyframes gradientShift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
        `}</style>
      </div>
    </NavigationProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}