import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';
import { API_URL } from '../../config';
import {
    MapPin, Star, ArrowLeft, Edit2, Trash2, User, MessageSquare
} from 'lucide-react';

export default function DestinationDetailsPage({ id }) {
    const navigate = useNavigate();
    const { user } = useAuth();

    // State
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0, distribution: {} });
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [editingReview, setEditingReview] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);

    // Mock Destination Data (since we don't have a full destinations API yet)
    // In a real app, we'd fetch this from /api/destinations/:id
    const destinations = {
        "Cox's Bazar": {
            name: "Cox's Bazar",
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
            description: 'Cox\'s Bazar is a city, fishing port, tourism centre and district headquarters in southeastern Bangladesh. It is famous mostly for its long natural sandy beach, and it is infamous for the largest refugee camp in the world. It is located 150 km south of the divisional headquarter city of Chittagong.',
            location: 'Chittagong Division'
        },
        "Sundarbans": {
            name: "Sundarbans",
            image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1200&q=80',
            description: 'The Sundarbans is a mangrove area in the delta formed by the confluence of the Ganges, Brahmaputra and Meghna Rivers in the Bay of Bengal. It spans from the Hooghly River in India\'s state of West Bengal to the Baleswar River in Bangladesh.',
            location: 'Khulna Division'
        },
        "Sylhet": {
            name: "Sylhet",
            image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80',
            description: 'Sylhet is a metropolitan city in northeastern Bangladesh. It is the administrative seat of Sylhet Division. The city is located on the right bank of the Surma River in northeastern Bengal. It has a subtropical climate and lush highland terrain.',
            location: 'Sylhet Division'
        },
        "Rangamati": {
            name: "Rangamati",
            image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80',
            description: 'Rangamati is the administrative headquarters of Rangamati Hill District in the Chittagong Hill Tracts of Bangladesh. It is also the capital city of Chittagong Hill Tracts. The town is located at 22°38\'N 92°12\'E and has an altitude of 14 metres.',
            location: 'Chittagong Hill Tracts'
        },
        "Sajek Valley": {
            name: "Sajek Valley",
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
            description: 'Sajek Valley is an emerging tourist spot in Bangladesh situated among the hills of the Kasalong range of mountains in Sajek union, Baghaichhari Upazila in Rangamati District. The valley is 1,476 feet above sea level. Sajek valley is known as the Queen of Hills & Roof of Rangamati.',
            location: 'Rangamati District'
        },
        "Saint Martin": {
            name: "Saint Martin",
            image: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=1200&q=80',
            description: 'St. Martin\'s Island is a small island (area only 3 km2) in the northeastern part of the Bay of Bengal, about 9 km south of the tip of the Cox\'s Bazar-Teknaf peninsula, and forming the southernmost part of Bangladesh.',
            location: 'Bay of Bengal'
        }
    };

    const destination = destinations[id] || { name: id, image: 'https://via.placeholder.com/1200x400', description: 'Destination details coming soon.', location: 'Bangladesh' };

    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, [id]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/reviews?destinationId=${encodeURIComponent(id)}`);
            const data = await response.json();
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/reviews/stats?destinationId=${encodeURIComponent(id)}`);
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        console.log('Submitting review...', { user, id, newReview });
        if (!user) return alert('Please login to review');

        try {
            const response = await fetch(`${API_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    userName: user.name,
                    userAvatar: user.avatar,
                    destinationId: id,
                    destinationName: destination.name,
                    rating: newReview.rating,
                    comment: newReview.comment
                })
            });

            if (response.ok) {
                setNewReview({ rating: 5, comment: '' });
                setShowReviewForm(false);
                fetchReviews();
                fetchStats();
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            await fetch(`${API_URL}/api/reviews/${reviewId}?userId=${user._id}`, {
                method: 'DELETE'
            });
            fetchReviews();
            fetchStats();
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const handleUpdateReview = async (e) => {
        e.preventDefault();
        try {
            await fetch(`${API_URL}/api/reviews/${editingReview._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    rating: editingReview.rating,
                    comment: editingReview.comment
                })
            });
            setEditingReview(null);
            fetchReviews();
            fetchStats();
        } catch (error) {
            console.error('Error updating review:', error);
        }
    };

    return (
        <div style={{ paddingBottom: '80px' }}>
            {/* Hero Section */}
            <div style={{ position: 'relative', height: '400px', marginBottom: '40px' }}>
                <img src={destination.image} alt={destination.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}></div>
                <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '1200px', padding: '0 24px', color: 'white' }}>
                    <button onClick={() => navigate('destinations')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', border: 'none', padding: '8px 16px', borderRadius: '8px', color: 'white', cursor: 'pointer', marginBottom: '20px', backdropFilter: 'blur(4px)' }}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>{destination.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', opacity: 0.9 }}>
                        <MapPin size={20} /> {destination.location}
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
                {/* Main Content */}
                <div>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>About {destination.name}</h2>
                        <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#4b5563' }}>{destination.description}</p>
                    </div>

                    {/* Reviews Section */}
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Reviews ({stats.totalReviews})</h2>
                            <button
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                style={{ padding: '10px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Edit2 size={16} /> Write a Review
                            </button>
                        </div>

                        {/* Review Form */}
                        {showReviewForm && (
                            <form onSubmit={handleSubmitReview} style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '12px', marginBottom: '32px', border: '1px solid #e5e7eb' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Share your experience</h3>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Rating</label>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star
                                                key={star}
                                                size={24}
                                                fill={star <= newReview.rating ? '#fbbf24' : 'none'}
                                                color={star <= newReview.rating ? '#fbbf24' : '#d1d5db'}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Your Review</label>
                                    <textarea
                                        value={newReview.comment}
                                        onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                        placeholder="Tell us about your trip..."
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', minHeight: '100px', fontSize: '14px' }}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Post Review</button>
                                    <button type="button" onClick={() => setShowReviewForm(false)} style={{ padding: '10px 24px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </form>
                        )}

                        {/* Reviews List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {loading ? <p>Loading reviews...</p> : reviews.length > 0 ? (
                                reviews.map(review => (
                                    <div key={review._id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '24px' }}>
                                        {editingReview && editingReview._id === review._id ? (
                                            <form onSubmit={handleUpdateReview}>
                                                <div style={{ marginBottom: '12px' }}>
                                                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star
                                                                key={star}
                                                                size={20}
                                                                fill={star <= editingReview.rating ? '#fbbf24' : 'none'}
                                                                color={star <= editingReview.rating ? '#fbbf24' : '#d1d5db'}
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => setEditingReview({ ...editingReview, rating: star })}
                                                            />
                                                        ))}
                                                    </div>
                                                    <textarea
                                                        value={editingReview.comment}
                                                        onChange={e => setEditingReview({ ...editingReview, comment: e.target.value })}
                                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', minHeight: '80px' }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button type="submit" style={{ padding: '6px 12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>Save</button>
                                                    <button type="button" onClick={() => setEditingReview(null)} style={{ padding: '6px 12px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                                                </div>
                                            </form>
                                        ) : (
                                            <>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e5e7eb', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {review.userAvatar ? (
                                                                <img src={review.userAvatar} alt={review.userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <User size={20} color="#9ca3af" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '600', color: '#1f2937' }}>{review.userName}</div>
                                                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    {user && user._id === review.userId && (
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button onClick={() => setEditingReview(review)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><Edit2 size={16} /></button>
                                                            <button onClick={() => handleDeleteReview(review._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < review.rating ? '#fbbf24' : 'none'} color={i < review.rating ? '#fbbf24' : '#d1d5db'} />
                                                    ))}
                                                </div>
                                                <p style={{ color: '#4b5563', lineHeight: '1.6' }}>{review.comment}</p>
                                            </>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                    <MessageSquare size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                    <p>No reviews yet. Be the first to share your experience!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', position: 'sticky', top: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>Rating Overview</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937' }}>{stats.averageRating}</div>
                            <div>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={20} fill={i < Math.round(stats.averageRating) ? '#fbbf24' : 'none'} color={i < Math.round(stats.averageRating) ? '#fbbf24' : '#d1d5db'} />
                                    ))}
                                </div>
                                <div style={{ fontSize: '14px', color: '#6b7280' }}>Based on {stats.totalReviews} reviews</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[5, 4, 3, 2, 1].map(star => (
                                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                                    <div style={{ width: '12px', fontWeight: '600', color: '#4b5563' }}>{star}</div>
                                    <Star size={12} fill="#fbbf24" color="#fbbf24" />
                                    <div style={{ flex: 1, height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${stats.totalReviews ? (stats.distribution?.[star] / stats.totalReviews) * 100 : 0}%`,
                                            height: '100%',
                                            backgroundColor: '#fbbf24'
                                        }}></div>
                                    </div>
                                    <div style={{ width: '24px', textAlign: 'right', color: '#9ca3af' }}>{stats.distribution?.[star] || 0}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
