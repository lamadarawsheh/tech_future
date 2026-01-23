'use client';
import React, { useEffect, useState } from 'react';
import Link from '../../app/components/Link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserLikes,
  getUserComments,
  getUserSavedPosts,
} from '../services/sanity';
import { format, formatDistanceToNow } from 'date-fns';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';

type TabType = 'all' | 'saved' | 'comments';
type NavType = 'overview' | 'posts' | 'saved' | 'likes' | 'settings';

export const Profile: React.FC = () => {
  const router = useRouter();
  const { user, subscriber, loading: authLoading, signOut } = useAuth();
  const { isDarkMode, toggleTheme } = useStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [activeNav, setActiveNav] = useState<NavType>('overview');
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!subscriber?._id) return;

      setLoading(true);
      try {
        const [saved, likes, userComments] = await Promise.all([
          getUserSavedPosts(subscriber._id),
          getUserLikes(subscriber._id),
          getUserComments(subscriber._id),
        ]);
        setSavedPosts(saved);
        setLikedPosts(likes);
        setComments(userComments);
      } catch (error) {
        console.error('Error fetching user activity:', error);
      } finally {
        setLoading(false);
      }
    };

    if (subscriber) {
      fetchUserActivity();
    }
  }, [subscriber]);

  if (!authLoading && !user) {
    return null;
  }

  useEffect(() => {
    if (!authLoading && (!user || !subscriber)) {
      router.push('/');
    }
  }, [user, subscriber, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-spin border-t-primary" />
        </div>
      </div>
    );
  }

  const totalActivity = savedPosts.length + likedPosts.length + comments.length;
  const profileCompletion = subscriber?.name ? 85 : 60;

  // Combine all activities for the feed
  const allActivities = [
    ...savedPosts.map((item) => ({ ...item, type: 'saved' as const })),
    ...likedPosts.map((item) => ({ ...item, type: 'liked' as const })),
    ...comments.map((item) => ({ ...item, type: 'comment' as const })),
  ].sort((a, b) => {
    const dateA = new Date(a.createdAt || a._createdAt || 0);
    const dateB = new Date(b.createdAt || b._createdAt || 0);
    return dateB.getTime() - dateA.getTime();
  });

  const filteredActivities =
    activeTab === 'all'
      ? allActivities
      : activeTab === 'saved'
        ? allActivities.filter((a) => a.type === 'saved')
        : allActivities.filter((a) => a.type === 'comment');

  const navItems: { key: NavType; label: string; icon: string }[] = [
    { key: 'overview', label: t('profile.overview'), icon: 'dashboard' },
    { key: 'posts', label: t('profile.posts'), icon: 'article' },
    { key: 'saved', label: t('profile.saved'), icon: 'bookmarks' },
    { key: 'likes', label: t('profile.likes'), icon: 'favorite' },
    { key: 'settings', label: t('profile.settings'), icon: 'settings' },
  ];

  return (
    <div className="min-h-screen -mt-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6 shadow-sm">
          {/* Cover / Banner */}
          <div className="h-32 md:h-40 bg-gradient-to-r from-primary via-primary/80 to-secondary relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-start gap-6 -mt-12 md:-mt-16">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl md:text-4xl font-bold border-4 border-white dark:border-slate-900 shadow-xl">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-lg border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[14px]">
                    check
                  </span>
                </div>
              </div>

              {/* Name & Info */}
              <div className="flex-1 md:mt-20">
                {/* 2. Full Name */}
                <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white font-display mb-1">
                  {subscriber?.name || user?.email?.split('@')[0] || 'User'}
                </h1>

                {/* 3. Username */}
                <p className="text-sm font-bold text-primary mb-2">
                  @
                  {user?.email
                    ?.split('@')[0]
                    ?.toLowerCase()
                    .replace(/\s/g, '')}
                </p>

                {/* 4. Short Bio / Role */}
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 font-medium">
                  Tech Enthusiast
                </p>

                {/* 5. Meta info row */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      location_on
                    </span>
                    <span className="font-semibold text-black dark:text-white">
                      {t('profile.location')}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      calendar_today
                    </span>
                    <span className="font-semibold text-black dark:text-white">
                      {t('profile.joined')}{' '}
                      {subscriber?.createdAt
                        ? format(new Date(subscriber.createdAt), 'MMMM yyyy')
                        : t('profile.recently')}
                    </span>
                  </span>
                </div>
              </div>

              {/* 6. Action buttons */}
              <div className="flex gap-2 md:mt-20">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors text-sm font-semibold shadow-lg shadow-primary/25"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    edit
                  </span>
                  {t('profile.editProfile')}
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-semibold border border-slate-200 dark:border-slate-700"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                  </span>
                  <span className="hidden sm:inline">
                    {isDarkMode ? t('profile.switchToLight') : t('profile.switchToDark')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Navigation */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-1">
                {navItems.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveNav(key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeNav === key
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {icon}
                    </span>
                    <span className="truncate">{label}</span>
                  </button>
                ))}
                <div className="hidden lg:block border-t border-slate-200 dark:border-slate-800 my-2" />
                <button
                  onClick={signOut}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all col-span-2 sm:col-span-1 lg:col-span-1"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    logout
                  </span>
                  <span className="truncate">{t('profile.signOut')}</span>
                </button>
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-6">
                {t('profile.communityStats')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                {/* Profile Completion */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-3 font-semibold uppercase tracking-wider">
                    <span className="text-slate-500 dark:text-slate-400">
                      {t('profile.profileCompletion')}
                    </span>
                    <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {profileCompletion}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>

                {/* Total Views */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('profile.totalViews')}
                    </span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                      {(totalActivity * 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      visibility
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('profile.contentOverview')}
                </h3>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-tight font-bold border border-slate-200/50 dark:border-slate-700/50">
                  {t('profile.last30Days')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {/* Saved */}
                <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-amber-500 text-[26px]">
                      bookmark
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                        {savedPosts.length}
                      </p>
                      <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {t('profile.thisWeek', { count: Math.min(savedPosts.length, 2) })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-tight">{t('profile.savedItems')}</p>
                  </div>
                </div>

                {/* Likes */}
                <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-rose-500 text-[26px]">
                      favorite
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                        {likedPosts.length}
                      </p>
                      <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {t('profile.thisWeek', { count: Math.min(likedPosts.length, 12) })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-tight">{t('profile.totalLikes')}</p>
                  </div>
                </div>

                {/* Comments */}
                <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sky-500 text-[26px]">
                      chat_bubble
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                        {comments.length}
                      </p>
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-400/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {t('profile.noChange')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-tight">{t('profile.commentsPosted')}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {activeNav === 'overview' && (
                <>
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                      {t('profile.activityFeed')}
                    </h2>
                    <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                      {[
                        { key: 'all' as TabType, label: t('profile.allActivity') },
                        { key: 'saved' as TabType, label: t('profile.saved') },
                        { key: 'comments' as TabType, label: t('profile.comments') },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setActiveTab(key)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === key
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                      <div className="p-8 space-y-6">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse flex gap-4">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                            <div className="flex-1 space-y-3">
                              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredActivities.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-slate-400">
                            inbox
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                          {t('profile.noActivity')}
                        </p>
                        <Link
                          to="/"
                          className="text-primary hover:underline text-sm font-medium"
                        >
                          {t('profile.startExploring')}
                        </Link>
                      </div>
                    ) : (
                      filteredActivities
                        .slice(0, 10)
                        .map((activity, index) => (
                          <ActivityItem
                            key={`${activity.type}-${activity._id}-${index}`}
                            activity={activity}
                            t={t}
                          />
                        ))
                    )}
                  </div>
                  {filteredActivities.length > 10 && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                      <button className="w-full py-3 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors">
                        {t('profile.loadMore')}
                      </button>
                    </div>
                  )}
                </>
              )}

              {activeNav === 'posts' && (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-slate-400">
                      article
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('profile.noPosts')}</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    {t('profile.noPostsDesc')}
                  </p>
                  <button className="px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">
                    {t('profile.writeFirst')}
                  </button>
                </div>
              )}

              {activeNav === 'saved' && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('profile.saved')}</h2>
                  </div>
                  {savedPosts.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-slate-500 dark:text-slate-400">{t('profile.noActivity')}</p>
                    </div>
                  ) : (
                    savedPosts.map((post, index) => (
                      <ActivityItem key={`saved-${index}`} activity={{ ...post, type: 'saved' }} t={t} />
                    ))
                  )}
                </div>
              )}

              {activeNav === 'likes' && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('profile.likes')}</h2>
                  </div>
                  {likedPosts.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-slate-500 dark:text-slate-400">{t('profile.noLikes')}</p>
                    </div>
                  ) : (
                    likedPosts.map((post, index) => (
                      <ActivityItem key={`liked-${index}`} activity={{ ...post, type: 'liked' }} t={t} />
                    ))
                  )}
                </div>
              )}

              {activeNav === 'settings' && (
                <div className="p-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('profile.accountSettings')}</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">{t('profile.profileInfo')}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('profile.profileInfoDesc')}</p>
                      </div>
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        {t('profile.editProfile')}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">{t('profile.appearance')}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('profile.appearanceDesc')}</p>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                      >
                        {isDarkMode ? t('profile.switchToLight') : t('profile.switchToDark')}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">{t('profile.emailNotifications')}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('profile.emailNotificationsDesc')}</p>
                      </div>
                      <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          onClose={() => setShowEditModal(false)}
          currentName={subscriber?.name || ''}
          email={user?.email || ''}
          t={t}
        />
      )}
    </div>
  );
};

