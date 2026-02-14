import React from 'react';
import { Map, Users, Award, Sparkles } from 'lucide-react';
import FeatureCard from '../common/FeatureCard';

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Hero Section */}
      <div className="hero-section" style={{
        position: 'relative',
        backgroundImage: 'linear-gradient(135deg, rgba(5, 150, 105, 0.85) 0%, rgba(13, 148, 136, 0.85) 100%), url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '28px',
        minHeight: '450px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(5, 150, 105, 0.3)'
      }}>
        {/* Animated Background Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`,
          animation: 'float 6s ease-in-out infinite'
        }} />

        {/* Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.15)'
        }} />

        {/* Content */}
        <div className="hero-content" style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '48px 32px',
          maxWidth: '900px'
        }}>
          {/* Badge */}
          <div className="hero-badge" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            padding: '8px 20px',
            borderRadius: '24px',
            marginBottom: '24px',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <Sparkles size={16} />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Welcome to PothChola</span>
          </div>

          <h1 className="hero-heading" style={{
            fontSize: '56px',
            fontWeight: '800',
            marginBottom: '20px',
            fontFamily: 'Poppins, sans-serif',
            lineHeight: '1.1',
            textShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            Discover Your Favorite Place with Us
          </h1>

          <p className="hero-subtitle" style={{
            fontSize: '22px',
            color: '#d1fae5',
            marginBottom: '32px',
            lineHeight: '1.6',
            fontWeight: '400'
          }}>
            Travel to any corner of Bangladesh, without going around in circles
          </p>

          <button className="hero-cta" style={{
            backgroundColor: 'white',
            color: '#059669',
            padding: '16px 40px',
            borderRadius: '28px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            animation: 'float 3s ease-in-out infinite',
            fontFamily: 'Poppins, sans-serif'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            }}
          >
            Start Exploring
          </button>
        </div>

        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }} />
      </div>

      {/* Feature Cards */}
      <div className="feature-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '28px'
      }}>
        <FeatureCard
          icon={<Map style={{ color: '#059669' }} size={36} strokeWidth={2.5} />}
          title="Interactive Maps"
          description="Explore districts with AI-powered insights on safety, weather, and best travel times"
        />
        <FeatureCard
          icon={<Users style={{ color: '#0d9488' }} size={36} strokeWidth={2.5} />}
          title="Connect with Travelers"
          description="Share experiences, plan group trips, and build your travel community"
        />
        <FeatureCard
          icon={<Award style={{ color: '#f59e0b' }} size={36} strokeWidth={2.5} />}
          title="Earn Rewards"
          description="Collect travel points and unlock exclusive benefits as you explore"
        />
      </div>
    </div>
  );
}