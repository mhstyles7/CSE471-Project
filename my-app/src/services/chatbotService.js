// ============================================
// REAL AI CHATBOT - Google Gemini API
// Enhanced for all requirements (2.1 - 2.5)
// Uses Official Google Generative AI SDK
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY2;

// Initialize the API Client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ============================================
// MODEL ROTATION CONFIG
// ============================================

const MODEL_SEQUENCE = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite"
];

let currentModelIndex = 0;

// Get active model instance
const getModelByIndex = (index) => {
  return genAI.getGenerativeModel({
    model: MODEL_SEQUENCE[index]
  });
};

// Generate with fallback for quota handling
const generateWithFallback = async (requestFn) => {
  const totalModels = MODEL_SEQUENCE.length;

  // Local copy of the index (isolated per request)
  let localIndex = currentModelIndex;
  let attempts = 0;

  while (attempts < totalModels) {
    const model = getModelByIndex(localIndex);

    try {
      const result = await requestFn(model);

      // Promote successful model globally
      currentModelIndex = localIndex;

      return result;
    } catch (error) {
      const isQuota =
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.toLowerCase().includes("quota");

      if (!isQuota) {
        throw error; // real error → stop
      }

      // Rotate locally only
      localIndex = (localIndex + 1) % totalModels;
      attempts++;
    }
  }

  throw new Error("All Gemini models exhausted due to quota limits");
};

// Platform pages for navigation guidance (2.3)
export const PLATFORM_PAGES = {
  home: { name: 'Home', description: 'Main landing page with featured destinations' },
  destinations: { name: 'Destinations', description: 'Explore popular travel destinations and book packages' },
  friends: { name: 'Friends', description: 'Connect with fellow travelers, send friend requests' },
  community: { name: 'Community', description: 'Share travel stories, post photos, interact with others' },
  'group-events': { name: 'Group Events', description: 'Create or join group tours and travel together' },
  rewards: { name: 'Rewards', description: 'View your points, tier status, and unlock perks' },
  'my-trips': { name: 'My Trips', description: 'Track your travel history and upcoming trips' },
  map: { name: 'Interactive Map', description: 'Explore all 64 districts with weather and safety info' },
  'local-guides': { name: 'Local Guides', description: 'Connect with verified local guides for tours' },
  culture: { name: 'Culture & Food', description: 'Discover local cuisine and cultural experiences' },
  profile: { name: 'Profile', description: 'View and edit your personal profile and settings' },
  about: { name: 'About', description: 'Learn about PothChola platform and mission' }
};

// Build personalized system prompt (2.1)
const buildSystemPrompt = (userContext) => {
  const { user, travelHistory, currentPage } = userContext || {};

  let personalizedInfo = '';

  // Add user personalization if logged in (2.1)
  if (user) {
    personalizedInfo += `\n\nCURRENT USER CONTEXT:
- Name: ${user.name || 'Traveler'}
- Logged in: Yes
- Account type: ${user.isPremium ? 'Premium Member' : 'Regular Member'}`;

    if (user.interests && user.interests.length > 0) {
      personalizedInfo += `\n- Interests: ${user.interests.join(', ')}`;
    }
  } else {
    personalizedInfo += `\n\nCURRENT USER: Not logged in (Guest)`;
  }

  // Add travel history for personalization (2.1)
  if (travelHistory && travelHistory.length > 0) {
    const recentTrips = travelHistory.slice(0, 3);
    personalizedInfo += `\n\nUSER'S TRAVEL HISTORY (for personalized suggestions):`;
    recentTrips.forEach(trip => {
      personalizedInfo += `\n- ${trip.destination || trip.title} (${trip.date || 'recent'})`;
    });
    personalizedInfo += `\nUse this history to suggest SIMILAR or COMPLEMENTARY destinations they haven't visited.`;
  }

  // Add current page context (2.3)
  if (currentPage && PLATFORM_PAGES[currentPage]) {
    personalizedInfo += `\n\nUSER'S CURRENT LOCATION: ${PLATFORM_PAGES[currentPage].name} page`;
  }

  return `You are PothChola AI, an intelligent and friendly travel assistant for Bangladesh.

YOUR CORE CAPABILITIES:
1. **Personalized Recommendations (2.1)**: Suggest destinations based on user's travel history and interests
2. **Platform Expertise (2.2)**: Answer questions about ALL website features and sections
3. **Navigation Guide (2.3)**: Help users navigate to different platform areas with clear directions
4. **Real-time Travel Info (2.4)**: Provide current travel tips, weather, safety info
5. **Engaging Conversation (2.5)**: Be dynamic, remember context, ask follow-up questions

AVAILABLE PLATFORM SECTIONS (for navigation guidance):
- Home: Main page with featured content
- Destinations: Browse and book travel packages
- Friends: Connect with other travelers
- Community: Share posts, photos, and stories
- Group Events: Join or create group tours
- Rewards: View points and tier perks (Bronze/Silver/Gold)
- My Trips: Track travel history
- Interactive Map: Explore 64 districts
- Local Guides: Hire verified guides
- Culture & Food: Local cuisine and traditions
- Profile: Personal settings and info

NAVIGATION INSTRUCTIONS:
When users want to go somewhere, tell them: "You can find [feature] in the **[Page Name]** section. Click on '[Page Name]' in the navigation menu at the top."

BANGLADESH DESTINATIONS:
- Beaches: Cox's Bazar (world's longest beach), Saint Martin Island
- Hills: Sajek Valley, Bandarban, Rangamati, Khagrachhari
- Nature: Sundarbans (mangroves), Ratargul (swamp forest), Lawachara
- Heritage: Paharpur, Mahasthangarh, Lalbagh Fort, Ahsan Manzil
- Tea: Sylhet, Sreemangal (tea capital)
${personalizedInfo}

RESPONSE STYLE:
- Be friendly and enthusiastic with emojis
- Keep responses concise (2-4 sentences) but informative
- For navigation, give CLEAR step-by-step directions
- For recommendations, PERSONALIZE based on user context
- Ask engaging follow-up questions to keep conversation going
- If user seems interested in a destination, offer to help them navigate to book it`;
};

