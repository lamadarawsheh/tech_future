import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getChallenges, 
  getDailyChallenge, 
  getUserCodingProfile,
  getChallengeCategories,
  hasUserSolvedChallenge
} from '../services/coding';
import { CodingChallenge, UserCodingProfile, getDifficultyBg, getXpForLevel } from '../types/coding';

const Practice: React.FC = () => {
  const { subscriber } = useAuth();
  const [challenges, setChallenges] = useState<CodingChallenge[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<CodingChallenge | null>(null);
  const [profile, setProfile] = useState<UserCodingProfile | null>(null);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [solvedChallenges, setSolvedChallenges] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const hasLoadedRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Weekly streak days
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const [streakDays, setStreakDays] = useState([true, true, true, true, true, false, false]);

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape to clear search
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  useEffect(() => {
    // Prevent re-fetching if already loaded and no filter changed
    if (hasLoadedRef.current && !activeDifficulty) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [challengesData, daily, cats] = await Promise.all([
          getChallenges(
            activeDifficulty ? { difficulty: activeDifficulty as any } : undefined,
            50, // Fetch more for search
            0
          ),
          getDailyChallenge(),
          getChallengeCategories()
        ]);
        
        setChallenges(challengesData);
        setDailyChallenge(daily);
        setCategories(cats);
        hasLoadedRef.current = true;

        if (subscriber?._id) {
          const userProfile = await getUserCodingProfile(subscriber._id);
          setProfile(userProfile);

          // Check which challenges user has solved
          const solvedSet = new Set<string>();
          for (const challenge of challengesData) {
            const solved = await hasUserSolvedChallenge(subscriber._id, challenge._id);
            if (solved) solvedSet.add(challenge._id);
          }
          setSolvedChallenges(solvedSet);
        }
      } catch (error) {
        console.error('Error fetching practice data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [activeDifficulty]); // Removed subscriber to prevent refetch on auth changes

  // Filter challenges based on search, category, and difficulty
  const filteredChallenges = useMemo(() => {
    let filtered = challenges;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        c.category?.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (activeCategory !== 'All') {
      filtered = filtered.filter(c => c.category === activeCategory);
    }
    
    return filtered;
  }, [challenges, searchQuery, activeCategory]);

  const xpToNextLevel = profile ? getXpForLevel(profile.level + 1) : 3000;
  const currentLevelXp = profile ? getXpForLevel(profile.level) : 0;
  const xpProgress = profile ? ((profile.xp - currentLevelXp) / (xpToNextLevel - currentLevelXp)) * 100 : 0;

  // Calculate time remaining for daily challenge (end of day)
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const hoursLeft = Math.floor((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60));
  const minutesLeft = Math.floor(((endOfDay.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="min-h-screen -mt-10 -mx-4 sm:-mx-6 lg:-mx-8 bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">terminal</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-display">CodeMaster</h1>
                <p className="text-xs text-slate-400">Arena</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className={`relative w-full transition-all ${searchFocused ? 'scale-105' : ''}`}>
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                  search
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search challenges, tags, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={`w-full bg-slate-800/80 border ${
                    searchFocused ? 'border-emerald-500/50 ring-2 ring-emerald-500/20' : 'border-slate-700'
                  } rounded-xl pl-10 pr-16 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-all`}
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                ) : (
                  <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded border border-slate-600">
                    <span>⌘</span>K
                  </kbd>
                )}
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/practice" className="text-emerald-400 font-medium text-sm">Arena</Link>
              <Link to="/challenges" className="text-slate-400 hover:text-white transition text-sm">Quests</Link>
              <Link to="/leaderboard" className="text-slate-400 hover:text-white transition text-sm">Leaderboard</Link>
              <Link to="/submissions" className="text-slate-400 hover:text-white transition text-sm">Discuss</Link>
            </nav>

            {profile && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">Level {profile.level}</p>
                  <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                  {profile.level}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Boss Battle */}
            {dailyChallenge && (
              <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-red-500/20 rounded-2xl border border-amber-500/30 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
                
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-amber-400">bolt</span>
                    <span className="text-amber-400 font-semibold text-sm">Daily Boss Battle</span>
                    <span className="ml-auto flex items-center gap-1 text-slate-400 text-sm">
                      <span className="material-symbols-outlined text-sm">timer</span>
                      {hoursLeft}h {minutesLeft}m left
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">{dailyChallenge.title}</h2>
                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                    Master the art of pointer manipulation. A classic challenge that tests your understanding of data structures.
                  </p>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <span className="flex items-center gap-1 text-amber-400 text-sm">
                      <span className="material-symbols-outlined text-sm">stars</span>
                      {dailyChallenge.xpReward} XP
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-sm">
                      <span className="material-symbols-outlined text-sm">group</span>
                      {dailyChallenge.totalSolved?.toLocaleString() || '1.2k'} Solved
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyBg(dailyChallenge.difficulty)}`}>
                      {dailyChallenge.difficulty.charAt(0).toUpperCase() + dailyChallenge.difficulty.slice(1)}
                    </span>
                  </div>
                  
                  <Link 
                    to={`/problem/${dailyChallenge.slug?.current || dailyChallenge._id}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition"
                  >
                    <span className="material-symbols-outlined text-sm">play_circle</span>
                    Start Challenge
                  </Link>
                </div>
              </div>
            )}

            {/* Mobile Search */}
            <div className="md:hidden mb-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search challenges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Search Results Info */}
            {searchQuery && (
              <div className="flex items-center gap-2 mb-4 text-sm">
                <span className="text-slate-400">
                  Found <span className="text-emerald-400 font-medium">{filteredChallenges.length}</span> challenges
                  {searchQuery && <span> for "<span className="text-white">{searchQuery}</span>"</span>}
                </span>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-slate-500 hover:text-white ml-auto"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => {
                  const randomChallenge = filteredChallenges[Math.floor(Math.random() * filteredChallenges.length)];
                  if (randomChallenge) {
                    window.location.href = `/problem/${randomChallenge.slug?.current || randomChallenge._id}`;
                  }
                }}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition p-2 rounded-lg hover:bg-slate-800"
                title="Random Challenge"
              >
                <span className="material-symbols-outlined text-sm">shuffle</span>
              </button>
              
              {['All', ...categories.map(c => c.category)].slice(0, 6).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                    activeCategory === cat
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Challenge List */}
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-slate-900/50 rounded-xl p-4 animate-pulse">
                    <div className="h-5 bg-slate-800 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-slate-800 rounded w-1/4" />
                  </div>
                ))
              ) : filteredChallenges.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-4xl text-slate-600 mb-3">search_off</span>
                  <p className="text-slate-400">No challenges found</p>
                </div>
              ) : (
                filteredChallenges.map((challenge) => (
                  <Link
                    key={challenge._id}
                    to={`/problem/${challenge.slug?.current || challenge._id}`}
                    className="group flex items-center gap-4 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition"
                  >
                    {/* Status Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      solvedChallenges.has(challenge._id)
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {solvedChallenges.has(challenge._id) ? (
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                      ) : (
                        <span className="text-xs font-bold">{challenge.order || '?'}</span>
                      )}
                    </div>

                    {/* Challenge Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium truncate group-hover:text-emerald-400 transition">
                          {challenge.title}
                        </h3>
                        {challenge.isBossChallenge && (
                          <span className="material-symbols-outlined text-amber-400 text-sm">swords</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {challenge.tags?.slice(0, 2).map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyBg(challenge.difficulty)}`}>
                        {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                      </span>
                      <span className="text-emerald-400 text-sm font-medium">+{challenge.xpReward} XP</span>
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">pie_chart</span>
                        {challenge.acceptanceRate?.toFixed(1) || '50.0'}%
                      </span>
                      <span className="material-symbols-outlined text-slate-600 group-hover:text-emerald-400 transition">
                        arrow_forward
                      </span>
                    </div>
                  </Link>
                ))
              )}

              {/* Random Quest Button */}
              <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl p-4 text-purple-400 font-medium transition">
                <span className="material-symbols-outlined">casino</span>
                Random Quest - Test your luck & skills
              </button>

              {/* Load More */}
              <button className="w-full py-3 text-slate-400 hover:text-white text-sm transition">
                Load More Quests
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weekly Streak */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-orange-400">local_fire_department</span>
                <span className="text-white font-semibold">Weekly Streak</span>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                {weekDays.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      streakDays[i]
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-slate-800 text-slate-600'
                    }`}>
                      {day}
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-slate-400 text-center">
                Keep it up! 2 days to a 7-day bonus.
              </p>
            </div>

            {/* Your Progress */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4">Your Progress</h3>
              
              {/* Easy */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-green-400">Easy</span>
                  <span className="text-slate-400">{profile?.easySolved || 0}/100</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                    style={{ width: `${((profile?.easySolved || 0) / 100) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Medium */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-yellow-400">Medium</span>
                  <span className="text-slate-400">{profile?.mediumSolved || 0}/150</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full"
                    style={{ width: `${((profile?.mediumSolved || 0) / 150) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Hard */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-red-400">Hard</span>
                  <span className="text-slate-400">{profile?.hardSolved || 0}/50</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-pink-400 rounded-full"
                    style={{ width: `${((profile?.hardSolved || 0) / 50) * 100}%` }}
                  />
                </div>
              </div>

              {/* Weak Areas */}
              <div className="pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500 mb-2">Weak Areas</p>
                <div className="flex flex-wrap gap-2">
                  {['Dynamic Programming', 'Graph Theory', 'Bit Manipulation'].map((area) => (
                    <span key={area} className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Code Preview */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-slate-500 ml-2">Solution.java</span>
              </div>
              <pre className="p-4 text-xs text-slate-300 font-mono overflow-x-auto">
                <code>{`class Solution {
  public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    while (curr != null) {
      ListNode nextTemp = curr.next;
      curr.next = prev;
      prev = curr;
      curr = nextTemp;
    }
    return prev;
  }
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-slate-500 text-sm">
            © 2024 CodeMaster Arena. Level up your coding skills.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Practice;

