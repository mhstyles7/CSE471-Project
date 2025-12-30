<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import {
  Award,
  Gift,
  Star,
  TrendingUp,
  Sparkles,
  Crown,
  Trophy,
  Medal,
  Lock,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "../../context/NavigationContext";
=======
import React, { useState, useEffect } from 'react';
import { Award, Gift, Star, TrendingUp, Sparkles, Crown, Trophy, Medal, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';
>>>>>>> origin/Tashu

export default function RewardsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState("rewards");
=======
  const [activeTab, setActiveTab] = useState('rewards');
>>>>>>> origin/Tashu
  const [notification, setNotification] = useState(null);

  // Dynamic Data
  const [userData, setUserData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rewards (Static for now, but could be DB driven)
  const [rewards, setRewards] = useState([
<<<<<<< HEAD
    {
      id: 1,
      name: "10% discount on agency packages",
      points: 500,
      unlocked: false,
      redeemed: false,
    },
    {
      id: 2,
      name: "Free local guide booking (1 per quarter)",
      points: 750,
      unlocked: false,
      redeemed: false,
    },
    {
      id: 3,
      name: "Premium badge on profile",
      points: 750,
      unlocked: false,
      redeemed: false,
    },
    {
      id: 4,
      name: "Early access to sponsored events",
      points: 1000,
      unlocked: false,
      redeemed: false,
    },
    {
      id: 5,
      name: "Exclusive travel recommendations",
      points: 1000,
      unlocked: false,
      redeemed: false,
    },
=======
    { id: 1, name: '10% discount on agency packages', points: 500, unlocked: false, redeemed: false },
    { id: 2, name: 'Free local guide booking (1 per quarter)', points: 750, unlocked: false, redeemed: false },
    { id: 3, name: 'Premium badge on profile', points: 750, unlocked: false, redeemed: false },
    { id: 4, name: 'Early access to sponsored events', points: 1000, unlocked: false, redeemed: false },
    { id: 5, name: 'Exclusive travel recommendations', points: 1000, unlocked: false, redeemed: false }
>>>>>>> origin/Tashu
  ]);

  useEffect(() => {
    const fetchRewardsData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Latest User Data (Points & Tier)
        if (isAuthenticated && user?._id) {
<<<<<<< HEAD
          const userRes = await fetch(
            `http://localhost:5000/api/users/${user._id}`
          );
=======
          const userRes = await fetch(`http://localhost:1306/api/users/${user._id}`);
>>>>>>> origin/Tashu
          const userDataFull = await userRes.json();
          setUserData(userDataFull);

          // Update local rewards state based on points
<<<<<<< HEAD
          setRewards((prev) =>
            prev.map((r) => ({
              ...r,
              unlocked: (userDataFull.points || 0) >= r.points,
            }))
          );
        }

        // 2. Fetch Leaderboard
        const lbRes = await fetch(
          "http://localhost:5000/api/rewards/leaderboard"
        );
=======
          setRewards(prev => prev.map(r => ({
            ...r,
            unlocked: (userDataFull.points || 0) >= r.points
          })));
        }

        // 2. Fetch Leaderboard
        const lbRes = await fetch('http://localhost:1306/api/rewards/leaderboard');
>>>>>>> origin/Tashu
        const lbData = await lbRes.json();

        // Map leaderboard to UI format
        const formattedLb = lbData.map((u, index) => ({
          rank: index + 1,
          name: u.name,
          points: u.points || 0,
<<<<<<< HEAD
          tier: u.tier || "Bronze",
          image: u.name.substring(0, 2).toUpperCase(),
          isMe: isAuthenticated && user?._id === u._id,
=======
          tier: u.tier || 'Bronze',
          image: u.name.substring(0, 2).toUpperCase(),
          isMe: isAuthenticated && user?._id === u._id
>>>>>>> origin/Tashu
        }));

        setLeaderboard(formattedLb);
        setLoading(false);
<<<<<<< HEAD
=======

>>>>>>> origin/Tashu
      } catch (error) {
        console.error("Error fetching rewards data:", error);
        setLoading(false);
      }
    };

    fetchRewardsData();
  }, [isAuthenticated, user]);

