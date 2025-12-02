import React, { useState } from 'react';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Simulate login
        if (onLogin) {
            onLogin({
                name: 'Demo User',
                email: email || 'demo@example.com',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
            });
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
            <h2>Login</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Sign In
                </button>
            </form>
        </div>
    );
}
