import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import {
    MapPin, Calendar, Clock, DollarSign, Heart,
    ChevronDown, ChevronUp, Search, Filter
} from 'lucide-react';

export default function TripPlannerPage() {
    const { user } = useAuth();
    const [plans, setPlans] = useState([]);
    const [savedPlans, setSavedPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [destination, setDestination] = useState('');
    const [style, setStyle] = useState('');
    const [expandedPlan, setExpandedPlan] = useState(null);

    const fetchPlans = useCallback(async () => {
        try {
            setLoading(true);
            let url = `${API_URL}/api/trip-plans`;
            const params = new URLSearchParams();
            if (destination) params.append('destination', destination);
            if (style) params.append('style', style);

            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url);
            const data = await response.json();
            setPlans(data);
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    }, [destination, style]);

    const fetchSavedPlans = useCallback(async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_URL}/api/trip-plans/saved/${user._id}`);
            const data = await response.json();
            setSavedPlans(data.map(item => item.planId));
        } catch (error) {
            console.error('Error fetching saved plans:', error);
        }
    }, [user]);

    useEffect(() => {
        fetchPlans();
        if (user) fetchSavedPlans();
    }, [fetchPlans, fetchSavedPlans, user]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPlans();
    };

    const toggleSavePlan = async (planId) => {
        if (!user) {
            alert('Please login to save plans');
            return;
        }

        const isSaved = savedPlans.includes(planId);

        try {
            if (isSaved) {
                await fetch(`${API_URL}/api/trip-plans/unsave/${user._id}/${planId}`, { method: 'DELETE' });
                setSavedPlans(prev => prev.filter(id => id !== planId));
            } else {
                await fetch(`${API_URL}/api/trip-plans/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user._id, planId })
                });
                setSavedPlans(prev => [...prev, planId]);
            }
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    const getStyleColor = (style) => {
        const colors = {
            budget: '#10b981',
            adventure: '#f59e0b',
            cultural: '#8b5cf6',
            leisure: '#3b82f6',
            luxury: '#ec4899'
        };
        return colors[style.toLowerCase()] || '#6b7280';
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
                    Pre-Planned Trip Suggestions
                </h1>
                <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
                    Discover ready-made 1-day itineraries tailored to your travel style.
                </p>
            </div>

            {/* Search & Filter */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <MapPin size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Where do you want to go?"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px' }}
                    />
                </div>

                <div style={{ position: 'relative', width: '200px' }}>
                    <Filter size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px', appearance: 'none', backgroundColor: 'white' }}
                    >
                        <option value="">All Styles</option>
                        <option value="cultural">🏛️ Cultural</option>
                        <option value="adventure">🏔️ Adventure</option>
                        <option value="leisure">🏖️ Leisure</option>
                        <option value="budget">💰 Budget</option>
                    </select>
                </div>

                <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={20} /> Find Plans
                </button>
            </form>

            {/* Results Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading trip plans...</div>
            ) : plans.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
                    {plans.map(plan => (
                        <div key={plan._id} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', transition: 'transform 0.2s' }}>
                            <div style={{ position: 'relative', height: '200px' }}>
                                <img src={plan.image} alt={plan.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} onClick={() => toggleSavePlan(plan._id)}>
                                    <Heart size={20} fill={savedPlans.includes(plan._id) ? '#ef4444' : 'none'} color={savedPlans.includes(plan._id) ? '#ef4444' : '#6b7280'} />
                                </div>
                                <div style={{ position: 'absolute', bottom: '16px', left: '16px', backgroundColor: getStyleColor(plan.style), color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                                    {plan.style}
                                </div>
                            </div>

                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{plan.title}</h3>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', color: '#6b7280', fontSize: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={16} /> {plan.destinationName}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={16} /> {plan.duration}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <DollarSign size={16} /> {plan.cost} Cost
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Highlights:</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {plan.highlights.map((highlight, index) => (
                                            <span key={index} style={{ backgroundColor: '#f3f4f6', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#4b5563' }}>
                                                {highlight}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setExpandedPlan(expandedPlan === plan._id ? null : plan._id)}
                                    style={{ width: '100%', padding: '12px', backgroundColor: expandedPlan === plan._id ? '#f3f4f6' : 'white', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#374151', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    {expandedPlan === plan._id ? 'Hide Itinerary' : 'View Full Itinerary'}
                                    {expandedPlan === plan._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>

                                {expandedPlan === plan._id && (
                                    <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                                        {plan.timeline.map((item, index) => (
                                            <div key={index} style={{ display: 'flex', gap: '16px', marginBottom: '20px', position: 'relative' }}>
                                                <div style={{ width: '80px', flexShrink: 0, fontSize: '13px', fontWeight: '600', color: '#059669', paddingTop: '2px' }}>
                                                    {item.time}
                                                </div>

                                                {/* Timeline line */}
                                                {index !== plan.timeline.length - 1 && (
                                                    <div style={{ position: 'absolute', left: '87px', top: '24px', bottom: '-24px', width: '2px', backgroundColor: '#e5e7eb' }}></div>
                                                )}

                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{item.activity}</div>
                                                    <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>{item.description}</div>
                                                </div>
                                            </div>
                                        ))}

                                        <button style={{ width: '100%', padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '12px' }}>
                                            Use This Plan
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
                    <Search size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>No plans found</h3>
                    <p style={{ color: '#6b7280' }}>Try adjusting your search filters or destination.</p>
                </div>
            )}

        </div>
    );
}
