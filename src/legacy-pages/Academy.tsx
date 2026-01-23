'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Link from '../../app/components/Link';

import { useStore } from '../store';

const CountUp = ({ end, duration = 2, suffix = '' }: { end: number, duration?: number, suffix?: string }) => {
    const [count, setCount] = React.useState(0);
    const countRef = React.useRef(null);
    const [isInView, setIsInView] = React.useState(false);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (countRef.current) {
            observer.observe(countRef.current);
        }

        return () => observer.disconnect();
    }, []);

    React.useEffect(() => {
        if (!isInView) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / (duration * 1000), 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - percentage, 4);

            setCount(Math.floor(end * ease));

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, isInView]);

    return (
        <span ref={countRef}>
            {count.toLocaleString()}{suffix}
        </span>
    );
};

// ... imports
// ... CountUp component (keep as is)

export const Academy: React.FC = () => {
    const { t } = useTranslation();
    const { isDarkMode } = useStore();

    const features = [
        // ... feature data (keep as is)
        {
            title: t('nav.practiceArena'),
            description: t('nav.solveChallenges'),
            icon: 'terminal',
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            link: '/practice'
        },
        // ... (keep others)
        {
            title: t('nav.learningPaths'),
            description: t('nav.structuredCourses'),
            icon: 'school',
            color: 'text-cyan-500',
            bg: 'bg-cyan-500/10',
            link: '/challenges'
        },
        {
            title: t('nav.leaderboard'),
            description: t('nav.rankings'),
            icon: 'leaderboard',
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            link: '/leaderboard'
        },
        {
            title: t('nav.mySubmissions'),
            description: t('nav.trackProgress'),
            icon: 'history_edu',
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            link: '/submissions'
        }
    ];

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} transition-colors duration-300`}>
            {/* Hero Section */}
            <div className={`relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white' : 'bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900'}`}>
                {/* Background Pattern */}
                <div className={`absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center ${isDarkMode ? 'opacity-5' : 'opacity-5 mix-blend-multiply'}`}></div>
                <div className={`absolute inset-0 bg-gradient-to-b from-transparent ${isDarkMode ? 'via-slate-900/50 to-slate-950' : 'via-white/50 to-slate-50'}`}></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium mb-8 border border-emerald-500/20 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Welcome to Bot & Beam Academy
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-extrabold font-display mb-6 tracking-tight">
                        Master{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 bg-[length:200%_auto] animate-text-shine">
                            Coding Skills
                        </span>
                    </h1>
                    <p className={`text-xl sm:text-2xl ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} max-w-3xl mx-auto mb-12 leading-relaxed`}>
                        Challenge yourself with interactive problems, follow structured learning paths, and compete with developers worldwide.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            to="/practice"
                            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2 group"
                        >
                            Start Coding Now
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                        <Link
                            to="/challenges"
                            className={`px-8 py-4 ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10 border-white/10' : 'bg-white text-slate-900 hover:bg-slate-50 border-slate-200'} rounded-xl font-bold transition-all backdrop-blur-sm border`}
                        >
                            Explore Courses
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
                        {[
                            { label: 'Active Learners', value: 2500, suffix: '+', icon: 'group' },
                            { label: 'Challenges', value: 150, suffix: '+', icon: 'terminal' },
                            { label: 'Learning Paths', value: 12, suffix: '', icon: 'school' },
                            { label: 'Success Rate', value: 94, suffix: '%', icon: 'trophy' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-emerald-500">{stat.icon}</span>
                                </div>
                                <div className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-1 font-display`}>
                                    <CountUp end={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wide`}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature) => (
                        <Link
                            key={feature.link}
                            to={feature.link}
                            className={`group relative ${isDarkMode ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200'} backdrop-blur-sm p-8 rounded-2xl border hover:border-emerald-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300`}
                        >
                            <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <span className={`material-symbols-outlined text-[32px] ${feature.color}`}>
                                    {feature.icon}
                                </span>
                            </div>
                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2 font-display`}>
                                {feature.title}
                            </h3>
                            <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                                {feature.description}
                            </p>
                            <span className="absolute top-6 right-6 material-symbols-outlined text-slate-400 group-hover:text-emerald-500 transition-colors">
                                arrow_forward
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Academy;
