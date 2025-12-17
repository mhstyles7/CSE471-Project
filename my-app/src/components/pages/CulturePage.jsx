import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';
import { ChefHat, Utensils, Calendar, ArrowRight, Lock, X, BookOpen, MapPin, Filter } from 'lucide-react';

const API_URL = 'http://localhost:1306';

// Real-time Bangla Date Converter
const getBanglaDate = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();

    // Bangla Months
    const banglaMonths = [
        "Boishakh", "Joishtho", "Ashar", "Srabon", "Bhadro", "Ashwin",
        "Kartik", "Agrahayan", "Poush", "Magh", "Falgun", "Chaitra"
    ];

    const seasons = [
        "Grishmo (Summer)", "Grishmo (Summer)",
        "Borsha (Rainy)", "Borsha (Rainy)",
        "Shorot (Autumn)", "Shorot (Autumn)",
        "Hemonto (Late Autumn)", "Hemonto (Late Autumn)",
        "Sheet (Winter)", "Sheet (Winter)",
        "Boshonto (Spring)", "Boshonto (Spring)"
    ];

    // Bangla calendar starts on April 14 (Pohela Boishakh)
    // Each Bangla month is approximately 30-31 days
    const monthDays = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];

    // Calculate Bangla year
    let banglaYear = year - 593;

    // Before April 14, we're in the previous Bangla year
    if (month < 3 || (month === 3 && day < 14)) {
        banglaYear--;
    }

    // Calculate Bangla month and day
    let banglaMonthIndex, banglaDay;

    // Rough mapping of Gregorian to Bangla dates
    const startOfBoishakh = new Date(year, 3, 14); // April 14
    const today = new Date(year, month, day);

    if (today < startOfBoishakh) {
        // We're before Boishakh of this year, calculate from last Boishakh
        const lastYearBoishakh = new Date(year - 1, 3, 14);
        const daysSinceBoishakh = Math.floor((today - lastYearBoishakh) / (1000 * 60 * 60 * 24));

        let cumulativeDays = 0;
        for (let i = 0; i < 12; i++) {
            if (cumulativeDays + monthDays[i] > daysSinceBoishakh) {
                banglaMonthIndex = i;
                banglaDay = daysSinceBoishakh - cumulativeDays + 1;
                break;
            }
            cumulativeDays += monthDays[i];
        }
    } else {
        const daysSinceBoishakh = Math.floor((today - startOfBoishakh) / (1000 * 60 * 60 * 24));

        let cumulativeDays = 0;
        for (let i = 0; i < 12; i++) {
            if (cumulativeDays + monthDays[i] > daysSinceBoishakh) {
                banglaMonthIndex = i;
                banglaDay = daysSinceBoishakh - cumulativeDays + 1;
                break;
            }
            cumulativeDays += monthDays[i];
        }
    }

    // Fallback
    if (banglaMonthIndex === undefined) {
        banglaMonthIndex = 7; // Agrahayan (December)
        banglaDay = 1;
    }

    return {
        day: banglaDay || 1,
        month: banglaMonths[banglaMonthIndex],
        year: banglaYear,
        season: seasons[banglaMonthIndex],
        monthIndex: banglaMonthIndex
    };
};

// Calculate days until next festival
const getDaysUntil = (targetMonth, targetDay) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    let targetDate = new Date(currentYear, targetMonth, targetDay);

    if (targetDate < now) {
        targetDate = new Date(currentYear + 1, targetMonth, targetDay);
    }

    const diffTime = targetDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const UPCOMING_EVENTS = [
    { name: "Pohela Boishakh", banglaDate: "1 Boishakh", engDate: "April 14", desc: "Bengali New Year", month: 3, day: 14 },
    { name: "Nobanno Utshob", banglaDate: "1 Agrahayan", engDate: "Nov 15", desc: "Harvest Festival", month: 10, day: 15 },
    { name: "Poush Mela", banglaDate: "Poush Month", engDate: "January", desc: "Folk Fair & Music", month: 0, day: 14 },
    { name: "Boshonto Utshob", banglaDate: "1 Falgun", engDate: "February 13", desc: "Spring Festival", month: 1, day: 13 },
    { name: "International Mother Language Day", banglaDate: "8 Falgun", engDate: "February 21", desc: "Ekushey February", month: 1, day: 21 }
];

