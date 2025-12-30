import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import {
    MapPin, Calendar, Award, Users, Bookmark, Clock,
    TrendingUp, Globe, Star, Plus, Trash2, ChevronRight,
    Plane, Camera, Heart
} from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddTrip, setShowAddTrip] = useState(false);
    const [showAddPlace, setShowAddPlace] = useState(false);
    const [newTrip, setNewTrip] = useState({ destination: '', startDate: '', endDate: '', notes: '', category: 'leisure' });
    const [newPlace, setNewPlace] = useState({ name: '', location: '', category: 'attraction', notes: '' });

    useEffect(() => {
        if (user?._id) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/dashboard/${user._id}`);
            const data = await response.json();
            setDashboardData(data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTrip = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/dashboard/${user._id}/travel-history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTrip)
            });
            if (response.ok) {
                setNewTrip({ destination: '', startDate: '', endDate: '', notes: '', category: 'leisure' });
                setShowAddTrip(false);
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Error adding trip:', error);
        }
    };

    const deleteTrip = async (tripId) => {
        try {
            await fetch(`${API_URL}/api/dashboard/${user._id}/travel-history/${tripId}`, {
                method: 'DELETE'
            });
            fetchDashboardData();
        } catch (error) {
            console.error('Error deleting trip:', error);
        }
    };

    const addPlace = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/dashboard/${user._id}/saved-places`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPlace)
            });
            if (response.ok) {
                setNewPlace({ name: '', location: '', category: 'attraction', notes: '' });
                setShowAddPlace(false);
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Error adding place:', error);
        }
    };

    const deletePlace = async (placeId) => {
        try {
            await fetch(`${API_URL}/api/dashboard/${user._id}/saved-places/${placeId}`, {
                method: 'DELETE'
            });
            fetchDashboardData();
        } catch (error) {
            console.error('Error deleting place:', error);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div style={{ textAlign: 'center', color: '#6b7280' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>✈️</div>
                    Loading your dashboard...
                </div>
            </div>
        );
    }

    const { stats, travelHistory, savedPlaces, activities } = dashboardData || {};

    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const getCategoryIcon = (category) => {
        const icons = {
            leisure: '🏖️', business: '💼', adventure: '🏔️', cultural: '🏛️', family: '👨‍👩‍👧‍👦'
        };
        return icons[category] || '✈️';
    };

    const getActivityIcon = (type) => {
        const icons = {
            trip_completed: <Plane size={16} />,
            place_saved: <Bookmark size={16} />,
            review_posted: <Star size={16} />,
            photo_uploaded: <Camera size={16} />
        };
        return icons[type] || <Clock size={16} />;
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                    Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}! 👋
                </h1>
                <p style={{ color: '#6b7280', fontSize: '16px' }}>
                    Here's an overview of your travel journey
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <StatCard icon={<Plane size={24} />} label="Total Trips" value={stats?.totalTrips || 0} color="#059669" bg="#ecfdf5" />
                <StatCard icon={<Globe size={24} />} label="Destinations" value={stats?.destinationsVisited || 0} color="#0d9488" bg="#f0fdfa" />
                <StatCard icon={<Bookmark size={24} />} label="Saved Places" value={stats?.totalSavedPlaces || 0} color="#8b5cf6" bg="#f5f3ff" />
                <StatCard icon={<Award size={24} />} label="Travel Points" value={stats?.travelPoints || 0} color="#f59e0b" bg="#fffbeb" />
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px' }}>
                {['overview', 'travel-history', 'saved-places', 'activities'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px 8px 0 0',
                            border: 'none',
                            backgroundColor: activeTab === tab ? '#059669' : 'transparent',
                            color: activeTab === tab ? 'white' : '#6b7280',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab.replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    {/* Recent Trips */}
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>Recent Trips</h3>
                            <button onClick={() => setActiveTab('travel-history')} style={{ color: '#059669', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                View all <ChevronRight size={16} />
                            </button>
                        </div>
                        {travelHistory?.length > 0 ? (
                            travelHistory.slice(0, 3).map(trip => (
                                <div key={trip._id} style={{ display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '8px', marginBottom: '8px', backgroundColor: '#f9fafb' }}>
                                    <span style={{ fontSize: '24px', marginRight: '12px' }}>{getCategoryIcon(trip.category)}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', color: '#1f2937' }}>{trip.destination}</div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>No trips yet. Start exploring!</p>
                        )}
                    </div>

                    {/* Quick Actions & Recent Activity */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Quick Actions */}
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Quick Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <QuickAction icon={<Plus size={18} />} label="Log New Trip" onClick={() => { setActiveTab('travel-history'); setShowAddTrip(true); }} />
                                <QuickAction icon={<Bookmark size={18} />} label="Save a Place" onClick={() => { setActiveTab('saved-places'); setShowAddPlace(true); }} />
                                <QuickAction icon={<MapPin size={18} />} label="Plan Next Trip" onClick={() => { }} />
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Recent Activity</h3>
                            {activities?.length > 0 ? (
                                activities.slice(0, 4).map(activity => (
                                    <div key={activity._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                                        <div style={{ color: '#059669' }}>{getActivityIcon(activity.type)}</div>
                                        <div style={{ flex: 1, fontSize: '13px', color: '#374151' }}>{activity.description}</div>
                                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{formatDate(activity.createdAt)}</div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#9ca3af', fontSize: '14px' }}>No recent activity</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'travel-history' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>Travel History</h3>
                        <button onClick={() => setShowAddTrip(!showAddTrip)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                            <Plus size={18} /> Add Trip
                        </button>
                    </div>

                    {showAddTrip && (
                        <form onSubmit={addTrip} style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <input type="text" placeholder="Destination" value={newTrip.destination} onChange={e => setNewTrip({ ...newTrip, destination: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
                                <select value={newTrip.category} onChange={e => setNewTrip({ ...newTrip, category: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px' }}>
                                    <option value="leisure">🏖️ Leisure</option>
                                    <option value="business">💼 Business</option>
                                    <option value="adventure">🏔️ Adventure</option>
                                    <option value="cultural">🏛️ Cultural</option>
                                    <option value="family">👨‍👩‍👧‍👦 Family</option>
                                </select>
                                <input type="date" placeholder="Start Date" value={newTrip.startDate} onChange={e => setNewTrip({ ...newTrip, startDate: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
                                <input type="date" placeholder="End Date" value={newTrip.endDate} onChange={e => setNewTrip({ ...newTrip, endDate: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
                            </div>
                            <textarea placeholder="Notes (optional)" value={newTrip.notes} onChange={e => setNewTrip({ ...newTrip, notes: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', resize: 'vertical', minHeight: '60px', marginBottom: '16px' }} />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Save Trip</button>
                                <button type="button" onClick={() => setShowAddTrip(false)} style={{ padding: '10px 24px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                            </div>
                        </form>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {travelHistory?.length > 0 ? (
                            travelHistory.map(trip => (
                                <div key={trip._id} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                                    <span style={{ fontSize: '32px', marginRight: '16px' }}>{getCategoryIcon(trip.category)}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', fontSize: '16px', color: '#1f2937' }}>{trip.destination}</div>
                                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                                            <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                        </div>
                                        {trip.notes && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{trip.notes}</div>}
                                    </div>
                                    <button onClick={() => deleteTrip(trip._id)} style={{ padding: '8px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                <Plane size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                <p>No trips logged yet. Add your first trip above!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'saved-places' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>Saved Places</h3>
                        <button onClick={() => setShowAddPlace(!showAddPlace)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                            <Plus size={18} /> Save Place
                        </button>
                    </div>

                    {showAddPlace && (
                        <form onSubmit={addPlace} style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <input type="text" placeholder="Place Name" value={newPlace.name} onChange={e => setNewPlace({ ...newPlace, name: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
                                <input type="text" placeholder="Location" value={newPlace.location} onChange={e => setNewPlace({ ...newPlace, location: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
                                <select value={newPlace.category} onChange={e => setNewPlace({ ...newPlace, category: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px' }}>
                                    <option value="attraction">🏛️ Attraction</option>
                                    <option value="restaurant">🍽️ Restaurant</option>
                                    <option value="hotel">🏨 Hotel</option>
                                    <option value="nature">🌲 Nature</option>
                                    <option value="shopping">🛍️ Shopping</option>
                                </select>
                                <input type="text" placeholder="Notes (optional)" value={newPlace.notes} onChange={e => setNewPlace({ ...newPlace, notes: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                                <button type="button" onClick={() => setShowAddPlace(false)} style={{ padding: '10px 24px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                            </div>
                        </form>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {savedPlaces?.length > 0 ? (
                            savedPlaces.map(place => (
                                <div key={place._id} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '16px', color: '#1f2937' }}>{place.name}</div>
                                            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                                                <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                                {place.location}
                                            </div>
                                            <div style={{ marginTop: '8px', padding: '4px 10px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '12px', fontSize: '11px', display: 'inline-block' }}>
                                                {place.category}
                                            </div>
                                        </div>
                                        <button onClick={() => deletePlace(place._id)} style={{ padding: '6px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                <Bookmark size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                <p>No saved places yet. Save your dream destinations!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'activities' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>Activity History</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activities?.length > 0 ? (
                            activities.map(activity => (
                                <div key={activity._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', backgroundColor: '#f9fafb' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '500', color: '#1f2937' }}>{activity.description}</div>
                                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{formatDate(activity.createdAt)}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                <Clock size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                <p>No activity yet. Start exploring to build your history!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper Components
function StatCard({ icon, label, value, color, bg }) {
    return (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>{value}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>{label}</div>

            </div>
        </div>
    );
}

function QuickAction({ icon, label, onClick }) {
    return (
        <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                {icon}
            </div>
            <span style={{ fontWeight: '500', color: '#374151' }}>{label}</span>
        </button>
    );
}

