import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Send, Lock, MapPin, Star, Image, Smile, Bell, Bookmark, MoreHorizontal, ThumbsUp, Laugh, Award, Camera, TrendingUp, Users, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';

export default function CommunityPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [postText, setPostText] = useState('');
  const [postType, setPostType] = useState('story');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [rating, setRating] = useState(0);
  const [notification, setNotification] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [replyingTo, setReplyingTo] = useState({});
  const [replyText, setReplyText] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [showReactions, setShowReactions] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');

  // Reaction types (3.2)
  const reactionTypes = [
    { type: 'like', emoji: '👍', label: 'Like' },
    { type: 'love', emoji: '❤️', label: 'Love' },
    { type: 'wow', emoji: '😮', label: 'Wow' },
    { type: 'haha', emoji: '😂', label: 'Haha' },
    { type: 'inspire', emoji: '✨', label: 'Inspiring' }
  ];

  // Posts state with full functionality (3.1 - 3.4)
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Alimool Razi',
      authorImage: 'AR',
      authorBadge: 'Explorer',
      time: '2 hours ago',
      type: 'recommendation',
      destination: 'Sajek Valley',
      rating: 5,
      content: 'Just completed an amazing trek to Sajek Valley! The sunrise view was absolutely breathtaking. Highly recommend visiting during winter season. The weather is perfect and the clouds literally touch your feet! 🏔️✨',
      photos: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400'
      ],
      reactions: { like: 15, love: 8, wow: 3, haha: 0, inspire: 5 },
      userReaction: null,
      comments: [
        {
          id: 1,
          author: 'Zarin Raisa',
          authorImage: 'ZR',
          text: 'This looks incredible! Adding to my list!',
          time: '1 hour ago',
          likes: 3,
          isLiked: false,
          replies: [
            { id: 11, author: 'Alimool Razi', authorImage: 'AR', text: 'You should definitely go! Let me know if you need tips.', time: '45 mins ago', likes: 1, isLiked: false }
          ]
        },
        {
          id: 2,
          author: 'Fahim Ahmed',
          authorImage: 'FA',
          text: 'How was the road condition? Planning to go next month.',
          time: '30 mins ago',
          likes: 1,
          isLiked: false,
          replies: []
        }
      ],
      shares: 3,
      isSaved: false,
      tags: ['trekking', 'hills', 'winter', 'photography']
    },
    {
      id: 2,
      author: 'Zarin Raisa',
      authorImage: 'ZR',
      authorBadge: 'Foodie',
      time: '5 hours ago',
      type: 'story',
      content: 'Explored the tea gardens of Sylhet yesterday. The fresh air and green hills were so refreshing! If anyone needs local guide recommendations, feel free to ask. ☕🌿\n\nPro tip: Visit early morning for the best photos and fewer crowds!',
      photos: [
        'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?w=400'
      ],
      reactions: { like: 10, love: 5, wow: 2, haha: 1, inspire: 3 },
      userReaction: 'love',
      comments: [
        {
          id: 1,
          author: 'Tasnim Rahman',
          authorImage: 'TR',
          text: 'Beautiful! Which tea estate did you visit?',
          time: '4 hours ago',
          likes: 2,
          isLiked: true,
          replies: [
            { id: 11, author: 'Zarin Raisa', authorImage: 'ZR', text: 'I went to Malnicherra - it\'s the oldest tea estate!', time: '3 hours ago', likes: 4, isLiked: false },
            { id: 12, author: 'Karim Uddin', authorImage: 'KU', text: 'Malnicherra is amazing! Try Lakkatura next time.', time: '2 hours ago', likes: 1, isLiked: false }
          ]
        }
      ],
      shares: 2,
      isSaved: true,
      tags: ['tea', 'nature', 'sylhet', 'tips']
    },
    {
      id: 3,
      author: 'Rafiq Ahmed',
      authorImage: 'RA',
      authorBadge: 'Adventurer',
      time: '1 day ago',
      type: 'question',
      content: 'Planning a 5-day trip to explore the Chittagong Hill Tracts. Any suggestions for must-visit places and local experiences? Looking for off-the-beaten-path recommendations! 🗺️',
      photos: [],
      reactions: { like: 8, love: 2, wow: 0, haha: 0, inspire: 1 },
      userReaction: null,
      comments: [
        {
          id: 1,
          author: 'Sabrina Khan',
          authorImage: 'SK',
          text: 'Visit Nilgiri! The sunrise from there is magical. Also try the local Marma cuisine.',
          time: '20 hours ago',
          likes: 7,
          isLiked: false,
          replies: []
        }
      ],
      shares: 5,
      isSaved: false,
      tags: ['question', 'hills', 'advice']
    }
  ]);

  // Trending topics for engagement (3.3)
  const trendingTopics = [
    { tag: 'wintertravel', posts: 128 },
    { tag: 'coxsbazar', posts: 95 },
    { tag: 'foodtour', posts: 76 },
    { tag: 'trekking', posts: 64 }
  ];

  // Top contributors (3.3)
  const topContributors = [
    { name: 'Alimool Razi', image: 'AR', posts: 24, badge: 'Explorer' },
    { name: 'Zarin Raisa', image: 'ZR', posts: 18, badge: 'Foodie' },
    { name: 'Rafiq Ahmed', image: 'RA', posts: 15, badge: 'Adventurer' }
  ];

  // Destinations for recommendations
  const destinations = [
    "Cox's Bazar", 'Sundarbans', 'Sylhet', 'Sajek Valley', 'Bandarban',
    'Rangamati', 'Saint Martin', 'Ratargul', 'Sreemangal', 'Kuakata'
  ];

  const showNotificationMsg = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Create post with photos (3.1)
  const handlePost = () => {
    if (!isAuthenticated) {
      navigate('login');
      return;
    }
    if (!postText.trim()) return;
    if (postType === 'recommendation' && !selectedDestination) {
      showNotificationMsg('Please select a destination for your recommendation', 'error');
      return;
    }

    const newPost = {
      id: Date.now(),
      author: user?.name || 'You',
      authorImage: user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U',
      authorBadge: 'Member',
      time: 'Just now',
      type: postType,
      content: postText,
      destination: postType === 'recommendation' ? selectedDestination : null,
      rating: postType === 'recommendation' ? rating : null,
      photos: selectedPhotos,
      reactions: { like: 0, love: 0, wow: 0, haha: 0, inspire: 0 },
      userReaction: null,
      comments: [],
      shares: 0,
      isSaved: false,
      tags: []
    };

    setPosts(prev => [newPost, ...prev]);
    setPostText('');
    setPostType('story');
    setSelectedDestination('');
    setRating(0);
    setSelectedPhotos([]);
    showNotificationMsg(
      postType === 'recommendation'
        ? `Your recommendation for ${selectedDestination} has been shared! 🌟`
        : postType === 'question'
          ? 'Your question has been posted! The community will help you out. 💬'
          : 'Your story has been shared! 📤'
    );
  };

  // Add photo (simulated) (3.1)
  const handleAddPhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
      'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?w=400'
    ];
    if (selectedPhotos.length < 4) {
      const randomPhoto = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
      setSelectedPhotos(prev => [...prev, randomPhoto]);
      showNotificationMsg('Photo added! 📷', 'info');
    }
  };

  // React to post (3.2)
  const handleReaction = (postId, reactionType) => {
    if (!isAuthenticated) {
      navigate('login');
      return;
    }
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const oldReaction = post.userReaction;
        const newReactions = { ...post.reactions };

        // Remove old reaction if exists
        if (oldReaction) {
          newReactions[oldReaction] = Math.max(0, newReactions[oldReaction] - 1);
        }

        // Add new reaction if different from old
        if (oldReaction !== reactionType) {
          newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
          return { ...post, reactions: newReactions, userReaction: reactionType };
        } else {
          // Remove reaction if same (toggle off)
          return { ...post, reactions: newReactions, userReaction: null };
        }
      }
      return post;
    }));
    setShowReactions(null);
  };

  // Save post
  const handleSave = (postId) => {
    if (!isAuthenticated) {
      navigate('login');
      return;
    }
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, isSaved: !post.isSaved };
      }
      return post;
    }));
    const post = posts.find(p => p.id === postId);
    showNotificationMsg(post?.isSaved ? 'Removed from saved' : 'Saved to your collection! 📑', 'info');
  };

  // Share post
  const handleShare = (postId) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, shares: post.shares + 1 };
      }
      return post;
    }));
    showNotificationMsg('Post shared! Your friends will see this. 📢');
  };

  // Add comment (3.2)
  const handleAddComment = (postId) => {
    if (!isAuthenticated) {
      navigate('login');
      return;
    }
    if (!commentText[postId]?.trim()) return;

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, {
            id: Date.now(),
            author: user?.name || 'You',
            authorImage: user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U',
            text: commentText[postId],
            time: 'Just now',
            likes: 0,
            isLiked: false,
            replies: []
          }]
        };
      }
      return post;
    }));
    setCommentText(prev => ({ ...prev, [postId]: '' }));
    showNotificationMsg('Comment added! 💬');
  };

  // Like comment (3.2)
  const handleLikeComment = (postId, commentId) => {
    if (!isAuthenticated) {
      navigate('login');
      return;
    }
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                isLiked: !comment.isLiked,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
              };
            }
            return comment;
          })
        };
      }
      return post;
    }));
  };

  // Add reply to comment (3.2)
  const handleAddReply = (postId, commentId) => {
    if (!isAuthenticated) {
      navigate('login');
      return;
    }
    const replyKey = `${postId}-${commentId}`;
    if (!replyText[replyKey]?.trim()) return;

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: [...comment.replies, {
                  id: Date.now(),
                  author: user?.name || 'You',
                  authorImage: user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U',
                  text: replyText[replyKey],
                  time: 'Just now',
                  likes: 0,
                  isLiked: false
                }]
              };
            }
            return comment;
          })
        };
      }
      return post;
    }));
    setReplyText(prev => ({ ...prev, [replyKey]: '' }));
    setReplyingTo(prev => ({ ...prev, [replyKey]: false }));
    showNotificationMsg('Reply added! 💬');
  };

  // Get total reactions count
  const getTotalReactions = (reactions) => {
    return Object.values(reactions).reduce((a, b) => a + b, 0);
  };

  // Get top reactions for display
  const getTopReactions = (reactions) => {
    return Object.entries(reactions)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => reactionTypes.find(r => r.type === type)?.emoji);
  };

  return (
    <div>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: notification.type === 'success' ? '#059669' : notification.type === 'error' ? '#dc2626' : '#6b7280',
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

      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Main Feed */}
        <div style={{ flex: 1, maxWidth: '700px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#1f2937',
              marginBottom: '12px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Community
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>
              Share stories, get inspired, and connect with fellow travelers
            </p>
          </div>

          {/* Tabs (3.3) */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {[
              { id: 'feed', label: '📰 Feed' },
              { id: 'trending', label: '🔥 Trending' },
              { id: 'questions', label: '❓ Questions' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? '#059669' : '#f3f4f6',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Create Post (3.1) */}
          {!isAuthenticated ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              padding: '28px',
              marginBottom: '28px',
              border: '1px solid rgba(5, 150, 105, 0.1)',
              textAlign: 'center'
            }}>
              <Lock size={48} color="#9ca3af" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Join the Conversation
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                Login to share your travel experiences and connect with others.
              </p>
              <button
                onClick={() => navigate('login')}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                }}
              >
                Sign In to Post
              </button>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              padding: '28px',
              marginBottom: '28px',
              border: '1px solid rgba(5, 150, 105, 0.1)'
            }}>
              {/* Post Type Selector */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[
                  { id: 'story', label: '📖 Story' },
                  { id: 'recommendation', label: '⭐ Recommend' },
                  { id: 'question', label: '❓ Question' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setPostType(type.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: postType === type.id ? '2px solid #059669' : '2px solid #e5e7eb',
                      backgroundColor: postType === type.id ? '#f0fdf4' : 'white',
                      color: postType === type.id ? '#059669' : '#6b7280',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '13px'
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Recommendation fields */}
              {postType === 'recommendation' && (
                <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select Destination</option>
                    {destinations.map(dest => (
                      <option key={dest} value={dest}>{dest}</option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                      >
                        <Star size={22} fill={star <= rating ? '#fbbf24' : 'none'} color={star <= rating ? '#fbbf24' : '#d1d5db'} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
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
                  {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                </div>
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder={
                    postType === 'recommendation'
                      ? "Share your experience and why you recommend this place..."
                      : postType === 'question'
                        ? "What would you like to ask the community?"
                        : "Share your travel story, tips, or experience..."
                  }
                  style={{
                    flex: 1,
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '14px',
                    fontSize: '15px',
                    resize: 'none',
                    outline: 'none',
                    minHeight: '100px',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />
              </div>

              {/* Photo Preview */}
              {selectedPhotos.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {selectedPhotos.map((photo, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img src={photo} alt="" style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                      <button
                        onClick={() => setSelectedPhotos(prev => prev.filter((_, i) => i !== idx))}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleAddPhoto}
                    style={{
                      background: 'none',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px'
                    }}
                  >
                    <Camera size={18} /> Photo
                  </button>
                  <button style={{
                    background: 'none',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px'
                  }}>
                    <MapPin size={18} /> Location
                  </button>
                </div>
                <button
                  onClick={handlePost}
                  disabled={!postText.trim()}
                  style={{
                    backgroundColor: postText.trim() ? '#059669' : '#d1d5db',
                    color: 'white',
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: postText.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Send size={16} />
                  Post
                </button>
              </div>
            </div>
          )}

          {/* Posts Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {posts
              .filter(post => {
                if (activeTab === 'questions') return post.type === 'question';
                if (activeTab === 'trending') return getTotalReactions(post.reactions) > 10;
                return true;
              })
              .map((post, index) => (
                <div key={post.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                  padding: '24px',
                  border: post.type === 'recommendation' ? '1px solid rgba(5, 150, 105, 0.2)' : '1px solid rgba(0,0,0,0.05)',
                  animation: `slideUp 0.5s ease-out ${index * 0.1}s both`
                }}>
                  {/* Post Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                        fontSize: '16px'
                      }}>
                        {post.authorImage}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ fontWeight: '700', color: '#1f2937', margin: 0, fontSize: '15px' }}>{post.author}</h4>
                          {post.authorBadge && (
                            <span style={{
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              🏆 {post.authorBadge}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>{post.time}</p>
                      </div>
                    </div>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  {/* Destination & Rating */}
                  {post.type === 'recommendation' && post.destination && (
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={16} color="#059669" />
                        <span style={{ fontWeight: '600', color: '#059669', fontSize: '14px' }}>{post.destination}</span>
                      </div>
                      {post.rating && (
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < post.rating ? '#fbbf24' : 'none'} color={i < post.rating ? '#fbbf24' : '#d1d5db'} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Question badge */}
                  {post.type === 'question' && (
                    <div style={{
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'inline-block',
                      marginBottom: '12px'
                    }}>
                      ❓ Question for the community
                    </div>
                  )}

                  {/* Content */}
                  <p style={{ color: '#374151', marginBottom: '14px', lineHeight: '1.6', fontSize: '15px', whiteSpace: 'pre-wrap' }}>{post.content}</p>

                  {/* Photos (3.1) */}
                  {post.photos && post.photos.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: post.photos.length === 1 ? '1fr' : '1fr 1fr',
                      gap: '8px',
                      marginBottom: '14px',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}>
                      {post.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt=""
                          style={{
                            width: '100%',
                            height: post.photos.length === 1 ? '300px' : '180px',
                            objectFit: 'cover'
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                      {post.tags.map((tag, i) => (
                        <span key={i} style={{
                          backgroundColor: '#f3f4f6',
                          color: '#6b7280',
                          padding: '4px 10px',
                          borderRadius: '10px',
                          fontSize: '12px'
                        }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reaction Summary */}
                  {getTotalReactions(post.reactions) > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex' }}>
                        {getTopReactions(post.reactions).map((emoji, i) => (
                          <span key={i} style={{ marginLeft: i > 0 ? '-4px' : 0, fontSize: '16px' }}>{emoji}</span>
                        ))}
                      </div>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>{getTotalReactions(post.reactions)} reactions</span>
                      <span style={{ fontSize: '13px', color: '#9ca3af' }}>•</span>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>{post.comments.length} comments</span>
                    </div>
                  )}

                  {/* Actions (3.2) */}
                  <div style={{ display: 'flex', gap: '4px', position: 'relative' }}>
                    {/* Reaction Button with Popup */}
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => post.userReaction ? handleReaction(post.id, post.userReaction) : setShowReactions(showReactions === post.id ? null : post.id)}
                        onMouseEnter={() => setShowReactions(post.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: post.userReaction ? '#fef2f2' : 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: post.userReaction ? '#ef4444' : '#6b7280',
                          fontSize: '13px',
                          fontWeight: '600',
                          padding: '8px 14px',
                          borderRadius: '8px'
                        }}
                      >
                        {post.userReaction ? (
                          <span style={{ fontSize: '18px' }}>{reactionTypes.find(r => r.type === post.userReaction)?.emoji}</span>
                        ) : (
                          <Heart size={18} />
                        )}
                        {post.userReaction ? reactionTypes.find(r => r.type === post.userReaction)?.label : 'React'}
                      </button>

                      {/* Reaction Popup (3.2) */}
                      {showReactions === post.id && (
                        <div
                          onMouseLeave={() => setShowReactions(null)}
                          style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '0',
                            backgroundColor: 'white',
                            borderRadius: '24px',
                            padding: '8px 12px',
                            display: 'flex',
                            gap: '4px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            animation: 'scaleIn 0.2s ease-out'
                          }}
                        >
                          {reactionTypes.map(reaction => (
                            <button
                              key={reaction.type}
                              onClick={() => handleReaction(post.id, reaction.type)}
                              title={reaction.label}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '24px',
                                padding: '4px',
                                transition: 'transform 0.2s',
                                transform: post.userReaction === reaction.type ? 'scale(1.2)' : 'scale(1)'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.3)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = post.userReaction === reaction.type ? 'scale(1.2)' : 'scale(1)'}
                            >
                              {reaction.emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: showComments[post.id] ? '#f0fdf4' : 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: showComments[post.id] ? '#059669' : '#6b7280',
                        fontSize: '13px',
                        fontWeight: '600',
                        padding: '8px 14px',
                        borderRadius: '8px'
                      }}
                    >
                      <MessageCircle size={18} />
                      Comment
                    </button>
                    <button
                      onClick={() => handleShare(post.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280',
                        fontSize: '13px',
                        fontWeight: '600',
                        padding: '8px 14px',
                        borderRadius: '8px'
                      }}
                    >
                      <Share2 size={18} />
                      Share
                    </button>
                    <button
                      onClick={() => handleSave(post.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: post.isSaved ? '#fef3c7' : 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: post.isSaved ? '#f59e0b' : '#6b7280',
                        fontSize: '13px',
                        fontWeight: '600',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        marginLeft: 'auto'
                      }}
                    >
                      <Bookmark size={18} fill={post.isSaved ? '#f59e0b' : 'none'} />
                    </button>
                  </div>

                  {/* Comments Section (3.2) */}
                  {showComments[post.id] && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                      {post.comments.map(comment => (
                        <div key={comment.id} style={{ marginBottom: '16px' }}>
                          {/* Comment */}
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #6b7280, #9ca3af)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '12px',
                              flexShrink: 0
                            }}>
                              {comment.authorImage}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                backgroundColor: '#f3f4f6',
                                borderRadius: '12px',
                                padding: '10px 14px'
                              }}>
                                <span style={{ fontWeight: '600', fontSize: '13px', color: '#1f2937' }}>{comment.author}</span>
                                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#374151' }}>{comment.text}</p>
                              </div>
                              <div style={{ display: 'flex', gap: '16px', marginTop: '6px', marginLeft: '8px' }}>
                                <button
                                  onClick={() => handleLikeComment(post.id, comment.id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    color: comment.isLiked ? '#ef4444' : '#6b7280',
                                    fontWeight: '600'
                                  }}
                                >
                                  {comment.isLiked ? '❤️' : '👍'} {comment.likes > 0 && comment.likes}
                                </button>
                                <button
                                  onClick={() => setReplyingTo(prev => ({ ...prev, [`${post.id}-${comment.id}`]: !prev[`${post.id}-${comment.id}`] }))}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    color: '#6b7280',
                                    fontWeight: '600'
                                  }}
                                >
                                  Reply
                                </button>
                                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{comment.time}</span>
                              </div>

                              {/* Replies (3.2) */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div style={{ marginTop: '12px', marginLeft: '8px' }}>
                                  {!showReplies[`${post.id}-${comment.id}`] && comment.replies.length > 0 && (
                                    <button
                                      onClick={() => setShowReplies(prev => ({ ...prev, [`${post.id}-${comment.id}`]: true }))}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: '#059669',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <ChevronDown size={16} />
                                      View {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                                    </button>
                                  )}

                                  {showReplies[`${post.id}-${comment.id}`] && (
                                    <>
                                      <button
                                        onClick={() => setShowReplies(prev => ({ ...prev, [`${post.id}-${comment.id}`]: false }))}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          cursor: 'pointer',
                                          fontSize: '13px',
                                          color: '#059669',
                                          fontWeight: '600',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          marginBottom: '8px'
                                        }}
                                      >
                                        <ChevronUp size={16} />
                                        Hide replies
                                      </button>
                                      {comment.replies.map(reply => (
                                        <div key={reply.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                          <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #059669, #0d9488)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '10px',
                                            flexShrink: 0
                                          }}>
                                            {reply.authorImage}
                                          </div>
                                          <div style={{ flex: 1 }}>
                                            <div style={{
                                              backgroundColor: '#e5e7eb',
                                              borderRadius: '10px',
                                              padding: '8px 12px'
                                            }}>
                                              <span style={{ fontWeight: '600', fontSize: '12px' }}>{reply.author}</span>
                                              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#374151' }}>{reply.text}</p>
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '8px' }}>{reply.time}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </>
                                  )}
                                </div>
                              )}

                              {/* Reply Input (3.2) */}
                              {replyingTo[`${post.id}-${comment.id}`] && isAuthenticated && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', marginLeft: '8px' }}>
                                  <input
                                    type="text"
                                    value={replyText[`${post.id}-${comment.id}`] || ''}
                                    onChange={(e) => setReplyText(prev => ({ ...prev, [`${post.id}-${comment.id}`]: e.target.value }))}
                                    placeholder={`Reply to ${comment.author}...`}
                                    style={{
                                      flex: 1,
                                      padding: '8px 14px',
                                      borderRadius: '20px',
                                      border: '2px solid #e5e7eb',
                                      fontSize: '13px',
                                      outline: 'none'
                                    }}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddReply(post.id, comment.id)}
                                  />
                                  <button
                                    onClick={() => handleAddReply(post.id, comment.id)}
                                    disabled={!replyText[`${post.id}-${comment.id}`]?.trim()}
                                    style={{
                                      backgroundColor: replyText[`${post.id}-${comment.id}`]?.trim() ? '#059669' : '#e5e7eb',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '50%',
                                      width: '32px',
                                      height: '32px',
                                      cursor: replyText[`${post.id}-${comment.id}`]?.trim() ? 'pointer' : 'not-allowed',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Send size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Comment (3.2) */}
                      {isAuthenticated && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                          <div style={{
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
                            flexShrink: 0
                          }}>
                            {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                          </div>
                          <input
                            type="text"
                            value={commentText[post.id] || ''}
                            onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="Write a comment..."
                            style={{
                              flex: 1,
                              padding: '10px 16px',
                              borderRadius: '20px',
                              border: '2px solid #e5e7eb',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!commentText[post.id]?.trim()}
                            style={{
                              backgroundColor: commentText[post.id]?.trim() ? '#059669' : '#e5e7eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '36px',
                              height: '36px',
                              cursor: commentText[post.id]?.trim() ? 'pointer' : 'not-allowed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Sidebar (3.3 - Engagement) */}
        <div style={{ width: '300px', flexShrink: 0 }}>
          {/* Trending Topics (3.3) */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#059669" />
              Trending Topics
            </h3>
            {trendingTopics.map((topic, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: idx < trendingTopics.length - 1 ? '1px solid #f3f4f6' : 'none'
              }}>
                <span style={{ color: '#059669', fontWeight: '600', fontSize: '14px' }}>#{topic.tag}</span>
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>{topic.posts} posts</span>
              </div>
            ))}
          </div>

          {/* Top Contributors (3.3) */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="#f59e0b" />
              Top Contributors
            </h3>
            {topContributors.map((user, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 0',
                borderBottom: idx < topContributors.length - 1 ? '1px solid #f3f4f6' : 'none'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #059669, #0d9488)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {user.image}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>{user.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>{user.posts} posts • {user.badge}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Community Guidelines (3.4) */}
          <div style={{
            backgroundColor: '#f0fdf4',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #bbf7d0'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#059669', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} />
              Community Tips
            </h3>
            <ul style={{ margin: 0, padding: '0 0 0 20px', fontSize: '13px', color: '#374151', lineHeight: '1.8' }}>
              <li>Share authentic travel experiences</li>
              <li>Be respectful and helpful</li>
              <li>Add photos to make posts engaging</li>
              <li>Answer questions from fellow travelers</li>
              <li>Tag destinations for easy discovery</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}