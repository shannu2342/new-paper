const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testHeroImages() {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NzM4M2MxOGM4MzM1NjlmN2M3YmU4MCIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzAwMjQ1NDMsImV4cCI6MTc3MDA2Nzc0M30.S9VGEyL6F0Aspni1-JLZRvXhKMUOefFj8U7adPDoH5s';

    // Test creating a hero image
    const createResponse = await fetch('http://localhost:4000/api/hero-images', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            imageUrl: 'https://picsum.photos/seed/hero1/1200/600.jpg',
            title: {
                en: 'Breaking News',
                te: 'బ్రేకింగ్ న్యూస్',
                hi: 'ब्रेकिंग न्यूज'
            },
            order: 0,
            enabled: true
        })
    });

    const createData = await createResponse.json();
    console.log('Create hero image response:', createData);

    // Test listing hero images
    const listResponse = await fetch('http://localhost:4000/api/hero-images');
    const listData = await listResponse.json();
    console.log('Hero images list:', listData);
}

testHeroImages().catch(console.error);
