'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from '../../app/components/Link';
import { useAuth } from '../contexts/AuthContext';
import {
  getLearningPaths,
  getLearningPath,
  getUserPathProgress,
  getUserCodingProfile
} from '../services/coding';
import { getDocumentTranslations } from '../services/sanity';
import { LearningPath, UserProgress, UserCodingProfile, getDifficultyBg } from '../types/coding';

// ... (imports remain the same, add useStore)
import { useStore } from '../store';

const Challenges: React.FC = () => {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { subscriber } = useAuth();
  const { isDarkMode } = useStore();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [profile, setProfile] = useState<UserCodingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const lang = i18n.language;
      try {
        if (slug) {
          let pathData = await getLearningPath(slug, lang);
          if (!pathData) {
            const otherLang = lang === 'en' ? 'ar' : 'en';
            const otherData = await getLearningPath(slug, otherLang);
            if (otherData) {
              const translations = await getDocumentTranslations(otherData._id);
              const target = translations.find(t => t.value?.language === lang);
              if (target && target.value?.slug?.current) {
                router.push(`/challenges/${target.value.slug.current}`);
                return;
              }
              pathData = otherData;
            }
          }
          setCurrentPath(pathData);
          if (subscriber?._id && pathData) {
            const progress = await getUserPathProgress(subscriber._id, pathData._id);
            setUserProgress(progress);
          }
        } else {
          const pathsData = await getLearningPaths(lang);
          setPaths(pathsData);
        }
        if (subscriber?._id) {
          const userProfile = await getUserCodingProfile(subscriber._id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error fetching challenges data:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, [slug, subscriber, i18n.language]);

  if (slug && currentPath) {
    const sortedChapters = [...(currentPath.chapters || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    const sortedPath = {
      ...currentPath, chapters: sortedChapters.map(ch => ({
        ...ch,
        lessons: [...(ch.lessons || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
      }))
    };
    const completedLessons = new Set(userProgress?.completedLessons || []);
    const currentLesson = userProgress?.currentLesson;
    const totalLessons = sortedPath.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0;
    const completedCount = completedLessons.size;
    const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    return (
      <div className={`min-h-screen pt-4 sm:pt-6 lg:pt-8 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/challenges" className={`inline-flex items-center gap-2 ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition mb-6`}>
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Learning Paths
          </Link>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-5`}>
                <p className="text-cyan-500 text-xs font-medium mb-2">Current Campaign</p>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>{sortedPath.title}</h2>
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-4`}>
                  <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-500">
                    Lvl {profile?.level || 1} Engineer
                  </span>
                  <span>{profile?.xp?.toLocaleString() || 0} XP</span>
                </div>
                <div className="mb-2">
                  <div className={`h-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} rounded-full overflow-hidden`}>
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500">{completedCount} of {totalLessons} lessons completed</p>
              </div>
              <div className="space-y-2">
                {sortedPath.chapters?.map((chapter, idx) => {
                  const chapterLessons = chapter.lessons || [];
                  const completedInChapter = chapterLessons.filter(l => completedLessons.has(l._id)).length;
                  const isComplete = completedInChapter === chapterLessons.length && chapterLessons.length > 0;
                  const isLocked = idx > 0 && !sortedPath.chapters?.[idx - 1]?.lessons?.every(l => completedLessons.has(l._id));
                  const isActive = activeChapter === idx;
                  return (
                    <button
                      key={chapter._id}
                      onClick={() => !isLocked && setActiveChapter(idx)}
                      disabled={isLocked}
                      className={`w-full text-left p-4 rounded-xl border transition ${isActive
                        ? 'bg-cyan-500/10 border-cyan-500/30'
                        : isLocked
                          ? `${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-200'} opacity-70 cursor-not-allowed`
                          : `${isDarkMode ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'}`
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isComplete
                          ? 'bg-green-500/20 text-green-500'
                          : isLocked
                            ? `${isDarkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-200 text-slate-400'}`
                            : 'bg-cyan-500/20 text-cyan-500'
                          }`}>
                          {isComplete ? (
                            <span className="material-symbols-outlined text-sm">check</span>
                          ) : isLocked ? (
                            <span className="material-symbols-outlined text-sm">lock</span>
                          ) : (
                            <span className="text-sm font-bold">{idx + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${isLocked ? 'text-slate-400' : isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Chapter {idx + 1}: {chapter.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {completedInChapter}/{chapterLessons.length} completed • +{chapter.xpReward} XP
                          </p>
                        </div>
                      </div>
                      {isActive && !isLocked && (
                        <div className="mt-3 ml-11 space-y-1">
                          {chapterLessons.map((lesson) => {
                            const isLessonComplete = completedLessons.has(lesson._id);
                            const isCurrent = currentLesson === lesson._id;
                            return (
                              <Link
                                key={lesson._id}
                                to={`/lesson/${lesson.slug?.current || lesson._id}`}
                                className={`flex items-center gap-2 py-1.5 text-sm ${isLessonComplete
                                  ? 'text-green-500'
                                  : isCurrent
                                    ? 'text-cyan-500 font-medium'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                                  }`}
                              >
                                <span className="material-symbols-outlined text-xs">
                                  {isLessonComplete ? 'check_circle' : isCurrent ? 'play_circle' : 'radio_button_unchecked'}
                                </span>
                                {lesson.title}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="lg:col-span-2">
              {sortedPath.chapters?.[activeChapter] && (
                <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl overflow-hidden`}>
                  <div className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border-slate-800' : 'bg-slate-50 border-slate-200'} p-6 border-b`}>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                      <span className="material-symbols-outlined text-sm">menu_book</span>
                      Library / {sortedPath.title} / {sortedPath.chapters[activeChapter].title}
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyBg(sortedPath.difficulty)}`}>
                        {sortedPath.difficulty?.charAt(0).toUpperCase() + sortedPath.difficulty?.slice(1)} Difficulty
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 text-xs">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        {sortedPath.estimatedHours}h
                      </span>
                      <span className="flex items-center gap-1 text-cyan-500 text-xs">
                        <span className="material-symbols-outlined text-xs">bolt</span>
                        XP Gain
                      </span>
                    </div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                      Mastering {sortedPath.chapters[activeChapter].title}
                    </h2>
                    <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} text-sm`}>
                      {sortedPath.chapters[activeChapter].description ||
                        'Unlock the efficiency of hierarchical data organization. Learn to navigate, insert, and delete nodes with log(n) precision.'}
                    </p>
                  </div>
                  <div className="p-6 space-y-4">
                    {sortedPath.chapters[activeChapter].lessons?.map((lesson, idx) => {
                      const isComplete = completedLessons.has(lesson._id);
                      const isCurrent = currentLesson === lesson._id;
                      return (
                        <Link
                          key={lesson._id}
                          to={`/lesson/${lesson.slug?.current || lesson._id}`}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition ${isComplete
                            ? 'bg-green-500/5 border-green-500/20'
                            : isCurrent
                              ? 'bg-cyan-500/10 border-cyan-500/30'
                              : isDarkMode ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isComplete
                            ? 'bg-green-500/20 text-green-500'
                            : isCurrent
                              ? 'bg-cyan-500/20 text-cyan-500'
                              : isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-500'
                            }`}>
                            <span className="material-symbols-outlined">
                              {lesson.type === 'concept' ? 'psychology' :
                                lesson.type === 'exercise' ? 'code' :
                                  lesson.type === 'quiz' ? 'quiz' : 'swords'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-medium`}>{lesson.title}</h3>
                              {isComplete && (
                                <span className="text-green-500 text-xs">Completed +{lesson.xpReward} XP</span>
                              )}
                            </div>
                            <p className="text-slate-500 text-sm capitalize">
                              {lesson.type} • {lesson.estimatedMinutes} min
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-slate-400">
                            {isComplete ? 'check_circle' : 'arrow_forward'}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  <div className={`p-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between`}>
                    <button
                      disabled={activeChapter === 0}
                      onClick={() => setActiveChapter(prev => prev - 1)}
                      className={`flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      <span className="material-symbols-outlined">arrow_back</span>
                      Previous Chapter
                    </button>
                    <button
                      disabled={activeChapter === (sortedPath.chapters?.length || 1) - 1}
                      onClick={() => setActiveChapter(prev => prev + 1)}
                      className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next Chapter
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-4 sm:pt-6 lg:pt-8 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4 font-display`}>
            Master Programming Through<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 dark:from-cyan-400 to-teal-600 dark:to-teal-400">
              Structured Learning Paths
            </span>
          </h2>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} max-w-2xl mx-auto`}>
            Follow curated learning journeys designed by industry experts. Build skills progressively with hands-on challenges and real-world projects.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-6 animate-pulse`}>
                <div className={`w-12 h-12 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded-xl mb-4`} />
                <div className={`h-6 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded w-2/3 mb-2`} />
                <div className={`h-4 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded w-full mb-4`} />
                <div className={`h-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded w-full`} />
              </div>
            ))
          ) : paths.length === 0 ? (
            <>
              {[
                { title: 'Data Structures Mastery', icon: 'account_tree', color: 'from-cyan-500 to-teal-500', description: 'Master arrays, linked lists, trees, graphs, and more', difficulty: 'medium' },
                { title: 'Algorithm Fundamentals', icon: 'functions', color: 'from-purple-500 to-pink-500', description: 'Learn sorting, searching, and optimization techniques', difficulty: 'medium' },
                { title: 'Dynamic Programming', icon: 'grid_4x4', color: 'from-orange-500 to-red-500', description: 'Solve complex problems with optimal substructure', difficulty: 'hard' },
                { title: 'System Design', icon: 'hub', color: 'from-blue-500 to-indigo-500', description: 'Design scalable distributed systems', difficulty: 'hard' },
                { title: 'JavaScript Mastery', icon: 'javascript', color: 'from-yellow-500 to-amber-500', description: 'Deep dive into modern JavaScript concepts', difficulty: 'easy' },
                { title: 'Python for Interviews', icon: 'code', color: 'from-green-500 to-emerald-500', description: 'Ace coding interviews with Python', difficulty: 'medium' },
              ].map((path, i) => (
                <Link
                  key={i}
                  to={`/challenges/${path.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`group ${isDarkMode ? 'bg-slate-900/50 hover:bg-slate-800/50 border-slate-800' : 'bg-white hover:bg-slate-50 border-slate-200'} border rounded-2xl p-6 transition`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center mb-4`}>
                    <span className="material-symbols-outlined text-white">{path.icon}</span>
                  </div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2 group-hover:text-cyan-500 transition`}>
                    {path.title}
                  </h3>
                  <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-sm mb-4`}>{path.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyBg(path.difficulty as any)}`}>
                      {path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}
                    </span>
                    <span className={`flex items-center gap-1 text-sm transition group-hover:text-cyan-500 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                      Start Learning
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </div>
                </Link>
              ))}
            </>
          ) : (
            paths.map((path) => (
              <Link
                key={path._id}
                to={`/challenges/${path.slug?.current || path._id}`}
                className={`group ${isDarkMode ? 'bg-slate-900/50 hover:bg-slate-800/50 border-slate-800' : 'bg-white hover:bg-slate-50 border-slate-200'} border rounded-2xl p-6 transition`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${path.color || 'from-cyan-500 to-teal-500'} flex items-center justify-center mb-4`}>
                  <span className="material-symbols-outlined text-white">{path.icon || 'school'}</span>
                </div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2 group-hover:text-cyan-500 transition`}>
                  {path.title}
                </h3>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-sm mb-4`}>{path.description}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    {path.estimatedHours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">bolt</span>
                    {path.totalXp} XP
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">group</span>
                    {path.enrolledCount?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyBg(path.difficulty)}`}>
                    {path.difficulty?.charAt(0).toUpperCase() + path.difficulty?.slice(1)}
                  </span>
                  <span className={`flex items-center gap-1 text-sm transition group-hover:text-cyan-500 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                    Start Learning
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Challenges;

