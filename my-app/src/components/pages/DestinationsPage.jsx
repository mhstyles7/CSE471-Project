import React from 'react';

export default function DestinationsPage() {
  const destinations = ['Cox\'s Bazar', 'Sundarbans', 'Sylhet', 'Rangamati', 'Sajek Valley', 'Saint Martin'];
  
  return (
    <div>
      <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>Popular Destinations</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {destinations.map(dest => (
          <div key={dest} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            transition: 'box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
          >
            <div style={{
              height: '192px',
              background: 'linear-gradient(to bottom right, #34d399, #14b8a6)'
            }}></div>
            <div style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>{dest}</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>Discover the beauty and culture of {dest}</p>
              <button style={{
                color: '#059669',
                fontWeight: '500',
                fontSize: '14px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}>
                Learn More →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}