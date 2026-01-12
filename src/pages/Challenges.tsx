import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getLearningPaths,
  getLearningPath,
  getUserPathProgress,
  getUserCodingProfile
} from '../services/coding';
import { LearningPath, UserProgress, UserCodingProfile, getDifficultyBg } from '../types/coding';

const Challenges: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const { subscriber } = useAuth();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [profile, setProfile] = useState<UserCodingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (slug) {
          // Fetch specific learning path
          const pathData = await getLearningPath(slug);
          setCurrentPath(pathData);

          if (subscriber?._id && pathData) {
            const progress = await getUserPathProgress(subscriber._id, pathData._id);
            setUserProgress(progress);
          }
        } else {
          // Fetch all learning paths
          const pathsData = await getLearningPaths();
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
  }, [slug, subscriber]);

  // If we're viewing a specific learning path
  if (slug && currentPath) {
    // Sort chapters and lessons by their order
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
      <div className="min-h-screen -mt-10 -mx-4 sm:-mx-6 lg:-mx-8 bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-100 via-cyan-100/30 to-slate-100 dark:from-slate-900 dark:via-cyan-900/30 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link to="/challenges" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                  <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">terminal</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display">CodeFlow</h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Learning Path</p>
                </div>
              </div>

              {profile && (
                <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-sm">bolt</span>
                  <span className="text-slate-900 dark:text-white font-medium text-sm">{profile.xp?.toLocaleString()} XP</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - Chapter Navigation */}
            <div className="lg:col-span-1 space-y-4">
              {/* Campaign Header */}
              <div className="bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-2xl p-5">
                <p className="text-cyan-600 dark:text-cyan-400 text-xs font-medium mb-2">Current Campaign</p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{sortedPath.title}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                  <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                    Lvl {profile?.level || 1} Engineer
                  </span>
                  <span>{profile?.xp?.toLocaleString() || 0} XP</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500">{completedCount} of {totalLessons} lessons completed</p>
              </div>

              {/* Chapters */}
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
                          ? 'bg-slate-900/30 border-slate-800 opacity-50 cursor-not-allowed'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isComplete
                          ? 'bg-green-500/20 text-green-400'
                          : isLocked
                            ? 'bg-slate-800 text-slate-600'
                            : 'bg-cyan-500/20 text-cyan-400'
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
                          <p className={`font-medium text-sm ${isLocked ? 'text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-white'}`}>
                            Chapter {idx + 1}: {chapter.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {completedInChapter}/{chapterLessons.length} completed • +{chapter.xpReward} XP
                          </p>
                        </div>
                      </div>

                      {/* Lessons Preview */}
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
                                  ? 'text-green-400'
                                  : isCurrent
                                    ? 'text-cyan-400 font-medium'
                                    : 'text-slate-400 hover:text-white'
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

            {/* Main Content - Current Lesson Preview */}
            <div className="lg:col-span-2">
              {sortedPath.chapters?.[activeChapter] && (
                <div className="bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {/* Lesson Header */}
                  <div className="bg-gradient-to-r from-cyan-500/20 to-teal-500/20 p-6 border-b border-slate-800">
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
                      <span className="flex items-center gap-1 text-cyan-400 text-xs">
                        <span className="material-symbols-outlined text-xs">bolt</span>
                        XP Gain
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Mastering {sortedPath.chapters[activeChapter].title}
                    </h2>
                    <p className="text-slate-300 text-sm">
                      {sortedPath.chapters[activeChapter].description ||
                        'Unlock the efficiency of hierarchical data organization. Learn to navigate, insert, and delete nodes with log(n) precision.'}
                    </p>
                  </div>

                  {/* Lessons List */}
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
                              : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                            }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isComplete
                            ? 'bg-green-500/20 text-green-400'
                            : isCurrent
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500'
                            }`}>
                            <span className="material-symbols-outlined">
                              {lesson.type === 'concept' ? 'psychology' :
                                lesson.type === 'exercise' ? 'code' :
                                  lesson.type === 'quiz' ? 'quiz' : 'swords'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-slate-900 dark:text-white font-medium">{lesson.title}</h3>
                              {isComplete && (
                                <span className="text-green-400 text-xs">Completed +{lesson.xpReward} XP</span>
                              )}
                            </div>
                            <p className="text-slate-500 text-sm capitalize">
                              {lesson.type} • {lesson.estimatedMinutes} min
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-slate-600">
                            {isComplete ? 'check_circle' : 'arrow_forward'}
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Navigation */}
                  <div className="p-6 border-t border-slate-800 flex items-center justify-between">
                    <button
                      disabled={activeChapter === 0}
                      onClick={() => setActiveChapter(prev => prev - 1)}
                      className="flex items-center gap-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <span className="material-symbols-outlined">arrow_back</span>
                      Previous Chapter
                    </button>
                    <button
                      disabled={activeChapter === (sortedPath.chapters?.length || 1) - 1}
                      onClick={() => setActiveChapter(prev => prev + 1)}
                      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
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

  // Learning Paths Overview
  return (
    <div className="min-h-screen -mt-10 -mx-4 sm:-mx-6 lg:-mx-8 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-100 via-cyan-100/30 to-slate-100 dark:from-slate-900 dark:via-cyan-900/30 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">terminal</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display">CodeFlow</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">Learning Paths</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/practice" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition text-sm">Practice</Link>
              <Link to="/leaderboard" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition text-sm">Leaderboard</Link>
              <Link to="/challenges" className="text-cyan-600 dark:text-cyan-400 font-medium text-sm">Challenges</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 font-display">
            Master Programming Through<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 dark:from-cyan-400 to-teal-600 dark:to-teal-400">
              Structured Learning Paths
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Follow curated learning journeys designed by industry experts. Build skills progressively with hands-on challenges and real-world projects.
          </p>
        </div>

        {/* Learning Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 animate-pulse">
                <div className="w-12 h-12 bg-slate-800 rounded-xl mb-4" />
                <div className="h-6 bg-slate-800 rounded w-2/3 mb-2" />
                <div className="h-4 bg-slate-800 rounded w-full mb-4" />
                <div className="h-2 bg-slate-800 rounded w-full" />
              </div>
            ))
          ) : paths.length === 0 ? (
            // Show sample paths when no data
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
                  className="group bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 rounded-2xl p-6 transition"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center mb-4`}>
                    <span className="material-symbols-outlined text-white">{path.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
                    {path.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{path.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyBg(path.difficulty as any)}`}>
                      {path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-500 text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
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
                className="group bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 rounded-2xl p-6 transition"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${path.color || 'from-cyan-500 to-teal-500'} flex items-center justify-center mb-4`}>
                  <span className="material-symbols-outlined text-white">{path.icon || 'school'}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
                  {path.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{path.description}</p>
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
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-500 text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
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

