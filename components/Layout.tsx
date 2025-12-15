import React from 'react';
import { useStore } from '../store';
import { Link, useLocation } from 'react-router-dom';
import { ChatInterface } from './ChatInterface';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode, toggleTheme, toggleAiModal } = useStore();
  const location = useLocation();

  return (
    <div className={`min-h-screen w-full flex flex-col ${isDarkMode ? 'dark' : ''} bg-background-light dark:bg-background-dark text-slate-600 dark:text-slate-300`}>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border-light dark:border-border-dark bg-surface-light/90 dark:bg-surface-dark/90 glass-panel transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-8">
            <div className="flex items-center gap-10">
              <Link to="/" className="flex items-center gap-3 text-slate-900 dark:text-white group">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <span className="material-symbols-outlined text-[24px]">hub</span>
                </div>
                <h2 className="text-xl font-extrabold tracking-tight font-display">Bot & Beam</h2>
              </Link>
              <nav className="hidden md:flex items-center gap-8">
                <Link to="/" className={`text-sm font-semibold transition-colors ${location.pathname === '/' ? 'text-primary' : 'text-slate-900 dark:text-white hover:text-primary dark:hover:text-primary'}`}>Home</Link>
                <Link to="/trending" className={`text-sm font-semibold transition-colors ${location.pathname === '/trending' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}>Trending</Link>
                <Link to="/categories" className={`text-sm font-semibold transition-colors ${location.pathname.includes('/category') ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}>Categories</Link>
                <Link to="/newsletter" className={`text-sm font-semibold transition-colors ${location.pathname === '/newsletter' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}>Newsletter</Link>
              </nav>
            </div>
            
            <div className="flex flex-1 justify-end gap-4 items-center">
              <Link to="/search" className="hidden lg:flex relative w-full max-w-xs h-11 group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input 
                  disabled
                  className="block w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-11 pr-4 py-2.5 text-sm font-medium placeholder-slate-400 text-slate-900 dark:text-white transition-all shadow-sm cursor-pointer hover:border-primary/50" 
                  placeholder="Click to search..." 
                  type="text" 
                />
              </Link>
              <button 
                onClick={toggleTheme}
                aria-label="Toggle Theme" 
                className="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <span className="material-symbols-outlined text-[20px]">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
              </button>
              <Link to="/newsletter" className="hidden sm:flex items-center gap-2 rounded-full bg-slate-900 dark:bg-white px-5 py-2.5 text-sm font-bold text-white dark:text-slate-900 transition-all hover:bg-primary dark:hover:bg-primary dark:hover:text-white hover:shadow-lg hover:shadow-primary/25 active:scale-95">
                <span>Subscribe</span>
              </Link>
              <button className="md:hidden text-slate-900 dark:text-white">
                 <span className="material-symbols-outlined text-[24px]">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>

      {/* AI Assistant FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={toggleAiModal}
          className="group flex items-center justify-center size-14 rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all duration-300"
        >
           <span className="material-symbols-outlined text-[28px] group-hover:rotate-12 transition-transform">smart_toy</span>
           <span className="absolute top-0 right-0 flex h-3 w-3 -mt-1 -mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
            </span>
        </button>
      </div>

      <ChatInterface />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-background-dark py-16 mt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-primary">
                            <span className="material-symbols-outlined text-[24px]">hub</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white font-display">Tech & Future</span>
                    </div>
                    <p className="text-slate-500 text-sm max-w-xs">
                        Exploring the boundaries of code, design, and artificial intelligence.
                    </p>
                </div>
                <div className="flex flex-wrap gap-8 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
                    <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                    <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
                </div>
                <div className="flex gap-4">
                    <button className="p-2 text-slate-400 hover:text-primary hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition-all">
                        <span className="sr-only">Twitter</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                    </button>
                    <button className="p-2 text-slate-400 hover:text-primary hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition-all">
                        <span className="sr-only">GitHub</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path></svg>
                    </button>
                </div>
            </div>
            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-medium text-slate-400">
                © 2023 Tech & Future Blog. All rights reserved.
            </div>
        </div>
      </footer>
    </div>
  );
};