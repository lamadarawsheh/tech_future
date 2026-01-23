'use client';
import React, { useState } from 'react';
import Link from '../../app/components/Link';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';

import { useTranslation } from 'react-i18next';

export const Newsletter: React.FC = () => {
  const { t } = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, subscriber } = useAuth();
  const isAuthenticated = !!user && !!subscriber;

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t('newsletter.heroDesc').split('.')[0]}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white font-display tracking-tight mb-6">
            {t('newsletter.heroTitle')}
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
            {t('newsletter.heroDesc')}
          </p>

          <div className="flex flex-col items-center gap-4">
            {isAuthenticated ? (
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-6 py-3 rounded-xl font-medium flex items-center gap-2">
                <span className="material-symbols-outlined">check_circle</span>
                {t('newsletter.subscribedTitle')}
              </div>
            ) : (
              <div className="w-full max-w-md relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="relative w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-6 py-4 rounded-xl font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xl"
                >
                  <span className="text-slate-400">{t('newsletter.inputPlaceholder')}</span>
                  <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold">
                    {t('newsletter.subscribeBtn')}
                  </span>
                </button>
              </div>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              {t('newsletter.trustedBy')}
            </p>
          </div>
        </div>
      </section>

      {/* Latest Issue */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-purple-500">mail</span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('newsletter.latestIssue')}</h2>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-purple-500/30 transition group">
          <div className="p-8 md:p-10">
            <div className="flex items-center gap-3 text-xs font-medium text-purple-600 dark:text-purple-400 mb-4">
              <span className="px-2 py-1 rounded-md bg-purple-500/10">Issue #42</span>
              <span>•</span>
              <span>Oct 24, 2023</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-purple-500 transition">
              {t('newsletter.latestIssueTitle')}
            </h3>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-3xl">
              {t('newsletter.latestIssueDesc')}
            </p>

            <button className="text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Read Issue <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Archive Preview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">history</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('newsletter.missedTitle')}</h2>
          </div>
          <Link to="/archive" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
            {t('newsletter.viewArchive')}
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <span className="font-mono">#{42 - i}</span>
                <span>•</span>
                <span>{t('newsletter.mock.time', '5 min read')}</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                {i === 1 ? 'The State of CSS 2024' : i === 2 ? 'Understanding React Concurrency' : 'System Design: Rate Limiting'}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                {t('newsletter.mock.desc')}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
