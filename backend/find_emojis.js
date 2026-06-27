const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'my-app', 'src');

const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(file, 'utf8');
            if (emojiRegex.test(content)) {
                results.push(file);
            }
        }
    });
    return results;
}

const filesWithEmojis = walkDir(srcDir);
console.log(filesWithEmojis.map(f => f.replace(srcDir, '')).join('\n'));
