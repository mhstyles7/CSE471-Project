import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const { forgotPassword, loading, error } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await forgotPassword(email);
            setSubmitted(true);
        } catch (err) {
            // Error is handled by context state
        }
    };

    if (submitted) {
        return (
            <div style={{ maxWidth: '400px', margin: '40px auto', padding: '32px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#059669' }}>
                    <CheckCircle size={48} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Check your email</h2>
                <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>
                    We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                </p>
                <button
                    onClick={() => window.location.href = '/login'}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}
                >
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '32px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); window.location.href = '/login'; }} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>
                    <ArrowLeft size={16} /> Back to Login
                </a>
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Reset Password</h2>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>Enter your email to receive reset instructions</p>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    {loading ? 'Sending Link...' : 'Send Reset Link'}
                </button>
            </form>
        </div>
    );
}
