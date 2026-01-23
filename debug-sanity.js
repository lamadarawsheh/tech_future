import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    useCdn: false,
    apiVersion: '2024-01-01',
});

async function checkDocs() {
    try {
        const docs = await client.fetch(`*[_type == "blogPost"][0...10] { _id, title, language }`);
        console.log('Sample documents:');
        console.log(JSON.stringify(docs, null, 2));

        const formats = await client.fetch(`*[_type == "blogPost"] { language }`);
        const uniqueLangs = [...new Set(formats.map(d => d.language))];
        console.log('Unique languages found in DB:', uniqueLangs);
    } catch (err) {
        console.error('Error fetching docs:', err);
    }
}

checkDocs();
