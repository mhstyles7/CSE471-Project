import React from 'react';

export default function DashboardPage({ user }) {
    return (
        <div style={{ padding: '40px' }}>
            <h1>User Dashboard</h1>
            <p>Welcome back, {user?.name || 'Traveler'}! (Points: {user?.points ?? 0})</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
                    <h3>Recent Activity</h3>
                    <p>Check out your latest trips.</p>
                </div>
                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
                    <h3>Saved Places</h3>
                    <p>0 places saved.</p>
                </div>
                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
                    <h3>Upcoming Trips</h3>
                    <p>No trips planned.</p>
                </div>
                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: '#fffbeb' }}>
                    <h3 style={{ color: '#f59e0b' }}>Travel Points</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{user?.points ?? 0}</p>
                    <p>Keep exploring to earn more!</p>
                </div>
            </div>
        </div>
    );
}
