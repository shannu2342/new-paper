const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_URL = 'http://localhost:4000/api';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NzM4M2MxOGM4MzM1NjlmN2M3YmU4MCIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzAwMjQ1NDMsImV4cCI6MTc3MDA2Nzc0M30.S9VGEyL6F0Aspni1-JLZRvXhKMUOefFj8U7adPDoH5s';

async function deleteOldHeroImages() {
    try {
        // Get all hero images
        const listResponse = await fetch(`${API_URL}/hero-images`);
        const heroImages = await listResponse.json();

        console.log('Current hero images:', heroImages);

        // Delete images with old placeholder URLs
        for (const image of heroImages) {
            if (image.imageUrl === 'https://example.com/image.jpg') {
                console.log('Deleting old hero image:', image._id);
                const deleteResponse = await fetch(`${API_URL}/hero-images/${image._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (deleteResponse.ok) {
                    console.log('Successfully deleted:', image._id);
                } else {
                    console.error('Failed to delete:', image._id, deleteResponse.statusText);
                }
            }
        }

        // List remaining images
        const finalListResponse = await fetch(`${API_URL}/hero-images`);
        const finalHeroImages = await finalListResponse.json();
        console.log('Remaining hero images:', finalHeroImages);

    } catch (error) {
        console.error('Error deleting old hero images:', error);
    }
}

deleteOldHeroImages();
