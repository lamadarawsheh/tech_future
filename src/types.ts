// types.ts - Sanity CMS Schema Types for Practical AI Blog

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
    url?: string;
  };
  alt?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
}

export type SlugObject = {
  _type: 'slug';
  current: string;
};

export type Slug = SlugObject | string;

export function getSlug(slug: Slug | undefined, fallback: string = ''): string {
  if (!slug) return fallback;
  return typeof slug === 'string' ? slug : slug.current || fallback;
}

export interface Author {
  _id: string;
  _type: 'author';
  name: string;
  slug: Slug;
  image?: SanityImage | string;
  bio?: any[]; // Portable Text
  social?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
}

export interface Category {
  _id: string;
  _type: 'category';
  title: string;
  slug: Slug;
  description?: string;
  color?: 'red' | 'blue' | 'green' | 'purple' | 'pink' | 'yellow';
}

export interface Subscriber {
  _id: string;
  _type: 'subscriber';
  name: string;
  email: string;
  avatar?: SanityImage;
  avatarUrl?: string;
  isSubscribed: boolean;
  subscribedAt?: string;
  subscriptionExpiry?: string;
  subscriptionTier: 'free' | 'basic' | 'premium';
  createdAt: string;
}

export interface Comment {
  _id: string;
  _type: 'comment';
  subscriber: Subscriber;
  post: { _ref: string };
  content: string;
  parentComment?: { _ref: string };
  approved?: boolean;
  featured: boolean;
  createdAt: string;
  editedAt?: string;
}

export interface Like {
  _id: string;
  _type: 'like';
  subscriber: { _ref: string };
  post: { _ref: string };
  createdAt: string;
}

export interface BlogPost {
  _id: string;
  _type: 'blogPost';
  title: string;
  slug: Slug;
  excerpt?: string;
  content: any[]; // Portable Text with code blocks and images
  categories?: Category[];
  readingTime: number;
  author: Author;
  publishedDate: string;
  updatedDate?: string;
  tags?: string[];
  featured: boolean;
  language?: string;
  image?: SanityImage | string;
  // Engagement fields
  viewCount: number;
  likeCount: number;
  commentCount: number;
  allowComments: boolean;
}

// Helper type for image URLs (after processing)
export interface ProcessedBlogPost extends Omit<BlogPost, 'image' | 'author'> {
  image?: string;
  author: Omit<Author, 'image'> & { image?: string };
}
