import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Send, Star, MapPin, Users, Award } from 'lucide-react';

import { API_URL } from '../../config';

export default function GuideDashboard() {
    const { user, refreshUser } = useAuth();
    const [postContent, setPostContent] = useState('');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (user) {
            fetchMyPosts();
            fetchBookings();
        }
    }, [user]);

    const fetchMyPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/guide/posts`);
            const data = await res.json();
            // Filter posts for this guide

            setPosts(data.filter(p => p.guideEmail === user.email));
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };


    const fetchBookings = async () => {
        try {
            const res = await fetch(`${API_URL}/api/bookings?guideEmail=${user.email}`);
            const data = await res.json();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };


    const handlePost = async (e) => {
        e.preventDefault();
        if (!postContent.trim()) return;

        try {
            const res = await fetch(`${API_URL}/api/guide/posts`, {

                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guideName: user.name,
                    guideEmail: user.email,
                    content: postContent,
                    likes: 0
                })
            });
            if (res.ok) {
                setPostContent('');
                fetchMyPosts();
                alert('Update posted successfully!');
            }
        } catch (error) {
            console.error('Error posting update:', error);
        }
    };


    const handleBookingAction = async (bookingId, status) => {
        try {
            await fetch(`${API_URL}/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchBookings();

            // Refresh user data to update trip count when completed
            if (status === 'completed') {
                await refreshUser();
            }

            alert(`Booking ${status}!`);
        } catch (error) {
            console.error('Error updating booking:', error);
        }
    };

    const handleReplyToComment = async (postId, commentIndex, replyText) => {
        if (!replyText?.trim()) return;
        try {
            await fetch(`${API_URL}/api/guide/posts/${postId}/comments/${commentIndex}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: user.name,
                    text: replyText,
                    userEmail: user.email
                })
            });
            fetchMyPosts();
        } catch (error) {
            console.error('Error replying:', error);
        }
    };


    // STRICT ACCESS CHECK
    if (user?.role !== 'admin' && user?.guideStatus !== 'approved') {
        return (
            <div style={{ padding: '40px', textAlign: 'center', marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ backgroundColor: '#fee2e2', padding: '32px', borderRadius: '16px', maxWidth: '500px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ color: '#991b1b', marginBottom: '12px', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        Access Denied
                    </h2>
                    <p style={{ color: '#7f1d1d', fontSize: '16px', lineHeight: '1.5' }}>
                        This area is restricted to approved Local Guides only.
                    </p>
                    <p style={{ color: '#7f1d1d', marginTop: '12px', fontSize: '14px' }}>
                        If you are a guide, please ensure your profile is approved.
                    </p>
                </div>
            </div>
        );
    }

    const guideCount = user?.trips || 0;
    const hasTrustedBadge = guideCount > 5;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>

            {/* Header / Stats */}
            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <img
                        src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                        alt="Profile"
                        style={{ width: '80px', height: '80px', borderRadius: '50%' }}
                    />
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {user?.name}
                            {hasTrustedBadge && <Award color="#fbbf24" fill="#fbbf24" size={24} title="Trusted Guide" />}

                        </h1>
                        <p style={{ color: '#6b7280', marginTop: '4px' }}>Local Guide • {guideCount} Trips Guided</p>
                    </div>
                </div>

                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>

                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{guideCount}</h3>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>Trips Guided</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>4.9</h3>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>Average Rating</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{hasTrustedBadge ? 'Trusted' : 'Rising'}</h3>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>Guide Status</p>
                    </div>
                </div>
            </div>

            {/* Post Update Section */}
            <div className="guide-content-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Post Daily Update</h2>
                    <form onSubmit={handlePost}>
                        <textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder="Share current weather, festival prep, or a hidden gem..."
                            style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', minHeight: '120px', resize: 'vertical', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button
                                type="submit"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                <Send size={18} /> Post Update
                            </button>
                        </div>
                    </form>

                    <div style={{ marginTop: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Your Recent Updates</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {posts.map(post => (
                                <div key={post._id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
                                    <p style={{ color: '#374151', marginBottom: '12px' }}>{post.content}</p>
                                    <p style={{ color: '#9ca3af', fontSize: '12px' }}>{new Date(post.createdAt).toLocaleDateString()}</p>
                                    {post.comments && post.comments.length > 0 && (
                                        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                                            <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Comments:</p>
                                            {post.comments.map((c, i) => (
                                                <p key={i} style={{ fontSize: '13px', marginBottom: '4px' }}>
                                                    <strong>{c.user}:</strong> {c.text}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Recent Bookings</h2>
                    {bookings.length === 0 ? (
                        <p style={{ color: '#6b7280' }}>No new bookings request.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {bookings.slice(0, 5).map(booking => (
                                <div key={booking._id} style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <p style={{ fontWeight: '600', margin: 0 }}>{booking.travelerName}</p>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            backgroundColor: booking.status === 'completed' ? '#d1fae5' : booking.status === 'accepted' ? '#dbeafe' : '#fef3c7',
                                            color: booking.status === 'completed' ? '#059669' : booking.status === 'accepted' ? '#2563eb' : '#d97706'
                                        }}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                                        {booking.type === 'cook_with_local' ? '🍳 Cook with Local' : '🎒 Guide Booking'} • ৳{booking.amount}
                                    </p>
                                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>
                                        {new Date(booking.createdAt).toLocaleDateString()}
                                    </p>
                                    {booking.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                            <button
                                                onClick={() => handleBookingAction(booking._id, 'accepted')}
                                                style={{ padding: '6px 12px', backgroundColor: '#d1fae5', color: '#059669', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleBookingAction(booking._id, 'rejected')}
                                                style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {booking.status === 'accepted' && (
                                        <button
                                            onClick={() => handleBookingAction(booking._id, 'completed')}
                                            style={{ marginTop: '12px', padding: '6px 12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                        >
                                            Mark Complete
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
