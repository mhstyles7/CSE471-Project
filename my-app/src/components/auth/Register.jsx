import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Facebook, Chrome } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('traveler');
    const { register, socialLogin, loading, error } = useAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password, role);
        } catch (err) {
            // Error is handled by context state
        }
    };

    const handleSocialLogin = async (provider) => {
        try {
            await socialLogin(provider);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '32px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Create Account</h2>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>Join our community of travelers</p>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                    <User size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
                        required
                    />
                </div>
                <div style={{ position: 'relative' }}>
                    <Mail size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
                        required
                    />
                </div>
                <div style={{ position: 'relative' }}>
                    <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
                        required
                    />
                </div>
                <div style={{ position: 'relative' }}>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px', outline: 'none', backgroundColor: 'white' }}
                    >
                        <option value="traveler">Traveler</option>
                        <option value="agency">Travel Agent</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '12px',
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        opacity: loading ? 0.7 : 1,
                        transition: 'background-color 0.2s'
                    }}
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            <div style={{ margin: '32px 0', position: 'relative' }}>
                <div style={{ borderBottom: '1px solid #e5e7eb' }}></div>
                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '0 12px', color: '#6b7280', fontSize: '14px' }}>
                    Or sign up with
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <button
                    type="button"
                    onClick={() => handleSocialLogin('Google')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        color: '#374151',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                    }}
                >
                    <Chrome size={20} />
                    Google
                </button>
                <button
                    type="button"
                    onClick={() => handleSocialLogin('Facebook')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        color: '#374151',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                    }}
                >
                    <Facebook size={20} color="#1877F2" />
                    Facebook
                </button>
            </div>

            <p style={{ marginTop: '32px', color: '#6b7280', fontSize: '14px' }}>
                Already have an account?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); window.location.href = '/login'; }} style={{ color: '#059669', textDecoration: 'none', fontWeight: '600' }}>
                    Sign in
                </a>
            </p>
        </div>
    );
}
