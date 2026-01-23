import { client, writeClient, urlFor } from '../lib/sanity';
import { BlogPost, Author, Category, Comment, Subscriber, Like, getSlug } from '../types';

// Helper to process image URLs
const processImage = (image: any): string => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  if (image.asset?.url) return image.asset.url;
  return urlFor(image);
};

// Helper to normalize slug
const normalizeSlug = (slug: any): string => {
  if (!slug) return '';
  return typeof slug === 'string' ? slug : slug.current || '';
};

// Helper to normalize language code
const normalizeLang = (lang: string = 'en'): string => {
  if (!lang) return 'en';
  return lang.split('-')[0].toLowerCase();
};

// ==================== BLOG POSTS ====================

// Fetch all blog posts (list view)
export const getAllPosts = async (lang: string = 'en'): Promise<BlogPost[]> => {
  const normalizedLang = normalizeLang(lang);
  const query = `*[_type == "blogPost" && (language == $lang || (!defined(language) && $lang == "en"))] | order(publishedDate desc) {
    _id,
    title,
    slug,
    excerpt,
    readingTime,
    publishedDate,
    featured,
    viewCount,
    likeCount,
    commentCount,
    tags,
    "image": image.asset->url,
    "author": author-> { _id, name, slug, "image": image.asset->url },
    "categories": categories[]-> { _id, title, slug, color }
  }`;

  try {
    const result = await client.fetch(query, { lang: normalizedLang });
    return result || [];
  } catch (e) {
    console.error('Error fetching all posts:', e);
    return [];
  }
};

// Fetch featured posts
export const getFeaturedPost = async (lang: string = 'en'): Promise<BlogPost | null> => {
  const normalizedLang = normalizeLang(lang);
  const query = `*[_type == "blogPost" && featured == true && (language == $lang || (!defined(language) && $lang == "en"))] | order(publishedDate desc)[0] {
    _id,
    title,
    slug,
    excerpt,
    readingTime,
    publishedDate,
    featured,
    viewCount,
    likeCount,
    commentCount,
    tags,
    "image": image.asset->url,
    "author": author-> { _id, name, slug, "image": image.asset->url },
    "categories": categories[]-> { _id, title, slug, color }
  }`;

  try {
    const result = await client.fetch(query, { lang: normalizedLang });
    return result || null;
  } catch (e) {
    console.error('Error fetching featured post:', e);
    return null;
  }
};

// Fetch recent posts (non-featured)
export const getRecentPosts = async (limit: number = 10, offset: number = 0, lang: string = 'en'): Promise<BlogPost[]> => {
  const normalizedLang = normalizeLang(lang);
  const start = offset;
  const end = offset + limit;
  const query = `*[_type == "blogPost" && (language == $lang || (!defined(language) && $lang == "en"))] | order(publishedDate desc)[$start...$end] {
    _id,
      title,
    slug,
    excerpt,
    readingTime,
    publishedDate,
    featured,
    viewCount,
    likeCount,
    commentCount,
    tags,
    "image": image.asset->url,
    "author": author-> { _id, name, slug, "image": image.asset->url },
    "categories": categories[]-> { _id, title, slug, color }
  }`;

  try {
    const result = await client.fetch(query, { start, end, lang: normalizedLang });
    return result || [];
  } catch (e) {
    console.error('Error fetching recent posts:', e);
    return [];
  }
};

// Get total count of posts
export const getTotalPostsCount = async (lang: string = 'en'): Promise<number> => {
  const normalizedLang = normalizeLang(lang);
  const query = `count(*[_type == "blogPost" && (language == $lang || (!defined(language) && $lang == "en"))])`;
  try {
    return await client.fetch(query, { lang: normalizedLang });
  } catch (e) {
    console.error('Error fetching posts count:', e);
    return 0;
  }
};

