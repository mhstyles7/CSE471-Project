import React, { useState } from 'react';
import { UserPlus, Users, Check, X } from 'lucide-react';

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState('all'); // all, requests, suggestions
  
  // Mock data - will come from backend
  const [friendRequests] = useState([
    { id: 1, name: 'Tasnim Rahman', mutualFriends: 5, image: 'TR' },
    { id: 2, name: 'Ahnaf Rivan', mutualFriends: 3, image: 'AR' }
  ]);

  const [friends] = useState([
    { id: 1, name: 'Alimool Razi', trips: 8, image: 'AR', lastActive: '2 hours ago' },
    { id: 2, name: 'Zarin Raisa', trips: 12, image: 'ZR', lastActive: 'Online' }
  ]);

  const [suggestions] = useState([
    { id: 1, name: 'Fahim Ahmed', mutualFriends: 7, image: 'FA' },
    { id: 2, name: 'Nusrat Jahan', mutualFriends: 4, image: 'NJ' }
  ]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937' }}>Your Travel Network</h2>
        <button style={{
          backgroundColor: '#059669',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <UserPlus size={18} />
          Find Friends
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb' }}>
        {['all', 'requests', 'suggestions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              color: activeTab === tab ? '#059669' : '#6b7280',
              borderBottom: activeTab === tab ? '2px solid #059669' : 'none',
              marginBottom: '-2px'
            }}
          >
            {tab === 'all' && 'All Friends'}
            {tab === 'requests' && `Requests (${friendRequests.length})`}
            {tab === 'suggestions' && 'Suggestions'}
          </button>
        ))}
      </div>

      {/* Friend Requests Tab */}
      {activeTab === 'requests' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {friendRequests.map(request => (
            <div key={request.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(to right, #059669, #0d9488)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {request.image}
                </div>
                <div>
                  <h4 style={{ fontWeight: '600', color: '#1f2937', margin: 0 }}>{request.name}</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                    {request.mutualFriends} mutual friends
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Check size={16} />
                  Accept
                </button>
                <button style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <X size={16} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Friends Tab */}
      {activeTab === 'all' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {friends.map(friend => (
            <div key={friend.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(to right, #059669, #0d9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '20px',
                margin: '0 auto 12px'
              }}>
                {friend.image}
              </div>
              <h4 style={{ fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>{friend.name}</h4>
              <p style={{ fontSize: '12px', color: '#10b981', margin: '0 0 8px 0' }}>{friend.lastActive}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px 0' }}>
                {friend.trips} trips completed
              </p>
              <button style={{
                backgroundColor: '#f3f4f6',
                color: '#1f2937',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                fontWeight: '500'
              }}>
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {suggestions.map(person => (
            <div key={person.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(to right, #6b7280, #9ca3af)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '20px',
                margin: '0 auto 12px'
              }}>
                {person.image}
              </div>
              <h4 style={{ fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>{person.name}</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px 0' }}>
                {person.mutualFriends} mutual friends
              </p>
              <button style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <UserPlus size={16} />
                Add Friend
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 