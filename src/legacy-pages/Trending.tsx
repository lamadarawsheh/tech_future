'use client';
import React, { useEffect, useState } from 'react';
import Link from '../../app/components/Link';
import { getTrendingPostsByTime, TrendingTimeFilter } from '../services/sanity';
import { BlogPost, getSlug } from '../types';

const POSTS_PER_PAGE = 12;
import { GridCardSkeleton } from '../components/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from '../components/AuthModal';
import { useTranslation } from 'react-i18next';

export const Trending: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TrendingTimeFilter>('week');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [topicSuggestion, setTopicSuggestion] = useState('');
  const [suggestionEmail, setSuggestionEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();

  const timeFilters: { key: TrendingTimeFilter; label: string }[] = [
    { key: 'today', label: t('home.timeFilter.today') },
    { key: 'week', label: t('home.timeFilter.week') },
    { key: 'month', label: t('home.timeFilter.month') },
    { key: 'all', label: t('home.timeFilter.all') },
  ];

  const handleSuggestTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicSuggestion.trim()) return;

    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitting(false);
    setSubmitted(true);

    setTimeout(() => {
      setShowSuggestModal(false);
      setSubmitted(false);
      setTopicSuggestion('');
      setSuggestionEmail('');
    }, 2000);
  };

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      const lang = i18n.language;
      try {
        const data = await getTrendingPostsByTime(activeFilter, POSTS_PER_PAGE, lang);

        setPosts(data);
      } catch (error) {
        console.error('Error fetching trending posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [activeFilter, i18n.language]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => <GridCardSkeleton key={i} />)}
      </div>
    )
  }

  const heroPost = posts[0];
  const gridPosts = posts.slice(1);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white font-display">
              {t('trending.title')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-normal leading-normal">
              {t('trending.subtitle')}
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {timeFilters.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`flex h-9 shrink-0 items-center justify-center px-4 rounded-full transition-colors cursor-pointer ${activeFilter === key
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-transparent'
                  }`}
              >
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* #01 Hero Article */}
      {heroPost && (
        <section className="w-full mb-12">
          <div className="group relative flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white dark:bg-surface-dark shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors duration-300">
            <div className="absolute top-0 left-0 rtl:left-auto rtl:right-0 z-10 bg-primary text-white px-4 py-2 rounded-br-2xl rtl:rounded-br-none rtl:rounded-bl-2xl text-lg font-bold shadow-lg">#01</div>
            <Link to={`/article/${getSlug(heroPost.slug)}`} className="w-full md:w-3/5 h-64 md:h-auto min-h-[360px] bg-center bg-no-repeat bg-cover relative" style={{ backgroundImage: `url('${heroPost.image}')` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
            </Link>
            <div className="flex w-full md:w-2/5 flex-col justify-center p-6 md:p-8 lg:p-10 gap-4">
              <div className="flex items-center gap-2 w-full">
                <span className="px-2.5 py-1 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">{heroPost.categories?.[0]?.title}</span>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm ml-auto">
                  <span className="material-symbols-outlined text-sm text-red-500">favorite</span>
                  <span>{heroPost.likeCount || 0}</span>
                </div>
              </div>
              <Link to={`/article/${getSlug(heroPost.slug)}`}>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors cursor-pointer font-display">
                  {heroPost.title}
                </h2>
              </Link>
              <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed line-clamp-3">
                {heroPost.excerpt}
              </p>
              <div className="flex justify-end mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link to={`/article/${getSlug(heroPost.slug)}`} className="flex items-center justify-center h-9 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium hover:bg-primary hover:text-white transition-all">
                  {t('trending.readArticle')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid for rest */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {gridPosts.map((item, index) => (
          <div key={item._id} className="group flex flex-col gap-0 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <Link to={`/article/${getSlug(item.slug)}`} className="relative w-full aspect-video bg-center bg-no-repeat bg-cover overflow-hidden" style={{ backgroundImage: `url('${item.image}')` }}>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
              <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-slate-900/80 backdrop-blur text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-lg border border-white/10">0{index + 2}</div>
            </Link>
            <div className="flex flex-col gap-3 p-5 flex-1">
              <div className="flex justify-between items-start">
                <span className="text-primary text-xs font-bold uppercase tracking-wider">{item.categories?.[0]?.title}</span>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
                  <span className="material-symbols-outlined text-xs text-red-500">favorite</span>
                  <span>{item.likeCount || 0}</span>
                </div>
              </div>
              <Link to={`/article/${getSlug(item.slug)}`}>
                <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 font-display">
                  {item.title}
                </h3>
              </Link>
              <div className="flex justify-end mt-auto pt-2">
                <Link to={`/article/${getSlug(item.slug)}`} className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary flex items-center gap-1">
                  {t('trending.readMore')} <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Subscribe Banner */}
      <section className="w-full mt-8">
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 dark:bg-slate-900 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/20 dark:bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12">
            <div className="flex flex-col gap-3 md:w-1/2 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-display">
                {t('trending.subscribeTitle')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-base max-w-md mx-auto md:mx-0">
                {t('trending.subscribeDesc')}
              </p>
            </div>
            <div className="flex w-full md:w-1/2 max-w-md">
              {user ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 w-full">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                  <div>
                    <p className="text-slate-900 dark:text-white font-medium">{t('trending.subscribed')}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex w-full gap-3 flex-col sm:flex-row">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex-1 h-12 px-6 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                    {t('trending.subscribeBtn')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Suggest a Topic Section */}
      <section className="w-full mt-12 mb-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 font-display">
            {t('trending.cantFind')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            {t('trending.suggestDesc')}
          </p>
          <button
            onClick={() => setShowSuggestModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <span className="material-symbols-outlined">lightbulb</span>
            {t('trending.suggestBtn')}
          </button>
        </div>
      </section>

      {posts.length === 0 && !loading && (
        <p className="text-center text-slate-500 dark:text-slate-400 pt-8 pb-4">
          {t('trending.noPosts')}
        </p>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      )}

      {/* Suggest Topic Modal */}
      {showSuggestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setShowSuggestModal(false)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {t('trending.thankYou')}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {t('trending.suggestionSubmitted')}
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">lightbulb</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {t('trending.suggestionTitle')}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('trending.suggestionPrompt')}
                  </p>
                </div>

                <form onSubmit={handleSuggestTopic} className="space-y-4">
                  <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t('trending.topicLabel')}
                    </label>
                    <textarea
                      id="topic"
                      value={topicSuggestion}
                      onChange={(e) => setTopicSuggestion(e.target.value)}
                      placeholder={t('trending.topicPlaceholder')}
                      required
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="suggestionEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t('trending.emailLabel')}
                    </label>
                    <input
                      id="suggestionEmail"
                      type="email"
                      value={suggestionEmail}
                      onChange={(e) => setSuggestionEmail(e.target.value)}
                      placeholder={t('trending.emailPlaceholder')}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                    <p className="text-xs text-slate-500 mt-1">{t('trending.notify')}</p>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !topicSuggestion.trim()}
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        {t('trending.submitting')}
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px] rtl:rotate-180">send</span>
                        {t('trending.submitBtn')}
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