// Fetch single blog post by slug
export const getPostBySlug = async (slug: string, lang: string = 'en'): Promise<BlogPost | null> => {
  if (!slug) {
    console.error('No slug provided to getPostBySlug');
    return null;
  }

  const decodedSlug = decodeURIComponent(slug);
  const normalizedLang = normalizeLang(lang);

  const query = `*[_type == "blogPost" && slug.current == $slug] | order(select(language == $lang => 1, 0) desc, publishedDate desc)[0] {
    _id,
    title,
    slug,
    excerpt,
    "content": content[] {
      ...,
      _type == "image" => { ..., "asset": asset-> }
    },
    readingTime,
    publishedDate,
    updatedDate,
    featured,
    viewCount,
    likeCount,
    commentCount,
    allowComments,
    tags,
    "image": image.asset->url,
    "author": author-> { _id, name, slug, "image": image.asset->url, bio, social },
    "categories": categories[]-> { _id, title, slug, color, description },
    language
  }`;

  try {
    console.log('Fetching post with slug:', decodedSlug, 'lang:', normalizedLang);
    const result = await client.fetch(query, { slug: decodedSlug, lang: normalizedLang });
    console.log('Sanity response:', result);
    return result || null;
  } catch (e) {
    console.error('Error fetching post by slug:', e);
    return null;
  }
};

// Fetch posts by category
export const getPostsByCategory = async (categorySlug: string, limit: number = 10, offset: number = 0, lang: string = 'en'): Promise<BlogPost[]> => {
  const normalizedLang = normalizeLang(lang);
  const start = offset;
  const end = offset + limit;
  const query = `*[_type == "blogPost" && (language == $lang || (!defined(language) && $lang == "en")) && $categorySlug in categories[]->slug.current] | order(publishedDate desc)[$start...$end] {
    _id,
    title,
    slug,
    excerpt,
    readingTime,
    publishedDate,
    featured,
    viewCount,
    likeCount,
    commentCount,
    "image": image.asset->url,
    "author": author-> { _id, name, slug, "image": image.asset->url },
    "categories": categories[]-> { _id, title, slug, color }
  }`;

  try {
    const result = await client.fetch(query, { categorySlug, start, end, lang: normalizedLang });
    return result || [];
  } catch (e) {
    console.error('Error fetching posts by category:', e);
    return [];
  }
};

// Get total count of posts in category
export const getCategoryPostsCount = async (categorySlug: string, lang: string = 'en'): Promise<number> => {
  const query = `count(*[_type == "blogPost" && (language == $lang || (!defined(language) && $lang == "en")) && $categorySlug in categories[]->slug.current])`;
  try {
    return await client.fetch(query, { categorySlug, lang });
  } catch (e) {
    console.error('Error fetching category posts count:', e);
    return 0;
  }
};

// Fetch trending posts (by view count)
export const getTrendingPosts = async (limit: number = 6, offset: number = 0, lang: string = 'en'): Promise<BlogPost[]> => {
  const start = offset;
  const end = offset + limit - 1;
  const query = `*[_type == "blogPost" && (language == $lang || (!defined(language) && $lang == "en"))] | order(viewCount desc)[$start...$end] {
    _id,
    title,
    slug,
    excerpt,
    readingTime,
    publishedDate,
    featured,
    viewCount,
    likeCount,
    commentCount,
    "image": image.asset->url,
    "author": author-> { _id, name, slug, "image": image.asset->url },
    "categories": categories[]-> { _id, title, slug, color }
  }`;

  try {
    const result = await client.fetch(query, { start, end, lang });
    return result || [];
  } catch (e) {
    console.error('Error fetching trending posts:', e);
    return [];
  }
};

// Fetch trending posts with time filter
export type TrendingTimeFilter = 'today' | 'week' | 'month' | 'all';

