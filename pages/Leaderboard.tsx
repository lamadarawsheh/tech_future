import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getLeaderboard, getUserCodingProfile, getUserRank } from '../services/coding';
import { UserCodingProfile, getTierColor, getXpForLevel } from '../types/coding';

const Leaderboard: React.FC = () => {
  const { subscriber } = useAuth();
  const [leaderboard, setLeaderboard] = useState<UserCodingProfile[]>([]);
  const [userProfile, setUserProfile] = useState<UserCodingProfile | null>(null);
  const [userRank, setUserRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'country'>('global');
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'all'>('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const filter = timeFilter === 'weekly' ? 'weekly' : activeTab === 'country' ? 'country' : 'global';
        const data = await getLeaderboard(filter, undefined, 50, 0);
        setLeaderboard(data);

        if (subscriber?._id) {
          const profile = await getUserCodingProfile(subscriber._id);
          setUserProfile(profile);
          if (profile) {
            const rank = await getUserRank(profile._id);
            setUserRank(rank);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [subscriber, activeTab, timeFilter]);

  // Get top 3 for podium
  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  return (
    <div className="min-h-screen -mt-10 -mx-4 sm:-mx-6 lg:-mx-8 bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900/30 to-slate-900 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">code_blocks</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-display">CodeMastery</h1>
                <p className="text-xs text-slate-400">Leaderboard</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/practice" className="text-slate-400 hover:text-white transition text-sm">Practice</Link>
              <Link to="/leaderboard" className="text-indigo-400 font-medium text-sm">Leaderboard</Link>
              <Link to="/challenges" className="text-slate-400 hover:text-white transition text-sm">Challenges</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 rounded-2xl border border-indigo-500/30 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
              
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-indigo-400 text-sm font-medium mb-1">Current Rank</p>
                  <p className="text-5xl font-bold text-white mb-2">Top 5%</p>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    Weekly Season Ends in 2 Days
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-white text-4xl">emoji_events</span>
                  </div>
                  <p className="text-white font-semibold">Coding Constellation</p>
                </div>
              </div>
              
              <p className="text-slate-300 text-sm mt-4">
                Join the elite circle of developers. Visualize your progress, challenge peers, and reach for the stars.
              </p>
            </div>

            {/* Podium - Top 3 */}
            {!loading && topThree.length >= 3 && (
              <div className="flex items-end justify-center gap-4 py-8">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-xl font-bold mb-2 shadow-lg">
                    {topThree[1]?.displayName?.[0] || 'U'}
                  </div>
                  <p className="text-white font-semibold text-sm mb-1">{topThree[1]?.displayName || 'User'}</p>
                  <p className="text-slate-400 text-xs mb-2">{topThree[1]?.xp?.toLocaleString() || 0} XP</p>
                  <div className="w-20 h-20 bg-gradient-to-t from-slate-600 to-slate-500 rounded-t-lg flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center -mb-4">
                  <div className="relative">
                    <span className="material-symbols-outlined text-amber-400 text-2xl absolute -top-6 left-1/2 -translate-x-1/2">crown</span>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold mb-2 shadow-lg shadow-amber-500/30">
                      {topThree[0]?.displayName?.[0] || 'U'}
                    </div>
                  </div>
                  <p className="text-white font-bold mb-0.5">{topThree[0]?.displayName || 'User'}</p>
                  <p className="text-amber-400 text-xs font-semibold mb-1">LEGENDARY</p>
                  <p className="text-slate-400 text-xs mb-2">{topThree[0]?.xp?.toLocaleString() || 0} XP</p>
                  <div className="w-24 h-28 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-lg flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">1</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center text-white text-xl font-bold mb-2 shadow-lg">
                    {topThree[2]?.displayName?.[0] || 'U'}
                  </div>
                  <p className="text-white font-semibold text-sm mb-1">{topThree[2]?.displayName || 'User'}</p>
                  <p className="text-slate-400 text-xs mb-2">{topThree[2]?.xp?.toLocaleString() || 0} XP</p>
                  <div className="w-20 h-16 bg-gradient-to-t from-orange-700 to-orange-600 rounded-t-lg flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              {(['global', 'friends', 'country'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === tab
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'global' ? 'Global League' : tab === 'friends' ? 'Friends' : 'My Country'}
                </button>
              ))}
              
              <div className="ml-auto flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-green-400">
                  <span className="material-symbols-outlined text-xs">keyboard_arrow_up</span>
                  Rising
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <span className="material-symbols-outlined text-xs">keyboard_arrow_down</span>
                  Falling
                </span>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-slate-900/50 rounded-xl p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-slate-800 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-slate-800 rounded w-1/4 mb-2" />
                        <div className="h-3 bg-slate-800 rounded w-1/6" />
                      </div>
                    </div>
                  </div>
                ))
              ) : restOfLeaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-4xl text-slate-600 mb-3">leaderboard</span>
                  <p className="text-slate-400">No users on the leaderboard yet</p>
                </div>
              ) : (
                restOfLeaderboard.map((user, index) => {
                  const rank = index + 4;
                  const rankChange = Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'same';
                  
                  return (
                    <div
                      key={user._id}
                      className="flex items-center gap-4 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition"
                    >
                      {/* Rank */}
                      <div className="flex items-center gap-2 w-16">
                        <span className="text-lg font-bold text-slate-400">{String(rank).padStart(2, '0')}</span>
                        {rankChange === 'up' && (
                          <span className="material-symbols-outlined text-green-400 text-sm">keyboard_arrow_up</span>
                        )}
                        {rankChange === 'down' && (
                          <span className="material-symbols-outlined text-red-400 text-sm">keyboard_arrow_down</span>
                        )}
                        {rankChange === 'same' && (
                          <span className="material-symbols-outlined text-slate-600 text-sm">remove</span>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {user.displayName?.[0] || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{user.displayName || 'Anonymous'}</span>
                          {user.tier === 'grandmaster' && (
                            <span className="material-symbols-outlined text-amber-400 text-sm">verified</span>
                          )}
                          <span className={`text-xs font-medium ${getTierColor(user.tier)}`}>
                            {user.tier?.charAt(0).toUpperCase() + user.tier?.slice(1) || 'Beginner'}
                          </span>
                        </div>
                      </div>

                      {/* Level */}
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Lvl</p>
                        <p className="text-white font-bold">{user.level || 1}</p>
                      </div>

                      {/* XP */}
                      <div className="text-right w-24">
                        <p className="text-white font-bold">{user.xp?.toLocaleString() || 0}</p>
                        <p className="text-xs text-slate-500">Points</p>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Load More */}
              <button className="w-full py-3 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition">
                View Next 50 Ranks
              </button>
            </div>
          </div>

          {/* Sidebar - User Stats */}
          <div className="space-y-6">
            {/* Your Rank Card */}
            {userProfile ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl font-bold text-indigo-400">#{userRank || '—'}</div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div>
                    <p className="text-white font-semibold">{userProfile.displayName || 'You'}</p>
                    <p className="text-slate-400 text-sm">{userProfile.xp?.toLocaleString() || 0} XP</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">Level {userProfile.level || 1}</span>
                    <span className="text-slate-500">
                      {(getXpForLevel((userProfile.level || 1) + 1) - (userProfile.xp || 0)).toLocaleString()} XP to Level {(userProfile.level || 1) + 1}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: '65%' }}
                    />
                  </div>
                </div>

                <Link
                  to="/submissions"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg text-sm font-medium transition"
                >
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  View Your Stats
                </Link>
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-600 mb-3">person_add</span>
                <p className="text-white font-semibold mb-2">Join the Leaderboard</p>
                <p className="text-slate-400 text-sm mb-4">Sign in to track your progress and compete with others</p>
                <Link
                  to="/practice"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Top 3 Detailed */}
            {topThree.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400">workspace_premium</span>
                  Top Performers
                </h3>
                <div className="space-y-3">
                  {topThree.map((user, i) => (
                    <div key={user._id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                        i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : 'bg-orange-600'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{user.displayName || 'Anonymous'}</p>
                        <p className="text-slate-500 text-xs">{user.xp?.toLocaleString() || 0} XP</p>
                      </div>
                      <span className={`text-xs font-medium ${getTierColor(user.tier)}`}>
                        {user.tier?.charAt(0).toUpperCase() + user.tier?.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Season Info */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-purple-400">event</span>
                <span className="text-white font-semibold">Season Rewards</span>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Finish in the Top 10 to earn exclusive badges and bonus XP!
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-400">🥇 1st Place</span>
                  <span className="text-white">1,000 XP + Crown Badge</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">🥈 2nd Place</span>
                  <span className="text-white">750 XP + Silver Badge</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-400">🥉 3rd Place</span>
                  <span className="text-white">500 XP + Bronze Badge</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

