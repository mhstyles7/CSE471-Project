<<<<<<< HEAD
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Check, X, MapPin, Heart, Bell, Clock, Activity, Calendar, MessageCircle, Send, UserPlus } from 'lucide-react';
=======
import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Check, X, MessageCircle, MapPin, Calendar, Heart, Send, Bell, Clock, Activity } from 'lucide-react';
>>>>>>> origin/Tashu
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

<<<<<<< HEAD
  // Modal & Interaction State
  const [activeModal, setActiveModal] = useState(null); // 'profile', 'message', 'invite'
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [conversation, setConversation] = useState([]); // Chat history
  const [myEvents, setMyEvents] = useState([]); // For invite dropdown
  const [selectedEventId, setSelectedEventId] = useState('');
  const chatEndRef = useRef(null); // For auto-scrolling

  // Legacy/Existing State required for other parts of the UI
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);

  // Notification Logic
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Legacy Handlers
  // Legacy Handlers
  const handleCancelRequest = async (requestId) => {
    try {
      // In a real app, delete from DB:
      // await fetch(`/api/users/request/${requestId}`, { method: 'DELETE' });

      // For now, just update UI state since we don't have a specific delete endpoint for requests ready yet
      // ACTUALLY, we should likely add one, but for now let's just update UI
      setSentRequests(prev => prev.filter(r => r.id !== requestId));
      showNotification("Request cancelled");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, type: 'like' })
      });
      if (res.ok) {
        const data = await res.json();
        const reactions = data.reactions || [];
        const likesCount = reactions.filter(r => r.type === 'like').length;
        const isLikedByMe = reactions.some(r => r.userId === user._id && r.type === 'like');

        // Update local state to reflect like
        setActivityFeed(prev => prev.map(post => {
          if (post.id === postId) {
            return { ...post, isLiked: isLikedByMe, likes: likesCount };
          }
          return post;
        }));
        // showNotification(data.action === 'added' ? "Post liked!" : "Like removed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInviteToTrip = (friendId, destination) => {
    // Redirect this to the new Modal
    const friendsData = friends; // Use local state if needed (will be bound)
    const friend = friends.find(f => f.id === friendId);
    if (friend) {
      handleOpenInvite(friend);
    }
  };