export const getTrendingPostsByTime = async (
  timeFilter: TrendingTimeFilter = 'all',
  limit: number = 4,
  lang: string = 'en'
): Promise<BlogPost[]> => {
  // Calculate date threshold based on filter
  const now = new Date();
  let dateThreshold: string | null = null;

  switch (timeFilter) {
    case 'today':
      dateThreshold = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      break;
    case 'week':
      dateThreshold = new Date(now.setDate(now.getDate() - 7)).toISOString();
      break;
    case 'month':
      dateThreshold = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      break;
    case 'all':
    default:
      dateThreshold = null;
  }

  const dateFilter = dateThreshold
    ? `&& publishedDate >= "${dateThreshold}"`
    : '';

  const normalizedLang = normalizeLang(lang);
  const query = `*[_type == "blogPost" && (language == $lang || (!defined(language) && $lang == "en")) ${dateFilter}] | order(coalesce(likeCount, 0) desc)[0...${limit}] {
    _id,
    title,
    slug,
    excerpt,
    readingTime,
    publishedDate,
    featured,
    viewCount,
    likeCount,
    commentCount,
    "image": image.asset->url,
    "author": author-> { _id, name, slug, "image": image.asset->url },
    "categories": categories[]-> { _id, title, slug, color }
  }`;

  try {
    const result = await client.fetch(query, { lang: normalizedLang });
    return result || [];
  } catch (e) {
    console.error('Error fetching trending posts by time:', e);
    return [];
  }
};

// Search posts
export type SearchSortOption = 'relevance' | 'newest' | 'popular';
export type SearchDateFilter = 'all' | '24h' | 'week' | 'month' | 'year';

export interface SearchFilters {
  term: string;
  limit?: number;
  offset?: number;
  sort?: SearchSortOption;
  category?: string;  // category slug
  dateFilter?: SearchDateFilter;
  tags?: string[];
  lang?: string;
}

export const searchPosts = async (
  termOrFilters: string | SearchFilters,
  limit: number = 10,
  offset: number = 0,
  sort: SearchSortOption = 'relevance',
  lang: string = 'en'
): Promise<BlogPost[]> => {
  // Support both old signature and new filters object
  const filters: SearchFilters = typeof termOrFilters === 'string'
    ? { term: termOrFilters, limit, offset, sort, lang }
    : termOrFilters;

  const {
    term = '',
    limit: searchLimit = 10,
    offset: searchOffset = 0,
    sort: searchSort = 'relevance',
    category,
    dateFilter = 'all',
    tags = [],
    lang: searchLang = 'en'
  } = filters;

  const normalizedLang = normalizeLang(searchLang);
  const start = searchOffset;
  const end = searchOffset + searchLimit;

  // Build filter conditions
  let filterConditions = '_type == "blogPost" && (language == $lang || (!defined(language) && $lang == "en"))';

  // Term search (title, excerpt, tags)
  if (term) {
    filterConditions += ' && (title match $term || excerpt match $term || tags match $term)';
  }

  // Category filter
  if (category && category !== 'all') {
    filterConditions += ' && $category in categories[]->slug.current';
  }

  // Date filter
  if (dateFilter && dateFilter !== 'all') {
    const now = new Date();
    let dateThreshold: Date;

    switch (dateFilter) {
      case '24h':
        dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        dateThreshold = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateThreshold = new Date(0);
    }
    filterConditions += ` && publishedDate >= "${dateThreshold.toISOString()}"`;
  }

  // Tags filter (any of the selected tags)
  if (tags.length > 0) {
    const tagConditions = tags.map((tag, i) => `tags match $tag${i}`).join(' || ');
    filterConditions += ` && (${tagConditions})`;
  }

  // Determine sort order
  let orderClause = '';
  switch (searchSort) {
    case 'newest':
      orderClause = 'order(publishedDate desc)';
      break;
    case 'popular':
      orderClause = 'order(viewCount desc)';
      break;
    case 'relevance':
    default:
      orderClause = 'order(publishedDate desc)';
      break;
  }

  const query = `*[${filterConditions}] | ${orderClause}[$start...$end] {
    _id,
    title,
    slug,
    excerpt,
    readingTime,
    publishedDate,
    featured,
    viewCount,
    likeCount,
    commentCount,
    tags,
    "image": image.asset->url,
    "author": author-> { _id, name, slug, "image": image.asset->url },
    "categories": categories[]-> { _id, title, slug, color }
  }`;

  try {
    const params: any = {
      term: term ? `*${term}*` : '',
      start,
      end,
      category: category || '',
      lang: normalizedLang
    };

    // Add tag parameters for case-insensitive match
    tags.forEach((tag, i) => {
      params[`tag${i}`] = tag;
    });

    const result = await client.fetch(query, params);
    return result || [];
  } catch (e) {
    console.error('Error searching posts:', e);
    return [];
  }
};

