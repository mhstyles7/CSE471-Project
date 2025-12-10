const http = require('http');

function request(path, method, data) {
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

        if (data) {
            options.headers['Content-Length'] = Buffer.byteLength(data);
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: body });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (data) {
            req.write(data);
        }
        req.end();
    });
}

async function test() {
    try {
        console.log('Testing Root...');
        const root = await request('/', 'GET');
        console.log('Root:', root);

        const email = `test${Date.now()}@example.com`;
        const password = 'password123';

        console.log('Testing Register...');
        const registerData = JSON.stringify({
            name: 'Test User',
            email: email,
            password: password
        });
        const regRes = await request('/api/auth/register', 'POST', registerData);
        console.log('Register Response:', regRes);

        console.log('Testing Login...');
        const loginData = JSON.stringify({
            email: email,
            password: password
        });
        const loginRes = await request('/api/auth/login', 'POST', loginData);
        console.log('Login Response:', loginRes);

    } catch (e) {
        console.error('Error:', e);
    }
}

test();
