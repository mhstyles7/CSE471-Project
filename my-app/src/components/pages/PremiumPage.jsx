import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';
import { CreditCard, Check, Crown, Shield, Award } from 'lucide-react';
import { API_URL } from '../../config';

export default function PremiumPage() {
    const { user, updateProfile, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handlePayment = async () => {
        if (!selectedPlan) return;
        if (!user) {
            alert('Please login first');
            navigate('login');
            return;
        }

        setProcessing(true);

        // Simulated payment delay
        setTimeout(async () => {
            try {
                if (selectedPlan === 'premium') {
                    // First update in backend
                    const backendRes = await fetch(`${API_URL}/api/users/${user._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isPremium: true, freeGuideBookingUsed: false })
                    });

                    if (backendRes.ok) {
                        // Backend updated successfully, now update local state
                        await updateProfile({ isPremium: true, freeGuideBookingUsed: false });
                    } else {
                        // Backend failed, still update local for now
                        await updateProfile({ isPremium: true, freeGuideBookingUsed: false });
                    }

                    // Check for pending guide booking
                    const pendingBooking = localStorage.getItem('pendingGuideBooking');
                    if (pendingBooking) {
                        const guideInfo = JSON.parse(pendingBooking);

                        // Create the booking automatically
                        await fetch(`${API_URL}/api/bookings`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'guide_booking',
                                guideName: guideInfo.guideName,
                                guideEmail: guideInfo.guideEmail,
                                travelerName: user.name,
                                travelerEmail: user.email,
                                postId: guideInfo.postId,
                                amount: 0, // Free first booking for premium
                                status: 'paid'
                            })
                        });

                        // Mark free booking as used
                        await updateProfile({ freeGuideBookingUsed: true });

                        // Clear pending booking
                        localStorage.removeItem('pendingGuideBooking');

                        alert('🎉 Payment Successful! You are now a Premium Member.\n\n✅ Your guide booking has been automatically completed!\n✅ Guide: ' + guideInfo.guideName);
                        navigate('local-guides');
                    } else {
                        alert('🎉 Payment Successful! You are now a Premium Member.\n\n✅ Your first guide booking is FREE!\n✅ Zero platform commission on bookings\n✅ Access to "Cook with Local" experiences');
                        navigate('home');
                    }
                } else if (selectedPlan === 'guide_booking') {
                    // Check for pending guide booking
                    const pendingBooking = localStorage.getItem('pendingGuideBooking');
                    const isFreeBooking = user.isPremium && !user.freeGuideBookingUsed;

                    if (pendingBooking) {
                        const guideInfo = JSON.parse(pendingBooking);

                        // Create the booking automatically
                        await fetch(`${API_URL}/api/bookings`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'guide_booking',
                                guideName: guideInfo.guideName,
                                guideEmail: guideInfo.guideEmail,
                                travelerName: user.name,
                                travelerEmail: user.email,
                                postId: guideInfo.postId,
                                amount: isFreeBooking ? 0 : 400,
                                status: 'paid'
                            })
                        });

                        // Mark free booking as used if applicable
                        if (isFreeBooking) {
                            await updateProfile({ freeGuideBookingUsed: true });
                        }

                        // Clear pending booking
                        localStorage.removeItem('pendingGuideBooking');

                        alert('🎉 Payment Successful! Guide booked!\n\n✅ Guide: ' + guideInfo.guideName + (isFreeBooking ? '\n✅ This was your FREE premium booking!' : ''));
                        navigate('local-guides');
                    } else if (isFreeBooking) {
                        await updateProfile({ freeGuideBookingUsed: true });
                        alert('🎉 Free Guide Booking Activated!\n\nAs a premium member, your first guide booking is FREE. Go to Local Guides to book a guide!');
                        navigate('local-guides');
                    } else {
                        // Regular guide booking payment - redirect to local guides
                        alert('🎉 Payment Successful! Guide booking credit added.\n\nGo to Local Guides to book a guide.');
                        navigate('local-guides');
                    }
                }
            } catch (error) {
                console.error('Payment failed:', error);
                alert('Payment failed. Please try again.');
            } finally {
                setProcessing(false);
                setSelectedPlan(null);
            }
        }, 1500);
    };

    // Calculate prices
    const guidePrice = user?.isPremium && !user?.freeGuideBookingUsed ? 'FREE' : '400tk';
    const premiumAlreadyActive = user?.isPremium;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937' }}>Upgrade Your Experience</h1>
                <p style={{ color: '#6b7280', marginTop: '10px' }}>Unlock exclusive benefits and verified guides.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                {/* Premium Membership Card */}
                <div style={{
                    border: '2px solid',
                    borderColor: selectedPlan === 'premium' ? '#059669' : '#e5e7eb',
                    borderRadius: '16px',
                    padding: '32px',
                    backgroundColor: 'white',
                    position: 'relative',
                    cursor: premiumAlreadyActive ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: selectedPlan === 'premium' ? '0 10px 15px -3px rgba(5, 150, 105, 0.1)' : 'none',
                    opacity: premiumAlreadyActive ? 0.8 : 1
                }} onClick={() => !premiumAlreadyActive && setSelectedPlan('premium')}>
                    {premiumAlreadyActive && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#059669', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={16} /> Active
                        </div>
                    )}
                    <Crown size={48} color="#059669" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Premium Member</h2>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
                        200tk <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#6b7280' }}>/ lifetime</span>
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}><Check size={18} color="#059669" /> First guide booking FREE</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}><Check size={18} color="#059669" /> Zero platform commission</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}><Check size={18} color="#059669" /> "Cook with Local" access</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}><Check size={18} color="#059669" /> Custom agency requests</li>
                    </ul>
                </div>

                {/* Guide Booking Card */}
                <div style={{
                    border: '2px solid',
                    borderColor: selectedPlan === 'guide_booking' ? '#3b82f6' : '#e5e7eb',
                    borderRadius: '16px',
                    padding: '32px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: selectedPlan === 'guide_booking' ? '0 10px 15px -3px rgba(59, 130, 246, 0.1)' : 'none'
                }} onClick={() => setSelectedPlan('guide_booking')}>
                    {user?.isPremium && !user?.freeGuideBookingUsed && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#f59e0b', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Award size={16} /> FREE for you!
                        </div>
                    )}
                    <Shield size={48} color="#3b82f6" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Book a Guide</h2>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
                        {guidePrice} <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#6b7280' }}>/ booking</span>
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}><Check size={18} color="#3b82f6" /> Verified local guide</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}><Check size={18} color="#3b82f6" /> Full day assistance</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}><Check size={18} color="#3b82f6" /> Secure payment</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}><Check size={18} color="#3b82f6" /> Local insider tips</li>
                    </ul>
                </div>
            </div>

            {/* Payment Action */}
            {selectedPlan && (
                <div style={{ backgroundColor: '#f9fafb', padding: '32px', borderRadius: '16px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Confirm Payment</h3>
                    <p style={{ marginBottom: '24px', color: '#4b5563' }}>
                        You are about to pay <strong>
                            {selectedPlan === 'premium' ? '200tk' :
                                (user?.isPremium && !user?.freeGuideBookingUsed) ? '0tk (FREE!)' : '400tk'}
                        </strong> via secure gateway.
                    </p>
                    <button
                        onClick={handlePayment}
                        disabled={processing || (selectedPlan === 'premium' && premiumAlreadyActive)}
                        style={{
                            padding: '14px 40px',
                            backgroundColor: '#1f2937',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '18px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            opacity: processing || (selectedPlan === 'premium' && premiumAlreadyActive) ? 0.7 : 1
                        }}
                    >
                        {processing ? 'Processing...' : (
                            <>
                                <CreditCard size={20} /> Pay Now
                            </>
                        )}
                    </button>
                    {selectedPlan === 'premium' && premiumAlreadyActive && (
                        <p style={{ color: '#d97706', marginTop: '12px', fontSize: '14px' }}>You are already a Premium Member.</p>
                    )}
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
