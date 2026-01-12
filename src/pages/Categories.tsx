import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/sanity';
import { Category } from '../types';
import { GridCardSkeleton } from '../components/Skeleton';
import { useTranslation } from 'react-i18next';

function getSlug(slug: any): string {
  if (!slug) return '';
  return typeof slug === 'string' ? slug : slug.current || '';
}

export const Categories: React.FC = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [topicSuggestion, setTopicSuggestion] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
      setEmail('');
    }, 2000);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white font-display">
            {t('categories.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-normal leading-normal">
            {t('categories.subtitle')}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <GridCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/category/${getSlug(category.slug)}`}
              className="group flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-2xl">
                    {category.title === 'AI & ML' ? 'smart_toy' :
                      category.title === 'Development' ? 'code' :
                        category.title === 'Cloud' ? 'cloud' :
                          category.title === 'Security' ? 'security' :
                            category.title === 'Data' ? 'database' : 'folder'}
                  </span>
                </div>
                <span className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:border-primary group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-display group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">
                  {category.description}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                <span>{t('categories.explore')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">No categories found.</p>
        </div>
      )}

      {/* CTA Section */}
      <div className="mt-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
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
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t('trending.emailLabel')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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