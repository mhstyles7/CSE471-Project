import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';

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
      <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
        My Travel History
      </h2>
      
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Track your journeys, view your travel timeline, and relive your adventures
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {trips.map((trip, index) => (
            <div
              key={trip.id}
              style={{
                borderLeft: `4px solid ${trip.status === 'upcoming' ? '#3b82f6' : '#059669'}`,
                paddingLeft: '16px',
                paddingTop: '12px',
                paddingBottom: '12px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h4 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px', fontSize: '18px' }}>
                    {trip.destination}
                  </h4>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280' }}>
                      <Calendar size={16} />
                      {trip.date}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280' }}>
                      <Clock size={16} />
                      {trip.duration}
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: trip.status === 'upcoming' ? '#dbeafe' : '#d1fae5',
                  color: trip.status === 'upcoming' ? '#1e40af' : '#047857'
                }}>
                  {trip.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        backgroundColor: '#f0fdf4',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #d1fae5',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#059669', fontWeight: '600', marginBottom: '8px' }}>
          Total Trips: {trips.length}
        </h3>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Keep exploring and add more destinations to your travel history!
        </p>
      </div>
    </div>
  );
}