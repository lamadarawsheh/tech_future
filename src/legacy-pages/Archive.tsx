'use client';
import React, { useEffect, useState } from 'react';
import Link from '../../app/components/Link';
import { getArchivePosts } from '../services/sanity';
import { BlogPost, getSlug } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { ArticleCardSkeleton } from '../components/Skeleton';
import { format } from 'date-fns';

import { useTranslation } from 'react-i18next';

const POSTS_PER_PAGE = 12;

export const Archive: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const lang = i18n.language;
      try {
        const data = await getArchivePosts(POSTS_PER_PAGE, 0, lang);

        setPosts(data);
        setHasMore(data.length === POSTS_PER_PAGE);
      } catch (error) {
        console.error('Error fetching archive posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [i18n.language]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const morePosts = await getArchivePosts(POSTS_PER_PAGE, posts.length, i18n.language);
      setPosts((prev) => [...prev, ...morePosts]);
      setHasMore(morePosts.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Group posts by month
  const groupedPosts = posts.reduce((acc, post) => {
    const monthKey = format(new Date(post.publishedDate), 'MMMM yyyy');
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(post);
    return acc;
  }, {} as Record<string, BlogPost[]>);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span className="material-symbols-outlined text-[16px]">
            chevron_right
          </span>
          <Link
            to="/newsletter"
            className="hover:text-primary transition-colors"
          >
            Newsletter
          </Link>
          <span className="material-symbols-outlined text-[16px]">
            chevron_right
          </span>
          <span className="text-slate-900 dark:text-white">Archive</span>
        </nav>

        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 font-display">
          Newsletter Archive
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          Browse through our past newsletters and catch up on the stories you
          might have missed.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4 block">
            archive
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No archived posts yet
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Check back later for past newsletter content.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Home
          </Link>
        </div>
      ) : (
        <>
          {Object.entries(groupedPosts).map(([month, monthPosts]) => (
            <div key={month} className="mb-12">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  calendar_month
                </span>
                {month}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                  ({monthPosts.length}{' '}
                  {monthPosts.length === 1 ? 'post' : 'posts'})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {monthPosts.map((post) => (
                  <ArticleCard key={post._id} post={post} variant="grid" />
                ))}
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-8 py-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary text-slate-700 dark:text-white font-medium transition-all disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Loading...
                  </>
                ) : (
                  <>
                    Load More
                    <span className="material-symbols-outlined">
                      expand_more
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <p className="text-center text-slate-500 dark:text-slate-400 pt-8">
              You've reached the end of the archive! 📚
            </p>
          )}
        </>
      )}
    </div>
  );
};
