import { BlogPost, Category } from '../types';

/**
 * AI Translation Service
 * Uses the Groq API to translate Sanity content on the fly.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Simple in-memory cache to avoid redundant API calls
const translationCache = new Map<string, any>();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAI(prompt: string, retries = 3): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
        console.warn('NEXT_PUBLIC_GROQ_API_KEY is not set. AI translation is disabled.');
        return '';
    }

    try {
        // Add a significant delay between requests to strictly respect the 30 RPM limit (1 request every 2 seconds)
        await sleep(2100);

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional translator. You translate technical content accurately while maintaining the original meaning and technical terms. Return ONLY the translated text or JSON as requested.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
            }),
        });

        if (response.status === 429) {
            if (retries > 0) {
                const waitTime = (5 - retries) * 3000; // Increased wait time
                console.warn(`Rate limit hit. Retrying in ${waitTime}ms...`);
                await sleep(waitTime);
                return await fetchAI(prompt, retries - 1);
            }
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`AI Translation failed: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    } catch (error) {
        if (retries > 0 && error instanceof Error && error.message.includes('rate_limit_exceeded')) {
            await sleep(2000);
            return await fetchAI(prompt, retries - 1);
        }
        throw error;
    }
}

/**
 * Translates a single string
 */
export async function translateText(text: string, targetLang: string = 'ar'): Promise<string> {
    if (!text || targetLang === 'en') return text;

    const cacheKey = `text_${targetLang}_${text}`;
    if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

    try {
        const prompt = `Translate this text to ${targetLang === 'ar' ? 'Arabic' : 'English'}. Preserve formatting and emojis.\n\nText: ${text}`;
        const translated = await fetchAI(prompt);
        if (translated) {
            translationCache.set(cacheKey, translated);
            return translated;
        }
        return text;
    } catch (error) {
        console.error('Text translation error:', error);
        return text;
    }
}

/**
 * Deeply translates an object by finding string values and translating them.
 * This is used for Portable Text and other nested structures.
 */
async function translateDeep(obj: any, targetLang: string): Promise<any> {
    if (!obj) return obj;
    if (typeof obj === 'string') {
        if (obj.length < 2) return obj; // Skip tiny strings/chars
        return await translateText(obj, targetLang);
    }
    if (Array.isArray(obj)) {
        // Sequential translation to respect rate limits
        const results = [];
        for (const item of obj) {
            results.push(await translateDeep(item, targetLang));
        }
        return results;
    }
    if (typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            // Skip keys that shouldn't be translated (Sanity meta keys, IDs, types, assets)
            if (['_id', '_type', '_ref', 'slug', 'image', 'asset', 'publishedDate', 'readingTime', 'viewCount', 'likeCount', 'commentCount', 'color'].includes(key)) {
                result[key] = obj[key];
            } else {
                result[key] = await translateDeep(obj[key], targetLang);
            }
        }
        return result;
    }
    return obj;
}

/**
 * Translates a blog post object
 */
export async function translatePost(post: BlogPost, targetLang: string = 'ar'): Promise<BlogPost> {
    if (targetLang === 'en' || !post) return post;

    const cacheKey = `post_${targetLang}_${post._id}`;
    if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

    try {
        // Translate title and excerpt first for speed/priority
        const basicData = {
            title: post.title,
            excerpt: post.excerpt,
        };

        const prompt = `Translate the following JSON values to ${targetLang === 'ar' ? 'Arabic' : 'English'}. Keep the keys exactly the same. Return ONLY the JSON.\n\n${JSON.stringify(basicData)}`;

        const resultText = await fetchAI(prompt);
        const cleanedJson = resultText.replace(/```json|```/g, '').trim();
        const translatedBasic = JSON.parse(cleanedJson);

        // Translate the full content body (Portable Text)
        // This is a bit slower but makes the whole article translated
        let translatedContent = post.content;
        if (post.content && post.content.length > 0) {
            translatedContent = await translateDeep(post.content, targetLang);
        }

        const translatedPost = {
            ...post,
            title: translatedBasic.title || post.title,
            excerpt: translatedBasic.excerpt || post.excerpt,
            content: translatedContent,
            isTranslated: true
        };

        translationCache.set(cacheKey, translatedPost);
        return translatedPost;
    } catch (error) {
        console.error('Post translation error:', error);
        return post;
    }
}

/**
 * Translates an array of posts
 */
export async function translatePosts(posts: BlogPost[], targetLang: string = 'ar'): Promise<BlogPost[]> {
    if (targetLang === 'en') return posts;

    // Process sequentially to be kind to the rate limit
    const translatedPosts: BlogPost[] = [];
    for (const post of posts) {
        const translated = await translatePost(post, targetLang);
        translatedPosts.push(translated);
    }
    return translatedPosts;
}
