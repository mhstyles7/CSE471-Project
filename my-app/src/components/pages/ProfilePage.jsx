import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { MapPin, Calendar, Award, Users, Edit, Camera, X, Save, TrendingUp, Star, Upload } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    bio: user?.bio || ''
  });

  // State for image previews
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [coverPreview, setCoverPreview] = useState(user?.coverImage || null);

  // Refs for file inputs
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // State for profile stats from MongoDB
  const [profileStats, setProfileStats] = useState({
    tripsCompleted: 0,
    friendsCount: 0,
    points: 0,
    reviewsCount: 0,
    badges: [],
    recentActivity: []
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch profile stats from MongoDB
  useEffect(() => {
    const fetchProfileStats = async () => {
      if (!user?._id) return;

      try {
        setStatsLoading(true);
        const response = await fetch(`${API_URL}/api/users/${user._id}/stats`);
        if (response.ok) {
          const data = await response.json();
          setProfileStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch profile stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchProfileStats();
  }, [user?._id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // In a real app, you would upload the images to a server here
      // and get back the URLs to save in the user profile.
      // For now, we'll just pass the data URLs if they changed.
      await updateProfile({
        ...editForm,
        avatar: avatarPreview,
        coverImage: coverPreview
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          setAvatarPreview(reader.result);
        } else {
          setCoverPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return <div>Loading...</div>;

  // Stats from MongoDB (dynamic)
  const stats = [
    { label: 'Trips Completed', value: profileStats.tripsCompleted, icon: <MapPin size={24} />, color: '#059669', bg: '#ecfdf5' },
    { label: 'Friends', value: profileStats.friendsCount, icon: <Users size={24} />, color: '#0d9488', bg: '#f0fdfa' },
    { label: 'Travel Points', value: profileStats.points, icon: <Award size={24} />, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Reviews Written', value: profileStats.reviewsCount, icon: <Edit size={24} />, color: '#3b82f6', bg: '#eff6ff' }
  ];

  // Badges from MongoDB (dynamic)
  const badges = profileStats.badges.length > 0 ? profileStats.badges : [
    { id: 1, name: 'Explorer', icon: '🌍', unlocked: false, description: 'Complete 3 or more trips' },
    { id: 2, name: 'Photographer', icon: '📸', unlocked: false, description: 'Earn 200+ travel points' },
    { id: 3, name: 'Social Butterfly', icon: '🦋', unlocked: false, description: 'Make 5 or more friends' },
    { id: 4, name: 'Reviewer', icon: '✍️', unlocked: false, description: 'Write 5 or more reviews' },
    { id: 5, name: 'Mountaineer', icon: '🏔️', unlocked: false, description: 'Complete 5 or more trips' }
  ];

  // Recent Activity from MongoDB (dynamic)
  const recentActivity = profileStats.recentActivity.length > 0 ? profileStats.recentActivity : [];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 className="section-heading" style={{
          fontSize: '42px',
          fontWeight: '800',
          color: '#1f2937',
          marginBottom: '12px',
          fontFamily: 'Poppins, sans-serif'
        }}>
          My Profile
        </h2>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>
          Manage your personal information and view your achievements
        </p>
      </div>

      {/* Profile Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
        marginBottom: '32px',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.05)',
        animation: 'slideUp 0.5s ease-out'
      }}>
        {/* Cover Image Area */}
        <div style={{
          height: '200px',
          background: coverPreview ? `url(${coverPreview}) center/cover no-repeat` : 'linear-gradient(135deg, #059669, #0d9488)',
          position: 'relative'
        }}>
          {!coverPreview && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              animation: 'pulse 4s infinite'
            }} />
          )}

          {/* Hidden File Input for Cover */}
          <input
            type="file"
            ref={coverInputRef}
            onChange={(e) => handleImageChange(e, 'cover')}
            style={{ display: 'none' }}
            accept="image/*"
          />

          <button
            onClick={() => coverInputRef.current.click()}
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: '600',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'}
          >
            <Camera size={16} />
            Change Cover
          </button>
        </div>

        <div className="profile-card-body" style={{ padding: '0 40px 40px', position: 'relative' }}>
          {/* Avatar */}
          <div style={{
            width: '140px',
            height: '140px',
            background: 'linear-gradient(135deg, #ffffff, #f3f4f6)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#059669',
            border: '6px solid white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginTop: '-70px',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <img
              src={avatarPreview || `https://ui-avatars.com/api/?name=${user.name}&background=059669&color=fff`}
              alt={user.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=059669&color=fff`; }}
            />

            {/* Hidden File Input for Avatar */}
            <input
              type="file"
              ref={avatarInputRef}
              onChange={(e) => handleImageChange(e, 'avatar')}
              style={{ display: 'none' }}
              accept="image/*"
            />

            {/* Avatar Overlay for Upload */}
            <div
              onClick={() => avatarInputRef.current.click()}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
            >
              <Camera size={32} color="white" />
            </div>

            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: '#10b981',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '4px solid white',
              pointerEvents: 'none'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              {isEditing ? (
                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical' }}
                    />
                  </div>

                  {/* Image Upload Buttons for Mobile/Clarity */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current.click()}
                      style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Upload size={14} /> Change Avatar
                    </button>
                    <button
                      type="button"
                      onClick={() => coverInputRef.current.click()}
                      style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Upload size={14} /> Change Cover
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Save size={16} /> Save Changes
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3 style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    color: '#1f2937',
                    margin: '0 0 8px 0',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {user.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#6b7280', fontSize: '15px' }}>{user.email}</span>
                    <span style={{ width: '4px', height: '4px', backgroundColor: '#d1d5db', borderRadius: '50%' }} />
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#059669',
                      fontWeight: '600',
                      backgroundColor: '#ecfdf5',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px'
                    }}>
                      <Star size={14} fill="#059669" />
                      {user.tier || 'Silver'} Member
                    </div>
                  </div>
                  <p style={{ color: '#4b5563', lineHeight: '1.7', fontSize: '16px', maxWidth: '700px' }}>{user.bio || 'Passionate traveler exploring the beauty of Bangladesh. Love hiking, photography, and trying local cuisines.'}</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px', marginTop: '20px' }}>
                    <Calendar size={16} />
                    <span>Member since {user.memberSince || 'January 2024'}</span>
                  </div>
                </>
              )}
            </div>

            {!isEditing && (
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
                gap: '8px',
                transition: 'all 0.2s',
                fontSize: '15px'
              }}
                onClick={() => {
                  setEditForm({ name: user.name, bio: user.bio });
                  setIsEditing(true);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <Edit size={18} strokeWidth={2.5} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>

        {/* Left Column: Stats & Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Stats Grid */}
          <div className="stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px'
          }}>
            {stats.map((stat, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.3s',
                  animation: `scaleIn 0.5s ease-out ${index * 0.1}s both`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{
                  display: 'inline-flex',
                  padding: '12px',
                  borderRadius: '50%',
                  backgroundColor: stat.bg,
                  color: stat.color,
                  marginBottom: '12px'
                }}>
                  {stat.icon}
                </div>
                <p style={{ fontSize: '24px', fontWeight: '800', color: '#1f2937', margin: '0 0 4px 0', fontFamily: 'Poppins, sans-serif' }}>
                  {stat.value}
                </p>
                <p style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500', margin: 0 }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            padding: '32px',
            border: '1px solid rgba(0,0,0,0.05)',
            animation: 'slideUp 0.5s ease-out 0.2s both'
          }}>
            <h4 style={{ fontWeight: '700', color: '#1f2937', marginBottom: '24px', fontSize: '20px', fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={24} color="#f59e0b" />
              Achievements
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '16px' }}>
              {badges.map((badge, index) => (
                <div
                  key={badge.id}
                  title={badge.description}
                  style={{
                    backgroundColor: badge.unlocked ? '#f0fdf4' : '#f9fafb',
                    border: `2px solid ${badge.unlocked ? '#bbf7d0' : '#f3f4f6'}`,
                    borderRadius: '16px',
                    padding: '16px',
                    textAlign: 'center',
                    opacity: badge.unlocked ? 1 : 0.6,
                    transition: 'all 0.3s',
                    cursor: 'help'
                  }}
                  onMouseEnter={(e) => {
                    if (badge.unlocked) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(5, 150, 105, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px', filter: badge.unlocked ? 'none' : 'grayscale(100%)' }}>
                    {badge.icon}
                  </div>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: badge.unlocked ? '#047857' : '#6b7280',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {badge.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          padding: '32px',
          border: '1px solid rgba(0,0,0,0.05)',
          height: 'fit-content',
          animation: 'slideUp 0.5s ease-out 0.3s both'
        }}>
          <h4 style={{ fontWeight: '700', color: '#1f2937', marginBottom: '24px', fontSize: '20px', fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={24} color="#3b82f6" />
            Recent Activity
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {statsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                Loading activities...
              </div>
            ) : recentActivity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                <p style={{ margin: 0, fontSize: '14px' }}>No recent activity yet.</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>Start exploring, writing reviews, or completing trips to see your activity here!</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={activity.id} style={{
                  display: 'flex',
                  gap: '16px',
                  paddingBottom: index < recentActivity.length - 1 ? '20px' : 0,
                  borderBottom: index < recentActivity.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <TrendingUp size={20} color="#3b82f6" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#374151', fontSize: '15px', wordWrap: 'break-word' }}>
                      {activity.action}
                    </p>
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>
                      {activity.date}
                    </p>
                  </div>
                  <div style={{
                    fontWeight: '700',
                    color: '#059669',
                    fontSize: '14px',
                    backgroundColor: '#ecfdf5',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    height: 'fit-content',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}>
                    {activity.points}
                  </div>
                </div>
              ))
            )}
          </div>
          <button style={{
            width: '100%',
            marginTop: '24px',
            padding: '12px',
            backgroundColor: '#f9fafb',
            color: '#4b5563',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
          >
            View All Activity
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 0.8; } 100% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}