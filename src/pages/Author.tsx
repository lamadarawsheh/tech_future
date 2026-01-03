import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAuthorBySlug, getPostsByAuthorId } from '../services/sanity';
import { AuthorProfileSkeleton } from '../components/Skeleton';
import { Author as AuthorType, BlogPost, getSlug } from '../types';

// Helper to render platform icons
const SocialIcon = ({ platform }: { platform: string }) => {
  switch (platform.toLowerCase()) {
    case 'twitter': 
    case 'x':
      return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>;
    case 'github': 
      return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path></svg>;
    case 'linkedin': 
      return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
    default: 
      return <span className="material-symbols-outlined text-xl">link</span>;
  }
};

export const Author: React.FC = () => {
  const { slug } = useParams();
  const [author, setAuthor] = useState<AuthorType | null>(null);
  const [authorPosts, setAuthorPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        if (!slug) return;
        try {
            const authData = await getAuthorBySlug(slug);
            if (authData) {
                setAuthor(authData);
                const postsData = await getPostsByAuthorId(authData._id);
                setAuthorPosts(postsData);
            }
        } catch (error) {
            console.error("Failed to load author:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [slug]);

  if (loading) return <AuthorProfileSkeleton />;

  if (!author) {
      return (
          <div className="py-20 text-center">
             <div className="inline-flex items-center justify-center size-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
                <span className="material-symbols-outlined text-4xl text-slate-400">person_off</span>
             </div>
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Author Not Found</h2>
             <p className="text-slate-500 mb-8">The author profile you are looking for does not exist or has been moved.</p>
             <Link to="/" className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors">
                 Return Home
             </Link>
          </div>
      );
  }

  const featuredPost = authorPosts.find(p => p.featured) || authorPosts[0];
  const recentPosts = authorPosts.filter(p => p._id !== featuredPost?._id);

  // Robust extraction of Portable Text for the bio
  const bioText = author.bio && Array.isArray(author.bio) && author.bio.length > 0
    ? author.bio.map(block => block.children?.map((c: any) => c.text).join('')).join(' ')
    : "This author hasn't written a bio yet.";

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex">
        <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
          <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li><span className="material-symbols-outlined text-[16px] pt-1">chevron_right</span></li>
          <li><span className="text-slate-900 dark:text-white font-medium">Authors</span></li>
          <li><span className="material-symbols-outlined text-[16px] pt-1">chevron_right</span></li>
          <li aria-current="page" className="font-medium text-primary dark:text-white">{author.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Sidebar / Profile Card */}
        <aside className="lg:col-span-4 flex flex-col gap-8">
           <div className="flex flex-col gap-6 sticky top-24">
             {/* Profile Header */}
             <div className="flex flex-col gap-4">
               {author.image ? (
                   <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-2xl min-h-64 w-full shadow-lg border border-slate-200 dark:border-slate-800" style={{backgroundImage: `url('${author.image}')`}}></div>
               ) : (
                   <div className="flex items-center justify-center aspect-square rounded-2xl min-h-64 w-full shadow-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                       <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600">person</span>
                   </div>
               )}
               <div className="flex flex-col justify-center gap-1">
                 <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white font-display">{author.name}</h1>
                 <p className="text-primary text-lg font-medium leading-normal">Contributor</p>
               </div>
             </div>
             
             <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity text-base font-bold leading-normal tracking-wide w-full shadow-lg">
               Follow Author
             </button>

             {/* Stats */}
             <div className="flex flex-row gap-4">
               <div className="flex flex-1 flex-col gap-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 items-start shadow-sm">
                 <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-none font-display">{authorPosts.length}</p>
                 <div className="flex items-center gap-2"><p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Articles</p></div>
               </div>
               <div className="flex flex-1 flex-col gap-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 items-start shadow-sm">
                 <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-none font-display">
                    {/* Simplified view count simulation */}
                    {authorPosts.length > 0 ? ((authorPosts.length * 1.8) + 1.2).toFixed(1) + 'k' : '0'}
                 </p>
                 <div className="flex items-center gap-2"><p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Reads</p></div>
               </div>
             </div>

             {/* Socials */}
             {author.socialLinks && author.socialLinks.length > 0 && (
                 <div className="flex gap-3">
                   {author.socialLinks.map((link, i) => (
                     <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center h-12 bg-white dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-all shadow-sm">
                        <SocialIcon platform={link.platform} />
                     </a>
                   ))}
                 </div>
             )}

             {/* AI Context Widget */}
             <div className="relative group rounded-2xl p-[1px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl">
               <div className="bg-white dark:bg-slate-900 rounded-[15px] p-5 h-full relative z-10">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-purple-500 text-xl">auto_awesome</span>
                     <h3 className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">AI Assistant</h3>
                   </div>
                   <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">Beta</span>
                 </div>
                 <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                    Analyze {author.name.split(' ')[0]}'s articles, summarize topics, or find specific quotes instantly.
                 </p>
                 <div className="relative flex items-center mb-3 group/input">
                   <input className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:outline-none transition-all pr-10 placeholder:text-slate-400 text-slate-900 dark:text-white" placeholder="Ask a question..." type="text"/>
                   <button className="absolute right-2 p-1.5 rounded-lg text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                     <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                   </button>
                 </div>
               </div>
             </div>

             {/* About Me */}
             <div className="flex flex-col gap-3 py-2">
               <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white font-display">About</h3>
               <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                   {bioText}
               </p>
             </div>
           </div>
        </aside>

        {/* Main Feed */}
        <main className="lg:col-span-8 flex flex-col gap-8">
           {/* Navigation Tabs */}
           <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 no-scrollbar">
             <button className="px-1 py-3 border-b-2 border-primary text-primary font-bold text-sm whitespace-nowrap mr-6">Latest Stories</button>
             <button className="px-1 py-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm whitespace-nowrap mr-6 transition-colors">Most Popular</button>
             <button className="px-1 py-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm whitespace-nowrap mr-6 transition-colors">Interviews</button>
           </div>

           {/* Featured Article - only show if exists */}
           {featuredPost ? (
             <Link to={`/article/${getSlug(featuredPost.slug)}`} className="group relative flex flex-col md:flex-row gap-0 rounded-3xl bg-slate-900 dark:bg-slate-800 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
               <div className="w-full md:w-5/12 h-64 md:h-auto relative overflow-hidden">
                 <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{backgroundImage: `url('${featuredPost.image}')`}}></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent md:hidden"></div>
               </div>
               <div className="flex flex-col justify-center flex-1 p-6 md:p-8 lg:p-10 relative">
                 <div className="flex items-center gap-3 mb-4">
                   <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Featured</span>
                   <span className="text-slate-400 text-xs font-medium">{new Date(featuredPost.publishedDate).toLocaleDateString()}</span>
                 </div>
                 <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4 text-white font-display group-hover:text-primary transition-colors cursor-pointer">
                    {featuredPost.title}
                 </h2>
                 <p className="text-slate-300 text-sm md:text-base leading-relaxed line-clamp-3 mb-6">
                    {featuredPost.excerpt}
                 </p>
                 <div className="flex items-center gap-5 mt-auto border-t border-slate-700 pt-4">
                   <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <span className="material-symbols-outlined text-[16px]">schedule</span> {featuredPost.readingTime} min read
                   </span>
                 </div>
               </div>
             </Link>
           ) : (
             <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50 dark:bg-slate-900/50">
               <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">article</span>
               <p className="text-slate-500 font-medium">No posts found for this author yet.</p>
               <p className="text-slate-400 text-sm mt-1">Check back later for new content.</p>
             </div>
           )}

           {/* Grid of Articles */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {recentPosts.map((post, i) => (
               <Link to={`/article/${getSlug(post.slug)}`} key={i} className="group flex flex-col gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 h-full">
                 <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 relative">
                   <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: `url('${post.image}')`}}></div>
                   <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 </div>
                 <div className="flex flex-col flex-1">
                   <div className="flex items-center gap-2 mb-2">
                     <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{new Date(post.publishedDate).toLocaleDateString()}</span>
                     <span className="text-slate-400 text-xs">•</span>
                     <span className="text-primary text-xs font-bold uppercase tracking-wide">{post.categories[0]?.title}</span>
                   </div>
                   <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors text-slate-900 dark:text-white font-display">{post.title}</h3>
                   <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                      {post.excerpt}
                   </p>
                   <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                     <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                       <span className="material-symbols-outlined text-[16px]">schedule</span> {post.readingTime} min read
                     </span>
                     <button className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
                     </button>
                   </div>
                 </div>
               </Link>
             ))}
           </div>
        </main>
      </div>
    </div>
  );
};