// Get total count for search results
export const getSearchResultsCount = async (filters: SearchFilters): Promise<number> => {
  const { term, category, dateFilter = 'all', tags = [], lang = 'en' } = filters;

  // Build filter conditions
  let filterConditions = '_type == "blogPost" && (language == $lang || (!defined(language) && $lang == "en"))';

  if (term) {
    filterConditions += ' && (title match $term || excerpt match $term || tags match $term)';
  }

  if (category && category !== 'all') {
    filterConditions += ' && $category in categories[]->slug.current';
  }

  if (dateFilter && dateFilter !== 'all') {
    const now = new Date();
    let dateThreshold: Date;

    switch (dateFilter) {
      case '24h':
        dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        dateThreshold = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateThreshold = new Date(0);
    }
    filterConditions += ` && publishedDate >= "${dateThreshold.toISOString()}"`;
  }

  if (tags.length > 0) {
    const tagConditions = tags.map((tag, i) => `tags match $tag${i}`).join(' || ');
    filterConditions += ` && (${tagConditions})`;
  }

  const query = `count(*[${filterConditions}])`;

  try {
    const normalizedLang = normalizeLang(lang);
    const params: any = {
      term: term ? `*${term}*` : '',
      category: category || '',
      lang: normalizedLang
    };

    // Add tag parameters for case-insensitive match
    tags.forEach((tag, i) => {
      params[`tag${i}`] = tag;
    });

    return await client.fetch(query, params);
  } catch (e) {
    console.error('Error counting search results:', e);
    return 0;
  }
};

/**
 * Find linked translations for a specific document
 * This uses the translation.metadata documents created by @sanity/document-internationalization
 */
export const getDocumentTranslations = async (documentId: string): Promise<any[]> => {
  const query = `*[_type == "translation.metadata" && references($documentId)][0]{
    translations[]{
      "_key": _key,
      "value": value->{ _id, _type, slug, language, title }
    }
  }`;

  try {
    const result = await client.fetch(query, { documentId });
    return result?.translations || [];
  } catch (e) {
    console.error('Error fetching document translations:', e);
    return [];
  }
};

// ==================== SEARCH SUGGESTIONS ====================

// Fetch search suggestions (for autocomplete)
export interface SearchSuggestion {
  _id: string;
  title: string;
  slug: string;
  type: 'post' | 'category' | 'tag' | 'author';
  image?: string;
  excerpt?: string;
}

export const getSearchSuggestions = async (term: string, limit: number = 6): Promise<SearchSuggestion[]> => {
  if (!term || term.length < 2) return [];

  try {
    // Search posts by title
    const postQuery = `*[_type == "blogPost" && title match $term] | order(viewCount desc)[0...${limit}] {
      _id,
      title,
      "slug": slug.current,
      "image": image.asset->url,
      excerpt
    }`;

    // Search categories
    const categoryQuery = `*[_type == "category" && title match $term][0...3] {
      _id,
      title,
      "slug": slug.current
    }`;

    // Search authors
    const authorQuery = `*[_type == "author" && name match $term][0...3] {
      _id,
      "title": name,
      "slug": slug.current,
      "image": image.asset->url
    }`;

    const [posts, categories, authors] = await Promise.all([
      client.fetch(postQuery, { term: `*${term}*` }),
      client.fetch(categoryQuery, { term: `*${term}*` }),
      client.fetch(authorQuery, { term: `*${term}*` }),
    ]);

    const suggestions: SearchSuggestion[] = [
      ...(posts || []).map((p: any) => ({ ...p, type: 'post' as const })),
      ...(categories || []).map((c: any) => ({ ...c, type: 'category' as const })),
      ...(authors || []).map((a: any) => ({ ...a, type: 'author' as const })),
    ];

    return suggestions.slice(0, limit);
  } catch (e) {
    console.error('Error fetching search suggestions:', e);
    return [];
  }
};