// Edit Profile Modal Component
const EditProfileModal: React.FC<{
  onClose: () => void;
  currentName: string;
  email: string;
  t: any;
}> = ({ onClose, currentName, email, t }) => {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    // Simulate save - in real app, call Sanity to update subscriber
    setTimeout(() => {
      setSaving(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('profile.editProfile')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                }`}
            >
              {message.text}
            </div>
          )}

          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || 'U'}
            </div>
            <button className="text-sm text-primary hover:underline font-medium">
              {t('profile.changeAvatar')}
            </button>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
              {t('profile.displayName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile.enterName')}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
              {t('profile.emailAddress')}
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed text-sm"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              {t('profile.emailNoChange')}
            </p>
          </div>

          {/* Bio Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
              {t('profile.bio')}
            </label>
            <textarea
              rows={3}
              placeholder={t('profile.bioPlaceholder')}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {t('profile.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="animate-spin">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  check
                </span>
                {t('profile.saveChanges')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem: React.FC<{ activity: any; t: any }> = ({ activity, t }) => {
  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  if (activity.type === 'saved') {
    return (
      <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-amber-500">
              bookmark
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              {t('profile.activitySaved')} • {getTimeAgo(activity.createdAt)}
            </p>
            <Link
              to={`/article/${activity.post?.slug}`}
              className="block p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-all group"
            >
              <div className="flex gap-4">
                {activity.post?.image && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                    <img
                      src={activity.post.image}
                      alt={activity.post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {activity.post?.categories?.[0] && (
                      <span className="text-xs font-medium text-primary">
                        {activity.post.categories[0].title}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {activity.post?.readingTime || 5} {t('article.minRead')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                    {activity.post?.title}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {activity.post?.excerpt}
                  </p>
                  {activity.post?.author?.name && (
                    <div className="flex items-center gap-2 mt-2">
                      {activity.post.author.image && (
                        <img
                          src={activity.post.author.image}
                          alt={activity.post.author.name}
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                      <span className="text-xs text-slate-500">
                        {activity.post.author.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-4 mt-3">
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <span className="material-symbols-outlined text-[20px]">
                  share
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activity.type === 'liked') {
    return (
      <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-rose-500">
              favorite
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              {t('profile.activityLiked')} • {getTimeAgo(activity.createdAt)}
            </p>
            <Link
              to={`/article/${activity.post?.slug}`}
              className="font-medium text-slate-900 dark:text-white hover:text-primary transition-colors"
            >
              {activity.post?.title}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (activity.type === 'comment') {
    return (
      <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-sky-500">
              chat_bubble
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              {t('profile.activityCommented')}{' '}
              <Link
                to={`/article/${activity.post?.slug}`}
                className="text-primary hover:underline"
              >
                {activity.post?.title}
              </Link>{' '}
              • {getTimeAgo(activity.createdAt)}
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-l-4 border-sky-500">
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                {activity.content}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <button className="flex items-center gap-1 text-sm text-slate-400 hover:text-rose-500 transition-colors">
                <span className="material-symbols-outlined text-[18px]">
                  favorite_border
                </span>
                <span>{t('profile.likes_count', { count: 12 })}</span>
              </button>
              <button className="flex items-center gap-1 text-sm text-slate-400 hover:text-sky-500 transition-colors">
                <span className="material-symbols-outlined text-[18px]">
                  reply
                </span>
                <span>{t('profile.reply')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Profile;
