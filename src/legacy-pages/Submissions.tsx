'use client';
import React, { useState, useEffect } from 'react';
import Link from '../../app/components/Link';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserSubmissions,
  getUserSubmissionStats,
  getUserCodingProfile
} from '../services/coding';
import { Submission, UserCodingProfile, getDifficultyBg, SubmissionStatus, ProgrammingLanguage } from '../types/coding';

const getStatusColor = (status: SubmissionStatus) => {
  switch (status) {
    case 'accepted': return 'text-green-400 bg-green-500/10';
    case 'wrong_answer': return 'text-red-400 bg-red-500/10';
    case 'runtime_error': return 'text-orange-400 bg-orange-500/10';
    case 'time_limit': return 'text-yellow-400 bg-yellow-500/10';
    case 'compile_error': return 'text-pink-400 bg-pink-500/10';
    default: return 'text-slate-400 bg-slate-500/10';
  }
};

const getStatusIcon = (status: SubmissionStatus) => {
  switch (status) {
    case 'accepted': return 'check_circle';
    case 'wrong_answer': return 'cancel';
    case 'runtime_error': return 'bug_report';
    case 'time_limit': return 'timer_off';
    case 'compile_error': return 'error';
    default: return 'help';
  }
};

const getStatusLabel = (status: SubmissionStatus) => {
  switch (status) {
    case 'accepted': return 'Accepted';
    case 'wrong_answer': return 'Wrong Answer';
    case 'runtime_error': return 'Runtime Error';
    case 'time_limit': return 'Time Limit Exceeded';
    case 'compile_error': return 'Compile Error';
    default: return status;
  }
};

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return past.toLocaleDateString();
};

// ... imports
import { useStore } from '../store';

// ... (helper functions remain same)

