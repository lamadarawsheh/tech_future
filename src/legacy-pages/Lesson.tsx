'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from '../../app/components/Link';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store';
import { client } from '../lib/sanity';
import {
  getUserCodingProfile,
  addXp,
  updateUserProgress,
  getUserPathProgress
} from '../services/coding';
import { Lesson as LessonType, UserCodingProfile, Chapter, getDifficultyBg } from '../types/coding';
import { PortableText } from '../components/PortableText';
import { useTranslation } from 'react-i18next';
import { getDocumentTranslations } from '../services/sanity';

interface LessonData extends LessonType {
  learningPath?: {
    _id: string;
    title: string;
    slug: { current: string };
    chapters: Chapter[];
  };
}

const Lesson: React.FC = () => {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { subscriber } = useAuth();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [profile, setProfile] = useState<UserCodingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [codeValue, setCodeValue] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      setLoading(true);
      try {
        const lang = i18n.language;

        // Fetch lesson with its learning path context
        const query = `*[_type == "lesson" && slug.current == $slug && language == $lang][0] {
          _id,
          title,
          slug,
          order,
          type,
          content,
          xpReward,
          estimatedMinutes,
          quiz,
          "challenge": challenge-> {
            _id,
            title,
            slug,
            starterCode,
            testCases[!isHidden]
          },
          "chapter": *[_type == "chapter" && references(^._id)][0] {
            _id,
            title,
             "learningPath": *[_type == "learningPath" && references(^._id)][0] {
              _id,
              title,
              slug,
              "chapters": chapters[]-> {
                _id,
                title,
                order,
                "lessons": lessons[]-> {
                  _id,
                  title,
                  slug,
                  order,
                  type,
                  xpReward
                }
              }
            }
          }
        }`;

        let lessonData = await client.fetch(query, { slug, lang });

        if (!lessonData) {
          // Check other lang and redirect
          const otherLang = lang === 'en' ? 'ar' : 'en';
          const otherQuery = `*[_type == "lesson" && slug.current == $slug && language == $otherLang][0]{ _id }`;
          const otherLesson = await client.fetch(otherQuery, { slug, otherLang });

          if (otherLesson) {
            const translations = await getDocumentTranslations(otherLesson._id);
            const target = translations.find(t => t.value?.language === lang);
            if (target && target.value?.slug?.current) {
              router.push(`/lesson/${target.value.slug.current}`);
              return;
            }
          }
        }

        // Handle nested learning path via chapter
        if (lessonData && !lessonData.learningPath && lessonData.chapter?.learningPath) {
          lessonData.learningPath = lessonData.chapter.learningPath;
        }

        setLesson(lessonData);

        // Set initial code for exercises
        if (lessonData?.challenge?.starterCode) {
          const pythonStarter = lessonData.challenge.starterCode.find(
            (s: any) => s.language === 'python'
          );
          setCodeValue(pythonStarter?.code || '');
        }

        if (subscriber?._id) {
          const userProfile = await getUserCodingProfile(subscriber._id);
          setProfile(userProfile);

          // Check if lesson is already completed
          if (lessonData?.learningPath?._id) {
            const progress = await getUserPathProgress(subscriber._id, lessonData.learningPath._id);
            if (progress?.completedLessons?.includes(lessonData._id)) {
              setIsCompleted(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, subscriber, i18n.language]);

  const handleCompleteLesson = async () => {
    if (!subscriber?._id || !lesson || !profile) return;

    try {
      // Update progress
      if (lesson.learningPath?._id) {
        await updateUserProgress(
          subscriber._id,
          lesson.learningPath._id,
          lesson._id,
          lesson.xpReward
        );
      }

      // Add XP
      await addXp(profile._id, lesson.xpReward);

      setIsCompleted(true);
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);

    // Check if all answers are correct
    const allCorrect = lesson?.quiz?.every(
      (q, i) => quizAnswers[i] === q.correctIndex
    );

    if (allCorrect && !isCompleted) {
      handleCompleteLesson();
    }
  };

  // Get all lessons from all chapters, sorted by chapter order then lesson order
  const getAllSortedLessons = () => {
    if (!lesson?.learningPath?.chapters) return [];

    // Sort chapters by order
    const sortedChapters = [...lesson.learningPath.chapters].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Flatten lessons, sorting each chapter's lessons by order
    const allLessons = sortedChapters.flatMap(ch => {
      const lessons = ch.lessons || [];
      return [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    return allLessons;
  };

  const getNextLesson = (): { title: string; slug: string } | null => {
    const allLessons = getAllSortedLessons();
    if (allLessons.length === 0) return null;

    const currentIndex = allLessons.findIndex(l => l._id === lesson?._id);

    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      const next = allLessons[currentIndex + 1];
      return { title: next.title, slug: next.slug?.current || next._id };
    }
    return null;
  };

  const getPrevLesson = (): { title: string; slug: string } | null => {
    const allLessons = getAllSortedLessons();
    if (allLessons.length === 0) return null;

    const currentIndex = allLessons.findIndex(l => l._id === lesson?._id);

    if (currentIndex > 0) {
      const prev = allLessons[currentIndex - 1];
      return { title: prev.title, slug: prev.slug?.current || prev._id };
    }
    return null;
  };

  const { isDarkMode } = useStore();

  if (loading) {
    return (
      <div className={`min-h-screen -mt-10 -mx-4 sm:-mx-6 lg:-mx-8 flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className={`min-h-screen -mt-10 -mx-4 sm:-mx-6 lg:-mx-8 flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">error</span>
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Lesson Not Found</h2>
          <p className={`mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>The lesson you're looking for doesn't exist.</p>
          <Link
            to="/challenges"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition"
          >
            Back to Learning Paths
          </Link>
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const prevLesson = getPrevLesson();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in">
          <span className="material-symbols-outlined">check_circle</span>
          <span>+{lesson.xpReward} XP earned!</span>
        </div>
      )}

      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gradient-to-r from-slate-900 via-cyan-900/30 to-slate-900 border-slate-700/50' : 'bg-white border-slate-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to={lesson.learningPath ? `/challenges/${lesson.learningPath.slug?.current}` : '/challenges'}
                className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition`}
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <div>
                <p className={`text-xs mb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  {lesson.learningPath?.title || 'Learning Path'}
                </p>
                <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{lesson.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isCompleted && (
                <span className="flex items-center gap-1 text-green-500 text-sm font-medium">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Completed
                </span>
              )}
              <span className="flex items-center gap-1 text-cyan-500 text-sm font-medium">
                <span className="material-symbols-outlined text-sm">bolt</span>
                {lesson.xpReward} XP
              </span>
              <span className={`flex items-center gap-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="material-symbols-outlined text-sm">schedule</span>
                {lesson.estimatedMinutes} min
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lesson Type Badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lesson.type === 'concept' ? 'bg-blue-500/20 text-blue-500' :
            lesson.type === 'exercise' ? 'bg-green-500/20 text-green-500' :
              lesson.type === 'quiz' ? 'bg-purple-500/20 text-purple-500' :
                'bg-amber-500/20 text-amber-500'
            }`}>
            <span className="material-symbols-outlined">
              {lesson.type === 'concept' ? 'psychology' :
                lesson.type === 'exercise' ? 'code' :
                  lesson.type === 'quiz' ? 'quiz' : 'swords'}
            </span>
          </div>
          <div>
            <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${lesson.type === 'concept' ? 'bg-blue-500/20 text-blue-500' :
              lesson.type === 'exercise' ? 'bg-green-500/20 text-green-500' :
                lesson.type === 'quiz' ? 'bg-purple-500/20 text-purple-500' :
                  'bg-amber-500/20 text-amber-500'
              }`}>
              {lesson.type}
            </span>
          </div>
        </div>

        {/* Lesson Content */}
        <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl overflow-hidden shadow-sm`}>
          {/* Content Header */}
          <div className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border-slate-800' : 'bg-slate-50 border-slate-200'} p-6 border-b`}>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>{lesson.title}</h2>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Portable Text Content */}
            {lesson.content && (
              <div className={`prose max-w-none mb-8 ${isDarkMode ? 'prose-invert' : 'prose-slate'}`}>
                <PortableText content={lesson.content} />
              </div>
            )}

            {/* Quiz Section */}
            {lesson.type === 'quiz' && lesson.quiz && lesson.quiz.length > 0 && (
              <div className="space-y-6 mt-8">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
                  <span className="material-symbols-outlined text-purple-500">quiz</span>
                  Knowledge Check
                </h3>

                {lesson.quiz.map((question, qIndex) => (
                  <div key={qIndex} className={`${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50 border border-slate-200'} rounded-xl p-6`}>
                    <p className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-medium mb-4`}>
                      {qIndex + 1}. {question.question}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => {
                        const isSelected = quizAnswers[qIndex] === oIndex;
                        const isCorrect = question.correctIndex === oIndex;
                        const showResult = quizSubmitted;

                        return (
                          <button
                            key={oIndex}
                            onClick={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [qIndex]: oIndex }))}
                            disabled={quizSubmitted}
                            className={`w-full text-left p-3 rounded-lg border transition ${showResult
                              ? isCorrect
                                ? 'bg-green-500/20 border-green-500/50 text-green-600 dark:text-green-400'
                                : isSelected
                                  ? 'bg-red-500/20 border-red-500/50 text-red-600 dark:text-red-400'
                                  : isDarkMode ? 'bg-slate-800/30 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
                              : isSelected
                                ? 'bg-purple-500/20 border-purple-500/50 text-purple-600 dark:text-purple-400'
                                : isDarkMode ? 'bg-slate-800/30 border-slate-700 text-slate-300 hover:border-slate-600' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                          >
                            <span className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${showResult && isCorrect
                                ? 'border-green-500 bg-green-500/20'
                                : showResult && isSelected
                                  ? 'border-red-500 bg-red-500/20'
                                  : isSelected
                                    ? 'border-purple-500 bg-purple-500/20'
                                    : 'border-slate-400'
                                }`}>
                                {String.fromCharCode(65 + oIndex)}
                              </span>
                              {option}
                              {showResult && isCorrect && (
                                <span className="material-symbols-outlined text-green-500 ml-auto">check_circle</span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className={`mt-4 p-3 rounded-lg ${quizAnswers[qIndex] === question.correctIndex
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-amber-500/10 border border-amber-500/20'
                        }`}>
                        <p className={`text-sm ${quizAnswers[qIndex] === question.correctIndex
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-amber-600 dark:text-amber-400'
                          }`}>
                          <span className="font-semibold">Explanation:</span> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {!quizSubmitted && (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length < lesson.quiz.length}
                    className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition"
                  >
                    Submit Answers
                  </button>
                )}
              </div>
            )}

            {/* Exercise Section */}
            {lesson.type === 'exercise' && lesson.challenge && (
              <div className="mt-8">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-2 mb-4`}>
                  <span className="material-symbols-outlined text-green-500">code</span>
                  Coding Exercise
                </h3>

                <div className={`${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-900'} rounded-xl overflow-hidden`}>
                  {/* Code Editor Header */}
                  <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-700 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs text-slate-500 ml-2">solution.py</span>
                  </div>

                  {/* Code Editor */}
                  <textarea
                    value={codeValue}
                    onChange={(e) => setCodeValue(e.target.value)}
                    className="w-full h-64 bg-slate-950 text-slate-300 font-mono text-sm p-4 resize-none focus:outline-none"
                    spellCheck={false}
                  />

                  {/* Test Cases */}
                  {lesson.challenge.testCases && (
                    <div className="border-t border-slate-700 p-4">
                      <p className="text-sm text-slate-400 mb-2">Test Cases:</p>
                      <div className="space-y-2">
                        {lesson.challenge.testCases.slice(0, 3).map((tc: any, i: number) => (
                          <div key={i} className="flex items-center gap-4 text-xs font-mono">
                            <span className="text-slate-500">Input: {tc.input}</span>
                            <span className="text-slate-400">→</span>
                            <span className="text-green-400">Expected: {tc.expectedOutput}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="border-t border-slate-700 p-4 flex items-center justify-between">
                    <Link
                      to={`/problem/${lesson.challenge.slug?.current || lesson.challenge._id}`}
                      className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
                    >
                      Open Full Editor
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </Link>
                    <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                      Run Tests
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Challenge Section */}
            {lesson.type === 'challenge' && (
              <div className="mt-8 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-amber-500 text-2xl">swords</span>
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Boss Challenge</h3>
                    <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-sm`}>Complete this challenge to finish the lesson</p>
                  </div>
                </div>
                <Link
                  to={lesson.challenge ? `/problem/${lesson.challenge.slug?.current}` : '/practice'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition"
                >
                  <span className="material-symbols-outlined">swords</span>
                  Accept Challenge
                </Link>
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className={`p-6 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50'} flex flex-col sm:flex-row items-center gap-4`}>
            {/* Mark as Complete Button */}
            {!isCompleted && lesson.type !== 'quiz' && (
              <button
                onClick={handleCompleteLesson}
                disabled={!subscriber}
                className={`w-full sm:flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20`}
              >
                <span className="material-symbols-outlined">check_circle</span>
                Mark as Complete (+{lesson.xpReward} XP)
              </button>
            )}

            {/* Next Lesson Button */}
            {nextLesson && (
              <Link
                to={`/lesson/${nextLesson.slug}`}
                className={`w-full sm:flex-1 py-3 ${isCompleted
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  : isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200'} rounded-xl font-medium transition flex items-center justify-center gap-2`}
              >
                <span>{isCompleted ? 'Next Lesson' : 'Skip to Next Lesson'}</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            )}

            {/* Login Prompt for non-subscribers */}
            {!subscriber && !isCompleted && lesson.type !== 'quiz' && (
              <div className="w-full text-center sm:hidden">
                <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Sign in to track your progress
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className={`p-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between`}>
            {prevLesson ? (
              <Link
                to={`/lesson/${prevLesson.slug}`}
                className={`flex items-center gap-2 transition ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <div className="text-left">
                  <p className="text-xs text-slate-500">Previous</p>
                  <p className="text-sm">{prevLesson.title}</p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                to={`/lesson/${nextLesson.slug}`}
                className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400 transition"
              >
                <div className="text-right">
                  <p className="text-xs text-slate-500">Next</p>
                  <p className="text-sm">{nextLesson.title}</p>
                </div>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            ) : (
              <Link
                to={lesson.learningPath ? `/challenges/${lesson.learningPath.slug?.current}` : '/challenges'}
                className="flex items-center gap-2 text-green-500 hover:text-green-400 transition"
              >
                <div className="text-right">
                  <p className="text-xs text-slate-500">Finished!</p>
                  <p className="text-sm">Back to Path</p>
                </div>
                <span className="material-symbols-outlined">check_circle</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lesson;