<<<<<<< HEAD
  const showNotificationMsg = (message, type = "success") => {
=======

  const showNotificationMsg = (message, type = 'success') => {
>>>>>>> origin/Tashu
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRedeem = async (rewardId) => {
    if (!isAuthenticated) return;

<<<<<<< HEAD
    const reward = rewards.find((r) => r.id === rewardId);
=======
    const reward = rewards.find(r => r.id === rewardId);
>>>>>>> origin/Tashu
    if (!reward || reward.redeemed) return;

    // Check points locally first (backend validates too)
    const currentPoints = userData?.points || 0;

    if (currentPoints < reward.points) {
<<<<<<< HEAD
      showNotificationMsg(`Not enough points to redeem this reward.`, "error");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to redeem "${reward.name}" for ${reward.points} points?`
      )
    ) {
      try {
        const res = await fetch("http://localhost:5000/api/rewards/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user._id,
            cost: reward.points,
            rewardTitle: reward.name,
          }),
=======
      showNotificationMsg(`Not enough points to redeem this reward.`, 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to redeem "${reward.name}" for ${reward.points} points?`)) {
      try {
        const res = await fetch('http://localhost:1306/api/rewards/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user._id,
            cost: reward.points,
            rewardTitle: reward.name
          })
>>>>>>> origin/Tashu
        });

        const data = await res.json();

        if (res.ok) {
<<<<<<< HEAD
          setRewards((prev) =>
            prev.map((r) => (r.id === rewardId ? { ...r, redeemed: true } : r))
          );
          setUserData((prev) => ({ ...prev, points: data.remainingPoints }));
          showNotificationMsg(`Successfully redeemed: ${reward.name}! 🎉`);
        } else {
          showNotificationMsg(data.message || "Redemption failed", "error");
        }
      } catch (error) {
        console.error("Redeem error:", error);
        showNotificationMsg("Network error occurred", "error");
=======
          setRewards(prev => prev.map(r => r.id === rewardId ? { ...r, redeemed: true } : r));
          setUserData(prev => ({ ...prev, points: data.remainingPoints }));
          showNotificationMsg(`Successfully redeemed: ${reward.name}! 🎉`);
        } else {
          showNotificationMsg(data.message || 'Redemption failed', 'error');
        }
      } catch (error) {
        console.error("Redeem error:", error);
        showNotificationMsg('Network error occurred', 'error');
>>>>>>> origin/Tashu
      }
    }
  };

  // Calculate Progress
  const userPoints = userData?.points || 0;
<<<<<<< HEAD
  const currentTier = userData?.tier || "Bronze";
  const nextTier =
    currentTier === "Gold"
      ? "Platinum"
      : currentTier === "Silver"
      ? "Gold"
      : "Silver";
  const pointsToNextTier =
    currentTier === "Gold"
      ? 2000 - userPoints
      : currentTier === "Silver"
      ? 1000 - userPoints
      : 500 - userPoints;
  const progress =
    currentTier === "Gold"
      ? ((userPoints - 1000) / 1000) * 100
      : currentTier === "Silver"
      ? ((userPoints - 500) / 500) * 100
      : (userPoints / 500) * 100;
=======
  const currentTier = userData?.tier || 'Bronze';
  const nextTier = currentTier === 'Gold' ? 'Platinum' : currentTier === 'Silver' ? 'Gold' : 'Silver';
  const pointsToNextTier = currentTier === 'Gold' ? 2000 - userPoints : currentTier === 'Silver' ? 1000 - userPoints : 500 - userPoints;
  const progress = currentTier === 'Gold' ? ((userPoints - 1000) / 1000) * 100 : currentTier === 'Silver' ? ((userPoints - 500) / 500) * 100 : (userPoints / 500) * 100;
>>>>>>> origin/Tashu

  if (loading) {
    return <div className="p-10 text-center">Loading Rewards...</div>;
  }

  return (
    <div>
      {/* Notification */}
      {notification && (
<<<<<<< HEAD
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor:
              notification.type === "success" ? "#059669" : "#dc2626",
            color: "white",
            padding: "16px 24px",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            zIndex: 1001,
            animation: "slideDown 0.3s ease-out",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {notification.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <Lock size={20} />
          )}
=======
        <div style={{
          position: 'fixed', top: '20px', right: '20px',
          backgroundColor: notification.type === 'success' ? '#059669' : '#dc2626',
          color: 'white', padding: '16px 24px', borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 1001,
          animation: 'slideDown 0.3s ease-out', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <Lock size={20} />}
>>>>>>> origin/Tashu
          {notification.message}
        </div>
      )}

<<<<<<< HEAD
      <div style={{ marginBottom: "32px" }}>
        <h2
          style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "#1f2937",
            marginBottom: "12px",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Travel Points & Rewards
        </h2>
        <p style={{ fontSize: "18px", color: "#6b7280" }}>
=======
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '42px', fontWeight: '800', color: '#1f2937', marginBottom: '12px', fontFamily: 'Poppins, sans-serif' }}>
          Travel Points & Rewards
        </h2>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>
