import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
<<<<<<< HEAD
import { useNavigate } from '../../context/NavigationContext';
import { Mail, ArrowLeft, CheckCircle, Key } from 'lucide-react';
=======
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
>>>>>>> origin/Tashu

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
<<<<<<< HEAD
    const [resetToken, setResetToken] = useState('');
    const { forgotPassword, loading, error, setError } = useAuth();
    const navigate = useNavigate();
=======
    const { forgotPassword, loading, error } = useAuth();
>>>>>>> origin/Tashu

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
<<<<<<< HEAD
            const data = await forgotPassword(email);
            setResetToken(data.token || '');
=======
            await forgotPassword(email);
>>>>>>> origin/Tashu
            setSubmitted(true);
        } catch (err) {
            // Error is handled by context state
        }
    };

<<<<<<< HEAD
    // Clear error when user starts typing
    const handleInputChange = (e) => {
        if (error) setError(null);
        setEmail(e.target.value);
    };

=======
>>>>>>> origin/Tashu
    if (submitted) {
        return (
            <div style={{ maxWidth: '400px', margin: '40px auto', padding: '32px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#059669' }}>
                    <CheckCircle size={48} />
                </div>
<<<<<<< HEAD
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Reset Link Generated</h2>
                <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>
                    A password reset link has been generated for <strong>{email}</strong>.
                </p>

                {resetToken && (
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', color: '#059669' }}>
                            <Key size={20} />
                            <span style={{ fontWeight: '600' }}>Your Reset Token</span>
                        </div>
                        <code style={{
                            display: 'block',
                            backgroundColor: '#dcfce7',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            wordBreak: 'break-all',
                            color: '#166534'
                        }}>
                            {resetToken}
                        </code>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', marginBottom: '0' }}>
                            Copy this token and use it to reset your password
                        </p>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                        onClick={() => navigate('reset-password')}
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
                        Reset Password
                    </button>
                    <button
                        onClick={() => navigate('login')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
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
=======
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
>>>>>>> origin/Tashu
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '32px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
<<<<<<< HEAD
                <button
                    onClick={() => navigate('login')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#6b7280', textDecoration: 'none', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <ArrowLeft size={16} /> Back to Login
                </button>
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Reset Password</h2>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>Enter your email to receive a reset token</p>
=======
                <a href="#" onClick={(e) => { e.preventDefault(); window.location.href = '/login'; }} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>
                    <ArrowLeft size={16} /> Back to Login
                </a>
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Reset Password</h2>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>Enter your email to receive reset instructions</p>
>>>>>>> origin/Tashu

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
<<<<<<< HEAD
                        onChange={handleInputChange}
=======
                        onChange={(e) => setEmail(e.target.value)}
>>>>>>> origin/Tashu
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
<<<<<<< HEAD
                    {loading ? 'Generating Token...' : 'Get Reset Token'}
                </button>
            </form>

            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
                    Already have a reset token?{' '}
                    <button
                        onClick={() => navigate('reset-password')}
                        style={{ color: '#059669', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        Reset your password
                    </button>
                </p>
            </div>
        </div>
    );
}

=======
                    {loading ? 'Sending Link...' : 'Send Reset Link'}
                </button>
            </form>
        </div>
    );
}
>>>>>>> origin/Tashu
