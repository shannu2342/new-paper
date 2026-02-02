const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function addDemoNews() {
    const loginResponse = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'admin',
            password: 'admin123'
        })
    });

    const loginData = await loginResponse.json();
    if (!loginData.token) {
        console.error('Login failed');
        return;
    }

    const token = loginData.token;
    const categories = ['home', 'amaravati', 'ap', 'international', 'national', 'editorial', 'sports', 'cinema', 'special', 'other'];

    for (const category of categories) {
        console.log(`Adding demo news to ${category} category...`);

        // For special category, add subcategories
        if (category === 'special') {
            const subcategories = ['health', 'women', 'devotional', 'crime'];
            for (const subcategory of subcategories) {
                await addArticle(token, category, subcategory);
            }
        } else {
            await addArticle(token, category);
        }
    }

    console.log('Demo news added successfully!');
}

async function addArticle(token, categoryType, otherCategoryKey = null) {
    const responses = await fetch('http://localhost:4000/api/articles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            title: {
                en: `${capitalize(categoryType)} News ${otherCategoryKey ? `(${capitalize(otherCategoryKey)})` : ''}`,
                te: `${capitalize(categoryType)} వార్తలు ${otherCategoryKey ? `(${capitalize(otherCategoryKey)})` : ''}`,
                hi: `${capitalize(categoryType)} समाचार ${otherCategoryKey ? `(${capitalize(otherCategoryKey)})` : ''}`
            },
            content: {
                en: `This is a demo article for the ${categoryType} section. It contains sample content to demonstrate how the news system works.`,
                te: `ఈ ${categoryType} విభాగానికి ఉదాహరణ వార్త. వార్తల నిర్వహణ వ్యవస్థ ఎలా పని చేస్తుందో ప్రదర్శించడానికి నమూనా ప్రదేశం ఉంది.`,
                hi: `यह ${categoryType} खंड के लिए एक डेमो लेख है। यह स्थानीय समाचार प्रणाली को कैसे चलाना है यह प्रदर्शित करने के लिए एक नमूना सामग्री है।`
            },
            summary: {
                en: `Demo article for ${categoryType} section`,
                te: `${categoryType} విభాగానికి ఉదాహరణ వార్త`,
                hi: `${categoryType} खंड के लिए डेमो लेख`
            },
            categoryType,
            otherCategoryKey,
            publishedAt: new Date().toISOString().split('T')[0],
            isBreaking: Math.random() > 0.7,
            isFeatured: Math.random() > 0.8,
            priority: Math.floor(Math.random() * 10),
            images: []
        })
    });

    const data = await responses.json();
    console.log(`Article created: ${data._id}`);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

addDemoNews().catch(console.error);
