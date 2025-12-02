import React, { useState } from 'react';
import { Calendar, Users, MapPin, Plus, UserPlus } from 'lucide-react';

export default function GroupEventsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  const [events] = useState([
    {
      id: 1,
      name: 'Cox\'s Bazar Beach Trip',
      date: '2024-12-15',
      location: 'Cox\'s Bazar',
      organizer: 'Alimool Razi',
      participants: 8,
      maxParticipants: 15,
      status: 'open',
      description: 'Join us for a 3-day beach adventure! We\'ll explore the longest sea beach in the world.'
    },
    {
      id: 2,
      name: 'Sylhet Tea Garden Tour',
      date: '2024-12-20',
      location: 'Sylhet',
      organizer: 'Zarin Raisa',
      participants: 12,
      maxParticipants: 12,
      status: 'full',
      description: 'Experience the serene beauty of tea gardens. Includes local guide and transportation.'
    }
  ]);

  const handleCreateEvent = () => {
    if (eventName && eventDate && eventLocation) {
      console.log('Creating event:', { eventName, eventDate, eventLocation });
      // Will connect to backend
      setShowCreateForm(false);
      setEventName('');
      setEventDate('');
      setEventLocation('');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937' }}>Group Events & Tours</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500'
          }}
        >
          <Plus size={20} />
          Create Event
        </button>
      </div>

      {/* Create Event Form */}
      {showCreateForm && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
            Create New Group Event
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Location"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateForm(false)}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#1f2937',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {events.map(event => (
          <div key={event.id} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                  {event.name}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
                  {event.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#6b7280', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} />
                    {event.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} />
                    {event.participants}/{event.maxParticipants} participants
                  </div>
                </div>
              </div>
              <div style={{
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: event.status === 'open' ? '#d1fae5' : '#fee2e2',
                color: event.status === 'open' ? '#047857' : '#dc2626'
              }}>
                {event.status === 'open' ? 'Open' : 'Full'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <button
                disabled={event.status === 'full'}
                style={{
                  backgroundColor: event.status === 'open' ? '#059669' : '#d1d5db',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: event.status === 'open' ? 'pointer' : 'not-allowed',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <UserPlus size={16} />
                {event.status === 'open' ? 'Join Event' : 'Event Full'}
              </button>
              <button style={{
                backgroundColor: '#f3f4f6',
                color: '#1f2937',
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}