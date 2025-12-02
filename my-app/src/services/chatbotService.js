// AI Chatbot Response Logic
export const getAIResponse = (userMessage) => {
  const message = userMessage.toLowerCase();
  
  // Feature 2.1: Personalized trip suggestions
  if (message.includes('destination') || message.includes('suggest') || message.includes('recommend') || message.includes('where')) {
    return "Based on your interests, I'd recommend exploring Cox's Bazar for beaches, Sundarbans for nature, or Sylhet for tea gardens. Which type of destination interests you most?";
  } 
  
  // Feature 2.2: Answer questions about features
  else if (message.includes('feature') || message.includes('how to') || message.includes('help') || message.includes('what can')) {
    return "PothChola offers many features: Trip Planning, Interactive Maps, Community Posts, Friend Connections, Travel Points & Rewards, and Agency Packages. What would you like to explore?";
  } 
  
  // Feature 2.2: Friends feature explanation
  else if (message.includes('friend') || message.includes('social') || message.includes('connect')) {
    return "You can connect with fellow travelers through our Friends section! Send friend requests, view travel activities, and plan group trips together. Go to the Friends page to get started.";
  } 
  
  // Feature 2.3: Navigation guidance - Map
  else if (message.includes('map') || message.includes('location') || message.includes('district')) {
    return "Our Interactive Map feature lets you explore districts, check weather forecasts, view your travel timeline, and get AI-based safety insights for any location. Click on 'Destinations' to explore!";
  } 
  
  // Feature 2.3: Navigation guidance - Community
  else if (message.includes('post') || message.includes('community') || message.includes('share')) {
    return "Visit the Community page to share your travel stories, photos, and recommendations! You can also comment on and react to other travelers' posts. Click 'Community' in the navigation.";
  } 
  
  // Feature 2.3: Navigation guidance - Group Events
  else if (message.includes('group') || message.includes('event') || message.includes('tour')) {
    return "Want to organize a group trip? Go to the 'Group Events' page where you can create events, invite friends, and plan collaborative tours together!";
  } 
  
  // Feature 2.4: Travel information - Points/Rewards
  else if (message.includes('point') || message.includes('reward') || message.includes('tier')) {
    return "Earn travel points by posting trips, writing reviews, and joining events! Progress through Bronze, Silver, and Gold tiers to unlock exclusive rewards. Check your Rewards page to see your current status.";
  } 
  
  // Feature 2.4: Real-time info - Weather
  else if (message.includes('weather') || message.includes('safe') || message.includes('climate')) {
    return "I can provide real-time weather updates and safety insights for any district in Bangladesh. Which area are you planning to visit? (Note: Full weather integration coming soon!)";
  } 
  
  // Feature 2.1: Trip history based suggestions
  else if (message.includes('history') || message.includes('past trip') || message.includes('been to')) {
    return "I can see your travel history! You've visited Cox's Bazar and Sylhet. Based on that, I'd recommend trying Rangamati for hill tracts or Sundarbans for mangrove forests. Want details?";
  }
  
  // Feature 2.5: Dynamic engagement - Getting started
  else if (message.includes('start') || message.includes('begin') || message.includes('new')) {
    return "Welcome! Let's get you started. First, complete your profile, then explore destinations on the map. You can also join the community to connect with other travelers. What interests you most?";
  }
  
  // Default engaging response
  else {
    return "That's interesting! I can help you with trip suggestions, navigation guidance, feature explanations, or travel planning. Try asking me about destinations, features, friends, community, or rewards!";
  }
};

// Future: This will connect to your backend API
export const sendMessageToBackend = async (message, userId) => {
  try {
    const response = await fetch('http://localhost:5000/api/chatbot/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        message,
        userId,
        timestamp: new Date()
      })
    });
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Chatbot API error:', error);
    return getAIResponse(message); // Fallback to local responses
  }
};