// Detect navigation intent and extract page (2.3)
export const detectNavigationIntent = (message) => {
  const msg = message.toLowerCase();

  const navigationPatterns = {
    'destinations': ['destination', 'places to visit', 'where to go', 'travel package', 'book trip', 'explore places'],
    'friends': ['friend', 'connect with', 'other travelers', 'find people', 'travel buddy'],
    'community': ['community', 'post', 'share story', 'share photo', 'what others', 'feed'],
    'group-events': ['group', 'event', 'join tour', 'group trip', 'travel together', 'group travel'],
    'rewards': ['reward', 'point', 'tier', 'badge', 'perk', 'benefit', 'earn'],
    'my-trips': ['my trip', 'trip history', 'past trip', 'travel history', 'where i went'],
    'map': ['map', 'district', 'area', 'region', 'weather', 'safety'],
    'local-guides': ['guide', 'local guide', 'hire guide', 'tour guide'],
    'culture': ['culture', 'food', 'cuisine', 'local food', 'tradition', 'festival'],
    'profile': ['profile', 'my account', 'settings', 'edit profile'],
    'about': ['about', 'what is pothchola', 'about us', 'company']
  };

  for (const [page, patterns] of Object.entries(navigationPatterns)) {
    if (patterns.some(pattern => msg.includes(pattern))) {
      return page;
    }
  }

  // Check for explicit navigation requests
  if (msg.includes('go to') || msg.includes('take me to') || msg.includes('navigate to') || msg.includes('show me') || msg.includes('how do i find') || msg.includes('where is')) {
    for (const [page, info] of Object.entries(PLATFORM_PAGES)) {
      if (msg.includes(page) || msg.includes(info.name.toLowerCase())) {
        return page;
      }
    }
  }

  return null;
};

// Detect personalization requests (2.1)
export const detectPersonalizationRequest = (message) => {
  const msg = message.toLowerCase();
  const patterns = [
    'recommend', 'suggest', 'where should i', 'what should i visit',
    'based on my', 'for me', 'personalized', 'similar to',
    'i like', 'i prefer', 'my interest', 'my style'
  ];
  return patterns.some(p => msg.includes(p));
};

