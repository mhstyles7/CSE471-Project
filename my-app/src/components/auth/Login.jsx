import React, { useState } from 'react';
<<<<<<< HEAD
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';
import { Mail, Lock } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, googleLogin, loading, error, setError } = useAuth();
    const navigate = useNavigate();
=======
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';
import { Mail, Lock, Facebook, Chrome } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, socialLogin, loading, error } = useAuth();
>>>>>>> origin/Tashu

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
<<<<<<< HEAD
            await login(email, password);
            navigate('home');
=======
            const userData = await login(email, password);
            // Redirect based on user role
            if (userData.role === 'admin') {
                navigate('dashboard');
            } else if (userData.role === 'agency') {
                navigate('agency');
            } else if (userData.guideStatus === 'approved') {
                navigate('local-guides');
            } else {
                navigate('home');
            }
>>>>>>> origin/Tashu
        } catch (err) {
            // Error is handled by context state
        }
    };

<<<<<<< HEAD
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            // Decode the JWT token from Google
            const decoded = jwtDecode(credentialResponse.credential);

            // Call our backend with the Google user data
            await googleLogin({
                email: decoded.email,
                name: decoded.name,
                googleId: decoded.sub,
                avatar: decoded.picture
            });

            navigate('home');
        } catch (err) {
            console.error('Google login failed:', err);
            setError('Google login failed. Please try again.');
        }
    };

    const handleGoogleError = () => {
        setError('Google login failed. Please try again.');
    };

    // Clear error when user starts typing
    const handleInputChange = (setter) => (e) => {
        if (error) setError(null);
        setter(e.target.value);
    };

=======
    const handleSocialLogin = async (provider) => {
        try {
            await socialLogin(provider);
        } catch (err) {
            console.error(err);
        }
    };

>>>>>>> origin/Tashu
    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '32px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Welcome Back</h2>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>Sign in to continue your journey</p>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                    <Mail size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
<<<<<<< HEAD
                        onChange={handleInputChange(setEmail)}
=======
                        onChange={(e) => setEmail(e.target.value)}
>>>>>>> origin/Tashu
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
<<<<<<< HEAD
                        onChange={handleInputChange(setPassword)}
=======
                        onChange={(e) => setPassword(e.target.value)}
>>>>>>> origin/Tashu
                        style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
                        required
                    />
                </div>

                <div style={{ textAlign: 'right' }}>
<<<<<<< HEAD
                    <button
                        type="button"
                        onClick={() => navigate('forgot-password')}
                        style={{ color: '#059669', fontSize: '14px', textDecoration: 'none', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        Forgot Password?
                    </button>
=======
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('forgot-password'); }} style={{ color: '#059669', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
                        Forgot Password?
                    </a>
>>>>>>> origin/Tashu
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
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <div style={{ margin: '32px 0', position: 'relative' }}>
                <div style={{ borderBottom: '1px solid #e5e7eb' }}></div>
                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '0 12px', color: '#6b7280', fontSize: '14px' }}>
                    Or continue with
                </span>
            </div>

<<<<<<< HEAD
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    text="continue_with"
                    shape="rectangular"
                    width="350"
                />
=======
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
>>>>>>> origin/Tashu
            </div>

            <p style={{ marginTop: '32px', color: '#6b7280', fontSize: '14px' }}>
                Don't have an account?{' '}
<<<<<<< HEAD
                <button
                    onClick={() => navigate('register')}
                    style={{ color: '#059669', textDecoration: 'none', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    Sign up
                </button>
=======
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('register'); }} style={{ color: '#059669', textDecoration: 'none', fontWeight: '600' }}>
                    Sign up
                </a>
>>>>>>> origin/Tashu
            </p>
        </div>
    );
}
<<<<<<< HEAD


=======
>>>>>>> origin/Tashu
