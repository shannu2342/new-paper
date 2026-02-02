const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function login() {
    try {
        const response = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });

        const data = await response.json();
        console.log('Login response:', data);

        if (data.token) {
            console.log('Login successful!');
            console.log('Token:', data.token);

            // Test hero images endpoint
            const heroResponse = await fetch('http://localhost:4000/api/hero-images', {
                headers: {
                    'Authorization': `Bearer ${data.token}`
                }
            });

            const heroData = await heroResponse.json();
            console.log('Hero images:', heroData);
        } else {
            console.log('Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

login();
