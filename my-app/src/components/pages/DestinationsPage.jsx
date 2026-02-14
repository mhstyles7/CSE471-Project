import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';

import { MapPin, ArrowRight, Clock, Star, Lock, Crown, Sparkles, Calendar, Users, DollarSign, X, Send } from 'lucide-react';
import PaymentModal from '../common/PaymentModal';
import { apiService } from '../../services/apiService';



export default function DestinationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Payment State
  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [bookingQuantity, setBookingQuantity] = useState(1);

  // Custom Booking State (Premium Only)
  const [isCustomModalOpen, setCustomModalOpen] = useState(false);
  const [customBookingPkg, setCustomBookingPkg] = useState(null);
  const [customForm, setCustomForm] = useState({
    preferredDates: '',
    numberOfTravelers: 1,
    specialRequests: '',
    budgetPreference: 'flexible'
  });
  const [submittingCustom, setSubmittingCustom] = useState(false);

  // Booking Modal State
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);


  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await apiService.get('/packages');
      setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const initBooking = (pkg) => {
    if (!user) {
      alert("Please login to book a package.");
      return;
    }
    setSelectedPackage(pkg);
    setBookingQuantity(1); // Reset quantity when opening
    setBookingModalOpen(true); // Show quantity selection modal first
  };

  const handleBookingConfirm = async () => {
    if (!selectedPackage) return;
    const totalAmount = selectedPackage.price * bookingQuantity;

    try {
      await apiService.post('/orders', {
        type: 'package_booking',
        packageId: selectedPackage._id,
        packageTitle: selectedPackage.title,
        agencyEmail: selectedPackage.agencyEmail,

        agencyName: selectedPackage.agencyName,
        travelerName: user.name,
        travelerEmail: user.email,
        customerName: user.name,
        quantity: bookingQuantity,
        amount: totalAmount,

        date: new Date().toISOString(),
        status: 'pending'
      });
      setPaymentOpen(false);
      setSelectedPackage(null);

      setBookingQuantity(1);
      alert(`Booking confirmed! Total: ৳${totalAmount} for ${bookingQuantity} person(s)`);

    } catch (error) {
      console.error('Error booking package:', error);
    }
  };

  const proceedToPayment = () => {
    setBookingModalOpen(false);
    setPaymentOpen(true);
  };

  const handleCustomBookingSubmit = async () => {
    if (!customBookingPkg || !customForm.preferredDates) return;
    setSubmittingCustom(true);
    try {
      await apiService.post('/orders', {
        type: 'custom_booking_request',
        packageId: customBookingPkg._id,
        packageTitle: customBookingPkg.title,
        agencyEmail: customBookingPkg.agencyEmail,
        customerName: user?.name,
        customerEmail: user?.email,
        ...customForm,
        status: 'pending_review'
      });
      alert('Custom booking request sent to the agency!');
      setCustomModalOpen(false);
      setCustomForm({ preferredDates: '', numberOfTravelers: 1, specialRequests: '', budgetPreference: 'flexible' });
    } catch (error) {
      console.error('Error submitting custom booking:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmittingCustom(false);
    }
  };

  const destinations = [
    {
      name: "Cox's Bazar",
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      description: 'Discover the beauty and culture of the world\'s longest natural sea beach',
      badge: 'Beach Paradise'
    },
    {
      name: 'Sundarbans',
      image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80',
      description: 'Explore the largest mangrove forest and UNESCO World Heritage Site',
      badge: 'Wildlife Haven'
    },
    {
      name: 'Sylhet',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
      description: 'Experience the serene beauty of rolling tea gardens and misty hills',
      badge: 'Tea Capital'
    },
    {
      name: 'Rangamati',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
      description: 'Discover scenic hills, lakes, and rich tribal culture',
      badge: 'Hill District'
    },
    {
      name: 'Sajek Valley',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      description: 'Witness breathtaking mountain peaks and cloud-covered valleys',
      badge: 'Mountain Peak'
    },
    {
      name: 'Saint Martin',
      image: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800&q=80',
      description: 'Relax on pristine coral island beaches with crystal clear waters',
      badge: 'Coral Island'
    }
  ];

  return (
    <div>

      {/* Quantity Selection Modal */}
      {isBookingModalOpen && selectedPackage && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div className="modal-content" style={{ backgroundColor: 'white', borderRadius: '24px', maxWidth: '450px', width: '100%', padding: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>Book Package</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>{selectedPackage.title}</p>

            <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>Price per person</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>৳{selectedPackage.price}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>Number of People</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setBookingQuantity(Math.max(1, bookingQuantity - 1))}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #e5e7eb', backgroundColor: 'white', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >−</button>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', minWidth: '40px', textAlign: 'center' }}>{bookingQuantity}</span>
                  <button
                    onClick={() => setBookingQuantity(bookingQuantity + 1)}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #059669', backgroundColor: '#f0fdf4', color: '#059669', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >+</button>
                </div>
              </div>

              <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>Total Amount</span>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#059669' }}>৳{selectedPackage.price * bookingQuantity}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setBookingModalOpen(false); setSelectedPackage(null); }}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer' }}
              >Cancel</button>
              <button
                onClick={proceedToPayment}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#059669', color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)' }}
              >Proceed to Payment</button>
            </div>
          </div>
        </div>
      )}


      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setPaymentOpen(false)}
        onConfirm={handleBookingConfirm}
        amount={selectedPackage ? `৳${selectedPackage.price * bookingQuantity}` : '৳0'}
        title={selectedPackage ? `${selectedPackage.title} (${bookingQuantity} person${bookingQuantity > 1 ? 's' : ''})` : ''}

      />

      <div style={{ marginBottom: '60px' }}>
        <h2 className="section-heading" style={{ fontSize: '42px', fontWeight: '800', color: '#1f2937', marginBottom: '12px', fontFamily: 'Poppins, sans-serif' }}>
          Popular Destinations
        </h2>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>
          Explore the most beautiful places across Bangladesh
        </p>
      </div>

      <div className="destinations-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px', marginBottom: '80px' }}>
        {destinations.map((dest, index) => (
          <div
            key={dest.name}
            onClick={() => navigate('destination-details', { id: dest.name })}

            style={{
              backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.05)',
              animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
          >
            <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
              <img src={dest.image} alt={dest.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
              <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#059669', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {dest.badge}
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{dest.name}</h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>{dest.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Available Packages Section */}
      <div style={{ padding: '60px 0', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2 className="section-heading" style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Available Travel Packages</h2>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>Curated experiences from our trusted agencies</p>
        </div>

        {loading ? <p style={{ textAlign: 'center' }}>Loading packages...</p> : (
          <div className="packages-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
            {packages.length === 0 ? <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No packages available at the moment.</p> : packages.map(pkg => (
              <div key={pkg._id} style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ padding: '6px 12px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    {pkg.agencyName || 'Agency'}
                  </span>
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>{pkg.title}</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#6b7280' }}>
                  <MapPin size={18} /> {pkg.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#6b7280' }}>
                  <Clock size={18} /> {pkg.duration}
                </div>

                <p style={{ flex: 1, color: '#4b5563', lineHeight: '1.6', marginBottom: '24px' }}>
                  {pkg.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #f3f4f6' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Price per person</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669' }}>৳{pkg.price}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <button
                      onClick={() => initBooking(pkg)}
                      style={{
                        padding: '12px 24px', backgroundColor: '#111827', color: 'white',
                        border: 'none', borderRadius: '12px', fontWeight: '600',
                        cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      Book Now
                    </button>
                    {user?.isPremium ? (
                      <button
                        onClick={() => { setCustomBookingPkg(pkg); setCustomModalOpen(true); }}
                        style={{
                          padding: '10px 20px', backgroundColor: '#fef3c7', color: '#d97706',
                          border: '1px solid #fcd34d', borderRadius: '12px', fontWeight: '600',
                          cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center'
                        }}
                      >
                        <Sparkles size={16} /> Customize
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('premium')}
                        style={{
                          padding: '10px 20px', backgroundColor: '#f3f4f6', color: '#9ca3af',
                          border: '1px solid #e5e7eb', borderRadius: '12px', fontWeight: '600',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center'
                        }}
                      >
                        <Lock size={14} /> Customize
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Custom Booking Modal (Premium Only) */}
      {isCustomModalOpen && customBookingPkg && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div className="modal-content" style={{ backgroundColor: 'white', borderRadius: '24px', maxWidth: '550px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '28px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Crown size={20} color="#f59e0b" />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#d97706', backgroundColor: '#fef3c7', padding: '4px 12px', borderRadius: '12px' }}>Premium Feature</span>
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>Customize Your Booking</h2>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>{customBookingPkg.title}</p>
                </div>
                <button onClick={() => setCustomModalOpen(false)} style={{ padding: '8px', borderRadius: '50%', border: 'none', backgroundColor: '#f3f4f6', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ padding: '28px' }}>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                    <Calendar size={16} color="#6b7280" /> Preferred Dates
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Dec 25-30, 2024 or Flexible"
                    value={customForm.preferredDates}
                    onChange={(e) => setCustomForm({ ...customForm, preferredDates: e.target.value })}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '15px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                    <Users size={16} color="#6b7280" /> Number of Travelers
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customForm.numberOfTravelers}
                    onChange={(e) => setCustomForm({ ...customForm, numberOfTravelers: e.target.value })}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '15px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                    <DollarSign size={16} color="#6b7280" /> Budget Preference
                  </label>
                  <select
                    value={customForm.budgetPreference}
                    onChange={(e) => setCustomForm({ ...customForm, budgetPreference: e.target.value })}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '15px', outline: 'none', backgroundColor: 'white' }}
                  >
                    <option value="flexible">Flexible</option>
                    <option value="budget">Budget-friendly</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium/Luxury</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block', color: '#374151' }}>Special Requests / Notes</label>
                  <textarea
                    placeholder="Any special requirements, dietary restrictions, accessibility needs, or specific activities you'd like to include..."
                    value={customForm.specialRequests}
                    onChange={(e) => setCustomForm({ ...customForm, specialRequests: e.target.value })}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '15px', outline: 'none', minHeight: '100px', resize: 'vertical' }}
                  />
                </div>
              </div>

              <button
                onClick={handleCustomBookingSubmit}
                disabled={submittingCustom || !customForm.preferredDates}
                style={{
                  width: '100%', marginTop: '28px', padding: '16px',
                  backgroundColor: submittingCustom || !customForm.preferredDates ? '#9ca3af' : '#059669',
                  color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '16px',
                  cursor: submittingCustom || !customForm.preferredDates ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                }}
              >
                <Send size={18} />
                {submittingCustom ? 'Sending Request...' : 'Send Custom Request to Agency'}
              </button>
            </div>
          </div>
        </div>
      )}


      <style>{`
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .dest-card:hover { 
          transform: translateY(-8px); 
          box-shadow: 0 20px 40px rgba(0,0,0,0.12); 
        }
        .dest-card:hover img { 
          transform: scale(1.1); 
        }
      `}</style>
    </div>
  );
}