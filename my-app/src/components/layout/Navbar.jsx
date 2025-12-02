import React from 'react';
import { Home, Users, Map, Calendar, Award, User, Info, LogOut, MessageCircle } from 'lucide-react';

export default function Navbar({ currentPage, setCurrentPage }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'destinations', label: 'Destinations', icon: Map },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'community', label: 'Community', icon: MessageCircle },
    { id: 'my-trips', label: 'My Trips', icon: Calendar },
    { id: 'rewards', label: 'Rewards', icon: Award },
    { id: 'group-events', label: 'Group Events', icon: Calendar },
    { id: 'about', label: 'About', icon: Info },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav style={{ 
      backgroundColor: 'white', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 40 
    }}>
      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            background: 'linear-gradient(to right, #059669, #0d9488)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            PothChola
          </h1>
          <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6b7280' }}>Travel Smart</span>
        </div>
        
        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: currentPage === item.id ? '#d1fae5' : 'transparent',
                  color: currentPage === item.id ? '#047857' : '#4b5563',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== item.id) e.target.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== item.id) e.target.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={16} />
                <span style={{ display: window.innerWidth > 768 ? 'inline' : 'none' }}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          color: '#4b5563',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer'
        }}>
          <LogOut size={18} />
          <span style={{ display: window.innerWidth > 768 ? 'inline' : 'none' }}>Logout</span>
        </button>
      </div>
    </nav>
  );
}