// types/coding.ts - Coding Practice Platform Types

export type Difficulty = 'easy' | 'medium' | 'hard';
export type SubmissionStatus = 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit' | 'compile_error';
export type ProgrammingLanguage = 'python' | 'javascript' | 'typescript' | 'java' | 'cpp' | 'go' | 'rust';

export interface CodingChallenge {
  _id: string;
  _type: 'codingChallenge';
  title: string;
  slug: { current: string };
  description: any[]; // Portable Text
  difficulty: Difficulty;
  xpReward: number;
  timeEstimate: number; // in minutes
  tags: string[];
  hints?: string[];
  starterCode: {
    language: ProgrammingLanguage;
    code: string;
  }[];
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }[];
  solution?: {
    language: ProgrammingLanguage;
    code: string;
    explanation?: any[]; // Portable Text
  }[];
  acceptanceRate: number;
  totalSubmissions: number;
  totalSolved: number;
  isBossChallenge: boolean;
  category: string;
  order: number;
  createdAt: string;
}

export interface Submission {
  _id: string;
  _type: 'submission';
  challenge: {
    _ref: string;
    title?: string;
    slug?: { current: string };
    difficulty?: Difficulty;
  };
  user: {
    _ref: string;
    name?: string;
  };
  code: string;
  language: ProgrammingLanguage;
  status: SubmissionStatus;
  runtime?: number; // in ms
  memory?: number; // in MB
  runtimePercentile?: number;
  memoryPercentile?: number;
  errorMessage?: string;
  testCasesPassed: number;
  totalTestCases: number;
  notes?: string;
  createdAt: string;
}

export interface UserCodingProfile {
  _id: string;
  _type: 'userCodingProfile';
  subscriber: {
    _ref: string;
    name?: string;
    email?: string;
  };
  displayName: string;
  username: string;
  xp: number;
  level: number;
  rank: number;
  tier: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master' | 'grandmaster' | 'legendary';
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  badges: string[];
  weeklyXp: number;
  monthlyXp: number;
  country?: string;
  joinedAt: string;
}

export interface LearningPath {
  _id: string;
  _type: 'learningPath';
  title: string;
  slug: { current: string };
  description: string;
  icon: string;
  color: string;
  totalXp: number;
  estimatedHours: number;
  chapters: Chapter[];
  enrolledCount: number;
  completedCount: number;
  difficulty: Difficulty;
  prerequisites?: string[];
  createdAt: string;
}

export interface Chapter {
  _id: string;
  _type: 'chapter';
  title: string;
  order: number;
  description?: string;
  lessons: Lesson[];
  xpReward: number;
}

export interface Lesson {
  _id: string;
  _type: 'lesson';
  title: string;
  slug: { current: string };
  order: number;
  type: 'concept' | 'exercise' | 'quiz' | 'challenge';
  content: any[]; // Portable Text with code blocks and visualizations
  xpReward: number;
  estimatedMinutes: number;
  challenge?: {
    _ref: string;
  };
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface UserProgress {
  _id: string;
  _type: 'userProgress';
  user: {
    _ref: string;
  };
  learningPath: {
    _ref: string;
  };
  completedLessons: string[];
  currentLesson?: string;
  startedAt: string;
  completedAt?: string;
  xpEarned: number;
}

// Helper functions
export const getDifficultyColor = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case 'easy': return 'text-green-500';
    case 'medium': return 'text-yellow-500';
    case 'hard': return 'text-red-500';
    default: return 'text-slate-500';
  }
};

export const getDifficultyBg = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case 'easy': return 'bg-green-500/10 text-green-500';
    case 'medium': return 'bg-yellow-500/10 text-yellow-500';
    case 'hard': return 'bg-red-500/10 text-red-500';
    default: return 'bg-slate-500/10 text-slate-500';
  }
};

export const getTierColor = (tier: UserCodingProfile['tier']): string => {
  switch (tier) {
    case 'beginner': return 'text-slate-400';
    case 'intermediate': return 'text-green-500';
    case 'advanced': return 'text-blue-500';
    case 'expert': return 'text-purple-500';
    case 'master': return 'text-orange-500';
    case 'grandmaster': return 'text-red-500';
    case 'legendary': return 'text-amber-400';
    default: return 'text-slate-500';
  }
};

export const getXpForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

export const getLevelFromXp = (xp: number): number => {
  let level = 1;
  let xpNeeded = 100;
  let totalXp = 0;
  
  while (totalXp + xpNeeded <= xp) {
    totalXp += xpNeeded;
    level++;
    xpNeeded = Math.floor(100 * Math.pow(1.5, level - 1));
  }
  
  return level;
};

