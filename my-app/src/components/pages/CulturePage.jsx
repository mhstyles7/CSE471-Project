import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';
import { ChefHat, Utensils, Calendar, ArrowRight, Lock, X, MapPin, Filter } from 'lucide-react';
import { API_URL } from '../../config';

// Bangla Date Converter - Accurate Calculation
const getBanglaDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth(); // 0-11 (Jan=0, Dec=11)
    const year = date.getFullYear();

    // Bangla Months with their start dates in Gregorian calendar
    const banglaMonths = [
        { name: "Boishakh", startMonth: 3, startDay: 14 },    // Apr 14
        { name: "Joishtho", startMonth: 4, startDay: 15 },    // May 15
        { name: "Ashar", startMonth: 5, startDay: 15 },       // Jun 15
        { name: "Srabon", startMonth: 6, startDay: 16 },      // Jul 16
        { name: "Bhadro", startMonth: 7, startDay: 16 },      // Aug 16
        { name: "Ashwin", startMonth: 8, startDay: 16 },      // Sep 16
        { name: "Kartik", startMonth: 9, startDay: 16 },      // Oct 16
        { name: "Agrahayan", startMonth: 10, startDay: 16 },  // Nov 16
        { name: "Poush", startMonth: 11, startDay: 15 },      // Dec 15
        { name: "Magh", startMonth: 0, startDay: 14 },        // Jan 14
        { name: "Falgun", startMonth: 1, startDay: 13 },      // Feb 13
        { name: "Chaitra", startMonth: 2, startDay: 14 }      // Mar 14
    ];

    // Bangla Seasons (Ritu)
    const banglaSeasons = [
        { name: "Grisho (Summer)", months: ["Boishakh", "Joishtho"] },
        { name: "Borsha (Monsoon)", months: ["Ashar", "Srabon"] },
        { name: "Shorot (Autumn)", months: ["Bhadro", "Ashwin"] },
        { name: "Hemonto (Late Autumn)", months: ["Kartik", "Agrahayan"] },
        { name: "Sheet (Winter)", months: ["Poush", "Magh"] },
        { name: "Boshonto (Spring)", months: ["Falgun", "Chaitra"] }
    ];

    // Find current Bangla month
    let banglaMonthIndex = -1;
    for (let i = 0; i < banglaMonths.length; i++) {
        const current = banglaMonths[i];
        const next = banglaMonths[(i + 1) % 12];

        // Check if current date falls in this Bangla month
        if (month === current.startMonth && day >= current.startDay) {
            banglaMonthIndex = i;
            break;
        } else if (month === next.startMonth && day < next.startDay) {
            banglaMonthIndex = i;
            break;
        } else if (month > current.startMonth && month < next.startMonth) {
            banglaMonthIndex = i;
            break;
        }
    }

    // Handle edge cases for year-end months
    if (banglaMonthIndex === -1) {
        // December 15 - December 31 is Poush
        if (month === 11 && day >= 15) {
            banglaMonthIndex = 8; // Poush
        }
        // January 1 - January 13 is Poush
        else if (month === 0 && day < 14) {
            banglaMonthIndex = 8; // Poush
        }
        // Default fallback
        else {
            banglaMonthIndex = 0;
        }
    }

    const currentBanglaMonth = banglaMonths[banglaMonthIndex];

    // Calculate Bangla day
    let banglaDay;
    if (month === currentBanglaMonth.startMonth) {
        banglaDay = day - currentBanglaMonth.startDay + 1;
    } else {
        // Days from end of previous Gregorian month
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        banglaDay = (daysInPrevMonth - currentBanglaMonth.startDay + 1) + day;
    }

    // Calculate Bangla year
    // Bangla year 1432 started on April 14, 2025
    let banglaYear = year - 593;
    if (month < 3 || (month === 3 && day < 14)) {
        banglaYear--;
    }

    // Find current season
    const currentMonthName = currentBanglaMonth.name;
    let currentSeason = "";
    for (const season of banglaSeasons) {
        if (season.months.includes(currentMonthName)) {
            currentSeason = season.name;
            break;
        }
    }

    return {
        day: String(banglaDay),
        month: currentBanglaMonth.name,
        year: String(banglaYear),
        season: currentSeason
    };
};

