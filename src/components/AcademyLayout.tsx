'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from '../../app/components/Link';
import { usePathname } from 'next/navigation';
import { useStore } from '../store';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { getUserCodingProfile } from '../services/coding';
import { UserCodingProfile } from '../types/coding';

export const AcademyHeader: React.FC = () => {
    const { t } = useTranslation();
    const pathname = usePathname();
    const { isDarkMode, toggleTheme } = useStore();
    const { subscriber } = useAuth();
    const [profile, setProfile] = useState<UserCodingProfile | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    useEffect(() => {
        if (subscriber?._id) {
            getUserCodingProfile(subscriber._id).then((p) => {
                if (p) setProfile(p);
            });
        }
    }, [subscriber]);

    const isActive = (path: string) => pathname.startsWith(path);

    const navItems = [
        { path: '/practice', label: t('nav.practiceArena'), icon: 'code' },
        { path: '/challenges', label: t('nav.learningPaths'), icon: 'school' },
        { path: '/leaderboard', label: t('nav.leaderboard'), icon: 'leaderboard' },
        { path: '/submissions', label: t('nav.mySubmissions'), icon: 'history' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-sm dark:shadow-black/10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo & Main Nav */}
                    <div className="flex items-center gap-8">
                        <Link to="/academy" className="flex items-center gap-3 group">
                            <Logo size={48} className="text-emerald-500 transform group-hover:scale-110 transition-transform duration-300" variant="emerald" />
                            <div className="flex flex-col">
                                <span className="font-display font-bold text-base sm:text-lg leading-tight tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    Bot & Beam
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">
                                    Academy
                                </span>
                            </div>
                        </Link>

                        <nav className="hidden md:flex items-center space-x-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group flex items-center gap-2 ${isActive(item.path)
                                        ? 'text-emerald-600 dark:text-white bg-emerald-50 dark:bg-white/10'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-[18px] ${isActive(item.path) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 group-hover:text-emerald-500 transition-colors'}`}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                    {isActive(item.path) && (
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Back to Blog */}
                        <Link
                            to="/"
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
                        >
                            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                            Back to Blog
                        </Link>

                        <div className="w-px h-6 bg-slate-200 dark:bg-white/10 hidden md:block"></div>

                        <button
                            onClick={toggleTheme}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {isDarkMode ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>

                        {subscriber && (
                            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10">
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-medium text-slate-900 dark:text-white max-w-[100px] truncate">{profile?.displayName || subscriber.name || 'Learner'}</span>
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                        {profile ? `Lvl ${profile.level} • ${profile.xp?.toLocaleString() || 0} XP` : 'Beginner'}
                                    </span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 border-2 border-white dark:border-slate-900 flex items-center justify-center overflow-hidden shadow-lg shadow-emerald-500/20">
                                    {subscriber.avatarUrl ? (
                                        <img src={subscriber.avatarUrl} alt={subscriber.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white font-bold text-xs">{((profile?.displayName || subscriber.name || 'U')[0]).toUpperCase()}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Burger Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors"
                            aria-label="Toggle Menu"
                        >
                            <span className="material-symbols-outlined text-[28px]">
                                {isMenuOpen ? 'close' : 'menu'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden fixed inset-x-0 top-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 shadow-xl transition-all duration-300 transform ${isMenuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'}`}>
                <div className="px-4 py-6 space-y-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${isActive(item.path)
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 space-y-4">
                        {subscriber && (
                            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                                    {((profile?.displayName || subscriber.name || 'U')[0]).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{profile?.displayName || subscriber.name || 'Learner'}</span>
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                        Level {profile?.level || 1} • {profile?.xp?.toLocaleString() || 0} XP
                                    </span>
                                </div>
                            </div>
                        )}
                        <Link
                            to="/"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-4 p-3 text-slate-500 dark:text-slate-400"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                            <span className="text-sm font-medium">Back to Main Website</span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export const AcademyFooter: React.FC = () => {
    return (
        <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-6 text-emerald-500">
                            <Logo size={40} className="text-emerald-500" variant="emerald" />
                            <span className="font-display font-bold text-xl text-slate-900 dark:text-white">Bot & Beam Academy</span>
                        </div>
                        <p className="text-sm leading-relaxed max-w-sm text-slate-500 dark:text-slate-500">
                            Empowering the next generation of developers with interactive challenges,
                            structured learning paths, and a community of passionate coders.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-bold mb-4">Learning</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/practice" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Practice Arena</Link></li>
                            <li><Link to="/challenges" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Learning Paths</Link></li>
                            <li><Link to="/leaderboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Leaderboard</Link></li>
                            <li><Link to="/submissions" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">My Submissions</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-bold mb-4">More</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Main Blog</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition">← Back to Blog</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