const DIVISIONS = ['All', 'Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 'Rajshahi', 'Barisal', 'Rangpur', 'Mymensingh'];

// Famous dishes with recipes (always shown at top)
const FAMOUS_DISHES = [
    {
        name: 'Panta Ilish',
        region: 'Dhaka',
        desc: 'Traditional fermented rice with Hilsa fish, a Pohela Boishakh specialty.',
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80',
        ingredients: ['Fermented rice (panta bhat)', 'Hilsa fish (Ilish)', 'Green chilies', 'Onion slices', 'Mustard oil', 'Salt to taste', 'Dried red chilies'],
        recipe: '1. Soak cooked rice overnight in water.\n2. Fry Hilsa fish with turmeric and salt.\n3. Serve panta with fried Ilish, raw onion, green chilies, and mustard oil.'
    },
    {
        name: 'Mezban Meat',
        region: 'Chittagong',
        desc: 'Spicy beef curry served in traditional Chittagonian feasts.',
        image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=600&q=80',
        ingredients: ['Beef (1 kg)', 'Onion (500g)', 'Ginger-garlic paste', 'Red chili powder', 'Turmeric', 'Cumin seeds', 'Bay leaves', 'Cardamom', 'Cinnamon', 'Mustard oil'],
        recipe: '1. Marinate beef with spices for 2 hours.\n2. Cook slowly with lots of onion until tender.\n3. The gravy should be thick and spicy.'
    },
    {
        name: 'Bhog',
        region: 'Sylhet',
        desc: 'Ritualistic vegetarian meal offerings during Durga Puja.',
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
        ingredients: ['Gobindobhog rice', 'Mixed vegetables', 'Paneer', 'Ghee', 'Garam masala', 'Raisins', 'Cashews', 'Sugar'],
        recipe: '1. Cook fragrant rice with ghee.\n2. Prepare mixed vegetable curry.\n3. Serve with khichuri and labra.'
    },
    {
        name: 'Kacchi Biryani',
        region: 'Old Dhaka',
        desc: 'Aromatic layered rice with marinated mutton, the pride of Old Dhaka.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
        ingredients: ['Mutton (1 kg)', 'Basmati rice (750g)', 'Yogurt (250g)', 'Fried onions', 'Saffron', 'Rose water', 'Potatoes', 'Whole spices', 'Ghee'],
        recipe: '1. Marinate mutton with yogurt and spices overnight.\n2. Layer marinated meat with parboiled rice.\n3. Slow cook (dum) for 2-3 hours.'
    }
];

export default function CulturePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const banglaDate = getBanglaDate();
    const [selectedDish, setSelectedDish] = useState(null);

    // Toggle for showing the full directory
    const [showDirectory, setShowDirectory] = useState(false);

    // API-driven dishes
    const [localDishes, setLocalDishes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDivision, setSelectedDivision] = useState('All');
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('All');

    // Fetch dishes from API only when directory is shown
    useEffect(() => {
        if (showDirectory) {
            fetchDishes();
        }
    }, [selectedDivision, selectedDistrict, showDirectory]);

    // Fetch districts when division changes
    useEffect(() => {
        if (selectedDivision !== 'All') {
            fetchDistricts(selectedDivision);
        } else {
            setDistricts([]);
            setSelectedDistrict('All');
        }
    }, [selectedDivision]);

    const fetchDishes = async () => {
        setLoading(true);
        try {
            let url = `${API_URL}/api/foods`;
            const params = new URLSearchParams();

            if (selectedDivision !== 'All') {
                params.append('division', selectedDivision);
            }
            if (selectedDistrict !== 'All') {
                params.append('district', selectedDistrict);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            setLocalDishes(data);
        } catch (error) {
            console.error('Error fetching dishes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDistricts = async (division) => {
        try {
            const res = await fetch(`${API_URL}/api/foods/districts/${division}`);
            const data = await res.json();
            setDistricts(['All', ...data]);
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };

    // Sort events by days until
    const sortedEvents = [...UPCOMING_EVENTS]
        .map(evt => ({ ...evt, daysUntil: getDaysUntil(evt.month, evt.day) }))
        .sort((a, b) => a.daysUntil - b.daysUntil);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Cultural & Culinary Explorer</h1>
                <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
                    Immerse yourself in the authentic flavors and traditions of Bangladesh.
                </p>
            </div>

            {/* Bangla Calendar Section */}
            <div style={{ marginBottom: '60px', padding: '32px', backgroundColor: '#fef3c7', borderRadius: '24px', border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <Calendar size={32} color="#d97706" />
                    <div>
                        <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#92400e', margin: 0 }}>Bangla Calendar</h2>
                        <p style={{ color: '#b45309', fontSize: '14px', margin: 0 }}>Real-time Bengali date</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
                    {/* Today's Date Card */}
                    <div style={{ flex: 1, minWidth: '250px', backgroundColor: 'white', padding: '24px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px rgba(217, 119, 6, 0.1)' }}>
                        <p style={{ fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Today is</p>
                        <h3 style={{ fontSize: '48px', fontWeight: 'bold', color: '#d97706', margin: '10px 0' }}>{banglaDate.day}</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>{banglaDate.month}, {banglaDate.year}</p>
                        <p style={{ color: '#b45309', marginTop: '8px' }}>{banglaDate.season}</p>
                    </div>

                    {/* Upcoming Events List */}
                    <div style={{ flex: 2, minWidth: '300px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e', marginBottom: '16px' }}>Upcoming Festivals</h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {sortedEvents.slice(0, 4).map((evt, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '16px', borderRadius: '12px' }}>
                                    <div>
                                        <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937' }}>{evt.name}</p>
                                        <p style={{ fontSize: '14px', color: '#6b7280' }}>{evt.desc}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 'bold', color: '#d97706' }}>{evt.daysUntil} days</p>
                                        <p style={{ fontSize: '12px', color: '#9ca3af' }}>{evt.engDate}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Famous Dishes Section (Always Visible) */}
            <div style={{ marginBottom: '60px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <Utensils size={32} color="#ea580c" />
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Famous Dishes</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
                    {FAMOUS_DISHES.map((dish, i) => (
                        <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
                            <img src={dish.image} alt={dish.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{dish.name}</h3>
                                    <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#fff7ed', color: '#c2410c', borderRadius: '20px', fontWeight: '600' }}>{dish.region}</span>
                                </div>
                                <p style={{ color: '#6b7280', lineHeight: '1.5', marginBottom: '16px' }}>{dish.desc}</p>
                                <button
                                    onClick={() => setSelectedDish(dish)}
                                    style={{ color: '#ea580c', fontWeight: '600', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <BookOpen size={16} /> View Recipe & Ingredients
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Explore Local Delicacies Button */}
                <div style={{ textAlign: 'center', marginTop: '48px' }}>
                    <button
                        onClick={() => setShowDirectory(!showDirectory)}
                        style={{
                            padding: '16px 40px',
                            backgroundColor: showDirectory ? '#f3f4f6' : '#ea580c',
                            color: showDirectory ? '#4b5563' : 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontSize: '18px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: showDirectory ? 'none' : '0 6px 20px rgba(234, 88, 12, 0.3)',
                            transition: 'all 0.3s'
                        }}
                    >
                        <MapPin size={22} />
                        {showDirectory ? 'Hide Directory' : 'Explore Local Delicacies by Region'}
                        <ArrowRight size={20} />
                    </button>
                    <p style={{ color: '#6b7280', marginTop: '12px', fontSize: '14px' }}>
                        Discover 100+ authentic dishes from 64 districts across Bangladesh
                    </p>
                </div>
            </div>

            {/* API-Driven Local Dishes Directory (Shown when Explore is clicked) */}
            {showDirectory && (
                <div style={{ marginBottom: '80px', padding: '32px', backgroundColor: '#fafafa', borderRadius: '24px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <MapPin size={28} color="#059669" />
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>Local Delicacies Directory</h2>
                        </div>

                        {/* Filter Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Filter size={18} color="#6b7280" />
                                <select
                                    value={selectedDivision}
                                    onChange={(e) => {
                                        setSelectedDivision(e.target.value);
                                        setSelectedDistrict('All');
                                    }}
                                    style={{
                                        padding: '10px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #e5e7eb',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        minWidth: '140px'
                                    }}
                                >
                                    {DIVISIONS.map(div => (
                                        <option key={div} value={div}>{div} Division</option>
                                    ))}
                                </select>
                            </div>

                            {districts.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MapPin size={18} color="#6b7280" />
                                    <select
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                        style={{
                                            padding: '10px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid #e5e7eb',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            backgroundColor: 'white',
                                            cursor: 'pointer',
                                            minWidth: '140px'
                                        }}
                                    >
                                        {districts.map(dist => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <span style={{ padding: '8px 16px', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '20px', fontSize: '14px', fontWeight: '600' }}>
                                {localDishes.length} dishes found
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading dishes...</p>
                        </div>
                    ) : localDishes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '16px' }}>
                            <p style={{ color: '#6b7280', fontSize: '16px' }}>No dishes found for this region. Try a different filter.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
                            {localDishes.map((dish, i) => (
                                <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
                                    <img src={dish.image} alt={dish.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                                    <div style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{dish.name}</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                                                <span style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '10px', fontWeight: '600', whiteSpace: 'nowrap' }}>{dish.district}</span>
                                            </div>
                                        </div>
                                        <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.4', margin: 0 }}>{dish.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Recipe Modal */}
            {selectedDish && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
                }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '24px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
                        <div style={{ position: 'relative' }}>
                            <img src={selectedDish.image} alt={selectedDish.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '24px 24px 0 0' }} />
                            <button
                                onClick={() => setSelectedDish(null)}
                                style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px', borderRadius: '50%', backgroundColor: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                                <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{selectedDish.name}</h2>
                                <span style={{ padding: '6px 14px', backgroundColor: '#fff7ed', color: '#c2410c', borderRadius: '20px', fontWeight: '600' }}>
                                    {selectedDish.region || selectedDish.district}
                                </span>
                            </div>

                            <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '24px' }}>
                                {selectedDish.desc || selectedDish.description}
                            </p>

                            {/* Show recipe & ingredients only for famous dishes */}
                            {selectedDish.ingredients && selectedDish.ingredients.length > 0 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ea580c', marginBottom: '12px' }}>Ingredients</h3>
                                    <ul style={{ margin: 0, paddingLeft: '20px', display: 'grid', gap: '8px' }}>
                                        {selectedDish.ingredients.map((ing, i) => (
                                            <li key={i} style={{ color: '#4b5563' }}>{ing}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedDish.recipe && (
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ea580c', marginBottom: '12px' }}>How to Make</h3>
                                    <p style={{ color: '#4b5563', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{selectedDish.recipe}</p>
                                </div>
                            )}

                            {/* For directory dishes without recipe */}
                            {!selectedDish.recipe && selectedDish.division && (
                                <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '12px' }}>
                                    <p style={{ margin: 0, color: '#059669', fontSize: '14px' }}>
                                        <strong>Location:</strong> {selectedDish.district}, {selectedDish.division} Division
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Cook with Local Section (Premium) */}
            <div style={{ marginBottom: '80px', backgroundColor: '#fff7ed', borderRadius: '24px', padding: '40px', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <ChefHat size={32} color="#ea580c" />
                        <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Cook with a Local</h2>
                    </div>
                    <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '32px', lineHeight: '1.6' }}>
                        Join a local family in their kitchen. Learn the secrets of authentic spices, traditional techniques, and share a meal together. An exclusive experience for our premium community.
                    </p>

                    {user?.isPremium ? (
                        <button
                            onClick={() => navigate('local-guides')}
                            style={{ padding: '14px 32px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                        >
                            Book Experience <ArrowRight size={20} />
                        </button>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <button
                                onClick={() => navigate('premium')}
                                style={{ padding: '14px 32px', backgroundColor: '#1f2937', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', width: 'fit-content' }}
                            >
                                <Lock size={18} /> Unlock with Premium
                            </button>
                            <p style={{ fontSize: '14px', color: '#ea580c' }}>Start your premium journey for just 200tk/lifetime.</p>
                        </div>
                    )}
                </div>
                <div style={{ flex: 1, minWidth: '300px', height: '300px', borderRadius: '16px', overflow: 'hidden' }}>
                    <img
                        src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80"
                        alt="Traditional cooking experience"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            </div>
        </div>
    );
}