// ==================== TAGS ====================

// Fetch all unique tags with counts
export const getPopularTags = async (limit: number = 10, lang: string = 'en'): Promise<{ tag: string; count: number }[]> => {
  const normalizedLang = normalizeLang(lang);
  const query = `*[_type == "blogPost" && defined(tags) && (language == $lang || (!defined(language) && $lang == "en"))] {
    tags
  }`;

  try {
    const posts = await client.fetch(query, { lang: normalizedLang });

    // Aggregate tags and count occurrences (case-insensitive)
    const tagCounts: Record<string, { displayName: string; count: number }> = {};
    posts.forEach((post: { tags: string[] }) => {
      post.tags?.forEach((tag: string) => {
        const normalizedTag = tag.toLowerCase().trim();
        if (tagCounts[normalizedTag]) {
          tagCounts[normalizedTag].count += 1;
        } else {
          // Keep the first occurrence's casing as display name
          tagCounts[normalizedTag] = { displayName: tag, count: 1 };
        }
      });
    });

    // Convert to array and sort by count
    const sortedTags = Object.values(tagCounts)
      .map(({ displayName, count }) => ({ tag: displayName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sortedTags;
  } catch (e) {
    console.error('Error fetching tags:', e);
    return [];
  }
};

// ==================== AUTHORS ====================

// Fetch author by slug
export const getAuthorBySlug = async (slug: string): Promise<Author | null> => {
  const query = `*[_type == "author" && slug.current == $slug][0] {
    _id,
    _type,
    name,
    slug,
    "image": image.asset->url,
    bio,
    social
  }`;

  try {
    const result = await client.fetch(query, { slug });
    return result || null;
  } catch (e) {
    console.error('Error fetching author:', e);
    return null;
  }
};

// Fetch posts by author
export const getPostsByAuthorId = async (authorId: string, lang: string = 'en'): Promise<BlogPost[]> => {
  const normalizedLang = normalizeLang(lang);
  const query = `*[_type == "blogPost" && author._ref == $authorId && (language == $lang || (!defined(language) && $lang == "en"))] | order(publishedDate desc) {
    _id,
    title,
    slug,
    excerpt,
    readingTime,
    publishedDate,
    featured,
    viewCount,
    likeCount,
    commentCount,
    "image": image.asset->url,
    "author": author-> { _id, name, slug, "image": image.asset->url },
    "categories": categories[]-> { _id, title, slug, color }
  }`;

  try {
    const result = await client.fetch(query, { authorId, lang: normalizedLang });
    return result || [];
  } catch (e) {
    console.error('Error fetching posts by author:', e);
    return [];
  }
};

// ==================== CATEGORIES ====================

// Fetch all categories with post counts
export const getCategories = async (lang: string = 'en'): Promise<(Category & { count: number })[]> => {
  const normalizedLang = normalizeLang(lang);
  const query = `*[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    color,
    "count": count(*[_type == "blogPost" && references(^._id) && (language == $lang || (!defined(language) && $lang == "en"))])
  }`;

  try {
    const result = await client.fetch(query, { lang: normalizedLang });
    return result || [];
  } catch (e) {
    console.error('Error fetching categories:', e);
    return [];
  }
};

// ==================== COMMENTS ====================

// Fetch comments for a post (comments show immediately, no approval needed)
export const getCommentsByPost = async (postId: string): Promise<Comment[]> => {
  const query = `*[_type == "comment" && post._ref == $postId] | order(featured desc, createdAt desc) {
    _id,
    content,
    createdAt,
    editedAt,
    featured,
    parentComment,
    "subscriber": subscriber-> { _id, name, "avatar": avatar.asset->url, avatarUrl, subscriptionTier }
  }`;

  try {
    const result = await client.fetch(query, { postId });
    return result || [];
  } catch (e) {
    console.error('Error fetching comments:', e);
    return [];
  }
};

// ==================== SUBSCRIBERS ====================

// Fetch subscriber by email
export const getSubscriberByEmail = async (email: string): Promise<Subscriber | null> => {
  const query = `*[_type == "subscriber" && email == $email][0] {
    _id,
    name,
    email,
    "avatar": avatar.asset->url,
    avatarUrl,
    isSubscribed,
    subscriptionTier
  }`;

  try {
    const result = await client.fetch(query, { email });
    return result || null;
  } catch (e) {
    console.error('Error fetching subscriber:', e);
    return null;
  }
};

// ==================== LIKES ====================

// Check if user has liked a post
export const checkUserLike = async (postId: string, subscriberId: string): Promise<Like | null> => {
  const query = `*[_type == "like" && post._ref == $postId && subscriber._ref == $subscriberId][0]`;

  try {
    const result = await client.fetch(query, { postId, subscriberId });
    return result || null;
  } catch (e) {
    console.error('Error checking like:', e);
    return null;
  }
};

// Get all likes by a user
export const getUserLikes = async (subscriberId: string): Promise<any[]> => {
  const query = `*[_type == "like" && subscriber._ref == $subscriberId] | order(_createdAt desc) {
    _id,
    _createdAt,
    "createdAt": _createdAt,
    post-> {
      _id,
      title,
      "slug": slug.current,
      "image": image.asset->url
    }
  }`;

  try {
    const result = await client.fetch(query, { subscriberId });
    return result || [];
  } catch (e) {
    console.error('Error fetching user likes:', e);
    return [];
  }
};

// Get all comments by a user
export const getUserComments = async (subscriberId: string): Promise<any[]> => {
  const query = `*[_type == "comment" && subscriber._ref == $subscriberId] | order(_createdAt desc) {
    _id,
    content,
    _createdAt,
    "createdAt": _createdAt,
    post-> {
      _id,
      title,
      "slug": slug.current
    }
  }`;

  try {
    const result = await client.fetch(query, { subscriberId });
    return result || [];
  } catch (e) {
    console.error('Error fetching user comments:', e);
    return [];
  }
};

// ==================== MUTATIONS (require write token) ====================

// Increment view count
export const incrementViewCount = async (postId: string): Promise<void> => {
  try {
    console.log('Incrementing view count for:', postId);
    await writeClient
      .patch(postId)
      .setIfMissing({ viewCount: 0 }) // Initialize to 0 if field doesn't exist
      .inc({ viewCount: 1 })
      .commit();
    console.log('View count incremented successfully');
  } catch (e) {
    console.error('Error incrementing view count:', e);
  }
};

// Create a comment (requires write token)
export const createComment = async (
  postId: string,
  subscriberId: string,
  content: string,
  parentCommentId?: string
): Promise<Comment | null> => {
  try {
    const comment = await writeClient.create({
      _type: 'comment',
      post: { _ref: postId, _type: 'reference' },
      subscriber: { _ref: subscriberId, _type: 'reference' },
      content,
      parentComment: parentCommentId ? { _ref: parentCommentId, _type: 'reference' } : undefined,
      featured: false,
      createdAt: new Date().toISOString(),
    });

    // Increment comment count on the post
    await writeClient
      .patch(postId)
      .setIfMissing({ commentCount: 0 })
      .inc({ commentCount: 1 })
      .commit();

    return comment as unknown as Comment;
  } catch (e) {
    console.error('Error creating comment:', e);
    return null;
  }
};

// Toggle like (requires write token)
export const toggleLike = async (postId: string, subscriberId: string): Promise<boolean> => {
  try {
    // Check if like exists
    const existingLike = await checkUserLike(postId, subscriberId);

    if (existingLike) {
      // Remove like
      await writeClient.delete(existingLike._id);
      await writeClient
        .patch(postId)
        .setIfMissing({ likeCount: 0 })
        .dec({ likeCount: 1 })
        .commit();
      return false;
    } else {
      // Add like
      await writeClient.create({
        _type: 'like',
        post: { _ref: postId, _type: 'reference' },
        subscriber: { _ref: subscriberId, _type: 'reference' },
        createdAt: new Date().toISOString(),
      });
      await writeClient
        .patch(postId)
        .setIfMissing({ likeCount: 0 })
        .inc({ likeCount: 1 })
        .commit();
      return true;
    }
  } catch (e) {
    console.error('Error toggling like:', e);
    return false;
  }
};

// Create/subscribe a user (requires write token)
export const createSubscriber = async (
  name: string,
  email: string
): Promise<Subscriber | null> => {
  try {
    // Check if subscriber exists
    const existing = await getSubscriberByEmail(email);
    if (existing) {
      return existing;
    }

    const subscriber = await writeClient.create({
      _type: 'subscriber',
      name,
      email,
      isSubscribed: true,  // Automatically active after subscribing
      subscriptionTier: 'free',
      createdAt: new Date().toISOString(),
    });
    return subscriber as Subscriber;
  } catch (e) {
    console.error('Error creating subscriber:', e);
    return null;
  }
};

// ==================== SAVED POSTS ====================

// Check if user has saved a post (using savedBy array on blogPost)
export const checkUserSavedPost = async (postId: string, subscriberId: string): Promise<boolean> => {
  const query = `*[_type == "blogPost" && _id == $postId && $subscriberId in savedBy[]._ref][0]`;

  try {
    const result = await client.fetch(query, { postId, subscriberId });
    return !!result;
  } catch (e) {
    console.error('Error checking saved post:', e);
    return false;
  }
};

// Get all saved posts by a user (posts where subscriberId is in savedBy array)
export const getUserSavedPosts = async (subscriberId: string): Promise<any[]> => {
  const query = `*[_type == "blogPost" && $subscriberId in savedBy[]._ref] | order(publishedDate desc) {
    _id,
    title,
    excerpt,
    "slug": slug.current,
    "image": image.asset->url,
    readingTime,
    publishedDate,
    "author": author-> { name, "image": image.asset->url },
    "categories": categories[]-> { _id, title, slug }
  }`;

  try {
    const result = await client.fetch(query, { subscriberId });
    // Wrap in post object for consistent structure with Profile page
    return (result || []).map((post: any) => ({
      _id: post._id,
      post,
      createdAt: post.publishedDate
    }));
  } catch (e) {
    console.error('Error fetching saved posts:', e);
    return [];
  }
};

// Toggle saved post (add/remove subscriber from savedBy array)
export const toggleSavedPost = async (postId: string, subscriberId: string): Promise<boolean> => {
  try {
    // Check if already saved
    const isSaved = await checkUserSavedPost(postId, subscriberId);

    if (isSaved) {
      // Remove from savedBy array
      await writeClient
        .patch(postId)
        .unset([`savedBy[_ref=="${subscriberId}"]`])
        .commit();
      return false;
    } else {
      // Add to savedBy array
      await writeClient
        .patch(postId)
        .setIfMissing({ savedBy: [] })
        .append('savedBy', [{ _ref: subscriberId, _type: 'reference' }])
        .commit();
      return true;
    }
  } catch (e) {
    console.error('Error toggling saved post:', e);
    return false;
  }
};

// ==================== ARCHIVE / PAST POSTS ====================

// Get past newsletter posts (older than 1 week)
export const getArchivePosts = async (limit: number = 12, offset: number = 0, lang: string = 'en'): Promise<BlogPost[]> => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const normalizedLang = normalizeLang(lang);
  const start = offset;
  const end = offset + limit;
  const dateThreshold = oneWeekAgo.toISOString();

  const query = `*[_type == "blogPost" && publishedDate < $dateThreshold && (language == $lang || (!defined(language) && $lang == "en"))] | order(publishedDate desc)[$start...$end] {
    _id,
    title,
    slug,
    excerpt,
    readingTime,
    publishedDate,
    featured,
    viewCount,
    likeCount,
    commentCount,
    "image": image.asset->url,
    "author": author-> { _id, name, slug, "image": image.asset->url },
    "categories": categories[]-> { _id, title, slug, color }
  }`;

  try {
    return await client.fetch(query, { dateThreshold, start, end, lang: normalizedLang });
  } catch (e) {
    console.error('Error fetching archive posts:', e);
    return [];
  }
};
