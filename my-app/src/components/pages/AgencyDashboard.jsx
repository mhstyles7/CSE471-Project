import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, ShoppingBag, PlusCircle, Calendar, MapPin, DollarSign, Users, TrendingUp, Edit, Trash2, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { apiService } from '../../services/apiService';

export default function AgencyDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview'); // overview, packages, orders, create-package, create-event
    const [packages, setPackages] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [newPackage, setNewPackage] = useState({ title: '', price: '', duration: '', location: '', description: '', image: '' });
    const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '', description: '', sponsor: user?.name });

    // Calculate dynamic stats from real data
    const calculateStats = () => {
        // Total Revenue from confirmed orders only
        const totalRevenue = orders
            .filter(o => o.status === 'Confirmed' || o.status === 'accepted')
            .reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0);

        // Active bookings (pending + confirmed)
        const activeBookings = orders.filter(o =>
            o.status === 'Pending' || o.status === 'pending' ||
            o.status === 'Confirmed' || o.status === 'accepted'
        ).length;

        return [
            { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, icon: <DollarSign size={24} />, color: '#059669', bg: '#ecfdf5' },
            { label: 'Active Bookings', value: activeBookings.toString(), icon: <ShoppingBag size={24} />, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Total Packages', value: packages.length.toString(), icon: <Package size={24} />, color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Total Orders', value: orders.length.toString(), icon: <TrendingUp size={24} />, color: '#8b5cf6', bg: '#f5f3ff' }
        ];
    };

    const stats = calculateStats();

    useEffect(() => {
        // Always fetch data on mount for overview stats
        fetchPackages();
        fetchOrders();
    }, []);

    useEffect(() => {
        if (activeTab === 'packages') fetchPackages();
        if (activeTab === 'orders') fetchOrders();
    }, [activeTab]);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            // Mock data if API fails or is empty
            const data = await apiService.get(`/packages?agencyEmail=${user.email}`).catch(() => []);
            if (data.length === 0) {
                setPackages([
                    { _id: 1, title: 'Sylhet Tea Garden Tour', price: 150, duration: '3 Days', location: 'Sylhet', description: 'Experience the green beauty.', status: 'Active' },
                    { _id: 2, title: 'Cox\'s Bazar Beach Retreat', price: 200, duration: '4 Days', location: 'Cox\'s Bazar', description: 'Relax at the world\'s longest beach.', status: 'Active' }
                ]);
            } else {
                setPackages(data);
            }
        } catch (error) {
            console.error('Error fetching packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Fetch regular orders
            const ordersData = await apiService.get(`/orders?agencyEmail=${user.email}`).catch(() => []);

            // Fetch custom bookings (premium user requests)
            const customBookingsData = await apiService.get(`/custom-bookings/agency/${user.email}`).catch(() => []);

            // Transform custom bookings to match order format
            const transformedCustomBookings = customBookingsData.map(cb => ({
                _id: cb._id,
                customerName: cb.travelerName,
                package: cb.packageTitle,
                amount: cb.proposedPrice || 'Custom',
                status: cb.status === 'pending' ? 'Pending' : cb.status === 'accepted' ? 'Confirmed' : cb.status,
                date: cb.createdAt,
                type: 'custom',
                travelerEmail: cb.travelerEmail,
                preferredDates: cb.preferredDates,
                numberOfTravelers: cb.numberOfTravelers,
                specialRequests: cb.specialRequests,
                budgetPreference: cb.budgetPreference
            }));

            // Merge both lists
            const allOrders = [...ordersData, ...transformedCustomBookings];

            if (allOrders.length === 0) {
                setOrders([
                    { _id: 'ORD-001', customerName: 'Rahim Ahmed', package: 'Sylhet Tea Garden Tour', amount: 150, status: 'Pending', date: '2024-12-05' },
                    { _id: 'ORD-002', customerName: 'Fatima Begum', package: 'Cox\'s Bazar Retreat', amount: 200, status: 'Confirmed', date: '2024-12-04' }
                ]);
            } else {
                setOrders(allOrders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePackage = async (e) => {
        e.preventDefault();
        try {
            await apiService.post('/packages', { ...newPackage, agencyEmail: user.email, agencyName: user.name });
            alert('Package created successfully!');
            setNewPackage({ title: '', price: '', duration: '', location: '', description: '', image: '' });
            setActiveTab('packages');
            fetchPackages();
        } catch (error) {
            console.error('Error creating package:', error);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await apiService.post('/events', { ...newEvent, agencyEmail: user.email });
            alert('Sponsored Event created successfully!');
            setNewEvent({ title: '', date: '', location: '', description: '', sponsor: user?.name });
            setActiveTab('overview');
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus, orderType) => {
        try {
            // Map UI status to backend status
            const backendStatus = newStatus === 'Confirmed' ? 'accepted' : newStatus === 'Cancelled' ? 'rejected' : newStatus.toLowerCase();

            // Use correct endpoint based on order type
            const endpoint = orderType === 'custom'
                ? `/custom-bookings/${orderId}`
                : `/orders/${orderId}`;

            // Update in backend (this triggers the email notification)
            await apiService.put(endpoint, { status: backendStatus });

            // Update local state
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));

            if (newStatus === 'Confirmed') {
                alert('✅ Order confirmed! Confirmation email sent to the customer.');
            }

            // Refresh orders to get updated data
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
        }
    };

    const handleDeletePackage = (pkgId) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            setPackages(prev => prev.filter(p => p._id !== pkgId));
        }
    };

    if (user?.role !== 'agency' && user?.role !== 'admin') {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
                <Users size={64} style={{ marginBottom: '20px' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Access Denied</h2>
                <p>This dashboard is restricted to registered Travel Agencies.</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1f2937', fontFamily: 'Poppins, sans-serif' }}>Agency Dashboard</h1>
                    <p style={{ color: '#6b7280' }}>Manage your travel packages, bookings, and events</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', padding: '8px 16px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                        {user?.name?.charAt(0)}
                    </div>
                    <div>
                        <p style={{ fontWeight: '700', fontSize: '14px', margin: 0 }}>{user?.name}</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Verified Agency</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px' }}>
                {[
                    { id: 'overview', label: 'Overview', icon: TrendingUp },
                    { id: 'packages', label: 'My Packages', icon: Package },
                    { id: 'orders', label: 'Orders', icon: ShoppingBag },
                    { id: 'create-package', label: 'New Package', icon: PlusCircle },
                    { id: 'create-event', label: 'New Event', icon: Calendar }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 20px',
                            backgroundColor: activeTab === tab.id ? '#059669' : 'white',
                            color: activeTab === tab.id ? 'white' : '#4b5563',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === tab.id ? '0 4px 12px rgba(5, 150, 105, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                            {stats.map((stat, index) => (
                                <div key={index} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ padding: '16px', borderRadius: '50%', backgroundColor: stat.bg, color: stat.color }}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{stat.label}</p>
                                        <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#1f2937', margin: 0 }}>{stat.value}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Recent Orders</h3>
                                {orders.slice(0, 3).map(order => (
                                    <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
                                        <div>
                                            <p style={{ fontWeight: '600', margin: 0 }}>{order.customerName}</p>
                                            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{order.package}</p>
                                        </div>
                                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: order.status === 'Confirmed' ? '#d1fae5' : '#fef3c7', color: order.status === 'Confirmed' ? '#059669' : '#d97706' }}>
                                            {order.status}
                                        </span>
                                    </div>
                                ))}
                                <button onClick={() => setActiveTab('orders')} style={{ marginTop: '16px', color: '#059669', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>View All Orders →</button>
                            </div>

                            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Top Performing Packages</h3>
                                {packages.slice(0, 3).map(pkg => (
                                    <div key={pkg._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={20} color="#9ca3af" /></div>
                                            <div>
                                                <p style={{ fontWeight: '600', margin: 0 }}>{pkg.title}</p>
                                                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{pkg.location}</p>
                                            </div>
                                        </div>
                                        <p style={{ fontWeight: '700', color: '#1f2937' }}>${pkg.price}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* PACKAGES TAB */}
                {activeTab === 'packages' && (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {packages.map(pkg => (
                            <div key={pkg._id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Package size={32} color="#9ca3af" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>{pkg.title}</h3>
                                        <div style={{ display: 'flex', gap: '16px', color: '#6b7280', fontSize: '14px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {pkg.location}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {pkg.duration}</span>
                                        </div>
                                        <p style={{ fontSize: '14px', color: '#4b5563', marginTop: '8px', maxWidth: '500px' }}>{pkg.description}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                                    <span style={{ fontSize: '24px', fontWeight: '800', color: '#059669' }}>${pkg.price}</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button onClick={() => handleDeletePackage(pkg._id)} style={{ padding: '8px 16px', border: '1px solid #fee2e2', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <tr>
                                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>Order ID</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>Customer</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>Package</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>Date</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>Amount</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>Status</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '16px', fontWeight: '600' }}>{order._id}</td>
                                        <td style={{ padding: '16px' }}>{order.customerName}</td>
                                        <td style={{ padding: '16px' }}>{order.package}</td>
                                        <td style={{ padding: '16px', color: '#6b7280' }}>{order.date}</td>
                                        <td style={{ padding: '16px', fontWeight: '600' }}>${order.amount}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                                                backgroundColor: order.status === 'Confirmed' ? '#d1fae5' : order.status === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                                                color: order.status === 'Confirmed' ? '#059669' : order.status === 'Cancelled' ? '#dc2626' : '#d97706'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => handleUpdateStatus(order._id, 'Confirmed', order.type)} title="Confirm" style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: '#d1fae5', color: '#059669', cursor: 'pointer' }}><CheckCircle size={18} /></button>
                                                <button onClick={() => handleUpdateStatus(order._id, 'Cancelled', order.type)} title="Cancel" style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', cursor: 'pointer' }}><XCircle size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* CREATE PACKAGE TAB */}
                {activeTab === 'create-package' && (
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>Create New Travel Package</h2>
                        <form onSubmit={handleCreatePackage} style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <label style={{ fontWeight: '600', color: '#374151' }}>Package Title</label>
                                <input type="text" placeholder="e.g. 3-Day Sundarbans Adventure" value={newPackage.title} onChange={e => setNewPackage({ ...newPackage, title: e.target.value })} style={inputStyle} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    <label style={{ fontWeight: '600', color: '#374151' }}>Price ($)</label>
                                    <input type="number" placeholder="0.00" value={newPackage.price} onChange={e => setNewPackage({ ...newPackage, price: e.target.value })} style={inputStyle} required />
                                </div>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    <label style={{ fontWeight: '600', color: '#374151' }}>Duration</label>
                                    <input type="text" placeholder="e.g. 3 Days, 2 Nights" value={newPackage.duration} onChange={e => setNewPackage({ ...newPackage, duration: e.target.value })} style={inputStyle} required />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <label style={{ fontWeight: '600', color: '#374151' }}>Location</label>
                                <input type="text" placeholder="e.g. Khulna, Bangladesh" value={newPackage.location} onChange={e => setNewPackage({ ...newPackage, location: e.target.value })} style={inputStyle} required />
                            </div>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <label style={{ fontWeight: '600', color: '#374151' }}>Description</label>
                                <textarea placeholder="Describe the package details, itinerary, and inclusions..." value={newPackage.description} onChange={e => setNewPackage({ ...newPackage, description: e.target.value })} style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }} required />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                                <button type="button" onClick={() => setActiveTab('packages')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#f3f4f6', color: '#4b5563', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)' }}>Publish Package</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* CREATE EVENT TAB */}
                {activeTab === 'create-event' && (
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>Create Sponsored Event</h2>
                        <form onSubmit={handleCreateEvent} style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <label style={{ fontWeight: '600', color: '#374151' }}>Event Title</label>
                                <input type="text" placeholder="e.g. Annual Travel Meetup 2024" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} style={inputStyle} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    <label style={{ fontWeight: '600', color: '#374151' }}>Date</label>
                                    <input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} style={inputStyle} required />
                                </div>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    <label style={{ fontWeight: '600', color: '#374151' }}>Location</label>
                                    <input type="text" placeholder="e.g. Dhaka, Bangladesh" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} style={inputStyle} required />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <label style={{ fontWeight: '600', color: '#374151' }}>Event Details</label>
                                <textarea placeholder="Describe the event, agenda, and special guests..." value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }} required />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                                <button type="button" onClick={() => setActiveTab('overview')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#f3f4f6', color: '#4b5563', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)' }}>Publish Event</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

const inputStyle = {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    fontSize: '15px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    backgroundColor: '#f9fafb'
};
