import React, { useState } from 'react';
import { Award, Gift, Star, TrendingUp, Sparkles, Crown, Trophy, Medal, Lock, Unlock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';

export default function RewardsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rewards'); // rewards, leaderboard, badges
  const [notification, setNotification] = useState(null);

  // Mock User Data (Replace with context/API later)
  const [userPoints, setUserPoints] = useState(750);
  const currentTier = userPoints >= 1000 ? 'Gold' : userPoints >= 500 ? 'Silver' : 'Bronze';
  const nextTier = currentTier === 'Gold' ? 'Platinum' : currentTier === 'Silver' ? 'Gold' : 'Silver';
  const pointsToNextTier = currentTier === 'Gold' ? 2000 - userPoints : currentTier === 'Silver' ? 1000 - userPoints : 500 - userPoints;
  const progress = currentTier === 'Gold' ? ((userPoints - 1000) / 1000) * 100 : currentTier === 'Silver' ? ((userPoints - 500) / 500) * 100 : (userPoints / 500) * 100;

  const [rewards, setRewards] = useState([
    { id: 1, name: '10% discount on agency packages', points: 500, unlocked: true, redeemed: false },
    { id: 2, name: 'Free local guide booking (1 per quarter)', points: 750, unlocked: true, redeemed: false },
    { id: 3, name: 'Premium badge on profile', points: 750, unlocked: true, redeemed: true },
    { id: 4, name: 'Early access to sponsored events', points: 1000, unlocked: false, redeemed: false },
    { id: 5, name: 'Exclusive travel recommendations', points: 1000, unlocked: false, redeemed: false }
  ]);

  const recentActivities = [
    { id: 1, action: 'Posted a trip review', points: 50, date: '2 days ago' },
    { id: 2, action: 'Completed Sylhet trip', points: 100, date: '1 week ago' },
    { id: 3, action: 'Joined community event', points: 25, date: '2 weeks ago' }
  ];

  const leaderboard = [
    { rank: 1, name: 'Alimool Razi', points: 2450, tier: 'Platinum', image: 'AR' },
    { rank: 2, name: 'Zarin Raisa', points: 1890, tier: 'Gold', image: 'ZR' },
    { rank: 3, name: 'Fahim Ahmed', points: 1650, tier: 'Gold', image: 'FA' },
    { rank: 4, name: 'You', points: userPoints, tier: currentTier, image: 'ME' },
    { rank: 5, name: 'Tasnim Rahman', points: 620, tier: 'Silver', image: 'TR' }
  ];

  const badges = [
    { id: 1, name: 'Explorer', description: 'Visited 5 different districts', icon: '🌍', earned: true },
    { id: 2, name: 'Photographer', description: 'Uploaded 50 photos', icon: '📸', earned: true },
    { id: 3, name: 'Social Butterfly', description: 'Invited 10 friends', icon: '🦋', earned: false },
    { id: 4, name: 'Reviewer', description: 'Wrote 20 reviews', icon: '✍️', earned: false },
    { id: 5, name: 'Mountaineer', description: 'Visited 3 hill stations', icon: '🏔️', earned: true }
  ];

  const showNotificationMsg = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRedeem = (rewardId) => {
    if (!isAuthenticated) {
      navigate('login');
      return;
    }

    const reward = rewards.find(r => r.id === rewardId);
    if (reward && !reward.redeemed && userPoints >= reward.points) {
      if (window.confirm(`Are you sure you want to redeem "${reward.name}" for ${reward.points} points?`)) {
        setRewards(prev => prev.map(r => r.id === rewardId ? { ...r, redeemed: true } : r));
        setUserPoints(prev => prev - reward.points);
        showNotificationMsg(`Successfully redeemed: ${reward.name}! 🎉`);
      }
    } else if (userPoints < reward.points) {
      showNotificationMsg(`Not enough points to redeem this reward.`, 'error');
    }
  };

  return (
    <div>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: notification.type === 'success' ? '#059669' : '#dc2626',
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
          {notification.type === 'success' ? <CheckCircle size={20} /> : <Lock size={20} />}
          {notification.message}
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '42px',
          fontWeight: '800',
          color: '#1f2937',
          marginBottom: '12px',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Travel Points & Rewards
        </h2>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>
          Earn points, unlock tiers, and enjoy exclusive benefits
        </p>
      </div>

      {/* Points Card */}
      <div style={{
        background: 'linear-gradient(135deg, #fbbf24, #f97316)',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(245, 158, 11, 0.3)',
        padding: '40px',
        color: 'white',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        animation: 'scaleIn 0.5s ease-out'
      }}>
        {/* Animated Background Pattern */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-20%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%)',
          animation: 'spin 20s linear infinite',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
          <div>
            <h3 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '8px', fontFamily: 'Poppins, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              {userPoints} <span style={{ fontSize: '24px' }}>Points</span>
            </h3>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '6px 16px',
              borderRadius: '20px',
              backdropFilter: 'blur(4px)'
            }}>
              <Star size={16} fill="white" />
              <span style={{ fontWeight: '600' }}>{currentTier} Tier Member</span>
            </div>
          </div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.25)',
            padding: '16px',
            borderRadius: '20px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            animation: 'float 4s ease-in-out infinite'
          }}>
            <Award size={40} strokeWidth={2} />
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '16px', position: 'relative', zIndex: 1 }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: '24px',
            height: '16px',
            overflow: 'hidden',
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #ffffff, #fef3c7)',
              borderRadius: '24px',
              height: '100%',
              width: `${Math.max(5, progress)}%`,
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                animation: 'shimmer 2s infinite'
              }} />
            </div>
          </div>
        </div>
        <p style={{ fontSize: '15px', color: '#fff7ed', fontWeight: '500', position: 'relative', zIndex: 1 }}>
          {pointsToNextTier} points to unlock {nextTier} Tier benefits
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', borderBottom: '2px solid #f3f4f6' }}>
        {[
          { id: 'rewards', label: '🎁 Rewards', icon: Gift },
          { id: 'leaderboard', label: '🏆 Leaderboard', icon: Trophy },
          { id: 'badges', label: '🎖️ Badges', icon: Medal }
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
              color: activeTab === tab.id ? '#f59e0b' : '#9ca3af',
              borderBottom: activeTab === tab.id ? '3px solid #f59e0b' : 'none',
              marginBottom: '-2px',
              backgroundColor: activeTab === tab.id ? '#fffbeb' : 'transparent',
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>

        {/* REWARDS TAB */}
        {activeTab === 'rewards' && (
          <>
            {/* Available Rewards */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              padding: '32px',
              border: '1px solid rgba(0,0,0,0.05)',
              animation: 'slideUp 0.5s ease-out 0.1s both'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: '#f0fdf4',
                  color: '#059669'
                }}>
                  <Gift size={24} strokeWidth={2.5} />
                </div>
                <h4 style={{ fontWeight: '700', color: '#1f2937', margin: 0, fontSize: '20px', fontFamily: 'Poppins, sans-serif' }}>Available Rewards</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {rewards.map((reward, index) => (
                  <div
                    key={reward.id}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      backgroundColor: reward.redeemed ? '#f3f4f6' : reward.unlocked ? '#f0fdf4' : '#f9fafb',
                      border: `1px solid ${reward.redeemed ? '#e5e7eb' : reward.unlocked ? '#bbf7d0' : '#f3f4f6'}`,
                      transition: 'all 0.3s',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                      <p style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: reward.redeemed ? '#6b7280' : reward.unlocked ? '#047857' : '#9ca3af',
                        flex: 1,
                        marginRight: '12px',
                        textDecoration: reward.redeemed ? 'line-through' : 'none'
                      }}>
                        {reward.name}
                      </p>
                      {reward.redeemed ? (
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '10px' }}>Redeemed</span>
                      ) : reward.unlocked ? (
                        <button
                          onClick={() => handleRedeem(reward.id)}
                          style={{
                            backgroundColor: '#059669',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Redeem
                        </button>
                      ) : (
                        <Lock size={16} color="#9ca3af" />
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: reward.unlocked ? '#059669' : '#9ca3af', fontWeight: '500' }}>
                      {reward.points} points {reward.unlocked ? '• Unlocked' : '• Locked'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              padding: '32px',
              border: '1px solid rgba(0,0,0,0.05)',
              animation: 'slideUp 0.5s ease-out 0.2s both'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: '#eff6ff',
                  color: '#3b82f6'
                }}>
                  <TrendingUp size={24} strokeWidth={2.5} />
                </div>
                <h4 style={{ fontWeight: '700', color: '#1f2937', margin: 0, fontSize: '20px', fontFamily: 'Poppins, sans-serif' }}>Recent Activity</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <p style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                        {activity.action}
                      </p>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: '700',
                        color: '#059669',
                        backgroundColor: '#d1fae5',
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        +{activity.points}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>{activity.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div style={{ gridColumn: '1 / -1', backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>Top Travelers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {leaderboard.map((user, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: user.name === 'You' ? '#f0fdf4' : 'white',
                  border: user.name === 'You' ? '2px solid #059669' : '1px solid #e5e7eb',
                  borderRadius: '16px',
                  boxShadow: user.rank <= 3 ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: user.rank === 1 ? '#fbbf24' : user.rank === 2 ? '#94a3b8' : user.rank === 3 ? '#b45309' : '#f3f4f6',
                    color: user.rank <= 3 ? 'white' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    marginRight: '16px',
                    fontSize: '18px'
                  }}>
                    {user.rank}
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    marginRight: '16px'
                  }}>
                    {user.image}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                      {user.name} {user.rank === 1 && <Crown size={16} color="#fbbf24" fill="#fbbf24" style={{ marginLeft: '4px' }} />}
                    </h4>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>{user.tier} Member</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '18px', fontWeight: '800', color: '#059669' }}>{user.points}</span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>Points</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BADGES TAB */}
        {activeTab === 'badges' && (
          <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {badges.map(badge => (
              <div key={badge.id} style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '24px',
                textAlign: 'center',
                border: badge.earned ? '2px solid #fbbf24' : '1px solid #e5e7eb',
                opacity: badge.earned ? 1 : 0.6,
                boxShadow: badge.earned ? '0 4px 12px rgba(251, 191, 36, 0.2)' : 'none',
                position: 'relative'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>{badge.icon}</div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>{badge.name}</h4>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>{badge.description}</p>
                {badge.earned && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: '#d1fae5',
                    color: '#059669',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    Earned
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* How to Earn Points */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
        borderRadius: '24px',
        padding: '32px',
        marginTop: '32px',
        border: '1px solid #bbf7d0',
        animation: 'slideUp 0.5s ease-out 0.3s both'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Sparkles size={20} color="#059669" />
          <h4 style={{ fontWeight: '700', color: '#065f46', fontSize: '20px', fontFamily: 'Poppins, sans-serif', margin: 0 }}>How to Earn Points</h4>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { action: 'Complete a trip', points: 100 },
            { action: 'Write a review', points: 50 },
            { action: 'Join an event', points: 25 },
            { action: 'Share a post', points: 10 },
            { action: 'Invite a friend', points: 30 }
          ].map((item, i) => (
            <div key={i} style={{
              backgroundColor: 'white',
              padding: '12px 16px',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(5, 150, 105, 0.05)'
            }}>
              <span style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>{item.action}</span>
              <span style={{ color: '#059669', fontWeight: '700', fontSize: '14px' }}>{item.points}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}