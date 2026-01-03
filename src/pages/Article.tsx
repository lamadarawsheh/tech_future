// In pages/Article.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug, incrementViewCount, checkUserSavedPost, toggleSavedPost } from '../services/sanity';
import { ArticleDetailSkeleton } from '../components/Skeleton';
import { PortableText } from '../components/PortableText';
import { LikeButton } from '../components/LikeButton';
import { CommentsSection } from '../components/CommentsSection';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { BlogPost, getSlug } from '../types';
import { format } from 'date-fns';

export const Article: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, subscriber, loading: authLoading } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const viewedPostId = useRef<string | null>(null);

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
          // Increment view count only once per post
          if (viewedPostId.current !== data._id) {
            viewedPostId.current = data._id;
            incrementViewCount(data._id);
            // Optimistically update the UI
            setPost(prev => prev ? { ...prev, viewCount: (prev.viewCount || 0) + 1 } : prev);
          }
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

  // Check if post is saved
  useEffect(() => {
    const checkSaved = async () => {
      if (post?._id && subscriber?._id) {
        const saved = await checkUserSavedPost(post._id, subscriber._id);
        setIsSaved(saved);
      }
    };
    checkSaved();
  }, [post?._id, subscriber?._id]);

  // Handle save/unsave post
  const handleSavePost = async () => {
    if (!subscriber?._id || !post?._id) {
      setShowAuthModal(true);
      return;
    }

    setSavingPost(true);
    try {
      const nowSaved = await toggleSavedPost(post._id, subscriber._id);
      setIsSaved(nowSaved);
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setSavingPost(false);
    }
  };

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

  const content = post.content || [];
  const imageUrl = typeof post.image === 'string' ? post.image : '';
  const authorImage = typeof post.author?.image === 'string' ? post.author.image : '';
  const isAuthenticated = !!user && !!subscriber;

  return (
    <>
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
            <li className="text-primary font-medium truncate max-w-[200px]">{post.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories?.map((category) => (
            <Link
              key={category._id}
                to={`/category/${getSlug(category.slug)}`}
              className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {category.title}
            </Link>
          ))}
        </div>
        
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight font-display">
          {post.title}
        </h1>
        
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
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

          {/* Engagement Stats */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              <span>{post.viewCount || 0} views</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-[18px]">favorite</span>
              <span>{post.likeCount || 0} likes</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
              <span>{post.commentCount || 0} comments</span>
            </div>
        </div>
      </header>

      {/* Featured Image */}
        {imageUrl && (
        <div className="mb-12 rounded-xl overflow-hidden">
          <img
              src={imageUrl}
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
              <Link
              key={tag}
                to={`/search?tag=${tag}`}
                className="px-3 py-1 text-sm rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-colors"
            >
                #{tag}
              </Link>
          ))}
        </div>
      )}

        {/* Like & Share Actions */}
        <div className="flex flex-wrap items-center gap-4 mb-12 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            Enjoyed this article?
          </span>
          <LikeButton
            postId={post._id}
            initialLikeCount={post.likeCount || 0}
            subscriberId={subscriber?._id}
            isSubscribed={isAuthenticated}
            onLikeChange={(newCount) => {
              setPost(prev => prev ? { ...prev, likeCount: newCount } : prev);
            }}
          />
          {!isAuthenticated && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-primary hover:underline text-sm"
            >
              Sign in to like & comment
            </button>
          )}
          <div className="flex-1" />
          <button 
            onClick={handleSavePost}
            disabled={savingPost}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              isSaved 
                ? 'bg-primary/10 text-primary' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSaved ? 'bookmark' : 'bookmark_border'}
            </span>
            {savingPost ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-[18px]">share</span>
            Share
          </button>
        </div>

      {/* Author Bio */}
      {post.author && (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 mb-12">
          <div className="flex flex-col sm:flex-row items-start gap-6">
              {authorImage && (
              <img
                  src={authorImage}
                alt={post.author.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
              <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {post.author.name}
              </h3>
              {post.author.bio && (
                  <div className="text-slate-600 dark:text-slate-400 mb-4">
                    {Array.isArray(post.author.bio) ? (
                      <PortableText content={post.author.bio} />
                    ) : (
                      <p>{post.author.bio}</p>
                    )}
                  </div>
                )}
                {/* Social Links */}
                {post.author.social && (
                  <div className="flex gap-3">
                    {post.author.social.twitter && (
                      <a
                        href={`https://twitter.com/${post.author.social.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                    )}
                    {post.author.social.github && (
                      <a
                        href={`https://github.com/${post.author.social.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                    {post.author.social.linkedin && (
                      <a
                        href={`https://linkedin.com/in/${post.author.social.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    )}
                  </div>
              )}
            </div>
          </div>
        </div>
      )}

        {/* Sign in CTA (if not authenticated) */}
        {!isAuthenticated && (
          <div className="mb-12 p-6 md:p-8 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary">login</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                Join the conversation
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Sign in with your email to like articles and join the discussion!
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">magic_button</span>
              Sign in with Magic Link
            </button>
          </div>
        )}

        {/* User Info (if authenticated) */}
        {isAuthenticated && (
          <div className="mb-12 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-green-500">check_circle</span>
              <div>
                <p className="font-medium text-green-800 dark:text-green-300">
                  Signed in as {user?.email}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  You can like and comment on articles!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <CommentsSection
          postId={post._id}
          allowComments={post.allowComments !== false}
          subscriberId={subscriber?._id}
          isSubscribed={isAuthenticated}
          onCommentAdded={(newCount) => {
            setPost(prev => prev ? { ...prev, commentCount: newCount } : prev);
          }}
        />
    </article>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};
