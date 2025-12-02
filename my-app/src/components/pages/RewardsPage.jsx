import React from 'react';
import { Award, Gift, Star, TrendingUp } from 'lucide-react';

export default function RewardsPage() {
  const userPoints = 750;
  const currentTier = 'Silver';
  const nextTier = 'Gold';
  const pointsToNextTier = 250;
  const progress = (userPoints / 1000) * 100; // Progress to Gold (1000 points)

  const rewards = [
    { id: 1, name: '10% discount on agency packages', points: 500, unlocked: true },
    { id: 2, name: 'Free local guide booking (1 per quarter)', points: 750, unlocked: true },
    { id: 3, name: 'Premium badge on profile', points: 750, unlocked: true },
    { id: 4, name: 'Early access to sponsored events', points: 1000, unlocked: false },
    { id: 5, name: 'Exclusive travel recommendations', points: 1000, unlocked: false }
  ];

  const recentActivities = [
    { id: 1, action: 'Posted a trip review', points: 50, date: '2 days ago' },
    { id: 2, action: 'Completed Sylhet trip', points: 100, date: '1 week ago' },
    { id: 3, action: 'Joined community event', points: 25, date: '2 weeks ago' }
  ];

  return (
    <div>
      <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
        Travel Points & Rewards
      </h2>

      {/* Points Card */}
      <div style={{
        background: 'linear-gradient(to right, #fbbf24, #f97316)',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        padding: '32px',
        color: 'white',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              {userPoints} Points
            </h3>
            <p style={{ color: '#fef3c7', fontSize: '16px' }}>{currentTier} Tier Member</p>
          </div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '12px',
            borderRadius: '12px'
          }}>
            <Award size={32} />
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '24px',
            height: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              height: '12px',
              width: `${progress}%`,
              transition: 'width 0.3s'
            }}></div>
          </div>
        </div>
        <p style={{ fontSize: '14px', color: '#fef3c7' }}>
          {pointsToNextTier} points to {nextTier} Tier
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Available Rewards */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Gift style={{ color: '#059669' }} size={24} />
            <h4 style={{ fontWeight: '600', color: '#1f2937', margin: 0 }}>Available Rewards</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rewards.map(reward => (
              <div
                key={reward.id}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: reward.unlocked ? '#d1fae5' : '#f3f4f6',
                  border: `1px solid ${reward.unlocked ? '#059669' : '#e5e7eb'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: reward.unlocked ? '#047857' : '#6b7280',
                    flex: 1
                  }}>
                    {reward.name}
                  </p>
                  {reward.unlocked && (
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  {reward.points} points {reward.unlocked ? '• Unlocked' : '• Locked'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TrendingUp style={{ color: '#3b82f6' }} size={24} />
            <h4 style={{ fontWeight: '600', color: '#1f2937', margin: 0 }}>Recent Activity</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivities.map(activity => (
              <div
                key={activity.id}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                    {activity.action}
                  </p>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#059669'
                  }}>
                    +{activity.points}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>{activity.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How to Earn Points */}
      <div style={{
        backgroundColor: '#f0fdf4',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '24px',
        border: '1px solid #d1fae5'
      }}>
        <h4 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>How to Earn Points</h4>
        <ul style={{ color: '#6b7280', listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: '8px' }}>✓ Complete a trip: 100 points</li>
          <li style={{ marginBottom: '8px' }}>✓ Write a review: 50 points</li>
          <li style={{ marginBottom: '8px' }}>✓ Join an event: 25 points</li>
          <li style={{ marginBottom: '8px' }}>✓ Share a post: 10 points</li>
          <li>✓ Invite a friend: 30 points</li>
        </ul>
      </div>
    </div>
  );
}