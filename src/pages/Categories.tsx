// pages/Categories.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { client } from '../lib/sanity';
import { GridCardSkeleton } from '../components/Skeleton';

interface Category {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  color?: string;
  "postCount"?: number;
}

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [topicSuggestion, setTopicSuggestion] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const query = `*[_type == "category"] {
          _id,
          title,
          "slug": slug.current,
          description,
          color,
          "postCount": count(*[_type == "blogPost" && references(^._id)])
        } | order(title asc)`;
        
        const data = await client.fetch(query);
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Color mapping for category cards
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-teal-600',
    purple: 'from-purple-500 to-indigo-600',
    orange: 'from-orange-500 to-amber-600',
    default: 'from-slate-600 to-slate-700'
  };

  const handleSuggestTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicSuggestion.trim()) return;
    
    setSubmitting(true);
    // Simulate API call - in production, you'd send this to your backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitting(false);
    setSubmitted(true);
    
    // Reset after a few seconds
    setTimeout(() => {
      setShowSuggestModal(false);
      setSubmitted(false);
      setTopicSuggestion('');
      setEmail('');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded mx-auto mb-8 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 font-display">
            Explore Categories
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover {categories.length} categories covering the latest in technology, development, and innovation.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const bgGradient = colorMap[category.color as keyof typeof colorMap] || colorMap.default;
            return (
              <Link
                key={category._id}
                to={`/category/${category.slug}`}
                className="group block h-full"
              >
                <div className="h-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className={`h-2 ${bgGradient} bg-gradient-to-r`}></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {category.title}
                      </h2>
                      <span className="text-sm font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {category.postCount || 0}
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center text-sm font-medium text-primary group-hover:underline">
                      View all posts
                      <svg
                        className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Let us know what topics you'd like to see more of. We're always looking to expand our coverage.
          </p>
          <button 
            onClick={() => setShowSuggestModal(true)}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Suggest a Topic
          </button>
        </div>
      </div>

      {/* Suggest Topic Modal */}
      {showSuggestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setShowSuggestModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Thank you!
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Your suggestion has been submitted. We'll review it soon!
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">lightbulb</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Suggest a Topic
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    What would you like us to write about?
                  </p>
                </div>

                <form onSubmit={handleSuggestTopic} className="space-y-4">
                  <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Topic *
                    </label>
                    <textarea
                      id="topic"
                      value={topicSuggestion}
                      onChange={(e) => setTopicSuggestion(e.target.value)}
                      placeholder="e.g., How to build a REST API with Node.js"
                      required
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email (optional)
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                    <p className="text-xs text-slate-500 mt-1">We'll notify you when we publish it</p>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !topicSuggestion.trim()}
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">send</span>
                        Submit Suggestion
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

export default Categories;