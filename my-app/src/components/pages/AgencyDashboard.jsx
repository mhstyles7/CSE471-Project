import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, ShoppingBag, PlusCircle, Calendar, MapPin, DollarSign, Users } from 'lucide-react';

import { apiService } from '../../services/apiService';

export default function AgencyDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('packages');
    const [packages, setPackages] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [newPackage, setNewPackage] = useState({ title: '', price: '', duration: '', location: '', description: '' });
    const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '', description: '', sponsor: user?.name });

    useEffect(() => {
        if (activeTab === 'packages') fetchPackages();
        if (activeTab === 'orders') fetchOrders();
    }, [activeTab]);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const data = await apiService.get(`/packages?agencyEmail=${user.email}`);
            setPackages(data);
        } catch (error) {
            console.error('Error fetching packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await apiService.get(`/orders?agencyEmail=${user.email}`);
            setOrders(data);
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
            setNewPackage({ title: '', price: '', duration: '', location: '', description: '' });
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
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    if (user?.role !== 'agency' && user?.role !== 'admin') {
        return <div style={{ padding: '40px', textAlign: 'center' }}><h2>Access Denied. Agency Account Required.</h2></div>;
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>Agency Dashboard</h1>
                <span style={{ marginLeft: 'auto', padding: '8px 16px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontSize: '14px', fontWeight: '600' }}>
                    {user?.name}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <button onClick={() => setActiveTab('packages')} style={tabStyle(activeTab === 'packages')}>
                    <Package size={20} /> Packages & Engagements
                </button>
                <button onClick={() => setActiveTab('orders')} style={tabStyle(activeTab === 'orders')}>
                    <ShoppingBag size={20} /> Order Management
                </button>
                <button onClick={() => setActiveTab('create-package')} style={tabStyle(activeTab === 'create-package')}>
                    <PlusCircle size={20} /> Create New Package
                </button>
                <button onClick={() => setActiveTab('create-event')} style={tabStyle(activeTab === 'create-event')}>
                    <Calendar size={20} /> Create Sponsored Event
                </button>
            </div>

            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minHeight: '500px' }}>
                {activeTab === 'packages' && (
                    <div>
                        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Your Packages</h2>
                        {loading ? <p>Loading...</p> : (
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {packages.length === 0 ? <p>No packages created yet.</p> : packages.map(pkg => (
                                    <div key={pkg._id} style={{ border: '1px solid #e5e7eb', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <h3 style={{ fontWeight: 'bold', fontSize: '18px' }}>{pkg.title}</h3>
                                            <p style={{ color: '#6b7280' }}>{pkg.location} • {pkg.duration}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: 'bold', fontSize: '18px', color: '#059669' }}>${pkg.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div>
                        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Order Management</h2>
                        {loading ? <p>Loading...</p> : (
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {orders.length === 0 ? <p>No orders received yet.</p> : orders.map(order => (
                                    <div key={order._id} style={{ border: '1px solid #e5e7eb', padding: '16px', borderRadius: '12px' }}>
                                        <p><strong>Order ID:</strong> {order._id}</p>
                                        <p><strong>Customer:</strong> {order.customerName}</p>
                                        <p><strong>Status:</strong> <span style={{ padding: '4px 8px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '4px' }}>{order.status || 'Pending'}</span></p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'create-package' && (
                    <form onSubmit={handleCreatePackage} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Create New Travel Package</h2>
                        <input type="text" placeholder="Package Title" value={newPackage.title} onChange={e => setNewPackage({ ...newPackage, title: e.target.value })} style={inputStyle} required />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <input type="number" placeholder="Price ($)" value={newPackage.price} onChange={e => setNewPackage({ ...newPackage, price: e.target.value })} style={inputStyle} required />
                            <input type="text" placeholder="Duration (e.g. 3 Days)" value={newPackage.duration} onChange={e => setNewPackage({ ...newPackage, duration: e.target.value })} style={inputStyle} required />
                        </div>
                        <input type="text" placeholder="Location" value={newPackage.location} onChange={e => setNewPackage({ ...newPackage, location: e.target.value })} style={inputStyle} required />
                        <textarea placeholder="Description" value={newPackage.description} onChange={e => setNewPackage({ ...newPackage, description: e.target.value })} style={{ ...inputStyle, minHeight: '120px' }} required />
                        <button type="submit" style={buttonStyle}>Publish Package</button>
                    </form>
                )}

                {activeTab === 'create-event' && (
                    <form onSubmit={handleCreateEvent} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Create Sponsored Event</h2>
                        <input type="text" placeholder="Event Title" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} style={inputStyle} required />
                        <input type="date" placeholder="Date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} style={inputStyle} required />
                        <input type="text" placeholder="Location" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} style={inputStyle} required />
                        <textarea placeholder="Event Details" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} style={{ ...inputStyle, minHeight: '120px' }} required />
                        <button type="submit" style={buttonStyle}>Publish Event</button>
                    </form>
                )}
            </div>
        </div>
    );
}

const tabStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: isActive ? '#059669' : 'white',
    color: isActive ? 'white' : '#4b5563',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
    boxShadow: isActive ? '0 4px 6px rgba(5, 150, 105, 0.2)' : 'none'
});

const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '16px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
};

const buttonStyle = {
    padding: '12px 24px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px'
};
