const http = require('http');

function makeRequest(path, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, data: data });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function test() {
    console.log('Testing Backend Health...');
    try {
        const health = await makeRequest('/', 'GET');
        console.log('Health Check:', health);
    } catch (e) {
        console.error('Health Check Failed:', e.message);
    }

    console.log('\nTesting Login...');
    try {
        const login = await makeRequest('/api/auth/login', 'POST', {
            email: 'test@example.com',
            password: 'wrongpassword'
        });
        console.log('Login Response:', login);
    } catch (e) {
        console.error('Login Request Failed:', e.message);
    }
}

test();
