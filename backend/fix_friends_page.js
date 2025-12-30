const fs = require('fs');
const path = '../my-app/src/components/pages/FriendsPage.jsx';

try {
    let content = fs.readFileSync(path, 'utf8');
    console.log("Original length:", content.length);

    // 1. Add Import if not present
    if (!content.includes("from '../../config';")) {
        content = content.replace(
            "import { useNavigate } from '../../context/NavigationContext';",
            "import { useNavigate } from '../../context/NavigationContext';\nimport { API_URL } from '../../config';"
        );
        console.log("Added API_URL import.");
    }

    // 2. Replace URLs
    // Case A: Backticks (Template Literals) -> `http://localhost:5000...`
    // We just replace the base. The backticks are already there.
    // BUT we must be careful not to double wrap or break.
    // Actually, simply replacing `http://localhost:5000` with `${API_URL}` INSIDE backticks works.

    // Case B: Single/Double Quotes -> 'http://localhost:5000...'
    // These MUST be converted to backticks OR use concatenation.
    // Easiest is to Convert to Backticks.

    // Regex for Single Quotes: 'http://localhost:5000...'
    // Replace with: `${API_URL}...`
    content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, "`\${API_URL}$1`");

    // Regex for Double Quotes: "http://localhost:5000..."
    content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, "`\${API_URL}$1`");

    // Regex for Backticks: `http://localhost:5000...`
    // Since backticks surround the whole string, we just want to replace the substring http://localhost:5000 with ${API_URL}
    // But we must NOT change the outer backticks.
    // If we just use string.replace('http://localhost:5000', '${API_URL}'), it works for backticks content.
    // BUT we already ran regexes for quotes. Now we have everything else (backticks).

    // Safer approach: 
    // Just replace the string literal http://localhost:5000 with ${API_URL} globally?
    // No, because 'http://localhost:5000' becoming '${API_URL}' is bad.
    // The query above replaced the QUOTES too. So 'url' became `url`. 

    // Now handle the existing backticks cases.
    // Existing: `http://localhost:5000/api/posts/${postId}`
    // We want: `${API_URL}/api/posts/${postId}`
    content = content.replace(/`http:\/\/localhost:5000([^`]*)`/g, "`\${API_URL}$1`");

    fs.writeFileSync(path, content, 'utf8');
    console.log("Modified length:", content.length);
    console.log("Successfully fixed FriendsPage.jsx URLs!");

} catch (err) {
    console.error("Error fixing file:", err);
}
