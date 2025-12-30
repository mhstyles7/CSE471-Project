const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');

// Comprehensive local dishes data organized by division and district
const LOCAL_DISHES_DATA = [
    // DHAKA DIVISION
    { name: 'Bakarkhani', district: 'Dhaka', division: 'Dhaka', description: 'Traditional layered bread from Old Dhaka', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80' },
    { name: 'Haji Biryani', district: 'Dhaka', division: 'Dhaka', description: 'Famous biryani from Aladdin\'s Lane, Old Dhaka', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80' },
    { name: 'Kacchi Biryani', district: 'Dhaka', division: 'Dhaka', description: 'Aromatic layered rice with marinated mutton, the pride of Old Dhaka', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80' },
    { name: 'Morog Polao', district: 'Dhaka', division: 'Dhaka', description: 'Fragrant chicken rice dish', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80' },
    { name: 'Shahi Jilapi', district: 'Dhaka', division: 'Dhaka', description: 'Royal-sized jalebi from Chawkbazar', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },
    { name: 'Borhani', district: 'Dhaka', division: 'Dhaka', description: 'Spiced yogurt drink served with biryani', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80' },
    { name: 'Falooda', district: 'Dhaka', division: 'Dhaka', description: 'Sweet rose-flavored milk dessert drink', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80' },
    { name: 'Tehari', district: 'Dhaka', division: 'Dhaka', description: 'Spiced beef rice dish', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80' },
    { name: 'Sutrapur Kebab', district: 'Dhaka', division: 'Dhaka', description: 'Famous kebabs from Sutrapur area', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80' },
    { name: 'Beauty Lassi', district: 'Dhaka', division: 'Dhaka', description: 'Iconic thick yogurt drink', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80' },

    { name: 'Jackfruit', district: 'Gazipur', division: 'Dhaka', description: 'National fruit of Bangladesh', image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&q=80' },
    { name: 'Kataler Bichi', district: 'Gazipur', division: 'Dhaka', description: 'Jackfruit seeds curry', image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&q=80' },

    { name: 'Latkan', district: 'Narsingdi', division: 'Dhaka', description: 'Burmese grape from Shibpur', image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=600&q=80' },
    { name: 'Rasullah', district: 'Narsingdi', division: 'Dhaka', description: 'Traditional sweet', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },

    { name: 'Khejur Gur', district: 'Manikganj', division: 'Dhaka', description: 'Date palm molasses', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },
    { name: 'Patali Gur', district: 'Manikganj', division: 'Dhaka', description: 'Solid date palm jaggery', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },

    { name: 'Patkhir', district: 'Munshiganj', division: 'Dhaka', description: 'Special dessert from Sreenagar', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },
    { name: 'Bhagyakul Mishti', district: 'Munshiganj', division: 'Dhaka', description: 'Famous local sweets', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80' },

    { name: 'Chomchom', district: 'Tangail', division: 'Dhaka', description: 'Iconic oval-shaped sweet from Porabari', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },
    { name: 'Amriti', district: 'Tangail', division: 'Dhaka', description: 'Pretzel-shaped sweet', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },
    { name: 'Garo Bamboo Chicken', district: 'Tangail', division: 'Dhaka', description: 'Chicken cooked in bamboo, Garo tribal cuisine', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80' },

    { name: 'Balish Mishti', district: 'Kishoreganj', division: 'Dhaka', description: 'Pillow-shaped sweet from Goynath\'s', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },
    { name: 'Tal er Pitha', district: 'Kishoreganj', division: 'Dhaka', description: 'Palm fruit cake', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },

    { name: 'Hilsa Fish', district: 'Faridpur', division: 'Dhaka', description: 'National fish of Bangladesh', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
    { name: 'Rasgulla', district: 'Gopalganj', division: 'Dhaka', description: 'Spongy milk-based sweet', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },
    { name: 'Chhanar Jilapi', district: 'Gopalganj', division: 'Dhaka', description: 'Cottage cheese jalebi', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },

    // CHITTAGONG DIVISION
    { name: 'Mezbani Mangsho', district: 'Chittagong', division: 'Chittagong', description: 'Spicy beef curry served in traditional Chittagonian feasts', image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=600&q=80' },
    { name: 'Kala Bhuna', district: 'Chittagong', division: 'Chittagong', description: 'Slow-cooked dark meat curry', image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=600&q=80' },
    { name: 'Shutki', district: 'Chittagong', division: 'Chittagong', description: 'Dried fish specialty', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
    { name: 'Baro Bhaja', district: 'Chittagong', division: 'Chittagong', description: 'Twelve types of fried items', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80' },
    { name: 'Bela Biscuit', district: 'Chittagong', division: 'Chittagong', description: 'Traditional local biscuit', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80' },
    { name: 'Oyster Fry', district: 'Chittagong', division: 'Chittagong', description: 'Fried coastal oysters', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
    { name: 'Akhni Biryani', district: 'Chittagong', division: 'Chittagong', description: 'Aromatic rice with meat and spices', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80' },

    { name: 'Loita Fry', district: 'Cox\'s Bazar', division: 'Chittagong', description: 'Fried Bombay duck fish', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
    { name: 'Rupchanda Fry', district: 'Cox\'s Bazar', division: 'Chittagong', description: 'Fried pomfret fish', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
    { name: 'Coral Fish BBQ', district: 'Cox\'s Bazar', division: 'Chittagong', description: 'Grilled coral fish', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
    { name: 'Rakhine Cuisine', district: 'Cox\'s Bazar', division: 'Chittagong', description: 'Spicy salads and seafood from Rakhine community', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },

    { name: 'Rasmalai', district: 'Comilla', division: 'Chittagong', description: 'Cream-soaked cottage cheese from Matri Bhandar', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },
    { name: 'Khaddar Sweets', district: 'Comilla', division: 'Chittagong', description: 'Khadi traditional sweets', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },

    { name: 'Chhanamukhi', district: 'Brahmanbaria', division: 'Chittagong', description: 'Cottage cheese sweet', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },

    { name: 'Ilish Hilsa', district: 'Chandpur', division: 'Chittagong', description: 'Famous Hilsa fish of Chandpur', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },

    { name: 'Narkel Naru', district: 'Noakhali', division: 'Chittagong', description: 'Coconut balls sweet', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },
    { name: 'Buffalo Curd', district: 'Noakhali', division: 'Chittagong', description: 'Traditional buffalo milk yogurt', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80' },

    { name: 'Mohipaler Khaja', district: 'Feni', division: 'Chittagong', description: 'Layered crispy sweet', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },

    { name: 'Bamboo Chicken', district: 'Rangamati', division: 'Chittagong', description: 'Sumoh Gorang - Chicken cooked in bamboo, Chakma style', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80' },
    { name: 'Kaptai Lake Fish', district: 'Rangamati', division: 'Chittagong', description: 'Fresh fish from Kaptai Lake', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
    { name: 'Pazon', district: 'Rangamati', division: 'Chittagong', description: 'Multi-vegetable dish, Chakma cuisine', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80' },
    { name: 'Binni Rice', district: 'Rangamati', division: 'Chittagong', description: 'Sticky glutinous rice', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80' },

    { name: 'Mundi', district: 'Bandarban', division: 'Chittagong', description: 'Noodle soup, Marma cuisine', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80' },
    { name: 'Nappi', district: 'Bandarban', division: 'Chittagong', description: 'Fermented fish paste', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
    { name: 'Bamboo Shoot Curry', district: 'Bandarban', division: 'Chittagong', description: 'Traditional hill tract curry', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80' },
    { name: 'Thanchi Tea', district: 'Bandarban', division: 'Chittagong', description: 'Local tea from Thanchi', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80' },

    { name: 'Hebaang', district: 'Khagrachari', division: 'Chittagong', description: 'Steamed food in leaf', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80' },
    { name: 'Gundrok', district: 'Khagrachari', division: 'Chittagong', description: 'Fermented vegetable', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80' },

    // SYLHET DIVISION
    { name: 'Satkora Beef', district: 'Sylhet', division: 'Sylhet', description: 'Beef curry with wild citrus fruit', image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=600&q=80' },
    { name: 'Seven Color Tea', district: 'Sylhet', division: 'Sylhet', description: 'Unique layered tea from Srimangal', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80' },
    { name: 'Akhni Polao', district: 'Sylhet', division: 'Sylhet', description: 'Aromatic rice cooked with meat', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80' },
    { name: 'Hutki Shira', district: 'Sylhet', division: 'Sylhet', description: 'Fermented fish stew', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
    { name: 'Nunor Bora', district: 'Sylhet', division: 'Sylhet', description: 'Salty rice snack', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },

    { name: 'Tea Leaf Salad', district: 'Moulvibazar', division: 'Sylhet', description: 'Fresh tea leaves salad', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80' },
    { name: 'Eromba', district: 'Moulvibazar', division: 'Sylhet', description: 'Manipuri mashed vegetables with fermented fish', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80' },

    { name: 'Haor Fish Curry', district: 'Sunamganj', division: 'Sylhet', description: 'Fish curry from wetlands', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
    { name: 'Biroin Chal', district: 'Sunamganj', division: 'Sylhet', description: 'Sticky rice', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80' },

    // KHULNA DIVISION
    { name: 'Chui Jhal', district: 'Khulna', division: 'Khulna', description: 'Meat with piper chaba vine', image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=600&q=80' },
    { name: 'Chingri Malai Curry', district: 'Khulna', division: 'Khulna', description: 'Prawn in coconut cream', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
    { name: 'Golda Chingri', district: 'Bagerhat', division: 'Khulna', description: 'Giant freshwater prawn', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
    { name: 'Sundarbans Honey', district: 'Satkhira', division: 'Khulna', description: 'Wild honey from Sundarbans', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80' },
    { name: 'Jamtala Sweets', district: 'Jessore', division: 'Khulna', description: 'Famous local sweets', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },
    { name: 'Kulfi Malai', district: 'Kushtia', division: 'Khulna', description: 'Traditional frozen dessert', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80' },
    { name: 'Til Khaja', district: 'Kushtia', division: 'Khulna', description: 'Sesame sweet', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },

    // RAJSHAHI DIVISION
    { name: 'Fazli Mango', district: 'Rajshahi', division: 'Rajshahi', description: 'Famous Rajshahi mango variety', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80' },
    { name: 'Langra Mango', district: 'Rajshahi', division: 'Rajshahi', description: 'Sweet aromatic mango', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80' },
    { name: 'Kalai Roti', district: 'Rajshahi', division: 'Rajshahi', description: 'Black gram bread', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80' },
    { name: 'Tiler Khaja', district: 'Rajshahi', division: 'Rajshahi', description: 'Sesame crispy sweet', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },

    { name: 'Bogra Doi', district: 'Bogra', division: 'Rajshahi', description: 'Famous thick yogurt curd', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80' },
    { name: 'Kotkoti', district: 'Bogra', division: 'Rajshahi', description: 'Crunchy snack from Mahasthangarh', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },

    { name: 'Kanchagolla', district: 'Natore', division: 'Rajshahi', description: 'Round milk-based sweet', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },

    { name: 'Pabna Doi', district: 'Pabna', division: 'Rajshahi', description: 'Creamy curd specialty', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80' },
    { name: 'Chamcham', district: 'Pabna', division: 'Rajshahi', description: 'Oval cottage cheese sweet', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },

    { name: 'Chapainawabganj Mango', district: 'Chapainawabganj', division: 'Rajshahi', description: 'Premium mangoes from mango capital', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80' },
    { name: 'Roshbhora', district: 'Chapainawabganj', division: 'Rajshahi', description: 'Syrup-filled sweet balls', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },

    // BARISAL DIVISION
    { name: 'Amra', district: 'Barisal', division: 'Barisal', description: 'Hog plum fruit', image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=600&q=80' },
    { name: 'Barisal Hilsa', district: 'Barisal', division: 'Barisal', description: 'Hilsa fish from Barisal rivers', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
    { name: 'Barisal Doi', district: 'Barisal', division: 'Barisal', description: 'Traditional curd', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80' },

    { name: 'Floating Guava', district: 'Pirojpur', division: 'Barisal', description: 'Guava from floating market', image: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=600&q=80' },

    { name: 'Mohish er Doi', district: 'Bhola', division: 'Barisal', description: 'Buffalo curd specialty', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80' },

    { name: 'Kuakata Crab Fry', district: 'Patuakhali', division: 'Barisal', description: 'Fried crab from Kuakata', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
    { name: 'Rakhine Fried Rice', district: 'Patuakhali', division: 'Barisal', description: 'Ethnic Rakhine style fried rice', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80' },

    // RANGPUR DIVISION
    { name: 'Haribhanga Mango', district: 'Rangpur', division: 'Rangpur', description: 'Special mango variety', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80' },
    { name: 'Sidol', district: 'Rangpur', division: 'Rangpur', description: 'Fermented fish paste', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
    { name: 'Teesta Fish', district: 'Rangpur', division: 'Rangpur', description: 'Fresh fish from Teesta river', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },

    { name: 'Kataribhog Rice', district: 'Dinajpur', division: 'Rangpur', description: 'Premium aromatic rice', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80' },
    { name: 'Dinajpur Lichu', district: 'Dinajpur', division: 'Rangpur', description: 'Famous lychee', image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=600&q=80' },
    { name: 'Chepa Shutki', district: 'Dinajpur', division: 'Rangpur', description: 'Pressed dried fish', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },

    { name: 'Domar Sandesh', district: 'Nilphamari', division: 'Rangpur', description: 'Milk-based sweet', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },
    { name: 'Syedpur Biryani', district: 'Nilphamari', division: 'Rangpur', description: 'Local style biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80' },

    { name: 'Panchagarh Tea', district: 'Panchagarh', division: 'Rangpur', description: 'Northern tea', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80' },
    { name: 'Panchagarh Orange', district: 'Panchagarh', division: 'Rangpur', description: 'Local oranges', image: 'https://images.unsplash.com/photo-1547514701-42f54e9ab81a?w=600&q=80' },

    { name: 'Suryapuri Mango', district: 'Thakurgaon', division: 'Rangpur', description: 'Premium mango variety', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80' },

    // MYMENSINGH DIVISION
    { name: 'Monda', district: 'Mymensingh', division: 'Mymensingh', description: 'Iconic sweet from Muktagacha', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },
    { name: 'Chapa Shutki', district: 'Mymensingh', division: 'Mymensingh', description: 'Pressed dried fish', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },
    { name: 'Nakham Bitchi', district: 'Mymensingh', division: 'Mymensingh', description: 'Garo dry fish soup with soda', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },

    { name: 'Chanar Payesh', district: 'Sherpur', division: 'Mymensingh', description: 'Cottage cheese pudding', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },
    { name: 'Garo Pork Curry', district: 'Sherpur', division: 'Mymensingh', description: 'Traditional Garo pork dish', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80' },

    { name: 'Balish Mishti Netrokona', district: 'Netrokona', division: 'Mymensingh', description: 'Pillow-shaped sweet', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },
    { name: 'Haor Fish', district: 'Netrokona', division: 'Mymensingh', description: 'Fresh fish from haors', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80' },

    { name: 'Chhanar Polao', district: 'Jamalpur', division: 'Mymensingh', description: 'Cottage cheese rice', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80' }
];

// Get all divisions
router.get('/divisions', async (req, res) => {
    const divisions = [...new Set(LOCAL_DISHES_DATA.map(d => d.division))];
    res.json(divisions);
});

// Get districts by division
router.get('/districts/:division', async (req, res) => {
    const { division } = req.params;
    const districts = [...new Set(LOCAL_DISHES_DATA.filter(d => d.division === division).map(d => d.district))];
    res.json(districts);
});

// Get all foods (with optional filtering)
router.get('/', async (req, res) => {
    try {
        const { division, district, search } = req.query;

        let results = [...LOCAL_DISHES_DATA];

        if (division) {
            results = results.filter(d => d.division.toLowerCase() === division.toLowerCase());
        }

        if (district) {
            results = results.filter(d => d.district.toLowerCase() === district.toLowerCase());
        }

        if (search) {
            const searchLower = search.toLowerCase();
            results = results.filter(d =>
                d.name.toLowerCase().includes(searchLower) ||
                d.description.toLowerCase().includes(searchLower) ||
                d.district.toLowerCase().includes(searchLower)
            );
        }

        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
