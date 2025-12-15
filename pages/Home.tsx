import React, { useEffect, useState } from 'react';
import { getFeaturedPost, getRecentPosts } from '../services/sanity';
import { ArticleCard } from '../components/ArticleCard';
import { HeroSkeleton, ArticleCardSkeleton } from '../components/Skeleton';
import { Link } from 'react-router-dom';
import { BlogPost } from '../types';
import { useStore } from '../store';

export const Home: React.FC = () => {
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleAiModal } = useStore();

  useEffect(() => {
    const loadData = async () => {
      // Simulate slight delay for skeleton demo if data is instant (optional)
      const [featured, recent] = await Promise.all([
        getFeaturedPost(),
        getRecentPosts()
      ]);
      setFeaturedPost(featured);
      setRecentPosts(recent);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
        <>
            <HeroSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                <div className="lg:col-span-8 flex flex-col gap-12">
                     <div className="flex flex-col gap-10">
                        {[1, 2, 3].map(i => <ArticleCardSkeleton key={i} />)}
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
              <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Connection Established</h2>
              <p className="text-slate-500">No content found. Please add 'blogPost' documents to your Sanity Studio.</p>
          </div>
      )
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
                  <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-primary rounded-full shadow-lg shadow-primary/40">Featured Story</span>
                  <div className="flex items-center gap-2 text-slate-200 text-sm font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    {new Date(featuredPost.publishedDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-slate-200 text-sm font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                     <span className="material-symbols-outlined text-[16px]">schedule</span>
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
                  <Link to={`/article/${featuredPost.slug.current}`} className="inline-flex items-center gap-3 pl-6 pr-4 py-3.5 bg-white text-slate-900 rounded-full font-bold text-sm hover:bg-slate-50 transition-all hover:pr-6 shadow-lg shadow-white/10 group-btn">
                      Read Full Article
                      <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center transition-colors group-btn-hover:bg-primary group-btn-hover:text-white">
                         <span className="material-symbols-outlined text-[16px] text-slate-900">arrow_forward</span>
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
                 <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Latest Thoughts</h2>
                 <p className="text-slate-500 dark:text-slate-400 font-medium">Insights on technology, design, and coding.</p>
              </div>
              <div className="flex gap-2 bg-slate-100 dark:bg-surface-dark p-1 rounded-lg">
                 <button className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors">
                    <span className="material-symbols-outlined text-[20px]">grid_view</span>
                 </button>
                 <button className="p-2 bg-white dark:bg-slate-700 text-primary shadow-sm rounded-md transition-colors">
                    <span className="material-symbols-outlined text-[20px]">view_list</span>
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
                     <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">AI Content Guide</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Need recommendations or have a question? Ask our AI assistant.</p>
                  </div>
               </div>
               <button 
                onClick={toggleAiModal}
                className="group flex items-center gap-2 rounded-full bg-white dark:bg-slate-700 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600 transition-all hover:text-primary dark:hover:text-primary hover:shadow-md active:scale-95"
               >
                  <span>Ask Assistant</span>
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">chat</span>
               </button>
             </div>
           </div>

           <div className="flex flex-col gap-10">
              {recentPosts.map((post) => (
                <ArticleCard key={post._id} post={post} />
              ))}
           </div>
           
           <div className="flex justify-center mt-6">
             <button className="flex items-center gap-3 px-10 py-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark hover:border-primary dark:hover:border-primary text-slate-900 dark:text-white hover:text-primary dark:hover:text-primary font-bold shadow-sm hover:shadow-lg transition-all active:scale-95 group">
                 Load More Articles
                 <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">refresh</span>
             </button>
           </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-10">
           {/* Newsletter Widget */}
           <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-surface-dark p-8 rounded-3xl border border-indigo-100 dark:border-slate-700 shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-primary">
                    <span className="material-symbols-outlined">mail</span>
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">Newsletter</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                 Get the latest tech trends and design insights delivered to your inbox weekly. No spam, just value.
              </p>
              <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                 <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border-indigo-100 dark:border-slate-700 px-4 py-3 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 text-slate-900 dark:text-white transition-all shadow-sm"
                 />
                 <button type="submit" className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30">
                    Join 10k+ Readers
                 </button>
              </form>
           </div>

           {/* Popular Tags */}
           <div className="bg-white dark:bg-transparent p-6 rounded-3xl border border-slate-100 dark:border-none shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                 <span className="material-symbols-outlined text-primary">label</span>
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Popular Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                 {['JavaScript', 'React', 'Design Systems', 'AI', 'Figma', 'CSS', 'Career'].map(tag => (
                    <Link key={tag} to={`/search?tag=${tag}`} className="px-4 py-2 rounded-full bg-slate-50 dark:bg-surface-dark hover:bg-primary hover:text-white text-slate-600 dark:text-slate-300 text-sm font-semibold transition-all border border-slate-200 dark:border-slate-800 hover:border-primary">
                       {tag}
                    </Link>
                 ))}
              </div>
           </div>

           {/* Trending */}
           <div>
              <div className="flex items-center gap-2 mb-6 pb-2 border-b border-border-light dark:border-border-dark">
                 <span className="material-symbols-outlined text-secondary">trending_up</span>
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Trending Now</h3>
              </div>
              <div className="flex flex-col gap-6">
                 {[
                   { id: '01', title: 'Understanding TypeScript Generics in 2024', meta: 'Oct 18 • 6 min read' },
                   { id: '02', title: 'Why we moved from Webpack to Vite', meta: 'Oct 12 • 4 min read' },
                   { id: '03', title: 'The psychology of color in dark mode UI', meta: 'Oct 10 • 9 min read' },
                   { id: '04', title: "Accessibility First: A Developer's Guide", meta: 'Oct 05 • 5 min read' }
                 ].map(item => (
                   <Link key={item.id} to="#" className="group flex gap-5 items-start">
                      <span className="text-3xl font-black text-slate-200 dark:text-slate-800 group-hover:text-primary transition-colors font-display -mt-1">{item.id}</span>
                      <div>
                         <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug">
                            {item.title}
                         </h4>
                         <p className="text-xs text-slate-500 mt-1.5 font-medium">{item.meta}</p>
                      </div>
                   </Link>
                 ))}
              </div>
           </div>
        </aside>
      </div>
    </>
  );
};