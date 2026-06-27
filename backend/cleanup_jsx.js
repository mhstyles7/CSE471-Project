const fs = require('fs');
const path = require('path');

const files = [
    '../my-app/src/components/chatbot/ChatBot.jsx',
    '../my-app/src/components/maps/InteractiveMap.jsx',
    '../my-app/src/components/maps/RoutePlanner.jsx',
    '../my-app/src/components/pages/CommunityPage.jsx',
    '../my-app/src/components/pages/CulturePage.jsx',
    '../my-app/src/components/pages/DashboardPage.jsx',
    '../my-app/src/components/pages/GroupEventsPage.jsx',
    '../my-app/src/components/pages/GuideDashboard.jsx',
    '../my-app/src/components/pages/MyTripsPage.jsx',
    '../my-app/src/components/pages/RewardsPage.jsx',
    '../my-app/src/components/pages/TripPlannerPage.jsx'
];

files.forEach(relativePath => {
    const fullPath = path.resolve(__dirname, relativePath);
    if (!fs.existsSync(fullPath)) return;

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // We want to fix the following patterns:
    // 1. label: '<Icon ... /> text' -> label: <><Icon ... /> text</>
    // 2. emoji: '<Icon ... />' -> emoji: <Icon ... />
    // 3. showNotificationMsg('... <Icon ... />') -> strip the <Icon ... /> from the string.
    
    // Fix showNotificationMsg
    // Example: showNotificationMsg(`Successfully redeemed: ${reward.name}! <PartyPopper ... />`)
    content = content.replace(/showNotificationMsg\(([`'"])(.*?)(<[A-Z][a-zA-Z]+ size=\{18\}.*?\/>)(.*?)\1(?:,\s*['"][^'"]*['"])?\);/g, (match, quote, before, icon, after) => {
        // Just strip the icon from the notification message
        return match.replace(icon, '').trim();
    });
    
    content = content.replace(/showNotificationMsg\(([`'"])(.*?)(<[A-Z][a-zA-Z]+ size=\{18\}.*?\/>)(.*?)\1(?:,\s*['"][^'"]*['"])?\)/g, (match, quote, before, icon, after) => {
        // Just strip the icon from the notification message
        return match.replace(icon, '').trim();
    });
    
    // Fix alert
    content = content.replace(/alert\(([`'"])(.*?)(<[A-Z][a-zA-Z]+ size=\{18\}.*?\/>)(.*?)\1\);/g, (match, quote, before, icon, after) => {
        return match.replace(icon, '').trim();
    });

    // Fix labels and categories
    // For example: { id: 'feed', label: '<Newspaper ... /> Feed' }
    // Needs to become: { id: 'feed', label: <><Newspaper ... /> Feed</> }
    content = content.replace(/(label|emoji|leisure|business|adventure|cultural|family):\s*[`'"](<[A-Z][a-zA-Z]+ size=\{18\}.*?\/>.*?)[`'"]/g, '$1: <>$2</>');
    
    // For mapping like `category === 'family' && "<User ... /> Family"` -> `category === 'family' && <><User ... /> Family</>`
    content = content.replace(/&& ['"](<[A-Z][a-zA-Z]+ size=\{18\}.*?\/>.*?)['"]/g, '&& <>$1</>');
    
    // For return values `return icons[category] || '<Plane ... />';` -> `return icons[category] || <Plane ... />;`
    content = content.replace(/\|\| ['"](<[A-Z][a-zA-Z]+ size=\{18\}.*?\/>.*?)['"]/g, '|| <>$1</>');
    
    // For string concatenation like `? '<CookingPot ... /> Cook with Local' :`
    content = content.replace(/\? ['"](<[A-Z][a-zA-Z]+ size=\{18\}.*?\/>.*?)['"] :/g, '? <>$1</> :');
    content = content.replace(/: ['"](<[A-Z][a-zA-Z]+ size=\{18\}.*?\/>.*?)['"]/g, ': <>$1</>');

    // For option tags `<option value="family"><User ... /> Family</option>` -> This actually works fine in JSX! Wait, `<option>` can only contain strings, not React components. So we need to remove the icon from option tags.
    // option tags removed to prevent crash

    // Chatbot text fields: ChatBot.jsx has `text: "Hi there! <Hand />"`
    content = content.replace(/text:\s*[`'"](.*?)<[A-Z][a-zA-Z]+ size=\{18\}.*?\/>(.*?)[`'"]/g, (match) => {
        return match.replace(/<[A-Z][a-zA-Z]+ size=\{18\}.*?\/>/g, '');
    });
    content = content.replace(/query:\s*[`'"](.*?)<[A-Z][a-zA-Z]+ size=\{18\}.*?\/>(.*?)[`'"]/g, (match) => {
        return match.replace(/<[A-Z][a-zA-Z]+ size=\{18\}.*?\/>/g, '');
    });

    fs.writeFileSync(fullPath, content, 'utf8');
});

console.log("Cleanup complete!");
