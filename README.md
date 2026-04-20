# 🚀 PothChola - Your Ultimate Travel Companion

**PothChola** is a comprehensive travel assistant application designed to revolutionize the tourism experience in Bangladesh. It connects travelers with destinations, local guides, and a vibrant community of explorers. From AI-powered recommendations to seamless booking and social sharing, PothChola makes every journey unforgettable.

## ✨ Key Features

*   **🔐 Secure Authentication**: User registration and login with simulated session management and Google OAuth support.
*   **🌍 Destination Guides**: Detailed information on popular spots like Cox's Bazar, Sylhet, Sundarbans, and more.
*   **🤖 AI Chatbot**: Integrated **Gemini AI** powered assistant ("PothChola AI") for real-time travel advice and navigation.
*   **🗺️ Interactive Maps**: detailed maps with **Leaflet**, featuring heatmaps, route estimation, and safety zones.
*   **👥 Social Community**: Connect with friends, share travel stories, and organize group events.
*   **🎁 Rewards System**: Gamified experience with points, tiers (Bronze/Silver/Gold), and exclusive perks.
*   **🏨 Service Booking**: Integrated booking system for hotels, food, and custom travel packages.
*   **🌤️ Real-time Updates**: Weather information and safety alerts for all 64 districts.

## 🛠️ Tech Stack

### Frontend uses:
*   **React.js**: Core UI library.
*   **Leaflet & React-Leaflet**: Interactive maps.
*   **Framer Motion**: Smooth animations and transitions.
*   **Lucide React**: Modern iconography.
*   **Google Gemini API**: AI Chatbot intelligence.

### Backend uses:
*   **Node.js & Express.js**: RESTful API server.
*   **MongoDB**: NoSQL database for flexible data storage.
*   **Nodemailer**: Email services for notifications and welcomes.
*   **Multer**: Handling file uploads.

## 📂 Project Structure

```bash
PothChola/
├── backend/            # Express.js API Server
│   ├── config/         # Database configuration
│   ├── routes/         # API Endpoints (Auth, Users, Destinations, etc.)
│   ├── uploads/        # Static file uploads
│   └── server.js       # Entry point
│
├── my-app/             # React Frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React Context (Auth, Navigation)
│   │   ├── services/   # API connectors (Chatbot, Weather)
│   │   └── pages/      # Application views
│   └── public/
│
└── README.md           # Project Documentation
```

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   **Node.js** (v14 or higher)
*   **MongoDB** (Local instance or Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/mhstyles7/CSE471-Project.git
cd CSE471-Project
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

**Configuration**: Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_password
CLIENT_URL=http://localhost:3000
```

Start the server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies:
```bash
cd ../my-app
npm install
```

**Configuration**: Create a `.env` file in the `my-app/` directory:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GEMINI_API_KEY=your_google_gemini_api_key
REACT_APP_GEMINI_API_KEY2=your_backup_gemini_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id
REACT_APP_OPENWEATHER_KEY=your_openweather_api_key
```

Start the application:
```bash
npm start
# Application runs on http://localhost:3000
```

## 🤖 AI Chatbot Engine
The project features a sophisticated AI chatbot located in `my-app/src/components/chatbot/ChatBot.jsx`. It utilizes the **Google Generative AI SDK** to provide context-aware responses, including:
*   **Navigation Intent Detection**: Intelligently redirects users to specific pages (e.g., "Take me to rewards").
*   **Personalization**: Tailors suggestions based on user's travel history and profile.
*   **Fallback Logic**: Robust error handling with pre-defined responses if the API is unavailable.

## 🤝 Contributors
*   **[Md. Meheraj Hossain]**
*   **[Nijaf Md. Ahanaf Rivan]** 
*   **[Alimool Razi]** 
*   **[Zarin Tasnim Raisa]** 
---
*Built for CSE471 Project Demonstration*
