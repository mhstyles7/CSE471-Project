import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Send, Star, MapPin, Users, Award, User, Mail, Calendar, CheckCircle, XCircle, Eye } from 'lucide-react';
import { API_URL } from '../../config';

export default function GuideDashboard() {
    const { user, refreshUser } = useAuth();
    const [postContent, setPostContent] = useState('');
    const [posts, setPosts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'bookings'

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
    const hasTrustedBadge = guideCount >= 5;
    const pendingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'paid').length;

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
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
                            {hasTrustedBadge && <Award color="#fbbf24" fill="#fbbf24" size={24} title="Trusted Guide (5+ trips)" />}
                        </h1>
                        <p style={{ color: '#6b7280', marginTop: '4px' }}>Local Guide • {guideCount} Trips Guided</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
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
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{pendingBookings}</h3>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>Pending Bookings</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button
                    onClick={() => setActiveTab('posts')}
                    style={{
                        padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '600',
                        backgroundColor: activeTab === 'posts' ? '#059669' : 'white',
                        color: activeTab === 'posts' ? 'white' : '#4b5563',
                        boxShadow: activeTab === 'posts' ? '0 4px 12px rgba(5, 150, 105, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                >
                    <Send size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    My Posts
                </button>
                <button
                    onClick={() => setActiveTab('bookings')}
                    style={{
                        padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '600',
                        backgroundColor: activeTab === 'bookings' ? '#059669' : 'white',
                        color: activeTab === 'bookings' ? 'white' : '#4b5563',
                        boxShadow: activeTab === 'bookings' ? '0 4px 12px rgba(5, 150, 105, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <Eye size={16} />
                    Show Bookings
                    {pendingBookings > 0 && (
                        <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{pendingBookings}</span>
                    )}
                </button>
            </div>

            {/* Posts Tab */}
            {activeTab === 'posts' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
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
                                {posts.length === 0 ? (
                                    <p style={{ color: '#6b7280' }}>No posts yet. Share your first update!</p>
                                ) : posts.map(post => (
                                    <PostCard key={post._id} post={post} onReply={handleReplyToComment} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Quick Stats</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '12px' }}>
                                <p style={{ color: '#059669', fontWeight: '600' }}>Posts This Week</p>
                                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{posts.length}</p>
                            </div>
                            <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '12px' }}>
                                <p style={{ color: '#3b82f6', fontWeight: '600' }}>Total Comments</p>
                                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{posts.reduce((acc, p) => acc + (p.comments?.length || 0), 0)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Traveler Bookings</h2>
                        <p style={{ color: '#6b7280', marginTop: '4px' }}>Manage booking requests from travelers</p>
                    </div>

                    {bookings.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center' }}>
                            <Users size={48} color="#9ca3af" style={{ marginBottom: '16px' }} />
                            <p style={{ color: '#6b7280', fontSize: '16px' }}>No bookings yet. Keep posting to attract travelers!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '0' }}>
                            {bookings.map(booking => (
                                <div key={booking._id} style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={24} color="#6b7280" />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '600', fontSize: '16px', margin: 0 }}>{booking.travelerName}</p>
                                            <p style={{ fontSize: '14px', color: '#6b7280', margin: '2px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Mail size={14} /> {booking.travelerEmail}
                                            </p>
                                            <p style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={12} /> {new Date(booking.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{
                                            padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                                            backgroundColor: booking.status === 'accepted' ? '#d1fae5' : booking.status === 'completed' ? '#e0e7ff' : booking.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                            color: booking.status === 'accepted' ? '#059669' : booking.status === 'completed' ? '#4f46e5' : booking.status === 'rejected' ? '#dc2626' : '#d97706'
                                        }}>
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </span>

                                        {(booking.status === 'pending' || booking.status === 'paid') && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleBookingAction(booking._id, 'accepted')}
                                                    style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: '#d1fae5', color: '#059669', cursor: 'pointer' }}
                                                    title="Accept"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleBookingAction(booking._id, 'rejected')}
                                                    style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', cursor: 'pointer' }}
                                                    title="Reject"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        )}

                                        {booking.status === 'accepted' && (
                                            <button
                                                onClick={() => handleBookingAction(booking._id, 'completed')}
                                                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                                            >
                                                Mark Complete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Post Card Component with Reply functionality
function PostCard({ post, onReply }) {
    const [replyTexts, setReplyTexts] = useState({});
    const [showReplyFor, setShowReplyFor] = useState(null);

    const submitReply = (commentIndex) => {
        const text = replyTexts[commentIndex];
        if (text?.trim()) {
            onReply(post._id, commentIndex, text);
            setReplyTexts(prev => ({ ...prev, [commentIndex]: '' }));
            setShowReplyFor(null);
        }
    };

    return (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
            <p style={{ color: '#374151', marginBottom: '12px' }}>{post.content}</p>
            <p style={{ color: '#9ca3af', fontSize: '12px' }}>{new Date(post.createdAt).toLocaleDateString()}</p>

            {post.comments && post.comments.length > 0 && (
                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Comments:</p>
                    {post.comments.map((c, i) => (
                        <div key={i} style={{ marginBottom: '12px' }}>
                            <p style={{ fontSize: '13px', marginBottom: '4px' }}>
                                <strong>{c.user}:</strong> {c.text}
                            </p>

                            {/* Show replies */}
                            {c.replies?.map((r, ri) => (
                                <div key={ri} style={{ marginLeft: '16px', padding: '6px 10px', backgroundColor: '#ecfdf5', borderRadius: '6px', marginBottom: '4px' }}>
                                    <p style={{ fontSize: '12px', margin: 0 }}>
                                        <strong style={{ color: '#059669' }}>{r.user}:</strong> {r.text}
                                    </p>
                                </div>
                            ))}

                            {/* Reply action */}
                            {showReplyFor === i ? (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', marginLeft: '16px' }}>
                                    <input
                                        type="text"
                                        placeholder="Write a reply..."
                                        value={replyTexts[i] || ''}
                                        onChange={(e) => setReplyTexts(prev => ({ ...prev, [i]: e.target.value }))}
                                        style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                                    />
                                    <button onClick={() => submitReply(i)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#059669', color: 'white', fontSize: '12px', cursor: 'pointer' }}>Reply</button>
                                </div>
                            ) : (
                                <button onClick={() => setShowReplyFor(i)} style={{ marginLeft: '16px', fontSize: '11px', color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Reply</button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
