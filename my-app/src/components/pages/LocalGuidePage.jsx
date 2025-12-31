import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, usePageParams } from '../../context/NavigationContext';
import { MessageCircle, Award, Send, UserPlus, X, ChefHat } from 'lucide-react';
import PaymentModal from '../common/PaymentModal';

import { apiService } from '../../services/apiService';
import { API_URL } from '../../config';

export default function LocalGuidePage() {
    const { user, updateProfile } = useAuth();

    const navigate = useNavigate();
    const pageParams = usePageParams();
    const isCookMode = pageParams?.cookMode === true;

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [commentTexts, setCommentTexts] = useState({});

    const [replyTexts, setReplyTexts] = useState({});
    const [showReplyFor, setShowReplyFor] = useState(null);


    // Payment State
    const [isPaymentOpen, setPaymentOpen] = useState(false);
    const [selectedGuidePost, setSelectedGuidePost] = useState(null);
    const [bookingType, setBookingType] = useState('guide_booking'); // 'guide_booking' or 'cook_with_local'


    // Guide Request State
    const [showGuideRequest, setShowGuideRequest] = useState(false);
    const [guideReason, setGuideReason] = useState('');
    const [guideNID, setGuideNID] = useState('');
    const [requesting, setRequesting] = useState(false);


    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await apiService.get('/guide/posts');

            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCommentSubmit = async (postId) => {
        const text = commentTexts[postId];

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

            });
            setCommentTexts(prev => ({ ...prev, [postId]: '' }));
            fetchPosts();
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const handleReplySubmit = async (postId, commentIndex) => {
        const replyKey = `${postId}-${commentIndex}`;
        const text = replyTexts[replyKey];

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
            setReplyTexts(prev => ({ ...prev, [replyKey]: '' }));
            setShowReplyFor(null);
            fetchPosts();
        } catch (error) {
            console.error('Error posting reply:', error);
        }
    };

    const initBookGuide = (post, type = 'guide_booking') => {
        if (!user) {
            alert("Please login to book a guide.");
            return;
        }

        // Guides cannot book themselves
        if (user.email === post.guideEmail) {
            alert("You cannot book yourself as a guide.");
            return;
        }

        setSelectedGuidePost(post);
        setBookingType(type);
        setPaymentOpen(true);
    };

    const handleBookGuideConfirm = async () => {
        if (!selectedGuidePost) return;


        // Premium users get first guide booking free
        const isFreeBooking = user?.isPremium && !user?.freeGuideBookingUsed;
        const bookingAmount = isFreeBooking ? 0 : 400;

        try {
            await fetch(`${API_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: bookingType,
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
            const typeLabel = bookingType === 'cook_with_local' ? 'Cook with Local experience' : 'Guide';
            alert(`${typeLabel} booked successfully!` + (isFreeBooking ? ' Your free premium booking has been used.' : ''));

        } catch (error) {
            console.error('Error booking guide:', error);
        }
    };

    // Strict Guide Check
    const isGuide = user?.role === 'admin' || user?.guideStatus === 'approved';


    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setPaymentOpen(false)}
                onConfirm={handleBookGuideConfirm}
                amount={user?.isPremium && !user?.freeGuideBookingUsed ? 'FREE' : '400tk'}
                title={isCookMode ? `Cook with Local: ${selectedGuidePost?.guideName}` : `Book Guide: ${selectedGuidePost?.guideName}`}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>

                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>Local Guides & Updates</h1>
                    <p style={{ color: '#6b7280' }}>Connect with locals and see what's happening around you.</p>
                </div>
                {/* Become Guide Button - for travelers who aren't guides */}
                {user && !isGuide && user.guideStatus !== 'pending' && (
                    <button
                        onClick={() => setShowGuideRequest(true)}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#7c3aed',
                            color: 'white',
                            border: 'none',
                            borderRadius: '24px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 6px rgba(124, 58, 237, 0.2)'
                        }}
                    >
                        <UserPlus size={20} /> Become Guide
                    </button>
                )}

                {/* Pending Status Badge */}
                {user && user.guideStatus === 'pending' && (
                    <span style={{
                        padding: '10px 20px',
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '24px',
                        fontWeight: '600',
                        fontSize: '14px'
                    }}>
                        ⏳ Guide Request Pending
                    </span>
                )}
            </div>

            {/* Cook with Local Banner */}
            {isCookMode && (
                <div style={{
                    backgroundColor: '#fff7ed',
                    border: '2px solid #ea580c',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <ChefHat size={32} color="#ea580c" />
                    <div>
                        <h3 style={{ margin: 0, color: '#ea580c', fontWeight: 'bold' }}>Cook with a Local Experience</h3>
                        <p style={{ margin: '4px 0 0', color: '#9a3412', fontSize: '14px' }}>
                            Select a local guide below to book your authentic cooking experience!
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('local-guides')}
                        style={{
                            marginLeft: 'auto',
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            border: '1px solid #ea580c',
                            borderRadius: '8px',
                            color: '#ea580c',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gap: '24px' }}>
                {loading ? <p>Loading updates...</p> : posts.map(post => (

                    <div key={post._id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4b5563' }}>
                                    {post.guideName?.[0]}
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {post.guideName}
                                        {post.guideTrips > 5 && (
                                            <Award size={16} color="#fbbf24" fill="#fbbf24" title="Trusted Guide" />
                                        )}
                                    </h3>
                                    <p style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(post.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {user?.email !== post.guideEmail && (
                                <button
                                    onClick={() => initBookGuide(post, isCookMode ? 'cook_with_local' : 'guide_booking')}
                                    style={{
                                        padding: '6px 16px',
                                        backgroundColor: isCookMode ? '#fff7ed' : '#e0f2fe',
                                        color: isCookMode ? '#ea580c' : '#0369a1',
                                        border: isCookMode ? '1px solid #ea580c' : 'none',
                                        borderRadius: '16px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {isCookMode && <ChefHat size={14} />}
                                    {isCookMode ? 'Book Cooking' : 'Book Guide'}
                                </button>
                            )}
                        </div>

                        <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', marginBottom: '20px' }}>
                            {post.content}
                        </p>

                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>

                            {/* Comments Section */}

                            {post.comments?.length > 0 && (
                                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {post.comments.map((comment, idx) => (
                                        <div key={idx} style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '12px' }}>
                                            <p style={{ fontSize: '14px', margin: 0 }}>
                                                <span style={{ fontWeight: '600' }}>{comment.user}</span>: {comment.text}
                                            </p>

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

                                        </div>
                                    ))}
                                </div>
                            )}

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

                        </div>
                    </div>
                ))}
            </div>

            {/* Become Guide Request Modal */}
            {showGuideRequest && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '24px',
                        maxWidth: '500px', width: '100%', padding: '32px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Become a Local Guide</h3>
                            <button onClick={() => setShowGuideRequest(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                                <X size={24} color="#9ca3af" />
                            </button>
                        </div>

                        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                            Share your local knowledge and earn by helping travelers explore your area!
                        </p>

                        <input
                            type="text"
                            placeholder="National ID (NID) Number *"
                            value={guideNID}
                            onChange={(e) => setGuideNID(e.target.value)}
                            style={{
                                width: '100%', padding: '14px 16px',
                                borderRadius: '12px', border: '1px solid #e5e7eb',
                                fontSize: '14px', boxSizing: 'border-box',
                                marginBottom: '16px'
                            }}
                        />

                        <textarea
                            placeholder="Tell us why you'd like to become a guide and what makes you qualified (your local expertise, languages spoken, specialties, etc.)"
                            value={guideReason}
                            onChange={(e) => setGuideReason(e.target.value)}
                            style={{
                                width: '100%', minHeight: '120px', padding: '16px',
                                borderRadius: '12px', border: '1px solid #e5e7eb',
                                fontSize: '14px', resize: 'vertical', boxSizing: 'border-box',
                                fontFamily: 'inherit'
                            }}
                        />

                        <button
                            onClick={async () => {
                                if (!guideNID.trim()) {
                                    alert('Please provide your National ID number.');
                                    return;
                                }
                                if (!guideReason.trim()) {
                                    alert('Please provide a reason for your application.');
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
                                            nid: guideNID,
                                            reason: guideReason
                                        })
                                    });
                                    const data = await res.json();
                                    if (res.ok) {
                                        alert('Your guide request has been submitted! An admin will review it soon.');
                                        setShowGuideRequest(false);
                                        setGuideReason('');
                                        setGuideNID('');
                                        await updateProfile({ guideStatus: 'pending' });
                                    } else {
                                        alert(data.message || 'Failed to submit request');
                                    }
                                } catch (error) {
                                    console.error('Error:', error);
                                    alert('Failed to submit request');
                                } finally {
                                    setRequesting(false);
                                }
                            }}
                            disabled={requesting}
                            style={{
                                width: '100%', padding: '16px', marginTop: '20px',
                                backgroundColor: requesting ? '#9ca3af' : '#7c3aed',
                                color: 'white', border: 'none', borderRadius: '12px',
                                fontWeight: 'bold', fontSize: '16px', cursor: requesting ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {requesting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