>>>>>>> origin/Tashu
          Earn points, unlock tiers, and enjoy exclusive benefits
        </p>
      </div>

      {/* Points Card */}
<<<<<<< HEAD
      <div
        style={{
          background: "linear-gradient(135deg, #fbbf24, #f97316)",
          borderRadius: "24px",
          boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.3)",
          padding: "40px",
          color: "white",
          marginBottom: "32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Helper visual elements omitted for brevity, keeping main structure */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            marginBottom: "28px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "48px",
                fontWeight: "800",
                marginBottom: "8px",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {userPoints} <span style={{ fontSize: "24px" }}>Points</span>
            </h3>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: "6px 16px",
                borderRadius: "20px",
              }}
            >
              <Star size={16} fill="white" />
              <span style={{ fontWeight: "600" }}>
                {currentTier} Tier Member
              </span>
            </div>
          </div>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              padding: "16px",
              borderRadius: "20px",
            }}
          >
=======
      <div style={{
        background: 'linear-gradient(135deg, #fbbf24, #f97316)',
        borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(245, 158, 11, 0.3)',
        padding: '40px', color: 'white', marginBottom: '32px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Helper visual elements omitted for brevity, keeping main structure */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
          <div>
            <h3 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '8px', fontFamily: 'Poppins, sans-serif' }}>
              {userPoints} <span style={{ fontSize: '24px' }}>Points</span>
            </h3>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '20px'
            }}>
              <Star size={16} fill="white" />
              <span style={{ fontWeight: '600' }}>{currentTier} Tier Member</span>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.25)', padding: '16px', borderRadius: '20px' }}>
>>>>>>> origin/Tashu
            <Award size={40} strokeWidth={2} />
          </div>
        </div>

        {/* Progress Bar */}
<<<<<<< HEAD
        <div style={{ marginBottom: "16px", position: "relative", zIndex: 1 }}>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.3)",
              borderRadius: "24px",
              height: "16px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "linear-gradient(90deg, #ffffff, #fef3c7)",
                borderRadius: "24px",
                height: "100%",
                width: `${Math.max(5, progress)}%`,
                transition: "width 1s ease",
              }}
            />
          </div>
        </div>
        <p
          style={{
            fontSize: "15px",
            color: "#fff7ed",
            fontWeight: "500",
            position: "relative",
            zIndex: 1,
          }}
        >
          {pointsToNextTier > 0
            ? `${pointsToNextTier} points to unlock ${nextTier} Tier benefits`
            : `You have reached the highest tier!`}
=======
        <div style={{ marginBottom: '16px', position: 'relative', zIndex: 1 }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '24px', height: '16px', overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(90deg, #ffffff, #fef3c7)', borderRadius: '24px',
              height: '100%', width: `${Math.max(5, progress)}%`, transition: 'width 1s ease'
            }} />
          </div>
        </div>
        <p style={{ fontSize: '15px', color: '#fff7ed', fontWeight: '500', position: 'relative', zIndex: 1 }}>
          {pointsToNextTier > 0 ? `${pointsToNextTier} points to unlock ${nextTier} Tier benefits` : `You have reached the highest tier!`}
>>>>>>> origin/Tashu
        </p>
      </div>

      {/* Navigation Tabs */}
