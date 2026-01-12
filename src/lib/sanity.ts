import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Read client (no CDN for real-time data)
export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn: false, // Disabled for real-time view counts
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2024-01-01',
});

// Write client (no CDN, requires token with write permissions)
export const writeClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn: false, // Must be false for mutations
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2024-01-01',
  token: import.meta.env.VITE_SANITY_TOKEN, // Requires Editor/Admin token
  ignoreBrowserTokenWarning: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  if (!source) return 'https://placehold.co/800x600?text=No+Image';
  return builder.image(source).url();
}
