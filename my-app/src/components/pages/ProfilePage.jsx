import React from 'react';
import { MapPin, Calendar, Award, Users, Edit } from 'lucide-react';

export default function ProfilePage() {
  const user = {
    name: 'MD. Meheraj Hossain',
    initials: 'MH',
    email: 'meheraj@pothchola.com',
    memberSince: 'January 2024',
    tier: 'Silver Member',
    bio: 'Travel enthusiast exploring the beauty of Bangladesh. Love discovering hidden gems and sharing experiences with fellow travelers.'
  };

  const stats = [
    { label: 'Trips Completed', value: 12, icon: <MapPin size={20} />, color: '#059669' },
    { label: 'Friends', value: 45, icon: <Users size={20} />, color: '#0d9488' },
    { label: 'Travel Points', value: 750, icon: <Award size={20} />, color: '#f59e0b' },
    { label: 'Reviews Written', value: 8, icon: <Edit size={20} />, color: '#3b82f6' }
  ];

  const badges = [
    { id: 1, name: 'Early Adopter', icon: '🌟', unlocked: true },
    { id: 2, name: 'Community Helper', icon: '🤝', unlocked: true },
    { id: 3, name: 'Explorer', icon: '🗺️', unlocked: true },
    { id: 4, name: 'Travel Expert', icon: '👑', unlocked: false }
  ];

  return (
    <div>
      <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
        My Profile
      </h2>

      {/* Profile Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '32px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{
            width: '96px',
            height: '96px',
            background: 'linear-gradient(to bottom right, #059669, #0d9488)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '36px',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            {user.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px 0' }}>
                  {user.name}
                </h3>
                <p style={{ color: '#6b7280', margin: '0 0 4px 0' }}>{user.email}</p>
                <p style={{ color: '#059669', fontWeight: '500', margin: 0 }}>{user.tier}</p>
              </div>
              <button style={{
                backgroundColor: '#f3f4f6',
                color: '#1f2937',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Edit size={16} />
                Edit Profile
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
              <Calendar size={16} />
              Member since {user.memberSince}
            </div>
            <p style={{ color: '#374151', lineHeight: '1.6' }}>{user.bio}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: stat.color }}>
                {stat.icon}
              </div>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color, margin: '0 0 4px 0' }}>
                {stat.value}
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '24px'
      }}>
        <h4 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '16px', fontSize: '20px' }}>
          Achievements & Badges
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
          {badges.map(badge => (
            <div
              key={badge.id}
              style={{
                backgroundColor: badge.unlocked ? '#f0fdf4' : '#f3f4f6',
                border: `2px solid ${badge.unlocked ? '#059669' : '#e5e7eb'}`,
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                opacity: badge.unlocked ? 1 : 0.5
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{badge.icon}</div>
              <p style={{
                fontSize: '14px',
                fontWeight: '500',
                color: badge.unlocked ? '#047857' : '#6b7280',
                margin: 0
              }}>
                {badge.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 