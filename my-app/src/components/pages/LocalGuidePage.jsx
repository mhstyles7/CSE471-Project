import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';
<<<<<<< HEAD
import { MessageCircle, Award } from 'lucide-react';
import PaymentModal from '../common/PaymentModal';

import { apiService } from '../../services/apiService';

export default function LocalGuidePage() {
    const { user } = useAuth();
=======
import { MessageCircle, Award, Send, HandHelping } from 'lucide-react';
import PaymentModal from '../common/PaymentModal';
import { API_URL } from '../../config';

export default function LocalGuidePage() {
    const { user, updateProfile } = useAuth();
>>>>>>> origin/Tashu
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [commentTexts, setCommentTexts] = useState({});
<<<<<<< HEAD
=======
    const [replyTexts, setReplyTexts] = useState({});
    const [showReplyFor, setShowReplyFor] = useState(null);
>>>>>>> origin/Tashu

    // Payment State
    const [isPaymentOpen, setPaymentOpen] = useState(false);
    const [selectedGuidePost, setSelectedGuidePost] = useState(null);

<<<<<<< HEAD
=======
    // Guide Request State
    const [showGuideRequest, setShowGuideRequest] = useState(false);
    const [guideReason, setGuideReason] = useState('');
    const [requesting, setRequesting] = useState(false);

>>>>>>> origin/Tashu
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
<<<<<<< HEAD
            const data = await apiService.get('/posts?type=update'); // Assuming 'update' type for guide posts
=======
            const res = await fetch(`${API_URL}/api/guide/posts`);
            const data = await res.json();
>>>>>>> origin/Tashu
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCommentSubmit = async (postId) => {
        const text = commentTexts[postId];
<<<<<<< HEAD
        if (!text?.trim()) return;

        try {
            await apiService.post(`/posts/${postId}/comments`, {
                user: user?.name || 'Traveler',
                text: text
=======
        if (!text?.trim() || !user) return;

        try {
            await fetch(`${API_URL}/api/guide/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: user.name,
                    text: text,
                    userEmail: user.email
                })
>>>>>>> origin/Tashu
            });
            setCommentTexts(prev => ({ ...prev, [postId]: '' }));
            fetchPosts();
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

<<<<<<< HEAD
    const initBookGuide = (post) => {
        if (!user) {
            alert("Please login to book a guide.");
            return;
        }
=======
    const handleReplySubmit = async (postId, commentIndex) => {
        const key = `${postId}-${commentIndex}`;
        const text = replyTexts[key];
        if (!text?.trim() || !user) return;

        try {
            await fetch(`${API_URL}/api/guide/posts/${postId}/comments/${commentIndex}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: user.name,
                    text: text,
                    userEmail: user.email
                })
            });
            setReplyTexts(prev => ({ ...prev, [key]: '' }));
            setShowReplyFor(null);
            fetchPosts();
        } catch (error) {
            console.error('Error posting reply:', error);
        }
    };

    const initBookGuide = (post) => {
        if (!user) {
            alert("Please login to book a guide.");
            navigate('login');
            return;
        }

        // Show payment modal for guide booking (400tk for all users)
>>>>>>> origin/Tashu
        setSelectedGuidePost(post);
        setPaymentOpen(true);
    };

    const handleBookGuideConfirm = async () => {
        if (!selectedGuidePost) return;
<<<<<<< HEAD
        try {
            await apiService.post('/bookings', {
                type: 'guide_booking',
                guideName: selectedGuidePost.guideName,
                guideEmail: selectedGuidePost.guideEmail,
                travelerName: user.name,
                travelerEmail: user.email,
                date: new Date().toISOString(),
                status: 'paid', // Payment confirmed via modal
                amount: '500' // Base fee for guide booking (example)
            });
            setPaymentOpen(false);
            setSelectedGuidePost(null);
            // alert(`Booking request sent to ${selectedGuidePost.guideName}! (Ref: ${data._id})`); - Modal success is enough
=======

        // Premium users get first guide booking free
        const isFreeBooking = user?.isPremium && !user?.freeGuideBookingUsed;
        const bookingAmount = isFreeBooking ? 0 : 400;

        try {
            await fetch(`${API_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'guide_booking',
                    guideName: selectedGuidePost.guideName,
                    guideEmail: selectedGuidePost.guideEmail,
                    travelerName: user.name,
                    travelerEmail: user.email,
                    postId: selectedGuidePost._id,
                    amount: bookingAmount,
                    status: 'paid'
                })
            });

            // If this was a free booking, mark it as used
            if (isFreeBooking) {
                await updateProfile({ freeGuideBookingUsed: true });
            }

            setPaymentOpen(false);
            setSelectedGuidePost(null);
            alert('Guide booked successfully!' + (isFreeBooking ? ' Your free premium booking has been used.' : ''));
>>>>>>> origin/Tashu
        } catch (error) {
            console.error('Error booking guide:', error);
        }
    };

<<<<<<< HEAD
    // Strict Guide Check
    const isGuide = user?.role === 'admin' || user?.guideStatus === 'approved';
=======
    const handleGuideRequest = async () => {
        if (!user) {
            alert("Please login first.");
            return;
        }
        setRequesting(true);
        try {
            const res = await fetch(`${API_URL}/api/guide/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    userName: user.name,
                    userEmail: user.email,
                    reason: guideReason
                })
            });
            const data = await res.json();
            if (res.ok) {
                await updateProfile({ guideStatus: 'pending' });
                alert('Guide request submitted! An admin will review your request.');
                setShowGuideRequest(false);
                setGuideReason('');
            } else {
                alert(data.message || 'Failed to submit request');
            }
        } catch (error) {
            console.error('Error requesting guide status:', error);
            alert('Failed to submit request');
        } finally {
            setRequesting(false);
        }
    };

    // Check user status
    const isGuide = user?.role === 'admin' || user?.guideStatus === 'approved';
    const hasPendingRequest = user?.guideStatus === 'pending';
    const canRequestGuide = user && user.role === 'traveler' && !isGuide && !hasPendingRequest;