const Submissions: React.FC = () => {
  const { subscriber } = useAuth();
  const { isDarkMode } = useStore();
  // ... (state vars remain same)
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    accepted: number;
    streak: number;
    recentActivity: { date: string; count: number; accepted: number }[];
  } | null>(null);
  const [profile, setProfile] = useState<UserCodingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | 'all'>('all');
  const [filterLanguage, setFilterLanguage] = useState<ProgrammingLanguage | 'all'>('all');
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

  useEffect(() => {
    // ... useEffect remains same
    const fetchData = async () => {
      if (!subscriber?._id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const filters: any = {};
        if (filterStatus !== 'all') filters.status = filterStatus;
        if (filterLanguage !== 'all') filters.language = filterLanguage;

        const [submissionsData, statsData, profileData] = await Promise.all([
          getUserSubmissions(subscriber._id, 50, 0, filters),
          getUserSubmissionStats(subscriber._id),
          getUserCodingProfile(subscriber._id)
        ]);

        setSubmissions(submissionsData);
        setStats(statsData);
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [subscriber, filterStatus, filterLanguage]);

  // Calculate max bar height for chart
  const maxActivity = Math.max(...(stats?.recentActivity?.map(a => a.count) || [1]), 1);

  if (!subscriber) {
    return (
      <div className={`min-h-screen pt-4 sm:pt-6 lg:pt-8 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} flex items-center justify-center`}>
        <div className="text-center">
          <span className={`material-symbols-outlined text-6xl ${isDarkMode ? 'text-slate-600' : 'text-slate-400'} mb-4`}>lock</span>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>Sign In Required</h2>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-6`}>Please sign in to view your submission history</p>
          <Link
            to="/practice"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition"
          >
            Go to Practice
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-4 sm:pt-6 lg:pt-8 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} transition-colors duration-300`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2 font-display`}>
            Your Coding Journey
          </h2>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Visualize your progress, analyze performance metrics, and revisit your solution evolution over time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Chart */}
            <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-semibold flex items-center gap-2`}>
                  <span className="material-symbols-outlined text-blue-400">bar_chart_4_bars</span>
                  Submission Activity
                </h3>
                <span className="text-slate-500 text-sm">Last 14 days</span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mb-4 text-xs">
                <span className={`flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span className="w-3 h-3 rounded bg-blue-500"></span>
                  Accepted
                </span>
                <span className={`flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span className="w-3 h-3 rounded bg-slate-600"></span>
                  Attempts
                </span>
              </div>

              {/* Chart */}
              <div className="flex items-end justify-between gap-2 h-32">
                {stats?.recentActivity?.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '100px' }}>
                      {/* Attempts bar (background) */}
                      <div
                        className="w-full bg-slate-700 rounded-t"
                        style={{
                          height: `${(day.count / maxActivity) * 100}%`,
                          minHeight: day.count > 0 ? '4px' : '0'
                        }}
                      />
                      {/* Accepted bar (overlay) */}
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t -mt-full"
                        style={{
                          height: `${(day.accepted / maxActivity) * 100}%`,
                          minHeight: day.accepted > 0 ? '4px' : '0'
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-600">
                      {new Date(day.date).getDate().toString().padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500 text-sm">filter_list</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className={`bg-white dark:bg-slate-800 border ${isDarkMode ? 'border-slate-700 text-white' : 'border-slate-300 text-slate-900'} rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">All Statuses</option>
                  <option value="accepted">Accepted</option>
                  <option value="wrong_answer">Wrong Answer</option>
                  <option value="runtime_error">Runtime Error</option>
                  <option value="time_limit">Time Limit</option>
                  <option value="compile_error">Compile Error</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500 text-sm">code</span>
                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value as any)}
                  className={`bg-white dark:bg-slate-800 border ${isDarkMode ? 'border-slate-700 text-white' : 'border-slate-300 text-slate-900'} rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">All Languages</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
            </div>

            {/* Submissions Timeline */}
            <div className="space-y-4">
              <h3 className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-semibold`}>Timeline</h3>

              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-4 animate-pulse`}>
                    <div className={`h-5 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded w-1/3 mb-2`} />
                    <div className={`h-4 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded w-1/4`} />
                  </div>
                ))
              ) : submissions.length === 0 ? (
                <div className={`text-center py-12 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl`}>
                  <span className="material-symbols-outlined text-4xl text-slate-600 mb-3">history</span>
                  <p className="text-slate-400">No submissions yet</p>
                  <Link
                    to="/practice"
                    className="inline-flex items-center gap-2 mt-4 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Start solving problems
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              ) : (
                submissions.map((submission) => (
                  <div
                    key={submission._id}
                    className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl overflow-hidden`}
                  >
                    <div
                      className={`p-4 cursor-pointer ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'} transition`}
                      onClick={() => setExpandedSubmission(
                        expandedSubmission === submission._id ? null : submission._id
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(submission.status)}`}>
                          <span className="material-symbols-outlined">
                            {getStatusIcon(submission.status)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(submission.status)}`}>
                              {getStatusLabel(submission.status)}
                            </span>
                            <span className={`${isDarkMode ? 'text-slate-500' : 'text-slate-500'} text-xs`}>
                              {formatTimeAgo(submission.createdAt)}
                            </span>
                          </div>
                          <Link
                            to={`/problem/${submission.challenge?.slug?.current || submission.challenge?._ref}`}
                            className={`${isDarkMode ? 'text-white hover:text-blue-400' : 'text-slate-900 hover:text-blue-600'} font-medium transition`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {submission.challenge?.title || 'Unknown Challenge'}
                          </Link>
                          <div className={`flex items-center gap-3 mt-1 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">code</span>
                              {submission.language?.charAt(0).toUpperCase() + submission.language?.slice(1)}
                            </span>
                            {submission.challenge?.difficulty && (
                              <span className={getDifficultyBg(submission.challenge.difficulty)}>
                                {submission.challenge.difficulty}
                              </span>
                            )}
                            {submission.challenge?.tags?.slice(0, 2).map((tag) => (
                              <span key={tag} className={`${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>#{tag}</span>
                            ))}
                          </div>
                        </div>

                        {/* Metrics */}
                        {submission.status === 'accepted' && (
                          <div className="hidden md:flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">timer</span>
                                Runtime
                              </p>
                              <p className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-medium`}>{submission.runtime || 0} ms</p>
                              <p className="text-xs text-green-400">
                                Beats {submission.runtimePercentile || 0}%
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">memory</span>
                                Memory
                              </p>
                              <p className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-medium`}>{submission.memory || 0} MB</p>
                              <p className="text-xs text-slate-400">
                                Beats {submission.memoryPercentile || 0}%
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Expand Icon */}
                        <span className={`material-symbols-outlined text-slate-500 transition ${expandedSubmission === submission._id ? 'rotate-180' : ''
                          }`}>
                          expand_more
                        </span>
                      </div>

                      {/* Error Message */}
                      {submission.status !== 'accepted' && submission.errorMessage && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-red-400 text-sm font-mono">{submission.errorMessage}</p>
                        </div>
                      )}
                    </div>

                    {/* Expanded Code View */}
                    {expandedSubmission === submission._id && (
                      <div className={`border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        <div className={`${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'} px-4 py-2 flex items-center justify-between`}>
                          <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Your Solution</span>
                          <div className="flex items-center gap-2">
                            <button className={`text-xs ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} flex items-center gap-1`}>
                              <span className="material-symbols-outlined text-xs">content_copy</span>
                              Copy
                            </button>
                            <button className={`text-xs ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} flex items-center gap-1`}>
                              <span className="material-symbols-outlined text-xs">edit_note</span>
                              Notes
                            </button>
                          </div>
                        </div>
                        <pre className={`p-4 text-sm ${isDarkMode ? 'text-slate-300 bg-slate-900/50' : 'text-slate-700 bg-slate-50'} font-mono overflow-x-auto max-h-64`}>
                          <code>{submission.code || '// No code available'}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Load More */}
              {submissions.length > 0 && (
                <button className="w-full py-3 text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center justify-center gap-2 transition">
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                  Load Older Submissions
                </button>
              )}
            </div>
          </div>

          {/* Sidebar - Stats */}
          <div className="space-y-6">
            {/* Total Solved */}
            <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-5`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-400">check_circle</span>
                </div>
                <div>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{profile?.totalSolved || 0}</p>
                  <p className="text-slate-500 text-sm">Total Solved</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  +5 this week
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-500 text-sm">Top 15% of users</span>
              </div>
            </div>

            {/* Current Streak */}
            <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-5`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-400">local_fire_department</span>
                </div>
                <div>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats?.streak || 0}</p>
                  <p className="text-slate-500 text-sm">Current Streak</p>
                </div>
              </div>

              {/* Streak Calendar */}
              <div className={`flex items-center justify-between ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-100'} rounded-lg p-3`}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                  const hasActivity = i < (stats?.streak || 0) % 7;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${hasActivity
                        ? 'bg-orange-500/30 text-orange-600 dark:text-orange-400'
                        : isDarkMode ? 'bg-slate-700 text-slate-600' : 'bg-slate-200 text-slate-400'
                        }`}>
                        {hasActivity && <span className="material-symbols-outlined text-xs">check</span>}
                      </div>
                      <span className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>{day}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-sm text-slate-500 mt-3">Keep it up!</p>
            </div>

            {/* Problem Breakdown */}
            {profile && (
              <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-5`}>
                <h3 className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-semibold mb-4`}>Problem Breakdown</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-green-400">Easy</span>
                      <span className="text-slate-400">{profile.easySolved}/100</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(profile.easySolved / 100) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-yellow-400">Medium</span>
                      <span className="text-slate-400">{profile.mediumSolved}/150</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full"
                        style={{ width: `${(profile.mediumSolved / 150) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-red-400">Hard</span>
                      <span className="text-slate-400">{profile.hardSolved}/50</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${(profile.hardSolved / 50) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Acceptance Rate */}
            <div className={`bg-gradient-to-br ${isDarkMode ? 'from-blue-500/20 to-indigo-500/20 border-blue-500/30' : 'from-blue-50 to-indigo-50 border-blue-100'} border rounded-2xl p-5`}>
              <h3 className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-semibold mb-3`}>Acceptance Rate</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className={`${isDarkMode ? 'text-slate-700' : 'text-slate-200'}`}
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${((stats?.accepted || 0) / Math.max(stats?.total || 1, 1)) * 251.2} 251.2`}
                      className="text-blue-400"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {stats?.total ? Math.round((stats.accepted / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-center text-slate-400 text-sm mt-3">
                {stats?.accepted || 0} / {stats?.total || 0} submissions accepted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submissions;

