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

// ==================== BLOG POSTS ====================

// Fetch all blog posts (list view)
export const getAllPosts = async (): Promise<BlogPost[]> => {
  const query = `*[_type == "blogPost"] | order(publishedDate desc) {
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
    const result = await client.fetch(query);
    return result || [];
  } catch (e) {
    console.error('Error fetching all posts:', e);
    return [];
  }
};

// Fetch featured posts
export const getFeaturedPost = async (): Promise<BlogPost | null> => {
  const query = `*[_type == "blogPost" && featured == true] | order(publishedDate desc)[0] {
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
    const result = await client.fetch(query);
    return result || null;
  } catch (e) {
    console.error('Error fetching featured post:', e);
    return null;
  }
};

// Fetch recent posts (non-featured)
export const getRecentPosts = async (limit: number = 10, offset: number = 0): Promise<BlogPost[]> => {
  const start = offset;
  const end = offset + limit - 1;
  const query = `*[_type == "blogPost"] | order(publishedDate desc)[$start...$end] {
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
    const result = await client.fetch(query, { start, end });
    return result || [];
  } catch (e) {
    console.error('Error fetching recent posts:', e);
    return [];
  }
};

// Get total count of posts
export const getTotalPostsCount = async (): Promise<number> => {
  const query = `count(*[_type == "blogPost"])`;
  try {
    return await client.fetch(query);
  } catch (e) {
    console.error('Error fetching posts count:', e);
    return 0;
  }
};

// Fetch single blog post by slug
export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  if (!slug) {
    console.error('No slug provided to getPostBySlug');
    return null;
  }

  const query = `*[_type == "blogPost" && slug.current == $slug][0] {
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
    "categories": categories[]-> { _id, title, slug, color, description }
  }`;

  try {
    console.log('Fetching post with slug:', slug);
    const result = await client.fetch(query, { slug });
    console.log('Sanity response:', result);
    return result || null;
  } catch (e) {
    console.error('Error fetching post by slug:', e);
    return null;
  }
};

// Fetch posts by category
export const getPostsByCategory = async (categorySlug: string, limit: number = 10, offset: number = 0): Promise<BlogPost[]> => {
  const start = offset;
  const end = offset + limit - 1;
  const query = `*[_type == "blogPost" && $categorySlug in categories[]->slug.current] | order(publishedDate desc)[$start...$end] {
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
    const result = await client.fetch(query, { categorySlug, start, end });
    return result || [];
  } catch (e) {
    console.error('Error fetching posts by category:', e);
    return [];
  }
};

// Get total count of posts in category
export const getCategoryPostsCount = async (categorySlug: string): Promise<number> => {
  const query = `count(*[_type == "blogPost" && $categorySlug in categories[]->slug.current])`;
  try {
    return await client.fetch(query, { categorySlug });
  } catch (e) {
    console.error('Error fetching category posts count:', e);
    return 0;
  }
};

// Fetch trending posts (by view count)
export const getTrendingPosts = async (limit: number = 6, offset: number = 0): Promise<BlogPost[]> => {
  const start = offset;
  const end = offset + limit - 1;
  const query = `*[_type == "blogPost"] | order(viewCount desc)[$start...$end] {
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
    const result = await client.fetch(query, { start, end });
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
  limit: number = 4
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

  const query = `*[_type == "blogPost" ${dateFilter}] | order(coalesce(likeCount, 0) desc)[0...${limit}] {
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
    const result = await client.fetch(query);
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
}

export const searchPosts = async (
  termOrFilters: string | SearchFilters,
  limit: number = 10,
  offset: number = 0,
  sort: SearchSortOption = 'relevance'
): Promise<BlogPost[]> => {
  // Support both old signature and new filters object
  const filters: SearchFilters = typeof termOrFilters === 'string'
    ? { term: termOrFilters, limit, offset, sort }
    : termOrFilters;

  const {
    term,
    limit: searchLimit = 10,
    offset: searchOffset = 0,
    sort: searchSort = 'relevance',
    category,
    dateFilter = 'all',
    tags = []
  } = filters;

  const start = searchOffset;
  const end = searchOffset + searchLimit - 1;

  // Build filter conditions
  let filterConditions = '_type == "blogPost"';

  // Term search (title, excerpt, tags)
  if (term) {
    filterConditions += ' && (title match $term || excerpt match $term || $term in tags)';
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
    const tagConditions = tags.map(tag => `"${tag}" in tags`).join(' || ');
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
    const result = await client.fetch(query, {
      term: term ? `*${term}*` : '',
      start,
      end,
      category: category || ''
    });
    return result || [];
  } catch (e) {
    console.error('Error searching posts:', e);
    return [];
  }
};

// Get total count for search results
export const getSearchResultsCount = async (filters: SearchFilters): Promise<number> => {
  const { term, category, dateFilter = 'all', tags = [] } = filters;

  // Build filter conditions
  let filterConditions = '_type == "blogPost"';

  if (term) {
    filterConditions += ' && (title match $term || excerpt match $term || $term in tags)';
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
    const tagConditions = tags.map(tag => `"${tag}" in tags`).join(' || ');
    filterConditions += ` && (${tagConditions})`;
  }

  const query = `count(*[${filterConditions}])`;

  try {
    return await client.fetch(query, {
      term: term ? `*${term}*` : '',
      category: category || ''
    });
  } catch (e) {
    console.error('Error counting search results:', e);
    return 0;
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
export const getPopularTags = async (limit: number = 10): Promise<{ tag: string; count: number }[]> => {
  const query = `*[_type == "blogPost" && defined(tags)] {
    tags
  }`;

  try {
    const posts = await client.fetch(query);

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
export const getPostsByAuthorId = async (authorId: string): Promise<BlogPost[]> => {
  const query = `*[_type == "blogPost" && author._ref == $authorId] | order(publishedDate desc) {
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
    const result = await client.fetch(query, { authorId });
    return result || [];
  } catch (e) {
    console.error('Error fetching posts by author:', e);
    return [];
  }
};

// ==================== CATEGORIES ====================

// Fetch all categories with post counts
export const getCategories = async (): Promise<(Category & { count: number })[]> => {
  const query = `*[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    color,
    "count": count(*[_type == "blogPost" && references(^._id)])
  }`;

  try {
    const result = await client.fetch(query);
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

    return comment as Comment;
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
export const getArchivePosts = async (limit: number = 12, offset: number = 0): Promise<BlogPost[]> => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const start = offset;
  const end = offset + limit - 1;

  const query = `*[_type == "blogPost" && publishedDate < $dateThreshold] | order(publishedDate desc)[$start...$end] {
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
    const result = await client.fetch(query, {
      dateThreshold: oneWeekAgo.toISOString(),
      start,
      end
    });
    return result || [];
  } catch (e) {
    console.error('Error fetching archive posts:', e);
    return [];
  }
};
