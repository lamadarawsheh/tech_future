import { client, urlFor } from '../lib/sanity';
import { BlogPost, Author, Category } from '../types';
import * as mock from './sanityMock';

const mapPost = (post: any): BlogPost => {
  if (!post) {
    console.error('No post data provided to mapPost');
    throw new Error('No post data provided');
  }

  return {
    _id: post.id || post._id,
    _type: 'blogPost',
    title: post.title,
    slug: post.slug || (post.slug?.current ? post.slug.current : ''),
    excerpt: post.excerpt,
    content: post.body || post.content,
    categories: post.categories || [],
    author: post.author ? {
      _id: post.author.id || post.author._id,
      name: post.author.name,
      image: post.author.image,
      bio: post.author.bio,
      socialLinks: post.author.socialLinks
    } : { name: 'Unknown', image: '' },
    publishedDate: post.publishedDate || post._createdAt,
    updatedDate: post.updatedDate || post._updatedAt,
    image: post.image || '',
    tags: post.tags || []
  };
};

const mapAuthor = (a: any): Author => ({
  ...a,
  image: a.image ? urlFor(a.image) : ''
});

const logError = (e: any) => {
    console.warn("Sanity connection error. Falling back to mock data. This is usually due to CORS settings in Sanity Studio. Go to API > CORS Origins and add your domain.", e);
}

export const getFeaturedPost = async (): Promise<BlogPost | null> => {
  const query = `*[_type == "blogPost" && featured == true][0] {
    ...,
    author->,
    categories[]->
  }`;
  try {
    const result = await client.fetch(query);
    return result ? mapPost(result) : null;
  } catch (e) {
    logError(e);
    return mock.getFeaturedPost() || null;
  }
};

export const getRecentPosts = async (): Promise<BlogPost[]> => {
  const query = `*[_type == "blogPost" && featured != true] | order(publishedDate desc) [0...10] {
    ...,
    author->,
    categories[]->
  }`;
  try {
    const result = await client.fetch(query);
    return result.map(mapPost);
  } catch (e) {
    logError(e);
    return mock.getRecentPosts();
  }
};

export const getPostsByAuthorId = async (authorId: string): Promise<BlogPost[]> => {
  const query = `*[_type == "blogPost" && references($authorId)] | order(publishedDate desc) {
    ...,
    author->,
    categories[]->
  }`;
  try {
    const result = await client.fetch(query, { authorId });
    return result.map(mapPost);
  } catch (e) {
    logError(e);
    return mock.getPostsByAuthorId(authorId);
  }
};

export const getAuthorBySlug = async (slug: string): Promise<Author | null> => {
  const query = `*[_type == "author" && slug.current == $slug][0]`;
  try {
    const result = await client.fetch(query, { slug });
    return result ? mapAuthor(result) : null;
  } catch (e) {
    logError(e);
    return mock.getAuthorBySlug(slug) || null;
  }
};
// Add this function to your sanity.ts service file
export const getTrendingPosts = async (limit: number = 6): Promise<BlogPost[]> => {
  const query = `*[_type == "blogPost"] | order(viewCount desc) [0...$limit] {
    ...,
    "id": _id,
    "slug": slug.current,
    "author": author->{
      name,
      "image": image.asset->url
    },
    "categories": categories[]->{
      title,
      "slug": slug.current,
      description,
      color
    },
    "image": image.asset->url,
    "viewCount": coalesce(viewCount, 0)
  }`;
  
  try {
    const result = await client.fetch(query, { limit });
    return result.map(mapPost);
  } catch (e) {
    logError(e);
    return [];
  }
};
export async function getPostsByCategory(slug: string): Promise<BlogPost[]> {
  const query = `*[_type == "blogPost" && $slug in categories[]->slug.current] | order(publishedDate desc) {
    _id,
    title,
    excerpt,
    "slug": slug.current,
    publishedDate,
    readingTime,
    "image": image.asset->url,
    "categories": categories[]->{title, "slug": slug.current},
    "author": author->{
      name,
      "image": image.asset->url
    }
  }`;
  
  const posts = await client.fetch(query, { slug });
  return posts;
}

export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  if (!slug) {
    console.error('No slug provided to getPostBySlug');
    return null;
  }

  const query = `*[_type == "blogPost" && slug.current == $slug][0] {
    ...,
    "id": _id,
    "slug": slug.current,
    author->{
      ...,
      "id": _id,
      "image": image.asset->url
    },
    categories[]->{
      ...,
      "id": _id
    },
    "image": mainImage.asset->url,
    "publishedDate": _createdAt,
    "updatedDate": _updatedAt
  }`;
  
  try {
    console.log('Fetching post with slug:', slug);
    const result = await client.fetch(query, { slug });
    console.log('Sanity response:', result);
    
    if (!result) {
      console.warn('No post found for slug:', slug);
      // Check if any posts exist with this slug
      const allPosts = await client.fetch(`*[_type == "blogPost"]{ "slug": slug.current }`);
      console.log('All available post slugs:', allPosts.map((p: any) => p.slug));
      return null;
    }
    
    return mapPost(result);
  } catch (e) {
    console.error('Error in getPostBySlug:', e);
    return null;
  }
};

export const searchPosts = async (term: string): Promise<BlogPost[]> => {
    const query = `*[_type == "blogPost" && (title match $term || excerpt match $term)] {
        ...,
        author->,
        categories[]->
    }`;
    try {
        const result = await client.fetch(query, { term: `*${term}*` });
        return result.map(mapPost);
    } catch (e) {
        logError(e);
        return mock.searchPosts(term);
    }
}