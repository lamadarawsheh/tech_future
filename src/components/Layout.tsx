'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import Link from '../../app/components/Link';
import { usePathname, useRouter } from 'next/navigation';
import { ChatInterface } from './ChatInterface';
import { AuthModal } from './AuthModal';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { getSearchSuggestions, SearchSuggestion } from '../services/sanity';

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isDarkMode, toggleTheme, toggleAiModal } = useStore();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;

    // Sync dark mode class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [i18n.language, isDarkMode]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };
  const pathname = usePathname();
  const isAcademyPage = pathname && ['/academy', '/practice', '/challenges', '/leaderboard', '/submissions', '/lesson', '/problem'].some(path => pathname.startsWith(path));
  const router = useRouter();
  const { user, subscriber, loading: authLoading, signOut } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const practiceMenuRef = useRef<HTMLDivElement>(null);

  // Handle click outside and escape key for mobile menu and practice dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      if (practiceMenuRef.current && !practiceMenuRef.current.contains(event.target as Node)) {
        setIsPracticeOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isPracticeOpen) {
          setIsPracticeOpen(false);
        } else {
          setIsMobileMenuOpen(false);
        }
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen, isPracticeOpen]);

  const isAuthenticated = !!user && !!subscriber;

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await getSearchSuggestions(searchQuery, 8);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
      setLoadingSuggestions(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedSuggestionIndex(-1);
  }, [suggestions]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
      handleSuggestionClick(suggestions[selectedSuggestionIndex]);
      return;
    }
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSuggestions([]);
      searchInputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'post') {
      router.push(`/article/${suggestion.slug}`);
    } else if (suggestion.type === 'category') {
      router.push(`/category/${suggestion.slug}`);
    } else if (suggestion.type === 'author') {
      router.push(`/author/${suggestion.slug}`);
    } else if (suggestion.type === 'tag') {
      router.push(`/search?tag=${suggestion.title}`);
    }
    setSearchQuery('');
    setSuggestions([]);
    searchInputRef.current?.blur();
  };

  // Keyboard shortcuts for search
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Escape') {
        setSearchQuery('');
        setSuggestions([]);
        searchInputRef.current?.blur();
      }
    },
    [suggestions.length]
  );

  // Global keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-background-light dark:bg-background-dark" />;

  return (
    <div
      className={`min-h-screen w-full flex flex-col ${isDarkMode ? 'dark' : ''
        } bg-background-light dark:bg-background-dark text-slate-600 dark:text-slate-300`}
    >
      {/* Header */}
      <header className={`sticky top-0 z-50 w-full border-b border-border-light dark:border-border-dark bg-surface-light/90 dark:bg-surface-dark/90 glass-panel transition-colors duration-300 ${isAcademyPage ? 'hidden' : ''}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between gap-2 sm:gap-4 md:gap-8">
            <div className="flex items-center gap-4 md:gap-10">
              <Link
                to="/"
                className="flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white group"
              >
                <Logo size={40} className="md:w-[52px] md:h-[52px] text-cyan-500 transition-transform group-hover:scale-110 group-hover:rotate-3" />
                <h2 className="text-base sm:text-xl md:text-2xl font-extrabold tracking-tight font-display whitespace-nowrap">
                  Bot & Beam
                </h2>
              </Link>
              <nav className="hidden md:flex items-center gap-8">
                <Link
                  to="/"
                  className={`text-sm font-semibold transition-colors ${pathname === '/'
                    ? 'text-primary'
                    : 'text-slate-900 dark:text-white hover:text-primary dark:hover:text-primary'
                    }`}
                >
                  {t('nav.home')}
                </Link>
                <Link
                  to="/trending"
                  className={`text-sm font-semibold transition-colors ${pathname === '/trending'
                    ? 'text-primary'
                    : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary'
                    }`}
                >
                  {t('nav.trending')}
                </Link>
                <Link
                  to="/categories"
                  className={`text-sm font-semibold transition-colors ${pathname.includes('/category')
                    ? 'text-primary'
                    : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary'
                    }`}
                >
                  {t('nav.categories')}
                </Link>
                {/* Academy Link */}
                <Link
                  to="/academy"
                  className={`flex items-center gap-1 text-sm font-semibold transition-colors ${[
                    '/academy',
                    '/practice',
                    '/challenges',
                    '/leaderboard',
                    '/submissions',
                  ].some((p) => pathname.startsWith(p))
                    ? 'text-primary'
                    : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary'
                    }`}
                >
                  <span className="relative">
                    <span className="animate-text-shine bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500 bg-[length:200%_auto] bg-clip-text text-transparent font-bold">
                      {t('nav.academy')}
                    </span>
                    <span className="absolute -top-1 -right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </span>
                </Link>
                <Link
                  to="/newsletter"
                  className={`text-sm font-semibold transition-colors ${pathname === '/newsletter'
                    ? 'text-primary'
                    : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary'
                    }`}
                >
                  {t('nav.newsletter')}
                </Link>
              </nav>
            </div>

            <div className="flex flex-1 justify-end gap-4 items-center">
              <form
                onSubmit={handleSearch}
                className="hidden lg:flex relative w-full max-w-sm h-11 group"
              >
                <div
                  className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${searchFocused ? 'text-primary' : 'text-slate-400'
                    }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    search
                  </span>
                </div>
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => {
                    // Delay blur to allow clicking suggestions
                    setTimeout(() => {
                      setSearchFocused(false);
                      setSuggestions([]);
                    }, 200);
                  }}
                  onKeyDown={handleKeyDown}
                  className={`block w-full rounded-full border bg-slate-50 dark:bg-slate-800/50 pl-11 pr-16 py-2.5 text-sm font-medium placeholder-slate-400 text-slate-900 dark:text-white transition-all shadow-sm focus:outline-none ${searchFocused
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                    }`}
                  placeholder={t('nav.searchPlaceholder')}
                  type="text"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      close
                    </span>
                  </button>
                ) : (
                  <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600">
                    <span>⌘</span>K
                  </kbd>
                )}

                {/* Enhanced Search Suggestions Dropdown */}
                {searchFocused &&
                  (suggestions.length > 0 ||
                    loadingSuggestions ||
                    searchQuery.length >= 2) && (
                    <div
                      ref={suggestionsRef}
                      className="absolute top-full left-0 mt-2 w-[420px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden z-[100] backdrop-blur-xl"
                    >
                      {/* Search Header */}
                      <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">
                              search
                            </span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              {searchQuery
                                ? `${t('nav.resultsFor')} "${searchQuery}"`
                                : t('nav.startTyping')}
                            </span>
                          </div>
                          {loadingSuggestions && (
                            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          )}
                        </div>
                      </div>

                      {loadingSuggestions && suggestions.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {t('nav.searching')}
                          </p>
                        </div>
                      ) : suggestions.length === 0 &&
                        searchQuery.length >= 2 ? (
                        <div className="px-4 py-8 text-center">
                          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">
                            search_off
                          </span>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {t('nav.noResults')} "{searchQuery}"
                          </p>
                          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                            {t('nav.tryDifferent')}
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Articles Section */}
                          {suggestions.filter((s) => s.type === 'post').length >
                            0 && (
                              <div className="py-2">
                                <div className="px-4 py-1.5 flex items-center gap-2">
                                  <span className="material-symbols-outlined text-emerald-500 text-sm">
                                    article
                                  </span>
                                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    {t('nav.articles')}
                                  </span>
                                </div>
                                {suggestions
                                  .filter((s) => s.type === 'post')
                                  .map((suggestion, index) => {
                                    const globalIndex = suggestions.findIndex(
                                      (s) => s._id === suggestion._id
                                    );
                                    return (
                                      <button
                                        key={`post-${suggestion._id}`}
                                        type="button"
                                        onClick={() =>
                                          handleSuggestionClick(suggestion)
                                        }
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${selectedSuggestionIndex === globalIndex
                                          ? 'bg-primary/10 dark:bg-primary/15'
                                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                          }`}
                                      >
                                        {suggestion.image ? (
                                          <div
                                            className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 bg-cover bg-center shrink-0 ring-1 ring-slate-200 dark:ring-slate-600"
                                            style={{
                                              backgroundImage: `url(${suggestion.image})`,
                                            }}
                                          />
                                        ) : (
                                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">
                                              article
                                            </span>
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary">
                                            {suggestion.title}
                                          </p>
                                          {suggestion.excerpt && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                                              {suggestion.excerpt}
                                            </p>
                                          )}
                                        </div>
                                        <div className="shrink-0 flex items-center gap-1 text-slate-400 dark:text-slate-500">
                                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">
                                            ↵
                                          </span>
                                        </div>
                                      </button>
                                    );
                                  })}
                              </div>
                            )}

                          {/* Categories Section */}
                          {suggestions.filter((s) => s.type === 'category')
                            .length > 0 && (
                              <div className="py-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="px-4 py-1.5 flex items-center gap-2">
                                  <span className="material-symbols-outlined text-violet-500 text-sm">
                                    category
                                  </span>
                                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    {t('nav.categories')}
                                  </span>
                                </div>
                                <div className="px-3 py-1 flex flex-wrap gap-2">
                                  {suggestions
                                    .filter((s) => s.type === 'category')
                                    .map((suggestion) => {
                                      const globalIndex = suggestions.findIndex(
                                        (s) => s._id === suggestion._id
                                      );
                                      return (
                                        <button
                                          key={`cat-${suggestion._id}`}
                                          type="button"
                                          onClick={() =>
                                            handleSuggestionClick(suggestion)
                                          }
                                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${selectedSuggestionIndex ===
                                            globalIndex
                                            ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 ring-2 ring-violet-300 dark:ring-violet-600'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300'
                                            }`}
                                        >
                                          <span className="material-symbols-outlined text-base">
                                            folder
                                          </span>
                                          {suggestion.title}
                                        </button>
                                      );
                                    })}
                                </div>
                              </div>
                            )}

                          {/* Authors Section */}
                          {suggestions.filter((s) => s.type === 'author')
                            .length > 0 && (
                              <div className="py-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="px-4 py-1.5 flex items-center gap-2">
                                  <span className="material-symbols-outlined text-blue-500 text-sm">
                                    person
                                  </span>
                                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    {t('nav.authors')}
                                  </span>
                                </div>
                                {suggestions
                                  .filter((s) => s.type === 'author')
                                  .map((suggestion) => {
                                    const globalIndex = suggestions.findIndex(
                                      (s) => s._id === suggestion._id
                                    );
                                    return (
                                      <button
                                        key={`author-${suggestion._id}`}
                                        type="button"
                                        onClick={() =>
                                          handleSuggestionClick(suggestion)
                                        }
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${selectedSuggestionIndex === globalIndex
                                          ? 'bg-blue-50 dark:bg-blue-900/20'
                                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                          }`}
                                      >
                                        {suggestion.image ? (
                                          <div
                                            className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center shrink-0 ring-2 ring-blue-200 dark:ring-blue-800"
                                            style={{
                                              backgroundImage: `url(${suggestion.image})`,
                                            }}
                                          />
                                        ) : (
                                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-white text-lg">
                                              person
                                            </span>
                                          </div>
                                        )}
                                        <div className="flex-1">
                                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            {suggestion.title}
                                          </p>
                                          <p className="text-xs text-blue-500 dark:text-blue-400">
                                            View profile & articles
                                          </p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-400 text-sm">
                                          arrow_forward
                                        </span>
                                      </button>
                                    );
                                  })}
                              </div>
                            )}

                          {/* Footer with View All */}
                          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                                <span className="flex items-center gap-1">
                                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-[10px]">
                                    ↑↓
                                  </kbd>
                                  navigate
                                </span>
                                <span className="flex items-center gap-1">
                                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-[10px]">
                                    ↵
                                  </kbd>
                                  select
                                </span>
                                <span className="flex items-center gap-1">
                                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-[10px]">
                                    esc
                                  </kbd>
                                  close
                                </span>
                              </div>
                              <button
                                type="submit"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg transition-colors"
                              >
                                {t('nav.viewAll')}
                                <span className="material-symbols-outlined text-sm">
                                  arrow_forward
                                </span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
              </form>
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle Theme"
                  className="flex items-center justify-center size-9 md:size-10 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <span className="material-symbols-outlined text-[18px] md:text-[20px]">
                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                  </span>
                </button>

                <button
                  onClick={toggleLanguage}
                  aria-label="Toggle Language"
                  className="flex items-center justify-center size-9 md:size-10 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs md:text-sm"
                >
                  {i18n.language === 'en' ? 'AR' : 'EN'}
                </button>
              </div>
              {/* Auth Button / User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline max-w-[120px] truncate">
                      {user?.email?.split('@')[0]}
                    </span>
                    <span className="material-symbols-outlined text-[16px]">
                      expand_more
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {subscriber?.name || 'User'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                          <Link
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              person
                            </span>
                            {t('nav.myProfile')}
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              bookmark
                            </span>
                            {t('nav.savedArticles')}
                          </Link>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={async () => {
                              await signOut();
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              logout
                            </span>
                            {t('nav.signOut')}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-slate-900 dark:bg-white px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white dark:text-slate-900 transition-all hover:bg-primary dark:hover:bg-primary dark:hover:text-white hover:shadow-lg hover:shadow-primary/25 active:scale-95 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[14px] sm:text-[18px]">login</span>
                  <span>{t('nav.signIn')}</span>
                </button>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-slate-900 dark:text-white p-2 -mr-2 focus:outline-none"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <span className="material-symbols-outlined text-[24px]">close</span>
                ) : (
                  <span className="material-symbols-outlined text-[24px]">menu</span>
                )}
              </button>
            </div>
          </div >
        </div >
      </header >

      <div
        ref={mobileMenuRef}
        className={`fixed inset-y-0 right-0 w-64 z-50 bg-white dark:bg-slate-900 shadow-xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } md:hidden`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('nav.menu')}</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav className="flex-1 py-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined mr-3">home</span>
              <span>{t('nav.home')}</span>
            </Link>
            <Link
              to="/trending"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined mr-3">trending_up</span>
              <span>{t('nav.trending')}</span>
            </Link>
            <Link
              to="/categories"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined mr-3">category</span>
              <span>{t('nav.categories')}</span>
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined mr-3">info</span>
              <span>{t('nav.about')}</span>
            </Link>
            <Link
              to="/academy"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="material-symbols-outlined mr-3 text-emerald-500">terminal</span>
                <span className="font-bold bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500 bg-[length:200%_auto] bg-clip-text text-transparent">
                  {t('nav.academy')}
                </span>
                <span className="ml-2 relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </Link>
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-6">
            <div className="flex items-center justify-between sm:hidden">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('nav.appearance')}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{isDarkMode ? t('nav.darkMode') : t('nav.lightMode')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
                  aria-label="Toggle Theme"
                >
                  <span className="material-symbols-outlined">
                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                  </span>
                </button>
                <button
                  onClick={toggleLanguage}
                  className="flex items-center justify-center h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:text-primary transition-colors"
                  aria-label="Toggle Language"
                >
                  {i18n.language === 'en' ? 'AR' : 'EN'}
                </button>
              </div>
            </div>
            {!isAuthenticated ? (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 hover:bg-primary text-white font-medium rounded-lg transition-colors dark:bg-white dark:text-slate-900 dark:hover:bg-primary dark:hover:text-white"
              >
                <span className="material-symbols-outlined">login</span>
                <span>{t('nav.signIn')}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  signOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center py-2 px-4 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <span className="material-symbols-outlined mr-2">logout</span>
                <span>{t('nav.signOut')}</span>
              </button>
            )}


          </div>
        </div>
      </div>

      {/* Overlay */}
      {
        isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )
      }

      {/* Main Content */}
      <main className={`flex-grow w-full ${isAcademyPage ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'}`}>
        {children}
      </main>

      {/* AI Assistant FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={toggleAiModal}
          className="group flex items-center justify-center size-14 rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <span className="material-symbols-outlined text-[28px] group-hover:rotate-12 transition-transform">
            smart_toy
          </span>
          <span className="absolute top-0 right-0 flex h-3 w-3 -mt-1 -mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
          </span>
        </button>
      </div>

      <ChatInterface />

      {/* Footer */}
      <footer className={`border-t border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-background-dark py-16 mt-10 ${isAcademyPage ? 'hidden' : ''}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="space-y-4">
              <Link
                to="/"
                className="flex items-center gap-3 text-slate-900 dark:text-white group"
              >
                <Logo size={42} className="text-cyan-500 transition-transform group-hover:scale-110 group-hover:rotate-3" />
                <span className="text-xl font-bold font-display">
                  Bot & Beam
                </span>
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t('footer.tagline')}
              </p>
            </div>

            {/* Contact Us */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 font-display">
                {t('footer.contactUs')}
              </h3>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                    mail
                  </span>
                  <span>hello@botandbeam.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                    call
                  </span>
                  <span>+1 (555) 000-0000</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                    location_on
                  </span>
                  <span>San Francisco, CA</span>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 font-display">
                {t('footer.quickLinks')}
              </h3>
              <ul className="space-y-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                <li>
                  <Link
                    to="/"
                    className="hover:text-primary transition-colors"
                  >
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/trending"
                    className="hover:text-primary transition-colors"
                  >
                    {t('nav.trending')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categories"
                    className="hover:text-primary transition-colors"
                  >
                    {t('nav.categories')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/practice"
                    className="hover:text-primary transition-colors"
                  >
                    {t('nav.practiceArena')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 font-display">
                {t('footer.followUs')}
              </h3>
              <div className="flex gap-4">
                {/* Twitter */}
                <a
                  href="#"
                  className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white hover:bg-[#1DA1F2] rounded-full transition-all"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                {/* GitHub */}
                <a
                  href="#"
                  className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white hover:bg-[#333] rounded-full transition-all"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href="#"
                  className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white hover:bg-[#0077b5] rounded-full transition-all"
                >
                  <span className="font-bold font-sans text-lg leading-none">
                    in
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-medium text-slate-500">
              © {new Date().getFullYear()} Bot & Beam. {t('footer.rights')}
            </p>
            <div className="flex gap-6 text-sm font-medium text-slate-500">
              <Link
                to="/privacy"
                className="hover:text-primary transition-colors"
              >
                {t('footer.privacyPolicy')}
              </Link>
              <Link
                to="/terms"
                className="hover:text-primary transition-colors"
              >
                {t('footer.termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div >
  );
};
