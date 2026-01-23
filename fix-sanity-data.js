import { createClient } from '@sanity/client';
import fs from 'fs';

// Simple .env.local parser
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
});

const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    useCdn: false,
    apiVersion: '2024-11-24',
    token: env.NEXT_PUBLIC_SANITY_TOKEN,
});

async function fixData() {
    try {
        console.log('Fetching posts...');
        const posts = await client.fetch('*[_type == "blogPost"]{_id, title, language}');

        for (const post of posts) {
            const shouldBeEn = !post._id.endsWith('-ar');
            const isAr = post.language === 'ar';
            const isNull = !post.language;

            if (shouldBeEn && (isAr || isNull)) {
                console.log(`Fixing "${post.title}" -> setting language to "en"`);
                await client.patch(post._id).set({ language: 'en' }).commit();
            } else {
                console.log(`Skipping "${post.title}" (Language: ${post.language})`);
            }
        }
        console.log('Done!');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

fixData();
