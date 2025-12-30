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
                resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
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
    const testUser = {
        name: 'Test User Agent',
        email: `agent_test_${Date.now()}@example.com`,
        password: 'password123'
    };

    console.log('1. Testing Registration...');
    try {
        const regRes = await makeRequest('/api/auth/register', 'POST', testUser);
        console.log('Registration Status:', regRes.statusCode);
        console.log('Registration Response:', regRes.data);

        if (regRes.statusCode === 201) {
            console.log('\n2. Testing Login with New User...');
            const loginRes = await makeRequest('/api/auth/login', 'POST', {
                email: testUser.email,
                password: testUser.password
            });
            console.log('Login Status:', loginRes.statusCode);
            console.log('Login Response:', loginRes.data);

            if (loginRes.statusCode === 200 && loginRes.data.token || loginRes.data._id) {
                console.log('\nSUCCESS: Backend Login Flow works correctly.');
            } else {
                console.log('\nFAILURE: Login failed despite successful registration.');
            }
        } else {
            console.log('\nSKIPPING LOGIN: Registration failed.');
        }

    } catch (e) {
        console.error('Request Failed:', e.message);
    }
}

test();
