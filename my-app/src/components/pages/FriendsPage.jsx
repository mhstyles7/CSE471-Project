import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Check, X, MessageCircle, MapPin, Calendar, Heart, Send, Bell, Clock, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';

export default function FriendsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [notification, setNotification] = useState(null);

  // State for friend requests - can be accepted/rejected (2.1)
  const [friendRequests, setFriendRequests] = useState([
    { id: 1, name: 'Tasnim Rahman', mutualFriends: 5, image: 'TR', bio: 'Adventure seeker | Beach lover', recentTrip: "Cox's Bazar" },
    { id: 2, name: 'Ahnaf Rivan', mutualFriends: 3, image: 'AR', bio: 'Mountain explorer', recentTrip: 'Bandarban' },
    { id: 3, name: 'Sabrina Khan', mutualFriends: 8, image: 'SK', bio: 'Food & Culture enthusiast', recentTrip: 'Sylhet' }
  ]);

  // State for accepted friends (2.1, 2.2)
  const [friends, setFriends] = useState([
    {
      id: 1,
      name: 'Alimool Razi',
      trips: 8,
      image: 'AR',
      lastActive: 'Online',
      isOnline: true,
      recentActivity: { type: 'trip', destination: 'Sajek Valley', date: '2 days ago' },
      upcomingTrip: { destination: "Cox's Bazar", date: 'Dec 15, 2024' }
    },
    {
      id: 2,
      name: 'Zarin Raisa',
      trips: 12,
      image: 'ZR',
      lastActive: '2 hours ago',
      isOnline: false,
      recentActivity: { type: 'post', content: 'Shared tea garden photos', date: '5 hours ago' },
      upcomingTrip: null
    },
    {
      id: 3,
      name: 'Rafiq Ahmed',
      trips: 5,
      image: 'RA',
      lastActive: '1 day ago',
      isOnline: false,
      recentActivity: { type: 'review', destination: 'Sundarbans', date: '1 day ago' },
      upcomingTrip: { destination: 'Rangamati', date: 'Dec 20, 2024' }
    }
  ]);

  // Friend suggestions (2.1)
  const [suggestions, setSuggestions] = useState([
    { id: 1, name: 'Fahim Ahmed', mutualFriends: 7, image: 'FA', commonInterests: ['Beach', 'Photography'] },
    { id: 2, name: 'Nusrat Jahan', mutualFriends: 4, image: 'NJ', commonInterests: ['Mountains', 'Trekking'] },
    { id: 3, name: 'Karim Uddin', mutualFriends: 6, image: 'KU', commonInterests: ['Culture', 'Food'] }
  ]);

  // Pending sent requests
  const [sentRequests, setSentRequests] = useState([]);

  // Friends' Activity Feed (2.2)
  const [activityFeed, setActivityFeed] = useState([
    { id: 1, friendName: 'Alimool Razi', friendImage: 'AR', type: 'trip', content: 'completed a trip to Sajek Valley', time: '2 hours ago', destination: 'Sajek Valley' },
    { id: 2, friendName: 'Zarin Raisa', friendImage: 'ZR', type: 'post', content: 'shared photos from Sylhet tea gardens', time: '5 hours ago' },
    { id: 3, friendName: 'Rafiq Ahmed', friendImage: 'RA', type: 'review', content: 'wrote a review for Sundarbans boat tour', time: '1 day ago', rating: 5 },
    { id: 4, friendName: 'Alimool Razi', friendImage: 'AR', type: 'recommendation', content: 'recommended visiting Ratargul Swamp Forest', time: '2 days ago', destination: 'Ratargul' }
  ]);

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Accept friend request (2.1)
  const handleAcceptRequest = (requestId) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      // Add to friends list
      setFriends(prev => [...prev, {
        ...request,
        trips: 0,
        lastActive: 'Just now',
        isOnline: true,
        recentActivity: { type: 'new_friend', content: 'Became friends with you', date: 'Just now' },
        upcomingTrip: null
      }]);
      // Remove from requests
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      // Add to activity feed
      setActivityFeed(prev => [{
        id: Date.now(),
        friendName: request.name,
        friendImage: request.image,
        type: 'new_friend',
        content: 'is now your friend!',
        time: 'Just now'
      }, ...prev]);
      showNotification(`You are now friends with ${request.name}! 🎉`);
    }
  };

  // Reject friend request (2.1)
  const handleRejectRequest = (requestId) => {
    const request = friendRequests.find(r => r.id === requestId);
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    if (request) {
      showNotification(`Request from ${request.name} declined`, 'info');
    }
  };

  // Send friend request (2.1)
  const handleSendRequest = (suggestionId) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      setSentRequests(prev => [...prev, suggestion]);
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      showNotification(`Friend request sent to ${suggestion.name}! 📤`);
    }
  };

  // Cancel sent request
  const handleCancelRequest = (requestId) => {
    const request = sentRequests.find(r => r.id === requestId);
    if (request) {
      setSentRequests(prev => prev.filter(r => r.id !== requestId));
      setSuggestions(prev => [...prev, { ...request, mutualFriends: request.mutualFriends || 0 }]);
      showNotification(`Request to ${request.name} cancelled`, 'info');
    }
  };

  // Send trip invitation (2.3)
  const handleInviteToTrip = (friendId, destination) => {
    const friend = friends.find(f => f.id === friendId);
    if (friend) {
      showNotification(`Trip invitation sent to ${friend.name} for ${destination}! ✈️`);
    }
  };

  // Login required check
  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Users size={64} color="#9ca3af" style={{ marginBottom: '20px' }} />
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>Connect with Travelers</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>Login to build your travel network and see friends' activities</p>
        <button
          onClick={() => navigate('login')}
          style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '14px 32px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
          }}
        >
          Sign In to Connect
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: notification.type === 'success' ? '#059669' : '#6b7280',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 1001,
          animation: 'slideDown 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Bell size={20} />
          {notification.message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{
            fontSize: '42px',
            fontWeight: '800',
            color: '#1f2937',
            marginBottom: '8px',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Your Travel Network
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            Connect with fellow travelers and see what they're up to
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {friendRequests.length > 0 && (
            <div style={{
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Bell size={18} />
              {friendRequests.length} pending request{friendRequests.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', borderBottom: '2px solid #f3f4f6', overflowX: 'auto' }}>
        {[
          { id: 'all', label: 'All Friends', count: friends.length },
          { id: 'activity', label: 'Activity Feed', icon: Activity },
          { id: 'requests', label: 'Requests', count: friendRequests.length },
          { id: 'suggestions', label: 'Suggestions' },
          { id: 'sent', label: 'Sent', count: sentRequests.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '14px 28px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '15px',
              color: activeTab === tab.id ? '#059669' : '#9ca3af',
              borderBottom: activeTab === tab.id ? '3px solid #059669' : 'none',
              marginBottom: '-2px',
              transition: 'all 0.3s',
              borderRadius: '8px 8px 0 0',
              backgroundColor: activeTab === tab.id ? '#f0fdf4' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {tab.icon && <tab.icon size={18} />}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span style={{
                backgroundColor: activeTab === tab.id ? '#059669' : '#e5e7eb',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Activity Feed Tab (2.2) */}
      {activeTab === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
            Friends' Recent Activities
          </h3>
          {activityFeed.map((activity, index) => (
            <div key={activity.id} style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              padding: '20px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
              border: '1px solid rgba(0,0,0,0.05)',
              animation: `slideUp 0.4s ease-out ${index * 0.1}s both`
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #059669, #0d9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
                flexShrink: 0
              }}>
                {activity.friendImage}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '15px', color: '#374151' }}>
                  <strong style={{ color: '#1f2937' }}>{activity.friendName}</strong> {activity.content}
                </p>
                {activity.destination && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: '#059669', fontSize: '14px' }}>
                    <MapPin size={14} />
                    {activity.destination}
                  </div>
                )}
                {activity.rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    {[...Array(activity.rating)].map((_, i) => (
                      <span key={i} style={{ color: '#fbbf24' }}>★</span>
                    ))}
                  </div>
                )}
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={12} />
                  {activity.time}
                </p>
              </div>
              <button style={{
                backgroundColor: '#f0fdf4',
                color: '#059669',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                <Heart size={14} />
                Like
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Friend Requests Tab (2.1) */}
      {activeTab === 'requests' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {friendRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <Users size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
              <p>No pending friend requests</p>
            </div>
          ) : (
            friendRequests.map((request, index) => (
              <div key={request.id} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(5, 150, 105, 0.1)',
                flexWrap: 'wrap',
                gap: '16px',
                animation: `slideUp 0.5s ease-out ${index * 0.1}s both`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #059669, #0d9488)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '22px',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                  }}>
                    {request.image}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '700', color: '#1f2937', margin: 0, fontSize: '18px' }}>{request.name}</h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>{request.bio}</p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#9ca3af' }}>
                      <span>{request.mutualFriends} mutual friends</span>
                      {request.recentTrip && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          Recently visited {request.recentTrip}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    style={{
                      backgroundColor: '#059669',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    <Check size={18} strokeWidth={2.5} />
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '600',
                      transition: 'all 0.3s'
                    }}
                  >
                    <X size={18} strokeWidth={2.5} />
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All Friends Tab (2.2) */}
      {activeTab === 'all' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {friends.map((friend, index) => (
            <div key={friend.id} style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              padding: '28px',
              border: '1px solid rgba(5, 150, 105, 0.1)',
              transition: 'all 0.3s',
              animation: `scaleIn 0.5s ease-out ${index * 0.1}s both`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #059669, #0d9488)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '24px',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                  }}>
                    {friend.image}
                  </div>
                  {friend.isOnline && (
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#22c55e',
                      borderRadius: '50%',
                      border: '3px solid white'
                    }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: '700', color: '#1f2937', margin: 0, fontSize: '18px' }}>{friend.name}</h4>
                  <p style={{ fontSize: '13px', color: friend.isOnline ? '#22c55e' : '#9ca3af', margin: '4px 0 0', fontWeight: '500' }}>
                    {friend.lastActive}
                  </p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                    {friend.trips} trips completed
                  </p>
                </div>
              </div>

              {/* Recent Activity (2.2) */}
              {friend.recentActivity && (
                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                  <p style={{ margin: 0, color: '#6b7280' }}>
                    <strong style={{ color: '#374151' }}>Recent:</strong> {friend.recentActivity.content || `${friend.recentActivity.type} - ${friend.recentActivity.destination}`}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>{friend.recentActivity.date}</p>
                </div>
              )}

              {/* Upcoming Trip (2.3) */}
              {friend.upcomingTrip && (
                <div style={{
                  backgroundColor: '#fef3c7',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <p style={{ margin: 0, color: '#92400e', fontWeight: '600' }}>
                      <Calendar size={14} style={{ marginRight: '6px', display: 'inline' }} />
                      Upcoming: {friend.upcomingTrip.destination}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#b45309' }}>{friend.upcomingTrip.date}</p>
                  </div>
                  <button
                    onClick={() => handleInviteToTrip(friend.id, friend.upcomingTrip.destination)}
                    style={{
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    Join Trip
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  backgroundColor: '#f0fdf4',
                  color: '#059669',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #bbf7d0',
                  cursor: 'pointer',
                  flex: 1,
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}>
                  View Profile
                </button>
                <button style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s'
                }}>
                  <MessageCircle size={20} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => showNotification(`Trip invitation sent to ${friend.name}!`)}
                  style={{
                    backgroundColor: '#f0fdf4',
                    color: '#059669',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '2px solid #bbf7d0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.3s'
                  }}
                  title="Send Trip Invitation"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions Tab (2.1) */}
      {activeTab === 'suggestions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {suggestions.map((person, index) => (
            <div key={person.id} style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              padding: '28px',
              textAlign: 'center',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s',
              animation: `scaleIn 0.5s ease-out ${index * 0.1}s both`
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #9ca3af, #6b7280)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '28px',
                margin: '0 auto 16px',
                boxShadow: '0 8px 16px rgba(107, 114, 128, 0.3)',
                border: '4px solid white'
              }}>
                {person.image}
              </div>
              <h4 style={{ fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0', fontSize: '20px' }}>{person.name}</h4>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px 0' }}>
                {person.mutualFriends} mutual friends
              </p>
              {person.commonInterests && (
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {person.commonInterests.map((interest, i) => (
                    <span key={i} style={{
                      backgroundColor: '#f0fdf4',
                      color: '#059669',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {interest}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => handleSendRequest(person.id)}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                  transition: 'all 0.3s'
                }}
              >
                <UserPlus size={18} strokeWidth={2.5} />
                Add Friend
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sent Requests Tab */}
      {activeTab === 'sent' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {sentRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <Send size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
              <p>No pending sent requests</p>
            </div>
          ) : (
            sentRequests.map((request, index) => (
              <div key={request.id} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #9ca3af, #6b7280)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {request.image}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: '600' }}>{request.name}</h4>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9ca3af' }}>Request pending...</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCancelRequest(request.id)}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}