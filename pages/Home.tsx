import React, { useEffect, useState } from 'react';
import {
  getFeaturedPost,
  getRecentPosts,
  getTotalPostsCount,
  getPopularTags,
  getTrendingPostsByTime,
  TrendingTimeFilter,
} from '../services/sanity';
import { ArticleCard } from '../components/ArticleCard';
import { HeroSkeleton, ArticleCardSkeleton } from '../components/Skeleton';
import { AuthModal } from '../components/AuthModal';
import { Link } from 'react-router-dom';
import { BlogPost, getSlug } from '../types';
import { format } from 'date-fns';
import { useStore } from '../store';
import { useAuth } from '../contexts/AuthContext';

const POSTS_PER_PAGE = 6;

export const Home: React.FC = () => {
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [popularTags, setPopularTags] = useState<
    { tag: string; count: number }[]
  >([]);
  const [trendingPosts, setTrendingPosts] = useState<BlogPost[]>([]);
  const [trendingFilter, setTrendingFilter] =
    useState<TrendingTimeFilter>('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { user, subscriber } = useAuth();
  const isAuthenticated = !!user && !!subscriber;
  const { toggleAiModal } = useStore();

  useEffect(() => {
    const loadData = async () => {
      const [featured, recent, total, tags, trending] = await Promise.all([
        getFeaturedPost(),
        getRecentPosts(POSTS_PER_PAGE, 0),
        getTotalPostsCount(),
        getPopularTags(8),
        getTrendingPostsByTime('all', 4),
      ]);
      setFeaturedPost(featured);
      setRecentPosts(recent);
      setTotalPosts(total);
      setPopularTags(tags);
      setTrendingPosts(trending);
      setLoading(false);
    };
    loadData();
  }, []);

  // Fetch trending posts when filter changes
  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      const trending = await getTrendingPostsByTime(trendingFilter, 4);
      setTrendingPosts(trending);
      setLoadingTrending(false);
    };
    fetchTrending();
  }, [trendingFilter]);

  const loadMorePosts = async () => {
    setLoadingMore(true);
    const morePosts = await getRecentPosts(POSTS_PER_PAGE, recentPosts.length);
    setRecentPosts((prev) => [...prev, ...morePosts]);
    setLoadingMore(false);
  };

  const hasMorePosts = recentPosts.length < totalPosts;

  if (loading) {
    return (
      <>
        <HeroSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-8 flex flex-col gap-12">
            <div className="flex flex-col gap-10">
              {[1, 2, 3].map((i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 hidden lg:block">
            <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse mb-8"></div>
            <div className="h-48 bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse"></div>
          </div>
        </div>
      </>
    );
  }

  // Fallback UI if no data is present yet
  if (!featuredPost && recentPosts.length === 0) {
    return (
      <div className="p-10 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
        <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
          Connection Established
        </h2>
        <p className="text-slate-500">
          No content found. Please add 'blogPost' documents to your Sanity
          Studio.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      {featuredPost && (
        <section className="mb-16 rounded-3xl overflow-hidden relative group shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/60 to-transparent z-10"></div>
          <div
            className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105"
            style={{ backgroundImage: `url('${featuredPost.image}')` }}
          ></div>
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10 lg:p-16">
            <div className="max-w-4xl space-y-6 transform transition-transform duration-500 group-hover:-translate-y-2">
              <div className="flex flex-wrap items-center gap-4">
                <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-primary rounded-full shadow-lg shadow-primary/40">
                  Featured Story
                </span>
                <div className="flex items-center gap-2 text-slate-200 text-sm font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[16px]">
                    calendar_today
                  </span>
                  {new Date(featuredPost.publishedDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-slate-200 text-sm font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[16px]">
                    schedule
                  </span>
                  {featuredPost.readingTime} min read
                </div>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-sm font-display">
                {featuredPost.title}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-slate-200 font-medium max-w-2xl leading-relaxed drop-shadow-sm hidden sm:block">
                {featuredPost.excerpt}
              </p>
              <div className="pt-4">
                <Link
                  to={`/article/${getSlug(featuredPost.slug)}`}
                  className="inline-flex items-center gap-3 pl-6 pr-4 py-3.5 bg-white text-slate-900 rounded-full font-bold text-sm hover:bg-slate-50 transition-all hover:pr-6 shadow-lg shadow-white/10 group-btn"
                >
                  Read Full Article
                  <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center transition-colors group-btn-hover:bg-primary group-btn-hover:text-white">
                    <span className="material-symbols-outlined text-[16px] text-slate-900">
                      arrow_forward
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-8 flex flex-col gap-12">
          <div className="flex items-end justify-between border-b border-border-light dark:border-border-dark pb-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
                Latest Thoughts
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Insights on technology, design, and coding.
              </p>
            </div>
            <div className="flex gap-2 bg-slate-100 dark:bg-surface-dark p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  grid_view
                </span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  view_list
                </span>
              </button>
            </div>
          </div>

          {/* AI Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-100 dark:border-slate-700 bg-indigo-50/50 dark:bg-slate-800/30 p-5 shadow-sm">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-2xl"></div>
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-700 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-600">
                  <span className="material-symbols-outlined">smart_toy</span>
                  <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900"></span>
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    AI Content Guide
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Need recommendations or have a question? Ask our AI
                    assistant.
                  </p>
                </div>
              </div>
              <button
                onClick={toggleAiModal}
                className="group flex items-center gap-2 rounded-full bg-white dark:bg-slate-700 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600 transition-all hover:text-primary dark:hover:text-primary hover:shadow-md active:scale-95"
              >
                <span>Ask Assistant</span>
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                  chat
                </span>
              </button>
            </div>
          </div>

          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
                : 'flex flex-col gap-10'
            }
          >
            {recentPosts.map((post) => (
              <ArticleCard key={post._id} post={post} variant={viewMode} />
            ))}
          </div>

          {hasMorePosts && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMorePosts}
                disabled={loadingMore}
                className="flex items-center gap-3 px-10 py-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark hover:border-primary dark:hover:border-primary text-slate-900 dark:text-white hover:text-primary dark:hover:text-primary font-bold shadow-sm hover:shadow-lg transition-all active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Articles
                    <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">
                      refresh
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {!hasMorePosts && recentPosts.length > 0 && (
            <p className="text-center text-slate-500 dark:text-slate-400 mt-6">
              You've reached the end! 🎉
            </p>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-10">
          {/* Newsletter Widget */}
          <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-surface-dark p-8 rounded-3xl border border-indigo-100 dark:border-slate-700 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-primary">
                <span className="material-symbols-outlined">mail</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                Newsletter
              </h3>
            </div>
            {isAuthenticated ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-500 text-2xl">
                    check_circle
                  </span>
                </div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                  You're subscribed!
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Signed in as {user?.email}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Get the latest tech trends and design insights delivered to
                  your inbox weekly. No spam, just value.
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    magic_button
                  </span>
                  Join 10k+ Readers
                </button>
              </>
            )}
          </div>

          {/* Popular Tags */}
          <div className="bg-white dark:bg-transparent p-6 rounded-3xl border border-slate-100 dark:border-none shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-primary">
                label
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Popular Tags
              </h3>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {popularTags.length > 0 ? (
                popularTags.map(({ tag, count }) => (
                  <Link
                    key={tag}
                    to={`/search?tag=${tag}`}
                    className="group px-4 py-2 rounded-full bg-slate-50 dark:bg-surface-dark hover:bg-primary hover:text-white text-slate-600 dark:text-slate-300 text-sm font-semibold transition-all border border-slate-200 dark:border-slate-800 hover:border-primary flex items-center gap-2"
                  >
                    {tag}
                    <span className="text-xs text-slate-400 group-hover:text-white/70">
                      {count}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-400">No tags found</p>
              )}
            </div>
          </div>

          {/* Trending */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-light dark:border-border-dark">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">
                  trending_up
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Trending Now
                </h3>
              </div>
            </div>

            {/* Time Filter Tabs */}
            <div className="flex flex-wrap gap-1 mb-6 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
              {[
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'This Week' },
                { key: 'month', label: 'This Month' },
                { key: 'all', label: 'All Time' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTrendingFilter(key as TrendingTimeFilter)}
                  className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    trendingFilter === key
                      ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-5">
              {loadingTrending ? (
                // Loading skeleton
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-4 items-start animate-pulse">
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                    </div>
                  </div>
                ))
              ) : trendingPosts.length > 0 ? (
                trendingPosts.map((post, index) => (
                  <Link
                    key={post._id}
                    to={`/article/${getSlug(post.slug)}`}
                    className="group flex gap-4 items-start"
                  >
                    <span className="text-2xl font-black text-slate-200 dark:text-slate-700 group-hover:text-primary transition-colors font-display w-8 flex-shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                        <span>
                          {post.publishedDate
                            ? format(new Date(post.publishedDate), 'MMM d')
                            : ''}
                        </span>
                        <span>•</span>
                        <span>{post.readingTime || 5} min read</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">
                            visibility
                          </span>
                          {post.viewCount || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">
                  No trending posts for this period
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};
