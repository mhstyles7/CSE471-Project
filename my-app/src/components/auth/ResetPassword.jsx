import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';
import { Lock, Key, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState(false);
    const { resetPassword, loading, error, setError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            await resetPassword(token, newPassword);
            setSuccess(true);
        } catch (err) {
            // Error is handled by context state
        }
    };

    // Clear error when user starts typing
    const handleInputChange = (setter) => (e) => {
        if (error) setError(null);
        setter(e.target.value);
    };

    if (success) {
        return (
            <div style={{ maxWidth: '400px', margin: '40px auto', padding: '32px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#059669' }}>
                    <CheckCircle size={48} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Password Reset Successful!</h2>
                <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>
                    Your password has been reset successfully. You can now login with your new password.
                </p>
                <button
                    onClick={() => navigate('login')}
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
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '32px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <button
                    onClick={() => navigate('forgot-password')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#6b7280', textDecoration: 'none', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <ArrowLeft size={16} /> Back to Forgot Password
                </button>
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Reset Your Password</h2>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>Enter your reset token and new password</p>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                    <Key size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Reset Token"
                        value={token}
                        onChange={handleInputChange(setToken)}
                        style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
                        required
                    />
                </div>
                <div style={{ position: 'relative' }}>
                    <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="password"
                        placeholder="New Password (min 6 characters)"
                        value={newPassword}
                        onChange={handleInputChange(setNewPassword)}
                        minLength={6}
                        style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
                        required
                    />
                </div>
                <div style={{ position: 'relative' }}>
                    <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={handleInputChange(setConfirmPassword)}
                        minLength={6}
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
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
            </form>

            <p style={{ marginTop: '32px', color: '#6b7280', fontSize: '14px' }}>
                Remember your password?{' '}
                <button
                    onClick={() => navigate('login')}
                    style={{ color: '#059669', textDecoration: 'none', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    Sign in
                </button>
            </p>
        </div>
    );
}
