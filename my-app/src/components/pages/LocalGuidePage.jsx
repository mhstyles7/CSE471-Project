import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';
import { MessageCircle, Award } from 'lucide-react';
import PaymentModal from '../common/PaymentModal';

import { apiService } from '../../services/apiService';

export default function LocalGuidePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [commentTexts, setCommentTexts] = useState({});

    // Payment State
    const [isPaymentOpen, setPaymentOpen] = useState(false);
    const [selectedGuidePost, setSelectedGuidePost] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await apiService.get('/posts?type=update'); // Assuming 'update' type for guide posts
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCommentSubmit = async (postId) => {
        const text = commentTexts[postId];
        if (!text?.trim()) return;

        try {
            await apiService.post(`/posts/${postId}/comments`, {
                user: user?.name || 'Traveler',
                text: text
            });
            setCommentTexts(prev => ({ ...prev, [postId]: '' }));
            fetchPosts();
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const initBookGuide = (post) => {
        if (!user) {
            alert("Please login to book a guide.");
            return;
        }
        setSelectedGuidePost(post);
        setPaymentOpen(true);
    };

    const handleBookGuideConfirm = async () => {
        if (!selectedGuidePost) return;
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
                amount="$30" // Flat fee for contacting guide
                title={`Book Guide: ${selectedGuidePost?.guideName}`}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>Local Guides & Updates</h1>
                    <p style={{ color: '#6b7280' }}>Connect with locals and see what's happening around you.</p>
                </div>
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
                    <div key={post._id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4b5563' }}>
                                    {post.guideName?.[0]}
                                </div>
                                <div>
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
                                </button>
                            )}
                        </div>

                        <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', marginBottom: '20px' }}>
                            {post.content}
                        </p>

                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                            {post.comments?.length > 0 && (
                                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {post.comments.map((comment, idx) => (
                                        <div key={idx} style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '12px' }}>
                                            <p style={{ fontSize: '14px', margin: 0 }}>
                                                <span style={{ fontWeight: '600' }}>{comment.user}</span>: {comment.text}
                                            </p>
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
        </div>
    );
}
