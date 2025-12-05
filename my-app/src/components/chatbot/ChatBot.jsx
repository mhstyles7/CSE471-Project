import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, Navigation, MapPin } from 'lucide-react';
import { getAIResponse, detectNavigationIntent, PLATFORM_PAGES } from '../../services/chatbotService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useCurrentPage } from '../../context/NavigationContext';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedNavigation, setSuggestedNavigation] = useState(null);
  const messagesEndRef = useRef(null);

  // Get user context for personalization (2.1)
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const currentPage = useCurrentPage();

  // Mock travel history - in production, fetch from API/context
  const [travelHistory] = useState([
    { destination: "Cox's Bazar", date: "2024-03" },
    { destination: "Sylhet", date: "2024-01" },
    { destination: "Sundarbans", date: "2023-11" }
  ]);

  // Initial personalized greeting (2.1, 2.5)
  useEffect(() => {
    const greeting = isAuthenticated && user?.name
      ? `Hi ${user.name.split(' ')[0]}! 👋 I'm your PothChola AI assistant. Based on your travel history, I can give you personalized recommendations! What would you like to explore today - new destinations, platform features, or tips for your next trip?`
      : "Hi there! 👋 I'm your PothChola AI travel assistant. I can help you discover amazing destinations in Bangladesh, navigate the platform, or answer any questions. What would you like to explore today? 🇧🇩";

    setMessages([{ text: greeting, isUser: false }]);
  }, [isAuthenticated, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Handle navigation action (2.3)
  const handleNavigate = (page) => {
    navigate(page);
    setSuggestedNavigation(null);
    setMessages(prev => [...prev, {
      text: `Taking you to ${PLATFORM_PAGES[page]?.name || page}... ✨`,
      isUser: false,
      isSystem: true
    }]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText;
    setInputText("");
    setSuggestedNavigation(null);
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      // Build user context for personalization (2.1)
      const userContext = {
        user: isAuthenticated ? user : null,
        travelHistory: isAuthenticated ? travelHistory : [],
        currentPage: currentPage
      };

      // Check for navigation intent (2.3)
      const navIntent = detectNavigationIntent(userMessage);
      if (navIntent) {
        setSuggestedNavigation(navIntent);
      }

      // Get AI response with context and history (2.4, 2.5)
      const aiResponse = await getAIResponse(userMessage, userContext, messages);
      setMessages(prev => [...prev, { text: aiResponse, isUser: false }]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages(prev => [...prev, {
        text: "I'm having trouble connecting right now. Please try again in a moment! 🔄",
        isUser: false,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick action buttons for common queries (2.5 - engagement)
  const quickActions = [
    { label: "🏖️ Beach destinations", query: "Suggest beach destinations" },
    { label: "⛰️ Hill stations", query: "Tell me about hill stations" },
    { label: "🧭 How to navigate", query: "How do I navigate this website?" },
    { label: "🏆 Rewards info", query: "Tell me about rewards" }
  ];

  const handleQuickAction = (query) => {
    setInputText(query);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: 1000,
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 24px rgba(5, 150, 105, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: 'bounce 2s infinite',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(-5deg)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(5, 150, 105, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(5, 150, 105, 0.4)';
          }}
        >
          <Bot size={32} strokeWidth={2.5} />
          <Sparkles size={14} style={{ position: 'absolute', top: '-2px', left: '-2px', color: '#fbbf24' }} />
          {/* Notification Dot */}
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '16px',
            height: '16px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            border: '2px solid white'
          }} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: '400px',
          height: '650px',
          backgroundColor: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #059669, #0d9488)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)'
              }}>
                <Bot size={26} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', fontFamily: 'Poppins, sans-serif' }}>
                  PothChola AI
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', opacity: 0.9 }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#4ade80', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                  {isAuthenticated ? `Helping ${user?.name?.split(' ')[0] || 'you'}` : 'Online & Ready'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              <X size={22} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            backgroundColor: '#f9fafb',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  animation: 'slideUp 0.3s ease-out'
                }}
              >
                {!msg.isUser && (
                  <span style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    marginLeft: '12px',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Sparkles size={10} />
                    AI Assistant
                  </span>
                )}
                <div style={{
                  padding: '14px 18px',
                  borderRadius: msg.isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  backgroundColor: msg.isUser ? '#059669' : msg.isSystem ? '#e0f2fe' : 'white',
                  color: msg.isUser ? 'white' : msg.isError ? '#dc2626' : '#1f2937',
                  boxShadow: msg.isUser ? '0 4px 12px rgba(5, 150, 105, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  border: msg.isUser ? 'none' : '1px solid #e5e7eb',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Navigation Suggestion Button (2.3) */}
            {suggestedNavigation && PLATFORM_PAGES[suggestedNavigation] && (
              <div style={{ animation: 'slideUp 0.3s ease-out' }}>
                <button
                  onClick={() => handleNavigate(suggestedNavigation)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 18px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Navigation size={18} />
                  Go to {PLATFORM_PAGES[suggestedNavigation].name}
                  <MapPin size={16} />
                </button>
              </div>
            )}

            {isLoading && (
              <div style={{ alignSelf: 'flex-start', animation: 'slideUp 0.3s ease-out' }}>
                <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={10} />
                  AI is thinking...
                </span>
                <div style={{
                  padding: '14px 20px',
                  borderRadius: '20px 20px 20px 4px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  gap: '6px'
                }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#059669', borderRadius: '50%', animation: 'bounce 1s infinite 0s' }} />
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#059669', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }} />
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#059669', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (2.5 - Engagement) */}
          {messages.length <= 1 && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#f0fdf4',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.query)}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '20px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = 'inherit';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              borderTop: '1px solid #f3f4f6',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me anything about travel..."
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '24px',
                border: '2px solid #e5e7eb',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: '#f9fafb'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#059669';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: inputText.trim() && !isLoading ? '#059669' : '#e5e7eb',
                color: 'white',
                border: 'none',
                cursor: inputText.trim() && !isLoading ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: inputText.trim() && !isLoading ? '0 4px 12px rgba(5, 150, 105, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (inputText.trim() && !isLoading) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = inputText.trim() && !isLoading ? '0 4px 12px rgba(5, 150, 105, 0.3)' : 'none';
              }}
            >
              <Send size={20} strokeWidth={2.5} style={{ marginLeft: '2px' }} />
            </button>
          </form>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}