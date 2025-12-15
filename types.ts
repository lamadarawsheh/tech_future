export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
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
  image: string; // Simplified for mock, usually SanityImage
  bio: any[]; // Portable Text
  socialLinks?: Array<{
    platform: 'twitter' | 'github' | 'linkedin';
    url: string;
  }>;
}

export interface Category {
  _id: string;
  _type: 'category';
  title: string;
  slug: Slug;
  description?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export interface CommentUser {
  id: string;
  name: string;
  image?: string;
}

export interface Comment {
  _id: string;
  _type: 'comment';
  _createdAt: string;
  user: CommentUser;
  content: string;
  approved: boolean;
  post: {
    _ref: string;
    _type: 'reference';
  };
  createdAt: string;
}

export interface BlogPost {
  _id: string;
  _type: 'blogPost';
  title: string;
  slug: Slug;
  excerpt: string;
  content: any[]; // Portable Text
  categories: Category[];
  readingTime: number;
  author: Author;
  publishedDate: string;
  updatedDate?: string;
  tags?: string[];
  featured?: boolean;
  image: string; // Simplified for mock
  viewCount: number;
  comments?: Array<{
    _ref: string;
    _type: 'reference';
    _key?: string;
  }>;
  likes?: Array<{
    _ref: string;
    _type: 'reference';
    _key?: string;
  }>;
}