>>>>>>> origin/Tashu

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setPaymentOpen(false)}
                onConfirm={handleBookGuideConfirm}
<<<<<<< HEAD
                amount="$30" // Flat fee for contacting guide
                title={`Book Guide: ${selectedGuidePost?.guideName}`}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
=======
                amount={user?.isPremium && !user?.freeGuideBookingUsed ? "FREE (Premium Benefit!)" : "400tk"}
                title={`Book Guide: ${selectedGuidePost?.guideName}`}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
>>>>>>> origin/Tashu
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>Local Guides & Updates</h1>
                    <p style={{ color: '#6b7280' }}>Connect with locals and see what's happening around you.</p>
                </div>
<<<<<<< HEAD
                {isGuide && (
                    <button
                        onClick={() => navigate('guide-dashboard')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '24px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 6px rgba(5, 150, 105, 0.2)'
                        }}
                    >
                        <Award size={20} /> Guide Others
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gap: '24px' }}>
                {loading ? <p>Loading updates...</p> : posts.map(post => (
=======
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {canRequestGuide && (
                        <button
                            onClick={() => setShowGuideRequest(true)}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '24px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)'
                            }}
                        >
                            <HandHelping size={20} /> Help Others (Become a Guide)
                        </button>
                    )}
                    {hasPendingRequest && (
                        <span style={{ padding: '12px 24px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '24px', fontWeight: '600' }}>
                            Guide Request Pending...
                        </span>
                    )}
                    {isGuide && (
                        <button
                            onClick={() => navigate('guide-dashboard')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#059669',
                                color: 'white',
                                border: 'none',
                                borderRadius: '24px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 6px rgba(5, 150, 105, 0.2)'
                            }}
                        >
                            <Award size={20} /> Guide Dashboard
                        </button>
                    )}
                </div>
            </div>

            {/* Guide Request Modal */}
            {showGuideRequest && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '90%' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Become a Local Guide</h3>
                        <p style={{ color: '#6b7280', marginBottom: '20px' }}>Share your local knowledge and help travelers explore your area!</p>
                        <textarea
                            placeholder="Why do you want to be a guide? Tell us about your local expertise..."
                            value={guideReason}
                            onChange={(e) => setGuideReason(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', minHeight: '100px', marginBottom: '20px', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowGuideRequest(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>Cancel</button>
                            <button
                                onClick={handleGuideRequest}
                                disabled={requesting || !guideReason.trim()}
                                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: 'white', fontWeight: '600', cursor: 'pointer', opacity: requesting || !guideReason.trim() ? 0.6 : 1 }}
                            >
                                {requesting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gap: '24px' }}>
                {loading ? <p>Loading updates...</p> : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '16px' }}>
                        <p style={{ color: '#6b7280', fontSize: '18px' }}>No guide posts yet. Be the first to share!</p>
                    </div>
                ) : posts.map(post => (
>>>>>>> origin/Tashu
                    <div key={post._id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4b5563' }}>
                                    {post.guideName?.[0]}
                                </div>
                                <div>
<<<<<<< HEAD
                                    <h3 style={{ fontWeight: 'bold', margin: 0 }}>{post.guideName}</h3>
                                    <p style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(post.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {user?.email !== post.guideEmail && (
                                <button
                                    onClick={() => initBookGuide(post)}
                                    style={{ padding: '6px 16px', backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Book Guide
=======
                                    <h3 style={{ fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {post.guideName}
                                        {post.guideTrips >= 5 ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', backgroundColor: '#fef3c7', borderRadius: '12px', fontSize: '11px', fontWeight: '600', color: '#d97706' }} title={`Trusted Guide (${post.guideTrips} trips completed)`}>
                                                <Award size={14} color="#f59e0b" fill="#f59e0b" />
                                                Trusted
                                            </span>
                                        ) : (
                                            <Award size={16} color="#059669" title="Verified Guide" />
                                        )}
                                    </h3>
                                    <p style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {new Date(post.createdAt).toLocaleDateString()}
                                        {post.guideTrips > 0 && <span style={{ color: '#9ca3af' }}>• {post.guideTrips} trips</span>}
                                    </p>
                                </div>
                            </div>

                            {user && user.email !== post.guideEmail && (
                                <button
                                    onClick={() => initBookGuide(post)}
                                    style={{ padding: '8px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Book This Guide
>>>>>>> origin/Tashu
                                </button>
                            )}
                        </div>

                        <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', marginBottom: '20px' }}>
                            {post.content}
                        </p>

                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
<<<<<<< HEAD
=======
                            {/* Comments Section */}
>>>>>>> origin/Tashu
                            {post.comments?.length > 0 && (
                                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {post.comments.map((comment, idx) => (
                                        <div key={idx} style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '12px' }}>
                                            <p style={{ fontSize: '14px', margin: 0 }}>
                                                <span style={{ fontWeight: '600' }}>{comment.user}</span>: {comment.text}
                                            </p>
<<<<<<< HEAD
=======
                                            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{new Date(comment.date).toLocaleDateString()}</p>

                                            {/* Replies */}
                                            {comment.replies?.map((reply, rIdx) => (
                                                <div key={rIdx} style={{ marginLeft: '20px', marginTop: '8px', padding: '8px', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
                                                    <p style={{ fontSize: '13px', margin: 0 }}>
                                                        <span style={{ fontWeight: '600', color: '#059669' }}>{reply.user}</span>: {reply.text}
                                                    </p>
                                                </div>
                                            ))}

                                            {/* Reply Button */}
                                            {user && (
                                                <div style={{ marginTop: '8px' }}>
                                                    {showReplyFor === `${post._id}-${idx}` ? (
                                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                            <input
                                                                type="text"
                                                                placeholder="Write a reply..."
                                                                value={replyTexts[`${post._id}-${idx}`] || ''}
                                                                onChange={(e) => setReplyTexts(prev => ({ ...prev, [`${post._id}-${idx}`]: e.target.value }))}
                                                                style={{ flex: 1, padding: '8px 12px', borderRadius: '16px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '13px' }}
                                                            />
                                                            <button
                                                                onClick={() => handleReplySubmit(post._id, idx)}
                                                                style={{ padding: '8px', borderRadius: '50%', backgroundColor: '#059669', border: 'none', cursor: 'pointer', color: 'white' }}
                                                            >
                                                                <Send size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setShowReplyFor(`${post._id}-${idx}`)}
                                                            style={{ fontSize: '12px', color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                                                        >
                                                            Reply
                                                        </button>
                                                    )}
                                                </div>
                                            )}
>>>>>>> origin/Tashu
                                        </div>
                                    ))}
                                </div>
                            )}

<<<<<<< HEAD
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input
                                    type="text"
                                    placeholder="Ask a question..."
                                    value={commentTexts[post._id] || ''}
                                    onChange={(e) => setCommentTexts(prev => ({ ...prev, [post._id]: e.target.value }))}
                                    style={{ flex: 1, padding: '10px 16px', borderRadius: '24px', border: '1px solid #e5e7eb', outline: 'none' }}
                                />
                                <button
                                    onClick={() => handleCommentSubmit(post._id)}
                                    style={{ padding: '10px', borderRadius: '50%', backgroundColor: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#4b5563' }}
                                >
                                    <MessageCircle size={20} />
                                </button>
                            </div>
=======
                            {/* Add Comment */}
                            {user && (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input
                                        type="text"
                                        placeholder="Ask a question..."
                                        value={commentTexts[post._id] || ''}
                                        onChange={(e) => setCommentTexts(prev => ({ ...prev, [post._id]: e.target.value }))}
                                        style={{ flex: 1, padding: '10px 16px', borderRadius: '24px', border: '1px solid #e5e7eb', outline: 'none' }}
                                    />
                                    <button
                                        onClick={() => handleCommentSubmit(post._id)}
                                        style={{ padding: '10px', borderRadius: '50%', backgroundColor: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#4b5563' }}
                                    >
                                        <MessageCircle size={20} />
                                    </button>
                                </div>
                            )}
>>>>>>> origin/Tashu
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
