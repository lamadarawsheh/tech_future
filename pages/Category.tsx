import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostsByCategory } from '../services/sanity';
import { GridCardSkeleton } from '../components/Skeleton';
import { BlogPost } from '../types';
import { useStore } from '../store';
import { client } from '../lib/sanity';

interface Category {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  count: number;
}

export const Category: React.FC = () => {
  const { slug } = useParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const { toggleAiModal } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      if (slug) {
        try {
          console.log('Fetching posts for category slug:', slug);
          const data = await getPostsByCategory(slug);
          console.log('Received posts data:', data);
          setPosts(data);
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [slug]);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const query = `*[_type == "category"] | order(title asc) {
        _id,
        title,
        "slug": slug.current,
        "count": count(*[_type == "blogPost" && references(^._id)])
      }`;
      
      const data = await client.fetch(query);
      console.log('Fetched categories with counts:', data); // Add this for debugging
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  fetchCategories();
}, []);

  const categoryTitle = slug ? slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') : 'Technology';

  if (loading) {
    return (
      <div className="w-full">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6 animate-pulse"></div>
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="w-full max-w-2xl space-y-3">
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
            <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GridCardSkeleton />
              <GridCardSkeleton />
              <GridCardSkeleton />
              <GridCardSkeleton />
            </div>
          </div>
          <aside className="hidden lg:block w-80 shrink-0 space-y-8">
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex mb-6">
        <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
          <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li><span className="material-symbols-outlined text-[16px] pt-1">chevron_right</span></li>
          <li><Link to="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
          <li><span className="material-symbols-outlined text-[16px] pt-1">chevron_right</span></li>
          <li aria-current="page" className="font-medium text-primary dark:text-white">{categoryTitle}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
              Category Archive
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 text-slate-900 dark:text-white font-display">
            {categoryTitle}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-body leading-relaxed">
            Deep dives into the latest trends in tech, AI breakthroughs, and software engineering practices.
            <span className="text-primary font-medium ml-1">{posts.length} articles</span> curated for developers.
          </p>
        </div>
        <button className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-all shadow-lg">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Follow Category
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              Most Recent
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
              Popular
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
              Trending
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {posts.length > 0 ? posts.map((post, idx) => (
              <article key={post._id} className={`group ${idx === 0 ? 'md:col-span-2 grid md:grid-cols-2 gap-0' : 'flex flex-col'} relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
                <div className={`${idx === 0 ? 'h-64 md:h-full' : 'h-48'} w-full bg-cover bg-center`} style={{ backgroundImage: `url('${post.image}')` }}></div>
                <div className={`p-6 md:p-8 flex flex-col justify-center ${idx === 0 ? '' : 'flex-1'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-primary text-xs font-bold uppercase tracking-wider">
                      {post.categories?.[0]?.title || 'Tech'}
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-slate-400 text-xs">
                      {new Date(post.publishedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <Link to={`/article/${post.slug?.current}`}>
                    <h3 className={`${idx === 0 ? 'text-2xl' : 'text-xl'} font-bold mb-3 text-slate-900 dark:text-white group-hover:text-primary transition-colors font-display`}>
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-slate-600 dark:text-slate-400 font-body mb-6 line-clamp-3 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className={`flex items-center gap-3 mt-auto ${idx !== 0 ? 'pt-4 border-t border-slate-100 dark:border-slate-800' : ''}`}>
                    {idx === 0 && post.author?.image && (
                      <div className="size-8 rounded-full bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url('${post.author.image}')` }}></div>
                    )}
                    <div className="text-xs flex justify-between w-full items-center">
                      <span className={`font-bold ${idx === 0 ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                        {post.author?.name || 'Anonymous'}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span> 
                        {post.readingTime || '5'} min read
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            )) : (
              <div className="md:col-span-2 py-10 text-center text-slate-500">
                No articles found in this category.
              </div>
            )}
          </div>

          {posts.length > 0 && (
            <div className="flex flex-col items-center">
              <button className="w-full md:w-auto min-w-[200px] flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 font-bold hover:bg-primary transition-colors group shadow-lg">
                Load More Articles
                <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">expand_more</span>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block w-80 shrink-0 space-y-8">
          {/* AI Widget */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-900 dark:to-slate-800 p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-8xl text-primary">smart_toy</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Online</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Need help? Ask me to find articles or summarize trends in this category.
              </p>
              <div className="relative">
                <button 
                  onClick={toggleAiModal}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2.5 pl-3 pr-10 text-sm focus:border-primary focus:ring-primary text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm text-left"
                >
                  Ask a question...
                </button>
                <button 
                  onClick={toggleAiModal}
                  className="absolute right-1.5 top-1.5 rounded-md p-1 text-slate-400 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={toggleAiModal} className="rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:border-primary/50 hover:text-primary transition-colors">
                  Top articles
                </button>
                <button onClick={toggleAiModal} className="rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:border-primary/50 hover:text-primary transition-colors">
                  Summarize
                </button>
              </div>
            </div>
          </div>

          {/* Digest Widget */}
          <div className="rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 p-6 sticky top-24">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <span className="material-symbols-outlined">mail</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">Weekly Digest</h3>
            <p className="text-slate-400 text-sm mb-4">Get the latest tech news and tutorials delivered straight to your inbox every Tuesday.</p>
            <form className="space-y-3" onSubmit={e => e.preventDefault()}>
              <input 
                className="w-full rounded-lg bg-slate-800 dark:bg-slate-900 border-slate-700 text-white text-sm placeholder-slate-500 focus:ring-primary focus:border-primary" 
                placeholder="Your email address" 
                type="email"
              />
              <button 
                className="w-full rounded-lg bg-primary py-2 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-lg" 
                type="submit"
              >
                Subscribe Free
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-display">Categories</h3>
            {categoriesLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2">
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                    <div className="h-5 w-5 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <Link 
                    key={category._id}
                    to={`/category/${category.slug.current}`}
                    className={`flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                      slug === category.slug.current ? 'bg-slate-50 dark:bg-slate-800' : ''
                    }`}
                  >
                    <span className={`text-sm font-medium transition-colors ${
                      slug === category.slug.current 
                        ? 'text-primary' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-primary'
                    }`}>
                      {category.title}
                    </span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 dark:text-slate-400">
                      {category.count}
                    </span>
                  </Link>
                ))}
                <div className="mt-4">
                  <Link 
                    to="/categories" 
                    className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    View all categories
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Trending Mini */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-display">Trending Now</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((num) => (
                <Link 
                  key={num} 
                  to="#" 
                  className="group flex gap-3"
                >
                  <span className="text-2xl font-black text-slate-200 dark:text-slate-800 group-hover:text-primary transition-colors font-display">
                    0{num}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                      How to optimize React performance in 2024
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Sep 12 • 4 min read
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Category;