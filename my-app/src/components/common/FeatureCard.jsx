import React from 'react';

export default function FeatureCard({ icon, title, description }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
      padding: '28px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      border: '1px solid rgba(5, 150, 105, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(5, 150, 105, 0.15)';
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.borderColor = 'rgba(5, 150, 105, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(5, 150, 105, 0.1)';
      }}
    >
      {/* Gradient Background on Hover */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #059669, #0d9488)',
        opacity: 0,
        transition: 'opacity 0.3s'
      }} className="card-accent" />

      {/* Icon Container */}
      <div style={{
        marginBottom: '20px',
        display: 'inline-flex',
        padding: '16px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(13, 148, 136, 0.1))',
        transition: 'transform 0.3s'
      }} className="icon-container">
        {icon}
      </div>

      <h3 style={{
        fontSize: '22px',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '12px',
        fontFamily: 'Poppins, sans-serif'
      }}>
        {title}
      </h3>

      <p style={{
        color: '#6b7280',
        fontSize: '15px',
        lineHeight: '1.7'
      }}>
        {description}
      </p>

      <style>{`
        div:hover .card-accent {
          opacity: 1 !important;
        }
        div:hover .icon-container {
          transform: scale(1.1) !important;
        }
      `}</style>
    </div>
  );
}