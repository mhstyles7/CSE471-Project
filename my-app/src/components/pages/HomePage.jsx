import React from 'react';
import { Map, Users, Award } from 'lucide-react';
import FeatureCard from '../common/FeatureCard';

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Section */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(to right, #059669, #0d9488)',
        borderRadius: '24px',
        height: '384px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.2)'
        }}></div>
        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '24px'
        }}>
          <p style={{ color: '#d1fae5', fontStyle: 'italic', marginBottom: '8px' }}>Welcome to PothChola</p>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>Discover Your Favorite Place with Us</h1>
          <p style={{ fontSize: '20px', color: '#d1fae5', marginBottom: '24px' }}>Travel to any corner of Bangladesh, without going around in circles</p>
          <button style={{
            backgroundColor: 'white',
            color: '#059669',
            padding: '12px 32px',
            borderRadius: '24px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}>
            Start Exploring
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <FeatureCard
          icon={<Map style={{ color: '#059669' }} size={32} />}
          title="Interactive Maps"
          description="Explore districts with AI-powered insights on safety, weather, and best travel times"
        />
        <FeatureCard
          icon={<Users style={{ color: '#0d9488' }} size={32} />}
          title="Connect with Travelers"
          description="Share experiences, plan group trips, and build your travel community"
        />
        <FeatureCard
          icon={<Award style={{ color: '#f59e0b' }} size={32} />}
          title="Earn Rewards"
          description="Collect travel points and unlock exclusive benefits as you explore"
        />
      </div>
    </div>
  );
}