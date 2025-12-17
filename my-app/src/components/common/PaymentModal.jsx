import React, { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle, X } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, onConfirm, amount, title }) {
    const [method, setMethod] = useState(''); // 'card' or 'mobile'
    const [step, setStep] = useState('select'); // 'select', 'details', 'processing', 'success'
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handlePay = () => {
        setLoading(true);
        setStep('processing');
        setTimeout(() => {
            setLoading(false);
            setStep('success');
            setTimeout(() => {
                onConfirm(); // Trigger the actual booking logic
                // Close modal after short delay or let parent close it
            }, 1000);
        }, 2000);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '450px',
                padding: '32px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                animation: 'slideUp 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                        {step === 'success' ? 'Payment Successful' : 'Complete Payment'}
                    </h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#9ca3af" />
                    </button>
                </div>

                {/* Content based on Step */}
                {step === 'select' && (
                    <div>
                        <p style={{ color: '#6b7280', marginBottom: '24px' }}>Select a payment method for <strong>{title}</strong>.</p>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <button
                                onClick={() => { setMethod('card'); setStep('details'); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
                                    border: '1px solid #e5e7eb', borderRadius: '16px',
                                    backgroundColor: 'white', cursor: 'pointer', transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#059669'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                            >
                                <div style={{ padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '12px', color: '#059669' }}>
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 'bold', margin: 0, color: '#1f2937' }}>Credit / Debit Card</p>
                                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Visa, Mastercard, Amex</p>
                                </div>
                            </button>

                            <button
                                onClick={() => { setMethod('mobile'); setStep('details'); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
                                    border: '1px solid #e5e7eb', borderRadius: '16px',
                                    backgroundColor: 'white', cursor: 'pointer', transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d946ef'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                            >
                                <div style={{ padding: '12px', backgroundColor: '#fdf4ff', borderRadius: '12px', color: '#d946ef' }}>
                                    <Smartphone size={24} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 'bold', margin: 0, color: '#1f2937' }}>Mobile Banking</p>
                                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Bkash, Nagad, Rocket</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {step === 'details' && (
                    <div>
                        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Amount to Pay</p>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{amount}</p>
                        </div>

                        {method === 'card' ? (
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <input placeholder="Card Number" style={inputStyle} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <input placeholder="MM/YY" style={inputStyle} />
                                    <input placeholder="CVC" style={inputStyle} />
                                </div>
                                <input placeholder="Cardholder Name" style={inputStyle} />
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <input placeholder="Enter Bkash/Nagad Number" style={inputStyle} />
                                <input placeholder="PIN" type="password" style={inputStyle} />
                            </div>
                        )}

                        <button
                            onClick={handlePay}
                            style={{
                                width: '100%', padding: '16px', marginTop: '24px',
                                backgroundColor: '#059669', color: 'white', border: 'none',
                                borderRadius: '12px', fontWeight: 'bold',
                                cursor: 'pointer', fontSize: '16px'
                            }}
                        >
                            Pay Now
                        </button>
                        <button onClick={() => setStep('select')} style={{ width: '100%', marginTop: '12px', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                            Back
                        </button>
                    </div>
                )}

                {step === 'processing' && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{
                            width: '48px', height: '48px', border: '4px solid #e5e7eb',
                            borderTop: '4px solid #059669', borderRadius: '50%',
                            display: 'inline-block', animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{ marginTop: '16px', fontWeight: '600', color: '#374151' }}>Processing Transaction...</p>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {step === 'success' && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <CheckCircle size={64} color="#059669" style={{ margin: '0 auto', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Success!</h3>
                        <p style={{ color: '#6b7280' }}>Your booking has been confirmed.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const inputStyle = {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '16px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
};
