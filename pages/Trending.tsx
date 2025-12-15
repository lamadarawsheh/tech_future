import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrendingPosts } from '../services/sanity';
import { BlogPost } from '../types';
import { GridCardSkeleton } from '../components/Skeleton';

function getSlug(slug: string | { current: string } | undefined): string {
  if (!slug) return '';
  return typeof slug === 'string' ? slug : slug.current || '';
}

export const Trending: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await getTrendingPosts(6); // Get top 6 trending posts
        setPosts(data);
      } catch (error) {
        console.error('Error fetching trending posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrending();
  }, []);

  if (loading) {
      return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <GridCardSkeleton key={i} />)}
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
                Trending Now
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-normal leading-normal">
                Top stories moving the tech world today.
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button className="flex h-9 shrink-0 items-center justify-center px-4 rounded-full bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors cursor-pointer">
              <span className="text-sm font-medium">This Week</span>
            </button>
            <button className="flex h-9 shrink-0 items-center justify-center px-4 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-transparent">
              <span className="text-sm font-medium">Today</span>
            </button>
            <button className="flex h-9 shrink-0 items-center justify-center px-4 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-transparent">
              <span className="text-sm font-medium">This Month</span>
            </button>
            <button className="flex h-9 shrink-0 items-center justify-center px-4 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-transparent">
              <span className="text-sm font-medium">All Time</span>
            </button>
          </div>
        </div>
      </div>

      {/* #01 Hero Article */}
      {heroPost && (
      <section className="w-full mb-12">
        <div className="group relative flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white dark:bg-surface-dark shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors duration-300">
          <div className="absolute top-0 left-0 z-10 bg-primary text-white px-4 py-2 rounded-br-2xl text-lg font-bold shadow-lg">#01</div>
<Link to={`/article/${getSlug(heroPost.slug)}`} className="w-full md:w-3/5 h-64 md:h-auto min-h-[360px] bg-center bg-no-repeat bg-cover relative" style={{backgroundImage: `url('${heroPost.image}')`}}>            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
          </Link>
          <div className="flex w-full md:w-2/5 flex-col justify-center p-6 md:p-8 lg:p-10 gap-4">
            <div className="flex items-center gap-2 w-full">
              <span className="px-2.5 py-1 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">{heroPost.categories[0]?.title}</span>
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
                  Read Article
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
                <Link to={`/article/${getSlug(item.slug)}`} className="relative w-full aspect-video bg-center bg-no-repeat bg-cover overflow-hidden" style={{backgroundImage: `url('${item.image}')`}}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-lg border border-white/10">0{index + 2}</div>
                </Link>
                <div className="flex flex-col gap-3 p-5 flex-1">
                    <div className="flex justify-between items-start">
                        <span className="text-primary text-xs font-bold uppercase tracking-wider">{item.categories[0]?.title}</span>
                    </div>
                    <Link to={`/article/${getSlug(item.slug)}`}>
                        <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 font-display">
                            {item.title}
                        </h3>
                    </Link>
                    <div className="flex justify-end mt-auto pt-2">
                        <Link to={`/article/${getSlug(item.slug)}`} className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary">
                            Read more →
                        </Link>
                    </div>
                </div>
             </div>
        ))}
      </section>

      {/* Subscribe Banner */}
      <section className="w-full mt-8">
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800">
           <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12">
             <div className="flex flex-col gap-3 md:w-1/2">
                <h3 className="text-2xl md:text-3xl font-bold text-white font-display">Never miss a trending story</h3>
                <p className="text-slate-400 text-base">Get the top 5 stories of the week delivered straight to your inbox every Friday.</p>
             </div>
             <div className="flex w-full md:w-1/2 max-w-md">
                <form className="flex w-full gap-3 flex-col sm:flex-row" onSubmit={e => e.preventDefault()}>
                   <input className="flex-1 h-12 rounded-lg bg-slate-800 border-transparent focus:border-primary focus:ring-0 text-white placeholder:text-slate-400 px-4" placeholder="Enter your email" type="email"/>
                   <button className="h-12 px-6 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold transition-colors whitespace-nowrap">
                      Subscribe
                   </button>
                </form>
             </div>
           </div>
        </div>
      </section>

      <div className="flex justify-center pt-8 pb-4">
        <button className="flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white font-medium transition-all group">
            <span>Load More Articles</span>
            <span className="material-symbols-outlined transition-transform group-hover:translate-y-0.5">expand_more</span>
        </button>
      </div>
    </div>
  );
};