// Calculate days remaining until an event
const getDaysRemaining = (eventMonth, eventDay) => {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Create event date for current year
    let eventDate = new Date(currentYear, eventMonth - 1, eventDay);

    // If event has passed this year, calculate for next year
    if (eventDate < today) {
        eventDate = new Date(currentYear + 1, eventMonth - 1, eventDay);
    }

    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

// Upcoming events with Gregorian month/day for calculating days remaining
const UPCOMING_EVENTS = [
    { name: "Pohela Boishakh", banglaDate: "1 Boishakh", engDate: "April 14", month: 4, day: 14, desc: "Bengali New Year" },
    { name: "Nobanno Utshob", banglaDate: "1 Agrahayan", engDate: "Nov 15", month: 11, day: 15, desc: "Harvest Festival" },
    { name: "Poush Mela", banglaDate: "1 Poush", engDate: "Dec 15", month: 12, day: 15, desc: "Folk Fair & Music" },
    { name: "Boshonto Utshob", banglaDate: "1 Falgun", engDate: "Feb 13", month: 2, day: 13, desc: "Spring Festival" }
].map(evt => ({
    ...evt,
    daysRemaining: getDaysRemaining(evt.month, evt.day)
})).sort((a, b) => a.daysRemaining - b.daysRemaining);


export default function CulturePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const banglaDate = getBanglaDate();

    // State for directory feature
    const [showDirectory, setShowDirectory] = useState(false);
    const [selectedDivision, setSelectedDivision] = useState('All');
    const [selectedDistrict, setSelectedDistrict] = useState('All');
    const [loading, setLoading] = useState(false);
    const [selectedDish, setSelectedDish] = useState(null);
    const [localDishes, setLocalDishes] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [districts, setDistricts] = useState([]);

    // Limit initial dishes display (6 items = 2-3 rows)
    const INITIAL_DISHES_LIMIT = 6;
    const isFiltered = selectedDivision !== 'All' || selectedDistrict !== 'All';

    useEffect(() => {
        fetchDishes();
        fetchDivisions();
    }, [selectedDivision, selectedDistrict]);

    const fetchDishes = async () => {
        setLoading(true);
        try {
            let query = '/api/foods?';
            if (selectedDivision !== 'All') query += `division=${selectedDivision}&`;
            if (selectedDistrict !== 'All') query += `district=${selectedDistrict}`;

            const res = await fetch(`${API_URL}${query}`);
            const data = await res.json();
            setLocalDishes(data);
        } catch (error) {
            console.error('Error fetching dishes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDivisions = async () => {
        try {
            const res = await fetch(`${API_URL}/api/foods/divisions`);
            const data = await res.json();
            setDivisions(['All', ...data]);
        } catch (error) {
            console.error('Error fetching divisions:', error);
        }
    };

    // Update districts when division changes
    useEffect(() => {
        if (selectedDivision === 'All') {
            setDistricts(['All']);
            return;
        }

        const fetchDistricts = async () => {
            try {
                const res = await fetch(`${API_URL}/api/foods/districts/${selectedDivision}`);
                const data = await res.json();
                setDistricts(['All', ...data]);
            } catch (error) {
                console.error('Error fetching districts:', error);
            }
        };
        fetchDistricts();
    }, [selectedDivision]);



    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 className="section-heading" style={{ fontSize: '42px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Cultural & Culinary Explorer</h1>
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
                        <p style={{ color: '#b45309', marginTop: '8px' }}>Season: {banglaDate.season}</p>

                    </div>

                    {/* Upcoming Events List */}
                    <div style={{ flex: 2, minWidth: '300px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e', marginBottom: '16px' }}>Upcoming Eventful Days</h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {UPCOMING_EVENTS.map((evt, i) => (

                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '16px', borderRadius: '12px' }}>
                                    <div>
                                        <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937' }}>{evt.name}</p>
                                        <p style={{ fontSize: '14px', color: '#6b7280' }}>{evt.desc}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 'bold', color: '#d97706' }}>{evt.banglaDate}</p>
                                        <p style={{ fontSize: '12px', color: '#9ca3af' }}>({evt.engDate})</p>
                                        <p style={{
                                            fontSize: '11px',
                                            color: evt.daysRemaining <= 30 ? '#059669' : '#6b7280',
                                            fontWeight: evt.daysRemaining <= 30 ? '600' : '400',
                                            marginTop: '4px',
                                            padding: '2px 8px',
                                            backgroundColor: evt.daysRemaining <= 30 ? '#ecfdf5' : '#f3f4f6',
                                            borderRadius: '10px',
                                            display: 'inline-block'
                                        }}>
                                            {evt.daysRemaining === 0 ? '🎉 Today!' :
                                                evt.daysRemaining === 1 ? '⏰ Tomorrow!' :
                                                    `${evt.daysRemaining} days left`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


            {/* Local Dishes Section */}
            <div style={{ marginBottom: '80px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <Utensils size={32} color="#ea580c" />
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Local Delicacies</h2>
                </div>
                <div className="dishes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
                    {(showDirectory ? [] : localDishes.slice(0, INITIAL_DISHES_LIMIT)).map((dish, i) => (

                        <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
                            <img src={dish.image} alt={dish.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>{dish.name}</h3>
                                    <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#fff7ed', color: '#c2410c', borderRadius: '20px', fontWeight: '600' }}>{dish.region}</span>
                                </div>
                                <p style={{ color: '#6b7280', lineHeight: '1.5' }}>{dish.desc}</p>
                                <button
                                    onClick={() => setSelectedDish(dish)}
                                    style={{ marginTop: '16px', color: '#ea580c', fontWeight: '600', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    View Recipe <ArrowRight size={16} />

                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Show count of remaining dishes when not in directory mode */}
                {!showDirectory && localDishes.length > INITIAL_DISHES_LIMIT && (
                    <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '12px' }}>
                        <p style={{ color: '#92400e', margin: 0, fontSize: '14px' }}>
                            Showing {INITIAL_DISHES_LIMIT} of {localDishes.length} dishes.
                            <strong> Click "Explore Local Delicacies by Region" below</strong> to filter and see more!
                        </p>
                    </div>
                )}


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
                                    {divisions.map(div => (
                                        <option key={div} value={div}>{div} {div !== 'All' && 'Division'}</option>
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
                        <div className="dishes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
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
                <div className="modal-overlay" style={{
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
                            onClick={() => navigate('local-guides', { cookMode: true })}
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
