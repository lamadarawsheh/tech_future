import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchPosts } from '../services/sanity';
import { ArticleCardSkeleton } from '../components/Skeleton';
import { BlogPost } from '../types';

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTag = searchParams.get('tag') || '';
  const [query, setQuery] = useState(initialTag);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Debounce and search
  useEffect(() => {
    const fetchResults = async () => {
        setLoading(true);
        if (query) {
            const results = await searchPosts(query);
            setPosts(results);
        } else {
            setPosts([]);
        }
        setLoading(false);
    };

    const timeoutId = setTimeout(() => {
        fetchResults();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Search Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-slate-900 dark:text-white">Search</span>
        </div>
        <div className="w-full max-w-3xl">
          <label className="flex flex-col h-14 w-full relative">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-lg shadow-black/5 dark:shadow-black/20">
              <div className="text-slate-400 dark:text-slate-500 flex border-none bg-white dark:bg-slate-800 items-center justify-center pl-4 rounded-l-xl">
                <span className="material-symbols-outlined text-[24px]">search</span>
              </div>
              <input 
                className="flex w-full min-w-0 flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-none focus:ring-0 h-full placeholder:text-slate-400 px-4 text-lg font-medium" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for articles..."
              />
              <div className="flex items-center justify-center rounded-r-xl bg-white dark:bg-slate-800 pr-2">
                <button className="flex cursor-pointer items-center justify-center rounded-lg bg-transparent text-slate-400 hover:text-primary p-2" onClick={() => setQuery('')}>
                  <span className="material-symbols-outlined text-[24px]">close</span>
                </button>
                <button className="hidden sm:flex ml-2 mr-2 cursor-pointer items-center justify-center rounded-lg h-10 px-6 bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-colors">
                    Search
                </button>
              </div>
            </div>
          </label>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight mb-2 font-display">Results for "{query}"</h1>
            <p className="text-slate-500 dark:text-slate-400">Showing {posts.length} articles</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary text-white px-4 border border-transparent font-medium text-sm">
               Relevance
            </button>
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 px-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-sm">
               Newest
            </button>
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 px-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-sm">
               Popular
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 space-y-8">
          <div className="flex flex-col gap-4">
            <h3 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2 font-display">
              <span className="material-symbols-outlined text-primary">category</span>
              Categories
            </h3>
            <div className="flex flex-col gap-2">
              {[
                  { name: 'All Categories', count: 124, checked: true },
                  { name: 'Design Systems', count: 42, checked: false },
                  { name: 'Development', count: 18, checked: false },
                  { name: 'UX Research', count: 8, checked: false }
              ].map((cat) => (
                <label key={cat.name} className="group flex items-center gap-3 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors -mx-2">
                  <div className="relative flex items-center">
                    <input defaultChecked={cat.checked} className="peer h-4 w-4 border-2 border-slate-300 dark:border-slate-600 bg-transparent checked:border-primary checked:bg-primary focus:ring-0 focus:ring-offset-0 transition-all text-primary" name="category" type="radio"/>
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white text-sm font-medium flex-1">{cat.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{cat.count}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2 font-display">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              Date Posted
            </h3>
            <div className="flex flex-col gap-2">
              {['Past 24 hours', 'Past week', 'Past month', 'Past year'].map((time, i) => (
                 <label key={time} className="group flex items-center gap-3 p-1 cursor-pointer">
                    <input defaultChecked={i === 2} className="rounded border-slate-300 dark:border-slate-600 bg-transparent text-primary focus:ring-0 checked:bg-primary checked:border-primary h-4 w-4" type="checkbox"/>
                    <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white text-sm">{time}</span>
                 </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
             <h3 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2 font-display">
               <span className="material-symbols-outlined text-primary">label</span>
               Related Tags
             </h3>
             <div className="flex flex-wrap gap-2">
                {['WCAG', 'Color Contrast', 'Screen Readers', 'A11y', 'Inclusive Design'].map((tag, i) => (
                    <button key={tag} className={`px-3 py-1.5 rounded-md text-xs transition-colors border ${i === 2 ? 'bg-primary/10 text-primary border-primary/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border-transparent'}`}>
                        {tag}
                    </button>
                ))}
             </div>
          </div>
        </aside>

        {/* Results List */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          {loading ? (
             <div className="flex flex-col gap-4">
                 <ArticleCardSkeleton />
                 <ArticleCardSkeleton />
                 <ArticleCardSkeleton />
             </div>
          ) : (
            <>
            {posts.map((post, i) => (
             <article key={i} className="group flex flex-col md:flex-row gap-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
               <div className="w-full md:w-64 h-48 md:h-auto shrink-0 relative overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
                  <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{backgroundImage: `url('${post.image}')`}}></div>
                  <div className="absolute top-3 left-3 bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-sm">{post.categories[0]?.title}</div>
               </div>
               <div className="flex flex-col flex-1 gap-2">
                 <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      <span>{new Date(post.publishedDate).toLocaleDateString()}</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span>{post.readingTime} min read</span>
                    </div>
                 </div>
                 <Link to={`/article/${post.slug.current}`}>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors cursor-pointer font-display">
                        {post.title}
                    </h2>
                 </Link>
                 <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 md:line-clamp-3">
                    {post.excerpt}
                 </p>
                 <div className="mt-auto pt-3 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <div className="size-6 rounded-full bg-slate-200 bg-cover bg-center" style={{backgroundImage: `url('${post.author.image}')`}}></div>
                       <span className="text-sm text-slate-900 dark:text-white font-medium">{post.author.name}</span>
                    </div>
                    <div className="flex-1"></div>
                    <Link to={`/article/${post.slug.current}`} className="text-primary text-sm font-semibold flex items-center gap-1 group/btn hover:underline">
                        Read Article
                        <span className="material-symbols-outlined text-[16px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                 </div>
               </div>
             </article>
            ))}
            </>
          )}
          
          {!loading && posts.length > 0 && (
          <div className="flex flex-col items-center justify-center pt-8 gap-4">
             <p className="text-sm text-slate-500 dark:text-slate-400">Showing {posts.length} results</p>
             <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full max-w-xs overflow-hidden">
                <div className="h-full bg-primary w-[16%]"></div>
             </div>
             <button className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors gap-2 mt-2">
                <span>Load More</span>
                <span className="material-symbols-outlined text-[20px]">refresh</span>
             </button>
          </div>
          )}

          {!loading && posts.length === 0 && (
               <div className="py-20 text-center text-slate-500">No results found.</div>
          )}
        </div>
      </div>
    </div>
  );
};