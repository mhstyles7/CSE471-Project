import React, { useState } from 'react';
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

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // Render the appropriate page based on currentPage state
  const renderPage = () => {
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
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f0fdf4, #f0fdfa)' }}>
      {/* Navigation */}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 20px' }}>
        {renderPage()}
      </main>

      {/* AI Chatbot - Fixed Bottom Right */}
      <ChatBot />
    </div>
  );
} 