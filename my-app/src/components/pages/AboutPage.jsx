import React from 'react';
import { MapPin, Users, Award, Shield, Heart, Globe, Sparkles } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: <MapPin size={32} strokeWidth={2.5} />,
      color: '#059669',
      bg: '#ecfdf5',
      title: 'Smart Travel Planning',
      description: 'AI-powered insights help you discover the best destinations based on safety, weather, and your preferences.'
    },
    {
      icon: <Users size={32} strokeWidth={2.5} />,
      color: '#0d9488',
      bg: '#f0fdfa',
      title: 'Community Connection',
      description: 'Connect with fellow travelers, share experiences, and plan group adventures together.'
    },
    {
      icon: <Award size={32} strokeWidth={2.5} />,
      color: '#f59e0b',
      bg: '#fffbeb',
      title: 'Rewards System',
      description: 'Earn points for your travel activities and unlock exclusive benefits and discounts.'
    },
    {
      icon: <Shield size={32} strokeWidth={2.5} />,
      color: '#3b82f6',
      bg: '#eff6ff',
      title: 'Safe & Verified',
      description: 'All guides and agencies are verified. Get real-time safety updates for any destination.'
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '48px',
          fontWeight: '800',
          color: '#1f2937',
          marginBottom: '16px',
          fontFamily: 'Poppins, sans-serif',
          background: 'linear-gradient(135deg, #059669, #0d9488)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          About PothChola
        </h2>
        <p style={{ fontSize: '20px', color: '#6b7280', maxWidth: '700px', margin: '0 auto' }}>
          Redefining travel experiences in Bangladesh through technology and community
        </p>
      </div>

      {/* Hero Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)',
        padding: '48px',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden',
        animation: 'slideUp 0.6s ease-out'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f0fdf4',
            color: '#059669',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: '600',
            fontSize: '14px',
            marginBottom: '24px'
          }}>
            <Sparkles size={16} />
            Our Vision
          </div>
          <h3 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '24px',
            fontFamily: 'Poppins, sans-serif',
            lineHeight: '1.3'
          }}>
            Your Smart Companion for <br />Exploring Bangladesh
          </h3>
          <div style={{ display: 'grid', mdGridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <p style={{ color: '#4b5563', fontSize: '17px', lineHeight: '1.8' }}>
              PothChola is your smart companion for exploring Bangladesh. We combine AI technology with local insights
              to help you discover, plan, and experience authentic travel adventures across the country.
            </p>
            <p style={{ color: '#4b5563', fontSize: '17px', lineHeight: '1.8' }}>
              From interactive maps to community connections, travel rewards to cultural experiences, we're here to
              make every journey memorable. Whether you're seeking hidden gems, planning group tours, or connecting
              with fellow travelers, PothChola brings the entire travel ecosystem to your fingertips.
            </p>
          </div>
        </div>

        {/* Decorative Background */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.05) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
      </div>

      {/* Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '28px',
        marginBottom: '40px'
      }}>
        {features.map((feature, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              padding: '32px',
              textAlign: 'center',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s',
              animation: `slideUp 0.5s ease-out ${index * 0.15}s both`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)';
            }}
          >
            <div style={{
              marginBottom: '20px',
              display: 'inline-flex',
              justifyContent: 'center',
              padding: '20px',
              borderRadius: '20px',
              backgroundColor: feature.bg,
              color: feature.color,
              transition: 'transform 0.3s'
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0)'}
            >
              {feature.icon}
            </div>
            <h4 style={{ fontWeight: '700', color: '#1f2937', marginBottom: '12px', fontSize: '20px', fontFamily: 'Poppins, sans-serif' }}>
              {feature.title}
            </h4>
            <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.7' }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div style={{
        background: 'linear-gradient(135deg, #059669, #0d9488)',
        borderRadius: '24px',
        padding: '48px',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(5, 150, 105, 0.3)',
        animation: 'slideUp 0.6s ease-out 0.4s both'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '50%', backdropFilter: 'blur(4px)' }}>
              <Globe size={40} />
            </div>
          </div>
          <h4 style={{ fontWeight: '800', marginBottom: '20px', fontSize: '32px', fontFamily: 'Poppins, sans-serif' }}>
            Our Mission
          </h4>
          <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#ecfdf5' }}>
            To make travel in Bangladesh accessible, safe, and enriching for everyone. We believe in the power of
            technology to connect people with places and create meaningful travel experiences that celebrate local
            culture and promote sustainable tourism.
          </p>
        </div>

        {/* Animated Background Particles */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          opacity: 0.3
        }} />
      </div>
    </div>
  );
}