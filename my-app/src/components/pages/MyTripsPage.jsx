import React from 'react';
import { Calendar, MapPin, Clock, TrendingUp } from 'lucide-react';

export default function MyTripsPage() {
  const trips = [
    {
      id: 1,
      destination: 'Cox\'s Bazar Beach Trip',
      date: 'November 2024',
      duration: '3 days',
      status: 'completed'
    },
    {
      id: 2,
      destination: 'Sylhet Tea Garden Tour',
      date: 'October 2024',
      duration: '2 days',
      status: 'completed'
    },
    {
      id: 3,
      destination: 'Sundarbans Mangrove Forest',
      date: 'December 2024',
      duration: '4 days',
      status: 'upcoming'
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '42px',
          fontWeight: '800',
          color: '#1f2937',
          marginBottom: '12px',
          fontFamily: 'Poppins, sans-serif'
        }}>
          My Travel History
        </h2>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>
          Track your journeys and relive your adventures
        </p>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
        padding: '32px',
        marginBottom: '28px',
        border: '1px solid rgba(5, 150, 105, 0.1)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
          {/* Timeline Line */}
          <div style={{
            position: 'absolute',
            left: '26px',
            top: '40px',
            bottom: '40px',
            width: '3px',
            background: 'linear-gradient(to bottom, #059669, #0d9488)',
            borderRadius: '2px'
          }} />

          {trips.map((trip, index) => (
            <div
              key={trip.id}
              style={{
                position: 'relative',
                paddingLeft: '68px',
                paddingTop: '12px',
                paddingBottom: '12px',
                animation: `slideUp 0.5s ease-out ${index * 0.15}s both`
              }}
            >
              {/* Timeline Dot */}
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '20px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: trip.status === 'upcoming'
                  ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                  : 'linear-gradient(135deg, #059669, #0d9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: trip.status === 'upcoming'
                  ? '0 4px 12px rgba(59, 130, 246, 0.4)'
                  : '0 4px 12px rgba(5, 150, 105, 0.4)',
                border: '4px solid white',
                zIndex: 1
              }}>
                {trip.status === 'upcoming' ? (
                  <TrendingUp size={14} color="white" strokeWidth={3} />
                ) : (
                  <Calendar size={14} color="white" strokeWidth={3} />
                )}
              </div>

              <div style={{
                backgroundColor: trip.status === 'upcoming' ? '#f0f9ff' : '#f0fdf4',
                borderRadius: '16px',
                padding: '20px 24px',
                border: `2px solid ${trip.status === 'upcoming' ? '#bfdbfe' : '#bbf7d0'}`,
                transition: 'all 0.3s'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(8px)';
                  e.currentTarget.style.boxShadow = trip.status === 'upcoming'
                    ? '0 8px 16px rgba(59, 130, 246, 0.15)'
                    : '0 8px 16px rgba(5, 150, 105, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontWeight: '700',
                      color: '#1f2937',
                      marginBottom: '12px',
                      fontSize: '20px',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      {trip.destination}
                    </h4>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                        <div style={{
                          padding: '6px',
                          borderRadius: '8px',
                          backgroundColor: 'white',
                          display: 'flex'
                        }}>
                          <Calendar size={16} color={trip.status === 'upcoming' ? '#3b82f6' : '#059669'} />
                        </div>
                        {trip.date}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                        <div style={{
                          padding: '6px',
                          borderRadius: '8px',
                          backgroundColor: 'white',
                          display: 'flex'
                        }}>
                          <Clock size={16} color={trip.status === 'upcoming' ? '#3b82f6' : '#059669'} />
                        </div>
                        {trip.duration}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '700',
                    backgroundColor: trip.status === 'upcoming' ? '#3b82f6' : '#059669',
                    color: 'white',
                    boxShadow: trip.status === 'upcoming'
                      ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                      : '0 4px 12px rgba(5, 150, 105, 0.3)'
                  }}>
                    {trip.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
        borderRadius: '20px',
        padding: '32px',
        border: '2px solid #bbf7d0',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.1)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #059669, #0d9488)',
          marginBottom: '16px',
          boxShadow: '0 8px 16px rgba(5, 150, 105, 0.3)'
        }}>
          <MapPin size={32} color="white" strokeWidth={2.5} />
        </div>
        <h3 style={{
          color: '#059669',
          fontWeight: '800',
          marginBottom: '8px',
          fontSize: '28px',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Total Trips: {trips.length}
        </h3>
        <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6' }}>
          Keep exploring and add more destinations to your travel history!
        </p>
      </div>
    </div>
  );
}