=======
>>>>>>> origin/Tashu

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
<<<<<<< HEAD
      const friendsRes = await fetch(`http://localhost:5000/api/users/${user._id}/friends`);
      const friendsData = await friendsRes.json();

      // 2. Fetch Sent Requests (To disable buttons)
      const sentRes = await fetch(`http://localhost:5000/api/users/${user._id}/sent-requests`);
      const sentData = await sentRes.json();

      // Transform keys for UI
      const mappedSent = sentData.map(req => ({
        id: req.id,
        name: req.toUser.name,
        image: req.toUser.avatar ? <img src={req.toUser.avatar} alt={req.toUser.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : req.toUser.name.substring(0, 2).toUpperCase(),
        userId: req.toUser._id
      }));

      setSentRequests(mappedSent);

      // 3. Fetch Incoming Requests
      const requestsRes = await fetch(`http://localhost:5000/api/users/${user._id}/requests`);
=======
      const friendsRes = await fetch(`http://localhost:1306/api/users/${user._id}/friends`);
      const friendsData = await friendsRes.json();

      // 2. Fetch Sent Requests (To disable buttons)
      const sentRes = await fetch(`http://localhost:1306/api/users/${user._id}/sent-requests`);
      const sentData = await sentRes.json();
      setSentRequests(sentData); // Store IDs of users I sent requests to

      // 3. Fetch Incoming Requests
      const requestsRes = await fetch(`http://localhost:1306/api/users/${user._id}/requests`);
>>>>>>> origin/Tashu
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
<<<<<<< HEAD
      const allUsersRes = await fetch(`http://localhost:5000/api/users`);
      const allUsersData = await allUsersRes.json();

      const friendIds = new Set(friendsData.map(f => f._id));
      const sentIds = new Set(sentData.map(r => r.toUser._id)); // Extract toUser ID from request object
=======
      const allUsersRes = await fetch(`http://localhost:1306/api/users`);
      const allUsersData = await allUsersRes.json();

      const friendIds = new Set(friendsData.map(f => f._id));
      const sentIds = new Set(sentData); // sentData is array of strings (user IDs)
>>>>>>> origin/Tashu

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
<<<<<<< HEAD
      const postsRes = await fetch(`http://localhost:5000/api/posts`);
=======
      const postsRes = await fetch(`http://localhost:1306/api/posts`);
>>>>>>> origin/Tashu
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
<<<<<<< HEAD
        fullContent: p.content, // Store full text for display
        likes: (p.reactions || []).filter(r => r.type === 'like').length,
        isLiked: (p.reactions || []).some(r => r.userId === user._id && r.type === 'like')
=======
        fullContent: p.content // Store full text for display
>>>>>>> origin/Tashu
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
<<<<<<< HEAD
      const res = await fetch(`http://localhost:5000/api/users/request`, {
=======
      const res = await fetch(`http://localhost:1306/api/users/request`, {
>>>>>>> origin/Tashu
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
<<<<<<< HEAD
      const res = await fetch(`http://localhost:5000/api/users/request/${requestId}`, {
=======
      const res = await fetch(`http://localhost:1306/api/users/request/${requestId}`, {
>>>>>>> origin/Tashu
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
<<<<<<< HEAD
      const res = await fetch(`http://localhost:5000/api/users/request/${requestId}`, {
=======
      const res = await fetch(`http://localhost:1306/api/users/request/${requestId}`, {
>>>>>>> origin/Tashu
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

<<<<<<< HEAD



  // Chat & Event Fetching Logic
  useEffect(() => {
    let interval;
    if (activeModal === 'invite') {
      fetchMyEvents();
    } else if (activeModal === 'message' && selectedFriend) {
      fetchConversation();
      // Poll for new messages every 3 seconds
      interval = setInterval(fetchConversation, 3000);
    }
    return () => clearInterval(interval);
  }, [activeModal, selectedFriend]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (activeModal === 'message' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation, activeModal]);

  const fetchConversation = async () => {
    if (!selectedFriend) return;
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${user._id}/${selectedFriend.id || selectedFriend._id}`);
      if (res.ok) {
        const data = await res.json();
        setConversation(data);
      }
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  const fetchMyEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/events');
      const data = await res.json();
      // Filter events where I am a participant or organizer
      const joined = data.filter(e =>
        e.organizerId === user._id ||
        (e.participants && e.participants.some(p => p.userId === user._id))
      );
      setMyEvents(joined);
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  // Handlers for Modals
  const handleOpenProfile = (friend) => {
    setSelectedFriend(friend);
    setActiveModal('profile');
  };

  const handleOpenMessage = (friend) => {
    setSelectedFriend(friend);
    setActiveModal('message');
    setMessageText('');
    setConversation([]); // Clear previous chat
  };

  const handleOpenInvite = (friend) => {
    setSelectedFriend(friend);
    setActiveModal('invite');
    setSelectedEventId('');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedFriend(null);
  };

  // Action Handlers
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: user._id,
          toUserId: selectedFriend.id || selectedFriend._id,
          text: messageText,
          fromUserName: user.name,
          fromUserImage: user.avatar || user.name[0]
        })
      });

      if (res.ok) {
        // showNotification(`Message sent to ${selectedFriend.name}! 📨`); // Optional: don't show toast for every chat msg
        setMessageText(''); // Clear input
        fetchConversation(); // Refresh chat immediately
      } else {
        showNotification("Failed to send message", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error sending message", "error");
    }
  };

  const handleSendInvite = async () => {
    if (!selectedEventId) return;
    try {
      // Use existing event invite endpoint
      const res = await fetch(`http://localhost:5000/api/events/${selectedEventId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitedUserId: selectedFriend.id || selectedFriend._id,
          invitedByUserId: user._id,
          invitedByUserName: user.name,
          invitedByUserImage: user.avatar || user.name[0]
        })
      });

      if (res.ok) {
        showNotification(`Invitation sent to ${selectedFriend.name}! ✈️`);
        handleCloseModal();
      } else {
        const d = await res.json();
        showNotification(d.message || "Failed to send invite", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error sending invite", "error");
    }
  };
=======
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
>>>>>>> origin/Tashu

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
<<<<<<< HEAD
          bottom: '20px',
=======
          top: '20px',
>>>>>>> origin/Tashu
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
<<<<<<< HEAD
              <button
                onClick={() => handleLikePost(activity.id)}
                style={{
                  backgroundColor: activity.isLiked ? '#059669' : '#f0fdf4',
                  color: activity.isLiked ? 'white' : '#059669',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}>
                <Heart size={14} fill={activity.isLiked ? 'white' : 'none'} />
                {activity.likes ? `${activity.likes} ` : ''}Like
=======
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
>>>>>>> origin/Tashu
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
<<<<<<< HEAD
                <button
                  onClick={() => handleOpenProfile(friend)}
                  style={{
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
                <button
                  onClick={() => handleOpenMessage(friend)}
                  style={{
                    backgroundColor: '#059669',
                    color: '#white',
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
                  onClick={() => handleOpenInvite(friend)}
=======
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
>>>>>>> origin/Tashu
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

<<<<<<< HEAD
      {/* --- MODALS --- */}

      {/* 1. Profile Modal */}
      {activeModal === 'profile' && selectedFriend && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000
        }} onClick={handleCloseModal}>
          <div style={{
            backgroundColor: 'white', width: '90%', maxWidth: '500px', borderRadius: '20px', padding: '30px',
            position: 'relative', animation: 'scaleIn 0.3s ease-out'
          }} onClick={e => e.stopPropagation()}>
            <button onClick={handleCloseModal} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#6b7280" /></button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#059669', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '40px', fontWeight: 'bold' }}>
                {selectedFriend.image}
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>{selectedFriend.name}</h2>
              <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '24px' }}>Member since {new Date().getFullYear()}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>{selectedFriend.trips}</div>
                  <div style={{ fontSize: '13px', color: '#065f46' }}>Trips Completed</div>
                </div>
                <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>{selectedFriend.points || 0}</div>
                  <div style={{ fontSize: '13px', color: '#1e40af' }}>Travel Points</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => { handleCloseModal(); handleOpenMessage(selectedFriend); }} style={{ flex: 1, padding: '12px', background: '#059669', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Message</button>
                <button onClick={handleCloseModal} style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Message Modal (Chat Interface) */}
      {activeModal === 'message' && selectedFriend && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000
        }} onClick={handleCloseModal}>
          <div style={{
            backgroundColor: 'white', width: '90%', maxWidth: '500px', height: '600px', borderRadius: '20px',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            animation: 'slideUp 0.3s ease-out'
          }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {selectedFriend.image}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{selectedFriend.name}</h3>
                  <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div> Online
                  </div>
                </div>
              </div>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={24} />
              </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f3f4f6' }}>
              {conversation.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '40px', color: '#9ca3af' }}>
                  <MessageCircle size={48} style={{ opacity: 0.5, marginBottom: '10px' }} />
                  <p>No messages yet. Say hello! 👋</p>
                </div>
              ) : (
                conversation.map((msg, idx) => {
                  const isMe = msg.fromUserId === user._id;
                  return (
                    <div key={idx} style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '75%'
                    }}>
                      <div style={{
                        backgroundColor: isMe ? '#059669' : 'white',
                        color: isMe ? 'white' : '#1f2937',
                        padding: '10px 16px',
                        borderRadius: isMe ? '16px 16px 0 16px' : '16px 16px 16px 0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        marginBottom: '4px',
                        fontSize: '15px'
                      }}>
                        {msg.text}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: isMe ? 'right' : 'left', padding: '0 4px' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', backgroundColor: 'white', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                autoFocus
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #d1d5db',
                  fontSize: '15px', outline: 'none', backgroundColor: '#f9fafb'
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: messageText.trim() ? '#059669' : '#e5e7eb',
                  color: 'white', border: 'none', cursor: messageText.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  transform: messageText.trim() ? 'scale(1)' : 'scale(0.95)'
                }}>
                <Send size={20} style={{ marginLeft: '2px' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Invite Modal */}
      {activeModal === 'invite' && selectedFriend && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000
        }} onClick={handleCloseModal}>
          <div style={{
            backgroundColor: 'white', width: '90%', maxWidth: '450px', borderRadius: '20px', padding: '30px',
            animation: 'slideUp 0.3s ease-out'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>Invite {selectedFriend.name}</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>Select an event to invite them to:</p>

            {myEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', marginBottom: '25px' }}>
                {myEvents.map(event => (
                  <label key={event._id || event.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px',
                    border: selectedEventId === (event._id || event.id) ? '2px solid #059669' : '2px solid #e5e7eb',
                    cursor: 'pointer', backgroundColor: selectedEventId === (event._id || event.id) ? '#f0fdf4' : 'white'
                  }}>
                    <input
                      type="radio"
                      name="eventSelect"
                      checked={selectedEventId === (event._id || event.id)}
                      onChange={() => setSelectedEventId(event._id || event.id)}
                      style={{ accentColor: '#059669' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>{event.name}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>{new Date(event.date).toLocaleDateString()} • {event.location}</div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', background: '#f9fafb', borderRadius: '10px', marginBottom: '20px' }}>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>You haven't joined or created any upcoming events.</p>
                <button onClick={() => navigate('group-events')} style={{ marginTop: '10px', color: '#059669', fontWeight: '600', border: 'none', background: 'none', cursor: 'pointer' }}>Go to Group Events</button>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={handleCloseModal} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSendInvite} disabled={!selectedEventId} style={{ padding: '10px 20px', background: selectedEventId ? '#059669' : '#d1d5db', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: selectedEventId ? 'pointer' : 'not-allowed' }}>
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

=======
>>>>>>> origin/Tashu
      {/* CSS Animations */}
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div >
  );
}