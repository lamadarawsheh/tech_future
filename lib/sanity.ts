import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn: true,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2024-11-24',
  token: import.meta.env.VITE_SANITY_TOKEN, // Optional: only if you need to write data
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  if (!source) return 'https://placehold.co/800x600?text=No+Image'; // Fallback
  return builder.image(source).url();
}