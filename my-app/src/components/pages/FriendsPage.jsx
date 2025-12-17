import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Check, X, MessageCircle, MapPin, Calendar, Heart, Send, Bell, Clock, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';

export default function FriendsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [notification, setNotification] = useState(null);

  // API State
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  // Fetch Data
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch My Friends
      const friendsRes = await fetch(`http://localhost:1306/api/users/${user._id}/friends`);
      const friendsData = await friendsRes.json();

      // 2. Fetch Sent Requests (To disable buttons)
      const sentRes = await fetch(`http://localhost:1306/api/users/${user._id}/sent-requests`);
      const sentData = await sentRes.json();
      setSentRequests(sentData); // Store IDs of users I sent requests to

      // 3. Fetch Incoming Requests
      const requestsRes = await fetch(`http://localhost:1306/api/users/${user._id}/requests`);
      const requestsData = await requestsRes.json();

      // Transform Request Data for UI
      const mappedRequests = requestsData.map(req => ({
        id: req.id, // Request ID
        fromUserId: req.fromUser._id,
        name: req.fromUser.name,
        image: req.fromUser.avatar ? <img src={req.fromUser.avatar} alt={req.fromUser.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : req.fromUser.name.substring(0, 2).toUpperCase(),
        bio: req.fromUser.role, // Use role as bio for now
        mutualFriends: Math.floor(Math.random() * 5), // Mock
        recentTrip: null
      }));
      setFriendRequests(mappedRequests);

      // 4. Fetch Suggestions (Filter out friends, me, AND already sent requests)
      const allUsersRes = await fetch(`http://localhost:1306/api/users`);
      const allUsersData = await allUsersRes.json();

      const friendIds = new Set(friendsData.map(f => f._id));
      const sentIds = new Set(sentData); // sentData is array of strings (user IDs)

      const newSuggestions = allUsersData.filter(u =>
        u._id !== user._id &&
        !friendIds.has(u._id) &&
        !sentIds.has(u._id) // Filter out pending sent requests
      );

      // Add random mutual friends count for UI demo
      const suggestionsWithMeta = newSuggestions.map(s => ({
        ...s,
        mutualFriends: Math.floor(Math.random() * 10),
        image: s.avatar ? <img src={s.avatar} alt={s.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : s.name.substring(0, 2).toUpperCase()
      }));

      setSuggestions(suggestionsWithMeta);

      // Map friends to UI format
      const friendsWithMeta = friendsData.map(f => ({
        ...f,
        id: f._id, // Map _id to id for UI
        image: f.avatar ? <img src={f.avatar} alt={f.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : f.name.substring(0, 2).toUpperCase(),
        trips: f.trips_count || 0,
        lastActive: 'Online',
        isOnline: true
      }));
      setFriends(friendsWithMeta);

      // 5. Fetch Activity Feed (Posts)
      const postsRes = await fetch(`http://localhost:1306/api/posts`);
      const postsData = await postsRes.json();

      // Filter posts: Show posts from my friends
      const myFriendIds = new Set(friendsData.map(f => f._id));
      const relevantPosts = postsData.filter(p => myFriendIds.has(p.userId));

      // Map posts to UI format
      const mappedFeed = relevantPosts.map(p => ({
        id: p._id,
        friendName: p.user.name,
        friendImage: p.user.avatar ? <img src={p.user.avatar} alt={p.user.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : p.user.name.substring(0, 2).toUpperCase(),
        type: p.type,
        content: p.type === 'trip' ? `completed a trip to ${p.destination}` :
          p.type === 'review' ? `reviewed ${p.destination}` :
            p.type === 'recommendation' ? `recommended ${p.destination}` :
              p.content, // for normal posts
        time: new Date(p.createdAt).toLocaleDateString(), // Simple format
        destination: p.destination,
        rating: p.rating,
        fullContent: p.content // Store full text for display
      }));

      setActivityFeed(mappedFeed);

    } catch (err) {
      console.error("Error fetching friends:", err);
      showNotification("Failed to load community data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Send Request
  const handleSendRequest = async (friendId) => {
    try {
      const res = await fetch(`http://localhost:1306/api/users/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: user._id, toUserId: friendId })
      });

      const data = await res.json();

      if (res.ok) {
        const addedUser = suggestions.find(s => s._id === friendId);
        showNotification(`Request sent to ${addedUser?.name}!`);

        // Update UI: Remove from suggestions, Add to Sent Requests? Or just disable button?
        // For now, remove from suggestions
        setSuggestions(prev => prev.filter(s => s._id !== friendId));
      } else {
        showNotification(data.message || "Failed to send request", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to send request", "error");
    }
  };

  // Accept Request
  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await fetch(`http://localhost:1306/api/users/request/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' })
      });

      if (res.ok) {
        const request = friendRequests.find(r => r.id === requestId);
        showNotification(`You are now friends with ${request?.name}!`);

        setFriendRequests(prev => prev.filter(r => r.id !== requestId));
        // Ideally refetch friends but we can just move it for now
        if (request) {
          // Quick UI update (reload will fix full data)
          // We need the full user object but we partly have it
          fetchData(); // Simplest way to resync
        }
      }
    } catch (err) {
      showNotification("Failed to accept request", "error");
    }
  };

  // Reject Request
  const handleRejectRequest = async (requestId) => {
    try {
      const res = await fetch(`http://localhost:1306/api/users/request/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (res.ok) {
        setFriendRequests(prev => prev.filter(r => r.id !== requestId));
        showNotification("Request declined");
      }
    } catch (err) {
      showNotification("Failed to reject request", "error");
    }
  };

  // Stub other existing functions to prevent errors if they are used elsewhere or just keep them as visual only for now
  const [friendRequests, setFriendRequests] = useState([]); // Leave empty for now as we don't have request logic
  const [sentRequests, setSentRequests] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);

  // Mock Notification logic
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Stub handlers

  const handleCancelRequest = () => { };
  const handleInviteToTrip = () => { };

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
          zIndex: 9999,
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
                {/* Show full content for posts that are just text */}
                {activity.type === 'post' && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#4b5563', fontStyle: 'italic' }}>
                    "{activity.fullContent}"
                  </p>
                )}
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
                onClick={() => handleSendRequest(person._id)}
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
      )
      }

      {/* Sent Requests Tab */}
      {
        activeTab === 'sent' && (
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
        )
      }

      {/* CSS Animations */}
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div >
  );
}