// Main AI Response Function
export const getAIResponse = async (userMessage, userContext = {}, conversationHistory = []) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('⚠️ Gemini API key not set. Using fallback responses.');
    return getFallbackResponse(userMessage, userContext);
  }

  try {
    // Build conversation context (2.5)
    const recentHistory = conversationHistory.slice(-6);
    const conversationText = recentHistory
      .map(msg => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}`)
      .join('\n');

    // Build personalized prompt (2.1)
    const systemPrompt = buildSystemPrompt(userContext);

    const fullPrompt = `${systemPrompt}

${conversationText ? `CONVERSATION HISTORY:\n${conversationText}\n\n` : ''}User: ${userMessage}

Remember to:
1. Be personalized if user context is available
2. Offer navigation help if they seem to be looking for a feature
3. Keep context from the conversation history
4. Be engaging and ask follow-up questions`;

    // Call Gemini API using SDK with fallback (2.4 - Real-time)
    const result = await generateWithFallback((model) =>
      model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      })
    );

    const response = await result.response;
    const aiMessage = response.text();

    if (!aiMessage) {
      throw new Error('No response from Gemini');
    }

    return aiMessage;

  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    return getFallbackResponse(userMessage, userContext);
  }
};

// Enhanced Fallback Responses with personalization
const getFallbackResponse = (userMessage, userContext = {}) => {
  const msg = userMessage.toLowerCase();
  const { user, travelHistory } = userContext;

  // Personalized greeting
  const userName = user?.name ? user.name.split(' ')[0] : '';

  // Navigation detection (2.3)
  const navPage = detectNavigationIntent(msg);
  if (navPage && PLATFORM_PAGES[navPage]) {
    const pageInfo = PLATFORM_PAGES[navPage];
    return `You can find **${pageInfo.name}** in the navigation menu at the top! 👆 Click on it to ${pageInfo.description.toLowerCase()}. Would you like me to tell you more about what you can do there?`;
  }

  // Personalized recommendations (2.1)
  if (detectPersonalizationRequest(msg) && travelHistory && travelHistory.length > 0) {
    const visitedPlaces = travelHistory.map(t => t.destination || t.title).join(', ');
    return `Based on your visits to ${visitedPlaces}, I'd recommend trying somewhere new! 🌟 If you enjoyed beaches, try Saint Martin Island. If you loved hills, Bandarban is amazing! What type of experience are you looking for?`;
  }

  // Destination queries
  if (msg.includes('beach') || msg.includes('cox')) {
    return `🏖️ Cox's Bazar is Bangladesh's crown jewel - the world's longest natural sea beach! Best time: November-March. ${userName ? `${userName}, would` : 'Would'} you like me to help you find packages in the **Destinations** section?`;
  }

  if (msg.includes('hill') || msg.includes('sajek') || msg.includes('bandarban')) {
    return `⛰️ For hill adventures, try Sajek Valley (clouds at your feet!), Bandarban (highest peaks), or Rangamati (lake views)! Perfect for trekking lovers. Want me to navigate you to **Destinations** to explore packages?`;
  }

  if (msg.includes('sundarbans') || msg.includes('mangrove') || msg.includes('tiger')) {
    return `🐯 The Sundarbans is home to the Royal Bengal Tiger and the world's largest mangrove forest! Best: October-March. Book a guided boat tour for safety. Check **Destinations** for Sundarbans packages!`;
  }

  if (msg.includes('sylhet') || msg.includes('tea')) {
    return `🍵 Sylhet is the tea capital of Bangladesh! Visit Jaflong, Ratargul Swamp Forest, and endless tea gardens. The lush green views are Instagram-worthy! Shall I help you explore options?`;
  }

  // Platform features (2.2)
  if (msg.includes('friend') || msg.includes('connect')) {
    return `👥 The **Friends** feature lets you connect with fellow travelers! Send requests, see their trips, and plan together. Click 'Friends' in the top menu or under 'More'. Want to check it out?`;
  }

  if (msg.includes('community') || msg.includes('post') || msg.includes('share')) {
    return `📸 **Community** is your travel social feed! Share stories, post photos, and engage with others. Find it in the navigation under 'Community'. It's like Instagram for Bangladesh travel!`;
  }

  if (msg.includes('group') || msg.includes('event') || msg.includes('tour')) {
    return `🎉 **Group Events** lets you join or create group tours! Perfect for solo travelers wanting company. Go to 'More' → 'Group Events' in the menu. Ready to find a group?`;
  }

  if (msg.includes('reward') || msg.includes('point') || msg.includes('tier')) {
    return `🏆 Earn **Rewards** by posting, reviewing, and traveling! Unlock Bronze → Silver → Gold tiers for exclusive perks. Check your progress in 'More' → 'Rewards'. ${userName ? `${userName}, you` : 'You'}'re on your way! 🌟`;
  }

  if (msg.includes('map') || msg.includes('district')) {
    return `🗺️ Our **Interactive Map** lets you explore all 64 districts! See weather, safety ratings, and attractions. Find it under 'More' → 'Interactive Map'. Which region interests you?`;
  }

  if (msg.includes('guide') || msg.includes('local')) {
    return `🧭 **Local Guides** connects you with verified locals who know hidden gems! Go to 'More' → 'Local Guides' to browse and book. They make your trip unforgettable!`;
  }

  if (msg.includes('book') || msg.includes('package')) {
    return `📦 To book a travel package, go to **Destinations** in the top menu! Browse curated packages from trusted agencies and book directly. Want me to tell you about popular destinations?`;
  }

  // General queries
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hello${userName ? ` ${userName}` : ''}! 👋 I'm your PothChola AI assistant! I can help you discover destinations, navigate the platform, or plan your next trip. What would you like to explore today?`;
  }

  if (msg.includes('help') || msg.includes('what can you')) {
    return `I'm here to help you with:\n🗺️ Destination recommendations\n🧭 Platform navigation\n👥 Features like Friends, Community, Events\n🏆 Rewards and tips\n\nWhat catches your interest${userName ? `, ${userName}` : ''}?`;
  }

  if (msg.includes('thank')) {
    return `You're welcome${userName ? `, ${userName}` : ''}! 😊 Happy to help anytime. Is there anything else you'd like to know about traveling in Bangladesh or using PothChola?`;
  }

  // Default engaging response (2.5)
  return `Great question! 🌟 I can help you explore Bangladesh destinations like Cox's Bazar, Sundarbans, or Sylhet, and guide you through PothChola's features. What interests you more - finding a destination or learning about a feature${userName ? `, ${userName}` : ''}?`;
};

export { getFallbackResponse };
