const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function accessAdmin() {
    // Login to get token
    const loginResponse = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'admin',
            password: 'admin123'
        })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.token) {
        console.error('Login failed');
        return;
    }

    // Now let's use the token to access protected routes
    console.log('\n--- Testing admin access ---');

    // Test hero images management
    const heroImagesResponse = await fetch('http://localhost:4000/api/hero-images', {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
    });

    const heroImagesData = await heroImagesResponse.json();
    console.log('Hero images:', heroImagesData);

    // Test articles endpoint
    const articlesResponse = await fetch('http://localhost:4000/api/articles?date=2026-02-02', {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
    });

    const articlesData = await articlesResponse.json();
    console.log('Articles:', articlesData);
}

accessAdmin().catch(console.error);
