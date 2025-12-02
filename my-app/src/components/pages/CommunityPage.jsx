import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';

export default function CommunityPage() {
  const [postText, setPostText] = useState('');
  const [posts] = useState([
    {
      id: 1,
      author: 'Alimool Razi',
      authorImage: 'AR',
      time: '2 hours ago',
      content: 'Just completed an amazing trek to Sajek Valley! The sunrise view was absolutely breathtaking. Highly recommend visiting during winter season. 🏔️',
      likes: 24,
      comments: 5,
      shares: 3,
      isLiked: false
    },
    {
      id: 2,
      author: 'Zarin Raisa',
      authorImage: 'ZR',
      time: '5 hours ago',
      content: 'Explored the tea gardens of Sylhet yesterday. The fresh air and green hills were so refreshing! If anyone needs local guide recommendations, feel free to ask. ☕🌿',
      likes: 18,
      comments: 8,
      shares: 2,
      isLiked: true
    }
  ]);

  const handlePost = () => {
    if (postText.trim()) {
      console.log('Creating post:', postText);
      // Will connect to backend API
      setPostText('');
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>Community Posts</h2>
      
      {/* Create Post */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(to right, #059669, #0d9488)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            MH
          </div>
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="Share your travel experience, tips, or photos..."
            style={{
              flex: 1,
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              minHeight: '80px'
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handlePost}
            disabled={!postText.trim()}
            style={{
              backgroundColor: postText.trim() ? '#059669' : '#d1d5db',
              color: 'white',
              padding: '8px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: postText.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Send size={16} />
            Share Post
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {posts.map(post => (
          <div key={post.id} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '24px'
          }}>
            {/* Post Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(to right, #059669, #0d9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {post.authorImage}
              </div>
              <div>
                <h4 style={{ fontWeight: '600', color: '#1f2937', margin: 0 }}>{post.author}</h4>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{post.time}</p>
              </div>
            </div>

            {/* Post Content */}
            <p style={{ color: '#374151', marginBottom: '16px', lineHeight: '1.6' }}>{post.content}</p>

            {/* Post Actions */}
            <div style={{
              display: 'flex',
              gap: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: post.isLiked ? '#ef4444' : '#6b7280',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <Heart size={18} fill={post.isLiked ? '#ef4444' : 'none'} />
                {post.likes} Likes
              </button>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <MessageCircle size={18} />
                {post.comments} Comments
              </button>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <Share2 size={18} />
                {post.shares} Shares
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}  