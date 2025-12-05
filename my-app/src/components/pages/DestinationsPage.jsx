import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, ArrowRight, Clock, Star } from 'lucide-react';
import PaymentModal from '../common/PaymentModal';
import { apiService } from '../../services/apiService';

export default function DestinationsPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Payment State
  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

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
    setPaymentOpen(true);
  };

  const handleBookingConfirm = async () => {
    if (!selectedPackage) return;
    try {
      await apiService.post('/orders', {
        type: 'package_booking',
        packageId: selectedPackage._id,
        packageTitle: selectedPackage.title,
        agencyEmail: selectedPackage.agencyEmail,
        travelerName: user.name,
        travelerEmail: user.email,
        customerName: user.name,
        amount: selectedPackage.price,
        date: new Date().toISOString(),
        status: 'pending'
      });
      setPaymentOpen(false);
      setSelectedPackage(null);
      alert('Booking confirmed!');
    } catch (error) {
      console.error('Error booking package:', error);
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
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setPaymentOpen(false)}
        onConfirm={handleBookingConfirm}
        amount={selectedPackage ? `$${selectedPackage.price}` : '$0'}
        title={selectedPackage?.title}
      />

      <div style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '42px', fontWeight: '800', color: '#1f2937', marginBottom: '12px', fontFamily: 'Poppins, sans-serif' }}>
          Popular Destinations
        </h2>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>
          Explore the most beautiful places across Bangladesh
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px', marginBottom: '80px' }}>
        {destinations.map((dest, index) => (
          <div
            key={dest.name}
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
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Available Travel Packages</h2>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>Curated experiences from our trusted agencies</p>
        </div>

        {loading ? <p style={{ textAlign: 'center' }}>Loading packages...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
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
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669' }}>${pkg.price}</p>
                  </div>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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