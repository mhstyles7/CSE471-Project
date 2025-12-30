import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';
import { CreditCard, Check, Crown, Shield } from 'lucide-react';
import { apiService } from '../../services/apiService';

export default function PremiumPage() {
    const { user, refreshUser } = useAuth();
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

        try {
            if (selectedPlan === 'premium') {
                // Create a membership order - backend will upgrade user to premium
                await apiService.post('/orders', {
                    type: 'membership',
                    userId: user._id,
                    customerName: user.name,
                    customerEmail: user.email,
                    amount: 200,
                    status: 'completed'
                });

                // Refresh user data from server to get updated isPremium status
                await refreshUser();
                alert('Payment Successful! You are now a Premium Member.');

            } else if (selectedPlan === 'guide_booking') {
                // Guide booking handled separately on LocalGuidePage
                alert('Please use the Local Guides page to book a guide.');
            }
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setProcessing(false);
            setSelectedPlan(null);
        }
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
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: selectedPlan === 'premium' ? '0 10px 15px -3px rgba(5, 150, 105, 0.1)' : 'none'
                }} onClick={() => setSelectedPlan('premium')}>
                    {user?.isPremium && (

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
                    transition: 'all 0.2s'
                }} onClick={() => setSelectedPlan('guide_booking')}>
                    <Shield size={48} color="#3b82f6" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Book a Guide</h2>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
                        300tk <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#6b7280' }}>/ booking</span>

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
                        You are about to pay <strong>{selectedPlan === 'premium' ? '200tk' : '300tk'}</strong> via secure gateway.
                    </p>
                    <button
                        onClick={handlePayment}
                        disabled={processing || (selectedPlan === 'premium' && user?.isPremium)}

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
                            opacity: processing || (selectedPlan === 'premium' && user?.isPremium) ? 0.7 : 1

                        }}
                    >
                        {processing ? 'Processing...' : (
                            <>
                                <CreditCard size={20} /> Pay Now
                            </>
                        )}
                    </button>
                    {selectedPlan === 'premium' && user?.isPremium && (

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