<<<<<<< HEAD
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "28px",
          borderBottom: "2px solid #f3f4f6",
        }}
      >
        {[
          { id: "rewards", label: " Rewards", icon: Gift },
          { id: "leaderboard", label: " Leaderboard", icon: Trophy },
          { id: "badges", label: " Badges", icon: Medal },
        ].map((tab) => (
=======
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', borderBottom: '2px solid #f3f4f6' }}>
        {[
          { id: 'rewards', label: '🎁 Rewards', icon: Gift },
          { id: 'leaderboard', label: '🏆 Leaderboard', icon: Trophy },
          { id: 'badges', label: '🎖️ Badges', icon: Medal }
        ].map(tab => (
>>>>>>> origin/Tashu
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
<<<<<<< HEAD
              padding: "14px 28px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "15px",
              color: activeTab === tab.id ? "#f59e0b" : "#9ca3af",
              borderBottom: activeTab === tab.id ? "3px solid #f59e0b" : "none",
              backgroundColor: activeTab === tab.id ? "#fffbeb" : "transparent",
              display: "flex",
              alignItems: "center",
              gap: "8px",
=======
              padding: '14px 28px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '15px',
              color: activeTab === tab.id ? '#f59e0b' : '#9ca3af',
              borderBottom: activeTab === tab.id ? '3px solid #f59e0b' : 'none',
              backgroundColor: activeTab === tab.id ? '#fffbeb' : 'transparent',
              display: 'flex', alignItems: 'center', gap: '8px'
>>>>>>> origin/Tashu
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

<<<<<<< HEAD
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "28px",
        }}
      >
        {/* REWARDS TAB */}
        {activeTab === "rewards" && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "24px",
              padding: "32px",
              border: "1px solid #f3f4f6",
            }}
          >
            <h4
              style={{
                fontWeight: "700",
                color: "#1f2937",
                marginBottom: "24px",
                fontSize: "20px",
              }}
            >
              Available Rewards
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  style={{
                    padding: "16px",
                    borderRadius: "16px",
                    backgroundColor: reward.redeemed
                      ? "#f3f4f6"
                      : reward.unlocked
                      ? "#f0fdf4"
                      : "#f9fafb",
                    border: `1px solid ${
                      reward.redeemed
                        ? "#e5e7eb"
                        : reward.unlocked
                        ? "#bbf7d0"
                        : "#f3f4f6"
                    }`,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "6px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: reward.redeemed
                          ? "#6b7280"
                          : reward.unlocked
                          ? "#047857"
                          : "#9ca3af",
                        textDecoration: reward.redeemed
                          ? "line-through"
                          : "none",
                        flex: 1,
                      }}
                    >
                      {reward.name}
                    </p>
                    {reward.redeemed ? (
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#059669",
                          backgroundColor: "#d1fae5",
                          padding: "2px 8px",
                          borderRadius: "10px",
                        }}
                      >
                        Redeemed
                      </span>
=======
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
        {/* REWARDS TAB */}
        {activeTab === 'rewards' && (
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f3f4f6' }}>
            <h4 style={{ fontWeight: '700', color: '#1f2937', marginBottom: '24px', fontSize: '20px' }}>Available Rewards</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {rewards.map((reward) => (
                <div key={reward.id} style={{
                  padding: '16px', borderRadius: '16px',
                  backgroundColor: reward.redeemed ? '#f3f4f6' : reward.unlocked ? '#f0fdf4' : '#f9fafb',
                  border: `1px solid ${reward.redeemed ? '#e5e7eb' : reward.unlocked ? '#bbf7d0' : '#f3f4f6'}`,
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                    <p style={{
                      fontSize: '15px', fontWeight: '600',
                      color: reward.redeemed ? '#6b7280' : reward.unlocked ? '#047857' : '#9ca3af',
                      textDecoration: reward.redeemed ? 'line-through' : 'none', flex: 1
                    }}>
                      {reward.name}
                    </p>
                    {reward.redeemed ? (
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '10px' }}>Redeemed</span>
>>>>>>> origin/Tashu
                    ) : reward.unlocked ? (
                      <button
                        onClick={() => handleRedeem(reward.id)}
                        style={{
<<<<<<< HEAD
                          backgroundColor: "#059669",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
=======
                          backgroundColor: '#059669', color: 'white', border: 'none',
                          padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
>>>>>>> origin/Tashu
                        }}
                      >
                        Redeem
                      </button>
                    ) : (
                      <Lock size={16} color="#9ca3af" />
                    )}
                  </div>
<<<<<<< HEAD
                  <p
                    style={{
                      fontSize: "13px",
                      color: reward.unlocked ? "#059669" : "#9ca3af",
                      fontWeight: "500",
                    }}
                  >
                    {reward.points} points{" "}
                    {reward.unlocked ? "• Unlocked" : "• Locked"}
=======
                  <p style={{ fontSize: '13px', color: reward.unlocked ? '#059669' : '#9ca3af', fontWeight: '500' }}>
                    {reward.points} points {reward.unlocked ? '• Unlocked' : '• Locked'}
>>>>>>> origin/Tashu
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEADERBOARD TAB */}
<<<<<<< HEAD
        {activeTab === "leaderboard" && (
          <div
            style={{
              gridColumn: "1 / -1",
              backgroundColor: "white",
              borderRadius: "24px",
              padding: "32px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
            }}
          >
            <h3
              style={{
                fontSize: "24px",
                fontWeight: "700",
                marginBottom: "24px",
                color: "#1f2937",
              }}
            >
              Top Travelers
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {leaderboard.length === 0 ? (
                <p>No leaderboard data available.</p>
              ) : (
                leaderboard.map((u, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "16px",
                      backgroundColor: u.isMe ? "#f0fdf4" : "white",
                      border: u.isMe
                        ? "2px solid #059669"
                        : "1px solid #e5e7eb",
                      borderRadius: "16px",
                      boxShadow:
                        u.rank <= 3 ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor:
                          u.rank === 1
                            ? "#fbbf24"
                            : u.rank === 2
                            ? "#94a3b8"
                            : u.rank === 3
                            ? "#b45309"
                            : "#f3f4f6",
                        color: u.rank <= 3 ? "white" : "#6b7280",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "800",
                        marginRight: "16px",
                        fontSize: "18px",
                      }}
                    >
                      {u.rank}
                    </div>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                        marginRight: "16px",
                      }}
                    >
                      {u.image}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          fontWeight: "700",
                          color: "#1f2937",
                        }}
                      >
                        {u.name}{" "}
                        {u.rank === 1 && (
                          <Crown
                            size={16}
                            color="#fbbf24"
                            fill="#fbbf24"
                            style={{ marginLeft: "4px" }}
                          />
                        )}
                      </h4>
                      <span style={{ fontSize: "13px", color: "#6b7280" }}>
                        {u.tier || "Bronze"} Member
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          display: "block",
                          fontSize: "18px",
                          fontWeight: "800",
                          color: "#059669",
                        }}
                      >
                        {u.points}
                      </span>
                      <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                        Points
                      </span>
                    </div>
                  </div>
                ))
              )}
=======
        {activeTab === 'leaderboard' && (
          <div style={{ gridColumn: '1 / -1', backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>Top Travelers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {leaderboard.length === 0 ? <p>No leaderboard data available.</p> : leaderboard.map((u, index) => (
                <div key={index} style={{
                  display: 'flex', alignItems: 'center', padding: '16px',
                  backgroundColor: u.isMe ? '#f0fdf4' : 'white',
                  border: u.isMe ? '2px solid #059669' : '1px solid #e5e7eb',
                  borderRadius: '16px',
                  boxShadow: u.rank <= 3 ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    backgroundColor: u.rank === 1 ? '#fbbf24' : u.rank === 2 ? '#94a3b8' : u.rank === 3 ? '#b45309' : '#f3f4f6',
                    color: u.rank <= 3 ? 'white' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '800', marginRight: '16px', fontSize: '18px'
                  }}>
                    {u.rank}
                  </div>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 'bold', marginRight: '16px'
                  }}>
                    {u.image}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                      {u.name} {u.rank === 1 && <Crown size={16} color="#fbbf24" fill="#fbbf24" style={{ marginLeft: '4px' }} />}
                    </h4>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>{(u.tier || 'Bronze')} Member</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '18px', fontWeight: '800', color: '#059669' }}>{u.points}</span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>Points</span>
                  </div>
                </div>
              ))}
>>>>>>> origin/Tashu
            </div>
          </div>
        )}

        {/* BADGES TAB (Static) */}
<<<<<<< HEAD
        {activeTab === "badges" && (
          <div style={{ gridColumn: "1 / -1", padding: "20px" }}>
            <p className="text-gray-500">Badges are coming soon!</p>
          </div>
        )}
=======
        {activeTab === 'badges' && (
          <div style={{ gridColumn: '1 / -1', padding: '20px' }}>
            <p className="text-gray-500">Badges are coming soon!</p>
          </div>
        )}

>>>>>>> origin/Tashu
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
