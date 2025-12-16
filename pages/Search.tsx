import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchPosts, SearchSortOption, SearchDateFilter, getCategories, getPopularTags, getSearchResultsCount } from '../services/sanity';
import { ArticleCardSkeleton } from '../components/Skeleton';
import { BlogPost, Category, getSlug } from '../types';

const POSTS_PER_PAGE = 10;

const sortOptions: { key: SearchSortOption; label: string }[] = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'newest', label: 'Newest' },
  { key: 'popular', label: 'Popular' },
];

// Date filter options
const dateFilters: { key: SearchDateFilter; label: string }[] = [
  { key: 'all', label: 'All Time' },
  { key: '24h', label: 'Past 24 hours' },
  { key: 'week', label: 'Past week' },
  { key: 'month', label: 'Past month' },
  { key: 'year', label: 'Past year' },
];

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTag = searchParams.get('tag') || '';
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery || initialTag);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<SearchSortOption>('relevance');
  const [categories, setCategories] = useState<(Category & { count: number })[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTag ? [initialTag] : []);
  const [dateFilter, setDateFilter] = useState<SearchDateFilter>('all');
  
  // Fetch categories and tags on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          getCategories(),
          getPopularTags(10)
        ]);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };
    fetchFilters();
  }, []);
  
  // Update query when URL params change
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    const urlTag = searchParams.get('tag') || '';
    if (urlQuery) {
      setQuery(urlQuery);
    } else if (urlTag) {
      setQuery(urlTag);
      setSelectedTags([urlTag]);
    }
  }, [searchParams]);
  
  // Build search filters object
  const buildFilters = useCallback(() => ({
    term: query,
    limit: POSTS_PER_PAGE,
    offset: 0,
    sort: sortBy,
    category: selectedCategory,
    dateFilter,
    tags: selectedTags.length > 0 ? selectedTags : undefined
  }), [query, sortBy, selectedCategory, dateFilter, selectedTags]);
  
  // Debounce and search
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const filters = buildFilters();
        
        // Fetch both results and count in parallel
        const [results, count] = await Promise.all([
          searchPosts(filters),
          getSearchResultsCount(filters)
        ]);
        
        setPosts(results);
        setTotalResults(count);
        setHasMore(results.length < count);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setPosts([]);
        setTotalResults(0);
      }
      setLoading(false);
    };

    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 400); // 400ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, sortBy, selectedCategory, dateFilter, selectedTags, buildFilters]);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const filters = {
        term: query,
        limit: POSTS_PER_PAGE,
        offset: posts.length,
        sort: sortBy,
        category: selectedCategory,
        dateFilter,
        tags: selectedTags.length > 0 ? selectedTags : undefined
      };
      
      const morePosts = await searchPosts(filters);
      setPosts(prev => [...prev, ...morePosts]);
      setHasMore(posts.length + morePosts.length < totalResults);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [query, posts.length, loadingMore, sortBy, selectedCategory, dateFilter, selectedTags, hasMore, totalResults]);

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
            <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight mb-2 font-display">
              {query ? `Results for "${query}"` : 'Browse Articles'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {loading ? 'Searching...' : `Found ${totalResults} article${totalResults !== 1 ? 's' : ''}`}
              {selectedCategory !== 'all' && ` in ${categories.find(c => getSlug(c.slug) === selectedCategory)?.title || selectedCategory}`}
              {selectedTags.length > 0 && ` tagged with ${selectedTags.join(', ')}`}
              {dateFilter !== 'all' && ` from ${dateFilters.find(d => d.key === dateFilter)?.label?.toLowerCase()}`}
            </p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {sortOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 font-medium text-sm transition-colors ${
                  sortBy === key
                    ? 'bg-primary text-white border border-transparent'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {label}
            </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 space-y-8">
          {/* Active Filters Summary */}
          {(selectedCategory !== 'all' || selectedTags.length > 0 || dateFilter !== 'all') && (
            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">filter_alt</span>
                  Active Filters
                </span>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedTags([]);
                    setDateFilter('all');
                  }}
                  className="text-xs text-primary hover:text-primary-dark font-medium"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs rounded-lg">
                    <span className="material-symbols-outlined text-xs">folder</span>
                    {categories.find(c => getSlug(c.slug) === selectedCategory)?.title}
                    <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-violet-900 dark:hover:text-white">×</button>
                  </span>
                )}
                {selectedTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs rounded-lg">
                    <span className="material-symbols-outlined text-xs">tag</span>
                    {tag}
                    <button onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))} className="ml-1 hover:text-cyan-900 dark:hover:text-white">×</button>
                  </span>
                ))}
                {dateFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-lg">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    {dateFilters.find(d => d.key === dateFilter)?.label}
                    <button onClick={() => setDateFilter('all')} className="ml-1 hover:text-amber-900 dark:hover:text-white">×</button>
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <h3 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2 font-display">
              <span className="material-symbols-outlined text-primary">category</span>
              Categories
            </h3>
            <div className="flex flex-col gap-2">
              <label className="group flex items-center gap-3 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors -mx-2">
                <div className="relative flex items-center">
                  <input 
                    checked={selectedCategory === 'all'} 
                    onChange={() => setSelectedCategory('all')}
                    className="peer h-4 w-4 border-2 border-slate-300 dark:border-slate-600 bg-transparent checked:border-primary checked:bg-primary focus:ring-0 focus:ring-offset-0 transition-all text-primary" 
                    name="category" 
                    type="radio"
                  />
                </div>
                <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white text-sm font-medium flex-1">All Categories</span>
                <span className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {categories.reduce((sum, cat) => sum + cat.count, 0)}
                </span>
              </label>
              {categories.map((cat) => (
                <label key={cat._id} className="group flex items-center gap-3 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors -mx-2">
                  <div className="relative flex items-center">
                    <input 
                      checked={selectedCategory === getSlug(cat.slug)} 
                      onChange={() => setSelectedCategory(getSlug(cat.slug))}
                      className="peer h-4 w-4 border-2 border-slate-300 dark:border-slate-600 bg-transparent checked:border-primary checked:bg-primary focus:ring-0 focus:ring-offset-0 transition-all text-primary" 
                      name="category" 
                      type="radio"
                    />
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white text-sm font-medium flex-1">{cat.title}</span>
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
              {dateFilters.map((filter) => (
                <label key={filter.key} className="group flex items-center gap-3 p-1 cursor-pointer">
                  <input 
                    checked={dateFilter === filter.key} 
                    onChange={() => setDateFilter(filter.key)}
                    className="rounded border-slate-300 dark:border-slate-600 bg-transparent text-primary focus:ring-0 checked:bg-primary checked:border-primary h-4 w-4" 
                    type="radio"
                    name="dateFilter"
                  />
                  <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white text-sm">{filter.label}</span>
                 </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
             <h3 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2 font-display">
               <span className="material-symbols-outlined text-primary">label</span>
               Popular Tags
             </h3>
             <div className="flex flex-wrap gap-2">
                {tags.length > 0 ? (
                  tags.map((tagItem) => {
                    const isSelected = selectedTags.includes(tagItem.tag);
                    return (
                      <button 
                        key={tagItem.tag} 
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTags(prev => prev.filter(t => t !== tagItem.tag));
                          } else {
                            setSelectedTags(prev => [...prev, tagItem.tag]);
                            if (!query) setQuery(tagItem.tag);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs transition-colors border ${
                          isSelected 
                            ? 'bg-primary/10 text-primary border-primary/30' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border-transparent'
                        }`}
                      >
                        {tagItem.tag}
                        <span className="ml-1 text-slate-400 dark:text-slate-500">({tagItem.count})</span>
                    </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500">No tags available</p>
                )}
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
                 <Link to={`/article/${getSlug(post.slug)}`}>
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
                    <Link to={`/article/${getSlug(post.slug)}`} className="text-primary text-sm font-semibold flex items-center gap-1 group/btn hover:underline">
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
             <p className="text-sm text-slate-500 dark:text-slate-400">
               Showing {posts.length} of {totalResults} results
             </p>
             {hasMore && (
               <>
                 <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full max-w-xs overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300" 
                      style={{ width: `${(posts.length / totalResults) * 100}%` }}
                    />
                 </div>
                 <button 
                   onClick={loadMorePosts}
                   disabled={loadingMore}
                   className="flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {loadingMore ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <span>Load More</span>
                        <span className="material-symbols-outlined text-[20px]">expand_more</span>
                      </>
                    )}
                 </button>
               </>
             )}
             {!hasMore && posts.length > 0 && (
               <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                 <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                 You've seen all {totalResults} results
               </p>
             )}
          </div>
          )}

          {!loading && posts.length === 0 && (
               <div className="py-16 text-center">
                 <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">search_off</span>
                 <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No results found</h3>
                 <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                   {query 
                     ? `We couldn't find any articles matching "${query}"${selectedCategory !== 'all' || selectedTags.length > 0 || dateFilter !== 'all' ? ' with your current filters' : ''}.`
                     : 'Enter a search term to find articles.'}
                 </p>
                 {(selectedCategory !== 'all' || selectedTags.length > 0 || dateFilter !== 'all') && (
                   <button
                     onClick={() => {
                       setSelectedCategory('all');
                       setSelectedTags([]);
                       setDateFilter('all');
                     }}
                     className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-medium text-sm transition-colors"
                   >
                     <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                     Clear all filters
                   </button>
                 )}
               </div>
          )}
        </div>
      </div>
    </div>
  );
};