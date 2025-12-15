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
          <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Suggest a Topic
          </button>
        </div>
      </div>
    </div>
  );
};

export default Categories;