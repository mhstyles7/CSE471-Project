
import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Plus, UserPlus, ArrowRight, Check, X, Share2, Bell, Send, Clock, MessageSquare, ListTodo, BarChart2, Trash2, Edit2, ChevronLeft, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';
import { API_URL } from '../../config';


export default function GroupEventsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState(null); // For detailed view
  const [detailTab, setDetailTab] = useState('itinerary'); // itinerary, discussion, tasks, polls

  // Events state (4.1)
  const [events, setEvents] = useState([]);



  // My joined events
  const [myEvents, setMyEvents] = useState([]);

  // Received invitations (4.2)
  const [invitations, setInvitations] = useState([]);

  // Friends list for inviting
  const [friends, setFriends] = useState([]);

  // Fetch Data
  const fetchData = React.useCallback(async () => {
    try {
      const [eventsRes, invitesRes, friendsRes] = await Promise.all([
        fetch(`${API_URL}/api/events`),
        isAuthenticated ? fetch(`${API_URL}/api/events/invitations/${user._id || user.id}`) : Promise.resolve({ json: () => [] }),
        isAuthenticated ? fetch(`${API_URL}/api/users/${user._id || user.id}/friends`) : Promise.resolve({ json: () => [] })
      ]);

      const eventsData = await eventsRes.json();
      const invitesData = await invitesRes.json();
      const friendsData = await friendsRes.json();

      // Process events to handle _id vs id
      const processedEvents = Array.isArray(eventsData) ? eventsData.map(e => ({
        ...e,
        id: e._id,
        participants: e.participants || [],
        hasJoined: (e.participants || []).some(p => p.userId === (user?._id || user?.id))
      })) : [];

      setEvents(processedEvents);
      if (isAuthenticated) {
        setMyEvents(processedEvents.filter(e => e.hasJoined));
        setInvitations(invitesData.map(i => ({ ...i, id: i._id })));
        setFriends(friendsData.map(f => ({ ...f, id: f._id })));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, [user, isAuthenticated]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]); // Refetch when user logs in


  const [showInviteModal, setShowInviteModal] = useState(null);

  // New Item States
  const [newItineraryItem, setNewItineraryItem] = useState({ day: 1, time: '', activity: '', location: '' });
  const [newChatMessage, setNewChatMessage] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newPoll, setNewPoll] = useState({ question: '', option1: '', option2: '' });

  const showNotificationMsg = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Join event (4.1)
  const handleJoinEvent = async (eventId) => {

    if (!isAuthenticated) {
      navigate('login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/events/${eventId}/join`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id || user.id,
          userName: user.name,
          userImage: user.name?.charAt(0) || 'U'
        })
      });

      if (res.ok) {
        showNotificationMsg(`You've joined the event! 🎉`);
        fetchData();
      } else {
        const data = await res.json();
        showNotificationMsg(data.message, 'error');
      }
    } catch (err) {
      console.error(err);

    }
  };

  // Leave event
  const handleLeaveEvent = async (eventId) => {
    try {
      await fetch(`${API_URL}/api/events/${eventId}/leave`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id || user.id })
      });
      showNotificationMsg('You left the event', 'info');
      if (selectedEventId === eventId) setSelectedEventId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Accept invitation (4.2)
  const handleAcceptInvitation = async (invitationId) => {
    const invitation = invitations.find(i => i.id === invitationId);
    if (invitation) {
      try {
        // First update invitation status
        await fetch(`${API_URL}/api/events/invitations/${invitationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'accepted' })
        });

        // Then join the event
        await handleJoinEvent(invitation.eventId);
      } catch (err) {
        console.error(err);
      }

    }
  };

  // Decline invitation
  const handleDeclineInvitation = async (invitationId) => {
    try {
      await fetch(`${API_URL}/api/events/invitations/${invitationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' })
      });
      setInvitations(prev => prev.filter(i => i.id !== invitationId));
      showNotificationMsg('Invitation declined', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Send invitation to friend (4.2)
  const handleInviteFriend = async (eventId, friendId) => {
    const friend = friends.find(f => f.id === friendId);
    const event = events.find(e => e.id === eventId);
    if (friend && event) {
      try {
        const res = await fetch(`${API_URL}/api/events/${eventId}/invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invitedUserId: friendId,
            invitedByUserId: user._id || user.id,
            invitedByUserName: user.name,
            invitedByUserImage: user.name?.charAt(0) || 'U'
          })
        });

        if (res.ok) {
          showNotificationMsg(`Invitation sent to ${friend.name} for "${event.name}"! 📤`);
          setShowInviteModal(null);
          fetchData(); // refresh invited lists
        } else {
          const d = await res.json();
          showNotificationMsg(d.message, 'error');
        }
      } catch (err) {
        console.error(err);
      }

    }
  };

  // Create event (4.1)
  const handleCreateEvent = async () => {

    if (!isAuthenticated) {
      navigate('login');
      return;
    }

    if (eventName && eventDate && eventLocation) {
      const newEvent = {
        name: eventName,
        date: eventDate,
        location: eventLocation,
        description: eventDescription || 'Join this exciting trip!',
        maxParticipants: parseInt(maxParticipants) || 10,
        organizer: user?.name || 'You',
        organizerId: user?._id || user?.id,
      };

      try {
        const res = await fetch(`${API_URL}/api/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEvent)
        });

        if (res.ok) {
          await fetchData();
          setShowCreateForm(false);
          setEventName('');
          setEventDate('');
          setEventLocation('');
          setEventDescription('');
          setMaxParticipants('');
          showNotificationMsg('Event created successfully! 🎊 Invite your friends to join.');
        }
      } catch (err) {
        console.error(err);
      }

    }
  };

  // Add Itinerary Item (4.3)
  const handleAddItinerary = async () => {
    if (!newItineraryItem.activity || !newItineraryItem.time) return;
    try {
      const res = await fetch(`${API_URL}/api/events/${selectedEventId}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItineraryItem)
      });
      if (res.ok) {
        setNewItineraryItem({ day: 1, time: '', activity: '', location: '' });
        showNotificationMsg('Itinerary updated! 📅');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Chat Message (4.4, 4.5)
  const handleSendMessage = async () => {
    if (!newChatMessage.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/events/${selectedEventId}/discussion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: user?.name || 'You',
          image: user?.name?.charAt(0) || 'U',
          text: newChatMessage
        })
      });
      if (res.ok) {
        setNewChatMessage('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Task (4.1)
  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/events/${selectedEventId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask, assignedTo: 'Unassigned' })
      });
      if (res.ok) {
        setNewTask('');
        showNotificationMsg('Task added! ✅');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Task Completion
  const toggleTask = async (taskId) => {
    try {
      await fetch(`${API_URL}/api/events/${selectedEventId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      // Optimistic toggle
      setEvents(prev => prev.map(e => {
        if (e.id === selectedEventId) {
          return {
            ...e,
            tasks: e.tasks.map(t => t.id === taskId || t.id.toString() === taskId ? { ...t, completed: !t.completed } : t)
          };
        }
        return e;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Create Poll (4.4)
  const handleCreatePoll = async () => {
    if (!newPoll.question || !newPoll.option1 || !newPoll.option2) return;
    try {
      const res = await fetch(`${API_URL}/api/events/${selectedEventId}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newPoll.question,
          options: [
            { id: 'a', text: newPoll.option1, votes: 0 },
            { id: 'b', text: newPoll.option2, votes: 0 }
          ]
        })
      });
      if (res.ok) {
        setNewPoll({ question: '', option1: '', option2: '' });
        showNotificationMsg('Poll created! 📊');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Vote on Poll (4.4)
  const handleVote = async (pollId, optionId) => {
    try {
      await fetch(`${API_URL}/api/events/${selectedEventId}/polls/${pollId}/vote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id || user.id, optionId })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }

  };

  // Login required check
  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Users size={64} color="#9ca3af" style={{ marginBottom: '20px' }} />
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>Join Group Adventures</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>Login to create events, join group tours, and invite friends</p>
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
          Sign In to Join
        </button>
      </div>
    );
  }

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          backgroundColor: notification.type === 'success' ? '#059669' : '#6b7280',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 99999,
          animation: 'slideDown 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Bell size={20} />
          {notification.message}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1002
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '28px',
            width: '90%',
            maxWidth: '400px',
            animation: 'scaleIn 0.3s ease-out'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Invite Friends</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {friends.map(friend => {
                const event = events.find(e => e.id === showInviteModal);
                const isInvited = event?.invitedFriends?.includes(friend.id);
                return (
                  <div key={friend.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #059669, #0d9488)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {friend.image}
                      </div>
                      <span style={{ fontWeight: '500' }}>{friend.name}</span>
                    </div>
                    <button
                      onClick={() => handleInviteFriend(showInviteModal, friend.id)}
                      disabled={isInvited}
                      style={{
                        backgroundColor: isInvited ? '#d1d5db' : '#059669',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: isInvited ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      {isInvited ? 'Invited' : 'Invite'}
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowInviteModal(null)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '12px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!selectedEventId ? (
        // LIST VIEW
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="section-heading" style={{
                fontSize: '42px',
                fontWeight: '800',
                color: '#1f2937',
                marginBottom: '8px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Group Events & Tours
              </h2>
              <p style={{ fontSize: '18px', color: '#6b7280' }}>
                Join exciting group adventures or organize your own
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {invitations.length > 0 && (
                <div style={{
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Bell size={18} />
                  {invitations.length} invitation{invitations.length > 1 ? 's' : ''}
                </div>
              )}
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: '600',
                  fontSize: '15px',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                  transition: 'all 0.3s'
                }}
              >
                <Plus size={20} strokeWidth={2.5} />
                Create Event
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="events-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '28px', borderBottom: '2px solid #f3f4f6' }}>
            {[
              { id: 'all', label: 'All Events' },
              { id: 'invitations', label: 'Invitations', count: invitations.length },
              { id: 'my-events', label: 'My Events', count: myEvents.length }
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
                  backgroundColor: activeTab === tab.id ? '#f0fdf4' : 'transparent',
                  borderRadius: '8px 8px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    backgroundColor: activeTab === tab.id ? '#059669' : '#e5e7eb',
                    color: activeTab === tab.id ? 'white' : '#6b7280',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '12px'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Invitations Tab */}
          {activeTab === 'invitations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {invitations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <Send size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
                  <p>No pending invitations</p>
                </div>
              ) : (
                invitations.map((invitation, index) => (
                  <div key={invitation.id} style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '2px solid #dbeafe',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    animation: `slideUp 0.4s ease-out ${index * 0.1}s both`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '20px'
                      }}>
                        {invitation.inviterImage}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '15px', color: '#374151' }}>
                          <strong>{invitation.invitedBy}</strong> invited you to join
                        </p>
                        <h4 style={{ margin: '4px 0', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                          {invitation.eventName}
                        </h4>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={14} /> {new Date(invitation.date).toLocaleDateString()}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} /> {invitation.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleAcceptInvitation(invitation.id)}
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
                          fontWeight: '600'
                        }}
                      >
                        <Check size={18} />
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineInvitation(invitation.id)}
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
                          fontWeight: '600'
                        }}
                      >
                        <X size={18} />
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Create Event Form */}
          {showCreateForm && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              padding: '32px',
              marginBottom: '32px',
              animation: 'slideDown 0.3s ease-out',
              border: '1px solid rgba(5, 150, 105, 0.1)'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '24px', fontFamily: 'Poppins, sans-serif' }}>
                Create New Group Event
              </h3>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <input
                    type="text"
                    placeholder="e.g., Weekend Getaway to Sajek"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    style={{
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="e.g., Sajek Valley, Rangamati"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    style={{
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Max Participants"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    min="2"
                    max="50"
                    style={{
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />
                </div>
                <textarea
                  placeholder="Describe your event plan, meeting point, cost estimation, and what to bring..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  style={{
                    padding: '14px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '15px',
                    outline: 'none',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#4b5563',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateEvent}
                    style={{
                      backgroundColor: '#059669',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
                    }}
                  >
                    Create Event
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Events List */}
          {(activeTab === 'all' || activeTab === 'my-events') && (
            <div style={{ display: 'grid', gap: '24px' }}>
              {(activeTab === 'my-events' ? myEvents : events).map((event, index) => (
                <div key={event.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '24px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                  padding: '32px',
                  border: event.hasJoined ? '2px solid #059669' : '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.3s',
                  animation: `slideUp 0.5s ease-out ${index * 0.15}s both`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                          {event.name}
                        </h3>

                        {event.isSponsored && (
                          <div style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                          }}>
                            <Star size={14} fill="white" />
                            Sponsored
                          </div>
                        )}

                        <div style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '700',
                          backgroundColor: event.status === 'open' ? '#d1fae5' : '#fee2e2',
                          color: event.status === 'open' ? '#047857' : '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'currentColor'
                          }} />
                          {event.status === 'open' ? 'Open' : 'Full'}
                        </div>
                        {event.hasJoined && (
                          <div style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '700',
                            backgroundColor: '#dbeafe',
                            color: '#1d4ed8'
                          }}>
                            ✓ Joined
                          </div>
                        )}
                      </div>
                      <p style={{ color: '#4b5563', fontSize: '16px', marginBottom: '20px', lineHeight: '1.6' }}>
                        {event.description}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', color: '#6b7280', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                            <Calendar size={18} color="#4b5563" />
                          </div>
                          <span style={{ fontWeight: '500' }}>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                            <MapPin size={18} color="#4b5563" />
                          </div>
                          <span style={{ fontWeight: '500' }}>{event.location}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                            <Users size={18} color="#4b5563" />
                          </div>
                          <span style={{ fontWeight: '500' }}>{event.participants.length}/{event.maxParticipants} participants</span>
                        </div>
                      </div>

                      {/* Participants Avatars */}
                      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex' }}>
                          {event.participants.slice(0, 5).map((p, i) => (
                            <div key={i} style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #059669, #0d9488)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '12px',
                              border: '2px solid white',
                              marginLeft: i > 0 ? '-10px' : 0
                            }}>
                              {p.image}
                            </div>
                          ))}
                          {event.participants.length > 5 && (
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#6b7280',
                              fontWeight: 'bold',
                              fontSize: '11px',
                              border: '2px solid white',
                              marginLeft: '-10px'
                            }}>
                              +{event.participants.length - 5}
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                          Organized by {event.organizer}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', paddingTop: '24px', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap' }}>
                    {event.hasJoined ? (
                      <>
                        <button
                          onClick={() => setShowInviteModal(event.id)}
                          style={{
                            backgroundColor: '#059669',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                        >
                          <Share2 size={18} />
                          Invite Friends
                        </button>
                        <button
                          onClick={() => setSelectedEventId(event.id)}
                          style={{
                            backgroundColor: 'white',
                            color: '#059669',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: '2px solid #059669',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          Manage Event
                          <ArrowRight size={18} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleJoinEvent(event.id)}
                        disabled={event.status === 'full'}
                        style={{
                          backgroundColor: event.status === 'open' ? '#059669' : '#e5e7eb',
                          color: event.status === 'open' ? 'white' : '#9ca3af',
                          padding: '12px 24px',
                          borderRadius: '12px',
                          border: 'none',
                          cursor: event.status === 'open' ? 'pointer' : 'not-allowed',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <UserPlus size={18} />
                        {event.status === 'open' ? 'Join Event' : 'Event Full'}
                      </button>
                    )}
                    {!event.hasJoined && (
                      <button style={{
                        backgroundColor: 'white',
                        color: '#374151',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        View Details
                        <ArrowRight size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        // DETAILED EVENT VIEW (4.3, 4.4, 4.5)
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <button
            onClick={() => setSelectedEventId(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              fontSize: '15px',
              fontWeight: '600'
            }}
          >
            <ChevronLeft size={20} />
            Back to Events
          </button>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1f2937', marginBottom: '8px' }}>{selectedEvent.name}</h1>
                <div style={{ display: 'flex', gap: '16px', color: '#6b7280' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {selectedEvent.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {selectedEvent.location}</span>
                </div>
              </div>
              <button
                onClick={() => handleLeaveEvent(selectedEvent.id)}
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Leave Event
              </button>
            </div>

            {/* Detail Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #f3f4f6', marginBottom: '24px' }}>
              {[
                { id: 'itinerary', label: '📅 Itinerary', icon: Calendar },
                { id: 'discussion', label: '💬 Discussion', icon: MessageSquare },
                { id: 'tasks', label: '✅ Tasks', icon: ListTodo },
                { id: 'polls', label: '📊 Polls', icon: BarChart2 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id)}
                  style={{
                    padding: '12px 24px',
                    background: 'none',
                    border: 'none',
                    borderBottom: detailTab === tab.id ? '3px solid #059669' : '3px solid transparent',
                    color: detailTab === tab.id ? '#059669' : '#6b7280',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '-2px'
                  }}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Itinerary Tab (4.3) */}
            {detailTab === 'itinerary' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#374151' }}>Trip Itinerary</h3>
                </div>

                {/* Add Item Form */}
                <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Add Activity</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <input type="number" placeholder="Day (e.g. 1, 2, 3)" min="1" value={newItineraryItem.day} onChange={e => setNewItineraryItem({ ...newItineraryItem, day: parseInt(e.target.value) })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                    <input type="time" placeholder="Time" value={newItineraryItem.time} onChange={e => setNewItineraryItem({ ...newItineraryItem, time: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                    <input type="text" placeholder="Activity (e.g. Breakfast, Hiking)" value={newItineraryItem.activity} onChange={e => setNewItineraryItem({ ...newItineraryItem, activity: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', flex: 2 }} />
                    <input type="text" placeholder="Location (e.g. Hotel, Beach)" value={newItineraryItem.location} onChange={e => setNewItineraryItem({ ...newItineraryItem, location: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                  </div>
                  <button onClick={handleAddItinerary} style={{ backgroundColor: '#059669', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Add to Itinerary</button>
                </div>

                {/* Timeline */}
                <div style={{ position: 'relative', paddingLeft: '20px' }}>
                  {selectedEvent.itinerary.length === 0 ? (
                    <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No itinerary items yet.</p>
                  ) : (
                    selectedEvent.itinerary.map((item, index) => (
                      <div key={item.id} style={{ marginBottom: '24px', position: 'relative', paddingLeft: '24px', borderLeft: '2px solid #e5e7eb' }}>
                        <div style={{ position: 'absolute', left: '-9px', top: '0', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#059669', border: '3px solid white' }}></div>
                        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '700', color: '#059669' }}>Day {item.day} • {item.time}</span>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>{item.location}</span>
                          </div>
                          <p style={{ margin: 0, color: '#374151', fontSize: '16px' }}>{item.activity}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Discussion Tab (4.4, 4.5) */}
            {detailTab === 'discussion' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '16px', marginBottom: '16px' }}>
                  {selectedEvent.discussion.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '40px' }}>
                      <MessageSquare size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                      <p>Start the conversation!</p>
                    </div>
                  ) : (
                    selectedEvent.discussion.map(msg => (
                      <div key={msg.id} style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexDirection: msg.user === (user?.name || 'You') ? 'row-reverse' : 'row' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>
                          {msg.image}
                        </div>
                        <div style={{ maxWidth: '70%', backgroundColor: msg.user === (user?.name || 'You') ? '#059669' : 'white', color: msg.user === (user?.name || 'You') ? 'white' : '#374151', padding: '12px 16px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                          <p style={{ margin: 0, fontSize: '14px' }}>{msg.text}</p>
                          <span style={{ fontSize: '11px', opacity: 0.8, display: 'block', marginTop: '4px', textAlign: 'right' }}>{msg.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    value={newChatMessage}
                    onChange={e => setNewChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '2px solid #e5e7eb', outline: 'none' }}
                  />
                  <button onClick={handleSendMessage} style={{ backgroundColor: '#059669', color: 'white', padding: '0 24px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>
                    <Send size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Tasks Tab (4.1) */}
            {detailTab === 'tasks' && (
              <div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <input
                    type="text"
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    placeholder="Add a new task..."
                    onKeyPress={e => e.key === 'Enter' && handleAddTask()}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #e5e7eb', outline: 'none' }}
                  />
                  <button onClick={handleAddTask} style={{ backgroundColor: '#059669', color: 'white', padding: '0 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Add Task</button>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {selectedEvent.tasks.map(task => (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: task.completed ? '#f0fdf4' : 'white', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                      <button
                        onClick={() => toggleTask(task.id)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          border: task.completed ? 'none' : '2px solid #d1d5db',
                          backgroundColor: task.completed ? '#059669' : 'transparent',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        {task.completed && <Check size={16} />}
                      </button>
                      <span style={{ flex: 1, textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#9ca3af' : '#374151', fontWeight: '500' }}>{task.title}</span>
                      <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#f3f4f6', borderRadius: '6px', color: '#6b7280' }}>{task.assignedTo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Polls Tab (4.4) */}
            {detailTab === 'polls' && (
              <div>
                <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Create Poll</h4>
                  <input type="text" placeholder="Question" value={newPoll.question} onChange={e => setNewPoll({ ...newPoll, question: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '12px' }} />
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <input type="text" placeholder="Option 1" value={newPoll.option1} onChange={e => setNewPoll({ ...newPoll, option1: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                    <input type="text" placeholder="Option 2" value={newPoll.option2} onChange={e => setNewPoll({ ...newPoll, option2: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                  </div>
                  <button onClick={handleCreatePoll} style={{ backgroundColor: '#059669', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Create Poll</button>
                </div>

                <div style={{ display: 'grid', gap: '24px' }}>
                  {selectedEvent.polls.map(poll => (
                    <div key={poll.id} style={{ border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px' }}>
                      <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#1f2937' }}>{poll.question}</h4>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {poll.options.map(option => {
                          const totalVotes = poll.options.reduce((a, b) => a + b.votes, 0);
                          const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
                          return (
                            <button
                              key={option.id}
                              onClick={() => handleVote(poll.id, option.id)}
                              style={{
                                position: 'relative',
                                padding: '12px 16px',
                                border: poll.userVoted === option.id ? '2px solid #059669' : '1px solid #e5e7eb',
                                borderRadius: '12px',
                                background: 'white',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                textAlign: 'left'
                              }}
                            >
                              <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: `${percentage}%`,
                                backgroundColor: '#d1fae5',
                                zIndex: 0,
                                transition: 'width 0.3s'
                              }} />
                              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', fontWeight: '500' }}>
                                <span>{option.text}</span>
                                <span>{percentage}% ({option.votes})</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS */}
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}