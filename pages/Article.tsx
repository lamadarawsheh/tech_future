// In pages/Article.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getPostBySlug } from '../services/sanity';
import { ArticleDetailSkeleton } from '../components/Skeleton';
import { PortableText } from '../components/PortableText';
import { BlogPost } from '../types';
import { format } from 'date-fns';

export const Article: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError('No article slug provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching article with slug:', slug);
        const data = await getPostBySlug(slug);
        console.log('Received article data:', data);
        
        if (!data) {
          setError('Article not found');
        } else {
          setPost(data);
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return <ArticleDetailSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {error || 'Article not found'}
          </h1>
          <Link
            to="/"
            className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  // Safely handle content that might be undefined
  const content = post.content || [];

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center text-sm text-slate-500 dark:text-slate-400">
          <li>
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li className="mx-2">/</li>
          <li className="text-primary font-medium">{post.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories?.map((category) => (
            <Link
              key={category._id}
              to={`/category/${category.slug}`}
              className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {category.title}
            </Link>
          ))}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
          {post.title}
        </h1>
        
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">schedule</span>
            {post.readingTime && <span>{post.readingTime} min read</span>}
          </div>
          <span>•</span>
          <time dateTime={post.publishedDate}>
            {format(new Date(post.publishedDate), 'MMMM d, yyyy')}
          </time>
          {post.updatedDate && (
            <>
              <span>•</span>
              <span className="text-xs">
                Updated {format(new Date(post.updatedDate), 'MMM d, yyyy')}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {post.image && (
        <div className="mb-12 rounded-xl overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose dark:prose-invert max-w-none mb-12">
        {content.length > 0 ? (
          <PortableText content={content} />
        ) : (
          <p className="text-slate-500 dark:text-slate-400">No content available for this article.</p>
        )}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-12">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-sm rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Author Bio */}
      {post.author && (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 mb-12">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {post.author.image && (
              <img
                src={post.author.image}
                alt={post.author.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {post.author.name}
              </h3>
              {post.author.bio && (
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {post.author.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};