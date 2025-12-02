import React from 'react';
import { MapPin, Users, Award, Shield } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: <MapPin size={32} style={{ color: '#059669' }} />,
      title: 'Smart Travel Planning',
      description: 'AI-powered insights help you discover the best destinations based on safety, weather, and your preferences.'
    },
    {
      icon: <Users size={32} style={{ color: '#0d9488' }} />,
      title: 'Community Connection',
      description: 'Connect with fellow travelers, share experiences, and plan group adventures together.'
    },
    {
      icon: <Award size={32} style={{ color: '#f59e0b' }} />,
      title: 'Rewards System',
      description: 'Earn points for your travel activities and unlock exclusive benefits and discounts.'
    },
    {
      icon: <Shield size={32} style={{ color: '#3b82f6' }} />,
      title: 'Safe & Verified',
      description: 'All guides and agencies are verified. Get real-time safety updates for any destination.'
    }
  ];

  return (
    <div>
      <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
        About PothChola
      </h2>
      
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '32px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          Your Smart Companion for Exploring Bangladesh
        </h3>
        <p style={{ color: '#374151', marginBottom: '16px', lineHeight: '1.8' }}>
          PothChola is your smart companion for exploring Bangladesh. We combine AI technology with local insights 
          to help you discover, plan, and experience authentic travel adventures across the country.
        </p>
        <p style={{ color: '#374151', lineHeight: '1.8' }}>
          From interactive maps to community connections, travel rewards to cultural experiences, we're here to 
          make every journey memorable. Whether you're seeking hidden gems, planning group tours, or connecting 
          with fellow travelers, PothChola brings the entire travel ecosystem to your fingertips.
        </p>
      </div>

      {/* Features Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {features.map((feature, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              {feature.icon}
            </div>
            <h4 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px', fontSize: '18px' }}>
              {feature.title}
            </h4>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div style={{
        backgroundColor: '#f0fdf4',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #d1fae5'
      }}>
        <h4 style={{ fontWeight: '600', color: '#047857', marginBottom: '12px', fontSize: '20px' }}>
          Our Mission
        </h4>
        <p style={{ color: '#374151', lineHeight: '1.8' }}>
          To make travel in Bangladesh accessible, safe, and enriching for everyone. We believe in the power of 
          technology to connect people with places and create meaningful travel experiences that celebrate local 
          culture and promote sustainable tourism.
        </p>
      </div>
    </div>
  );
} 