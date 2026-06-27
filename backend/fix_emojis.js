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
    '../my-app/src/components/pages/TripPlannerPage.jsx',
    '../my-app/src/services/chatbotService.js'
];

const emojiMap = {
    '👋': 'Hand',
    '✨': 'Sparkles',
    '🔄': 'RefreshCw',
    '🏖': 'Umbrella',
    '⛰': 'Mountain',
    '🧭': 'Compass',
    '🏆': 'Trophy',
    '✕': 'X',
    '🚌': 'Bus',
    '🚆': 'Train',
    '🚗': 'Car',
    '✈': 'Plane',
    '🛺': 'Navigation',
    '👍': 'ThumbsUp',
    '❤': 'Heart',
    '😮': 'Smile',
    '😂': 'Smile',
    '🌟': 'Star',
    '💬': 'MessageSquare',
    '📤': 'Upload',
    '📷': 'Camera',
    '📑': 'FileText',
    '📢': 'Megaphone',
    '📰': 'Newspaper',
    '🔥': 'Flame',
    '❓': 'HelpCircle',
    '📖': 'BookOpen',
    '🎉': 'PartyPopper',
    '💼': 'Briefcase',
    '🏔': 'Mountain',
    '🏛': 'Landmark',
    '👨': 'User',
    '👩': 'User',
    '👧': 'User',
    '👦': 'User',
    '🍽': 'Utensils',
    '🏨': 'Hotel',
    '🌲': 'TreePine',
    '🛍': 'ShoppingBag',
    '🎊': 'PartyPopper',
    '📅': 'Calendar',
    '✅': 'CheckCircle2',
    '📊': 'BarChart3',
    '✓': 'Check',
    '🍳': 'CookingPot',
    '🎒': 'Backpack',
    '💰': 'Coins',
    '⚠': 'AlertTriangle',
    '❌': 'XCircle',
    '👆': 'Pointer',
    '🐯': 'Cat',
    '🍵': 'Coffee',
    '👥': 'Users',
    '📸': 'Camera',
    '🗺': 'Map',
    '📦': 'Package',
    '😊': 'Smile'
};

files.forEach(relativePath => {
    const fullPath = path.resolve(__dirname, relativePath);
    if (!fs.existsSync(fullPath)) return;

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    const iconsToAdd = new Set();
    const isJsx = fullPath.endsWith('.jsx');

    for (const [emoji, icon] of Object.entries(emojiMap)) {
        if (content.includes(emoji)) {
            modified = true;
            if (isJsx) {
                iconsToAdd.add(icon);
                const replacement = `<${icon} size={18} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 4px' }} />`;
                content = content.split(emoji).join(replacement);
            } else {
                content = content.split(emoji).join(''); // Remove emojis from JS files
            }
        }
    }

    if (modified && isJsx && iconsToAdd.size > 0) {
        const importMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
        if (importMatch) {
            const existingIcons = importMatch[1].split(',').map(s => s.trim());
            iconsToAdd.forEach(icon => {
                if (!existingIcons.includes(icon)) existingIcons.push(icon);
            });
            const newImport = `import { ${existingIcons.join(', ')} } from 'lucide-react'`;
            content = content.replace(importMatch[0], newImport);
        } else {
            const newImport = `import { ${Array.from(iconsToAdd).join(', ')} } from 'lucide-react';\n`;
            const lastImportIdx = content.lastIndexOf('import ');
            if (lastImportIdx !== -1) {
                const nextLineIdx = content.indexOf('\\n', lastImportIdx) + 1;
                content = content.slice(0, nextLineIdx) + newImport + content.slice(nextLineIdx);
            } else {
                content = newImport + content;
            }
        }
    }

    if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated emojis in ${relativePath}`);
    }
});
