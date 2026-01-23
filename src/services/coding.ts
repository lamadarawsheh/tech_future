// services/coding.ts - Coding Platform API Services

import { client, writeClient } from '../lib/sanity';
import {
  CodingChallenge,
  Submission,
  UserCodingProfile,
  LearningPath,
  UserProgress,
  Difficulty,
  SubmissionStatus,
  ProgrammingLanguage,
  getLevelFromXp
} from '../types/coding';

// Helper to normalize language code
const normalizeLang = (lang: string = 'en'): string => {
  if (!lang) return 'en';
  return lang.split('-')[0].toLowerCase();
};

// ==================== PISTON CODE EXECUTION API ====================

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

// Language mapping for Piston (use '*' for latest version)
const LANGUAGE_MAP: Record<ProgrammingLanguage, string> = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  java: 'java',
  cpp: 'cpp',
  go: 'go',
  rust: 'rust',
};

export interface ExecutionResult {
  success: boolean;
  output: string;
  error: string | null;
  executionTime: number;
}

export interface TestCaseResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  error: string | null;
  executionTime: number;
}

export interface CodeExecutionResponse {
  allPassed: boolean;
  results: TestCaseResult[];
  totalPassed: number;
  totalTests: number;
  averageRuntime: number;
}

// Generate wrapper code that calls the user's function with parsed input
const generateWrapper = (userCode: string, language: ProgrammingLanguage, stdin: string): string => {
  // If stdin is empty, just return the user's code as-is (for quick run)
  if (!stdin || stdin.trim() === '') {
    return userCode;
  }

  // Detect function name from user code
  let functionName = '';

  if (language === 'python') {
    // Match: def function_name(
    const match = userCode.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
    if (match) functionName = match[1];
  } else if (language === 'javascript' || language === 'typescript') {
    // Match: function functionName( or const functionName = 
    const match = userCode.match(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/) ||
      userCode.match(/(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
    if (match) functionName = match[1];
  }

  if (!functionName) {
    // Can't find function, return code as-is
    return userCode;
  }

  // Generate wrapper based on language
  if (language === 'python') {
    return `${userCode}

# --- AUTO-GENERATED RUNNER (DO NOT MODIFY) ---
import sys
import json
import re

def _parse_args(input_str):
    """Parse input like '[2, 7, 11, 15], 9' or '\"()\"' into Python objects"""
    input_str = input_str.strip()
    
    # Try to parse as JSON array of arguments
    try:
        # Wrap in array brackets if not already
        if not input_str.startswith('[') or not input_str.endswith(']'):
            # Find the split point between arguments
            # Handle: "[2, 7, 11, 15], 9" -> two args
            # Handle: "\"()\"" -> one string arg
            
            # Check if it's a simple quoted string
            if input_str.startswith('"') and input_str.endswith('"'):
                return [input_str[1:-1]]  # Remove quotes
            
            # Try to find array followed by other args
            depth = 0
            split_idx = -1
            for i, c in enumerate(input_str):
                if c in '[{(':
                    depth += 1
                elif c in ']})':
                    depth -= 1
                elif c == ',' and depth == 0:
                    split_idx = i
                    break
            
            if split_idx > 0:
                # Multiple arguments
                first = input_str[:split_idx].strip()
                rest = input_str[split_idx+1:].strip()
                
                # Parse first argument
                try:
                    first_val = json.loads(first.replace("'", '"'))
                except:
                    first_val = first
                
                # Parse remaining arguments recursively
                rest_vals = _parse_args(rest) if rest else []
                return [first_val] + (rest_vals if isinstance(rest_vals, list) else [rest_vals])
            else:
                # Single argument - try JSON parse
                try:
                    return [json.loads(input_str.replace("'", '"'))]
                except:
                    return [input_str]
        else:
            # Already looks like a JSON array
            return json.loads(input_str.replace("'", '"'))
    except Exception as e:
        # Fallback: return as single string
        return [input_str]

# Read input and run
_input = sys.stdin.read().strip()
_args = _parse_args(_input)
_result = ${functionName}(*_args)
print(_result if _result is not None else '')
`;
  } else if (language === 'javascript' || language === 'typescript') {
    return `${userCode}

// --- AUTO-GENERATED RUNNER (DO NOT MODIFY) ---
const _input = require('fs').readFileSync(0, 'utf-8').trim();

function _parseArgs(inputStr) {
  inputStr = inputStr.trim();
  
  // Handle quoted string
  if (inputStr.startsWith('"') && inputStr.endsWith('"')) {
    return [inputStr.slice(1, -1)];
  }
  
  // Try to find split point for multiple args
  let depth = 0;
  let splitIdx = -1;
  for (let i = 0; i < inputStr.length; i++) {
    const c = inputStr[i];
    if ('[{('.includes(c)) depth++;
    else if (']})'.includes(c)) depth--;
    else if (c === ',' && depth === 0) {
      splitIdx = i;
      break;
    }
  }
  
  if (splitIdx > 0) {
    const first = inputStr.slice(0, splitIdx).trim();
    const rest = inputStr.slice(splitIdx + 1).trim();
    
    let firstVal;
    try { firstVal = JSON.parse(first); } catch { firstVal = first; }
    
    const restVals = rest ? _parseArgs(rest) : [];
    return [firstVal, ...(Array.isArray(restVals) ? restVals : [restVals])];
  }
  
  // Single argument
  try { return [JSON.parse(inputStr)]; } catch { return [inputStr]; }
}

const _args = _parseArgs(_input);
const _result = ${functionName}(..._args);
console.log(typeof _result === 'object' ? JSON.stringify(_result) : _result);
`;
  }

  // For other languages, return code as-is
  return userCode;
};

// Execute code using Piston API
export const executeCode = async (
  code: string,
  language: ProgrammingLanguage,
  stdin: string = ''
): Promise<ExecutionResult> => {
  const pistonLanguage = LANGUAGE_MAP[language];

  if (!pistonLanguage) {
    return {
      success: false,
      output: '',
      error: `Unsupported language: ${language}`,
      executionTime: 0
    };
  }

  const startTime = Date.now();

  // Wrap user code with runner to call function with parsed input
  const wrappedCode = generateWrapper(code, language, stdin);

  try {
    console.log('Executing code with Piston:', {
      language: pistonLanguage,
      codeLength: wrappedCode.length,
      stdin,
      hasWrapper: wrappedCode !== code
    });

    const response = await fetch(`${PISTON_API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: pistonLanguage,
        version: '*', // Use latest available version
        files: [
          {
            name: `main.${language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'java' ? 'java' : language === 'cpp' ? 'cpp' : language}`,
            content: wrappedCode
          }
        ],
        stdin: stdin || '',
      })
    });

    console.log('Piston response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Piston API error:', errorText);
      throw new Error(`Piston API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Piston response data:', data);

    const executionTime = Date.now() - startTime;

    // Check for compilation errors
    if (data.compile && data.compile.code !== 0) {
      return {
        success: false,
        output: '',
        error: data.compile.stderr || data.compile.output || 'Compilation error',
        executionTime
      };
    }

    // Check if run exists
    if (!data.run) {
      return {
        success: false,
        output: '',
        error: 'No execution result returned',
        executionTime
      };
    }

    // Check for runtime errors (non-zero exit code with stderr)
    if (data.run.code !== 0 && data.run.stderr) {
      return {
        success: false,
        output: data.run.stdout || '',
        error: data.run.stderr,
        executionTime
      };
    }

    // Success - return output
    return {
      success: true,
      output: (data.run.stdout || data.run.output || '').trim(),
      error: data.run.stderr ? data.run.stderr.trim() : null,
      executionTime
    };
  } catch (error) {
    console.error('Code execution error:', error);
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Failed to execute code. Check your internet connection.',
      executionTime: Date.now() - startTime
    };
  }
};

// Normalize output for comparison (handles formatting differences)
const normalizeOutput = (output: string): string => {
  return output
    .trim()
    .replace(/\r\n/g, '\n')           // Normalize line endings
    .replace(/\s+/g, ' ')              // Collapse whitespace
    .replace(/\[\s+/g, '[')            // Remove space after [
    .replace(/\s+\]/g, ']')            // Remove space before ]
    .replace(/,\s+/g, ', ')            // Normalize comma spacing
    .replace(/True/g, 'true')          // Python True -> JavaScript true
    .replace(/False/g, 'false')        // Python False -> JavaScript false
    .replace(/None/g, 'null')          // Python None -> JavaScript null
    .toLowerCase();                     // Case insensitive
};

// Run code against multiple test cases
export const runTestCases = async (
  code: string,
  language: ProgrammingLanguage,
  testCases: { input: string; expectedOutput: string }[]
): Promise<CodeExecutionResponse> => {
  const results: TestCaseResult[] = [];
  let totalPassed = 0;
  let totalRuntime = 0;

  for (const testCase of testCases) {
    const result = await executeCode(code, language, testCase.input);

    // Normalize outputs for comparison
    const normalizedExpected = normalizeOutput(testCase.expectedOutput);
    const normalizedActual = normalizeOutput(result.output);

    // Check for match (also try without quotes for string outputs)
    const passed = result.success && (
      normalizedActual === normalizedExpected ||
      normalizedActual === normalizedExpected.replace(/"/g, '') ||
      normalizedActual.replace(/"/g, '') === normalizedExpected
    );

    if (passed) {
      totalPassed++;
    }

    totalRuntime += result.executionTime;

    results.push({
      passed,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: result.output,
      error: result.error,
      executionTime: result.executionTime
    });

    console.log('Test case comparison:', {
      input: testCase.input,
      expected: normalizedExpected,
      actual: normalizedActual,
      passed
    });
  }

  return {
    allPassed: totalPassed === testCases.length,
    results,
    totalPassed,
    totalTests: testCases.length,
    averageRuntime: Math.round(totalRuntime / testCases.length)
  };
};

// ==================== CODING CHALLENGES ====================

// Fetch all challenges with optional filters
export const getChallenges = async (
  filters?: {
    difficulty?: Difficulty;
    category?: string;
    tag?: string;
    lang?: string;
  },
  limit: number = 20,
  offset: number = 0
): Promise<CodingChallenge[]> => {
  const start = offset;
  const end = offset + limit;
  const rawLang = filters?.lang || 'en';
  const lang = normalizeLang(rawLang);

  let filterConditions = `_type == "codingChallenge" && (language == $lang || (!defined(language) && $lang == "en"))`;
  if (filters?.difficulty) {
    filterConditions += ` && difficulty == "${filters.difficulty}"`;
  }
  if (filters?.category) {
    filterConditions += ` && category == "${filters.category}"`;
  }
  if (filters?.tag) {
    filterConditions += ` && "${filters.tag}" in tags`;
  }

  const query = `*[${filterConditions}] | order(order asc)[$start...$end] {
    _id,
    title,
    slug,
    difficulty,
    xpReward,
    timeEstimate,
    tags,
    acceptanceRate,
    totalSubmissions,
    totalSolved,
    isBossChallenge,
    category,
    order
  }`;

  try {
    const result = await client.fetch(query, { start, end, lang });
    return result || [];
  } catch (e) {
    console.error('Error fetching challenges:', e);
    return [];
  }
};

// Fetch single challenge by slug
export const getChallengeBySlug = async (slug: string, lang: string = 'en'): Promise<CodingChallenge | null> => {
  const query = `*[_type == "codingChallenge" && slug.current == $slug && (language == $lang || (!defined(language) && $lang == "en"))][0] {
    _id,
    title,
    slug,
    description,
    difficulty,
    xpReward,
    timeEstimate,
    tags,
    hints,
    starterCode,
    testCases[!isHidden],
    acceptanceRate,
    totalSubmissions,
    totalSolved,
    isBossChallenge,
    category
  }`;

  const normalizedLang = normalizeLang(lang);
  try {
    const result = await client.fetch(query, { slug, lang: normalizedLang });
    return result || null;
  } catch (e) {
    console.error('Error fetching challenge:', e);
    return null;
  }
};

// Get daily boss challenge
export const getDailyChallenge = async (lang: string = 'en'): Promise<CodingChallenge | null> => {
  const normalizedLang = normalizeLang(lang);
  // Get a random boss challenge or rotate based on date
  const today = new Date().toISOString().split('T')[0];
  const query = `*[_type == "codingChallenge" && isBossChallenge == true && (language == $lang || (!defined(language) && $lang == "en"))] | order(_createdAt asc) {
    _id,
    title,
    slug,
    description,
    difficulty,
    xpReward,
    timeEstimate,
    tags,
    totalSolved,
    category
  }`;

  try {
    const challenges = await client.fetch(query, { lang: normalizedLang });
    if (!challenges?.length) return null;

    // Rotate based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % challenges.length;
    return challenges[index];
  } catch (e) {
    console.error('Error fetching daily challenge:', e);
    return null;
  }
};

// Get challenge categories
export const getChallengeCategories = async (lang: string = 'en'): Promise<{ category: string; count: number }[]> => {
  const normalizedLang = normalizeLang(lang);
  const query = `*[_type == "codingChallenge" && (language == $lang || (!defined(language) && $lang == "en"))] {
    category
  }`;

  try {
    const challenges = await client.fetch(query, { lang: normalizedLang });
    const categoryCounts: Record<string, number> = {};

    challenges.forEach((c: { category: string }) => {
      if (c.category) {
        categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      }
    });

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  } catch (e) {
    console.error('Error fetching categories:', e);
    return [];
  }
};

// ==================== SUBMISSIONS ====================

// Create a submission
export const createSubmission = async (
  challengeId: string,
  userId: string,
  code: string,
  language: ProgrammingLanguage,
  status: SubmissionStatus,
  results: {
    runtime?: number;
    memory?: number;
    runtimePercentile?: number;
    memoryPercentile?: number;
    errorMessage?: string;
    testCasesPassed: number;
    totalTestCases: number;
  }
): Promise<Submission | null> => {
  try {
    const submission = await writeClient.create({
      _type: 'submission',
      challenge: { _ref: challengeId, _type: 'reference' },
      user: { _ref: userId, _type: 'reference' },
      code,
      language,
      status,
      ...results,
      createdAt: new Date().toISOString(),
    });

    // Update challenge stats
    await writeClient
      .patch(challengeId)
      .setIfMissing({ totalSubmissions: 0, totalSolved: 0 })
      .inc({ totalSubmissions: 1 })
      .commit();

    if (status === 'accepted') {
      await writeClient
        .patch(challengeId)
        .inc({ totalSolved: 1 })
        .commit();
    }

    return submission as Submission;
  } catch (e) {
    console.error('Error creating submission:', e);
    return null;
  }
};

// Get user submissions
export const getUserSubmissions = async (
  userId: string,
  limit: number = 20,
  offset: number = 0,
  filters?: {
    status?: SubmissionStatus;
    language?: ProgrammingLanguage;
  }
): Promise<Submission[]> => {
  const start = offset;
  const end = offset + limit - 1;

  let filterConditions = `_type == "submission" && user._ref == $userId`;
  if (filters?.status) {
    filterConditions += ` && status == "${filters.status}"`;
  }
  if (filters?.language) {
    filterConditions += ` && language == "${filters.language}"`;
  }

  const query = `*[${filterConditions}] | order(createdAt desc)[$start...$end] {
    _id,
    code,
    language,
    status,
    runtime,
    memory,
    runtimePercentile,
    memoryPercentile,
    errorMessage,
    testCasesPassed,
    totalTestCases,
    notes,
    createdAt,
    "challenge": challenge-> {
      _id,
      title,
      slug,
      difficulty,
      tags
    }
  }`;

  try {
    const result = await client.fetch(query, { userId, start, end });
    return result || [];
  } catch (e) {
    console.error('Error fetching submissions:', e);
    return [];
  }
};

// Get submission stats for a user
export const getUserSubmissionStats = async (userId: string): Promise<{
  total: number;
  accepted: number;
  streak: number;
  recentActivity: { date: string; count: number; accepted: number }[];
}> => {
  const query = `{
    "total": count(*[_type == "submission" && user._ref == $userId]),
    "accepted": count(*[_type == "submission" && user._ref == $userId && status == "accepted"]),
    "submissions": *[_type == "submission" && user._ref == $userId] | order(createdAt desc) {
      createdAt,
      status
    }
  }`;

  try {
    const result = await client.fetch(query, { userId });

    // Calculate streak and activity
    const submissions = result.submissions || [];
    const activityMap: Record<string, { count: number; accepted: number }> = {};

    submissions.forEach((s: { createdAt: string; status: string }) => {
      const date = s.createdAt.split('T')[0];
      if (!activityMap[date]) {
        activityMap[date] = { count: 0, accepted: 0 };
      }
      activityMap[date].count++;
      if (s.status === 'accepted') {
        activityMap[date].accepted++;
      }
    });

    // Calculate streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      if (activityMap[dateStr]?.accepted > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Get last 14 days activity
    const recentActivity: { date: string; count: number; accepted: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      recentActivity.push({
        date: dateStr,
        count: activityMap[dateStr]?.count || 0,
        accepted: activityMap[dateStr]?.accepted || 0,
      });
    }

    return {
      total: result.total || 0,
      accepted: result.accepted || 0,
      streak,
      recentActivity,
    };
  } catch (e) {
    console.error('Error fetching submission stats:', e);
    return { total: 0, accepted: 0, streak: 0, recentActivity: [] };
  }
};

// ==================== USER CODING PROFILE ====================

// Get or create user coding profile
export const getUserCodingProfile = async (subscriberId: string): Promise<UserCodingProfile | null> => {
  const query = `*[_type == "userCodingProfile" && subscriber._ref == $subscriberId][0] {
    _id,
    displayName,
    username,
    xp,
    level,
    rank,
    tier,
    currentStreak,
    longestStreak,
    lastActiveDate,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    totalSubmissions,
    acceptedSubmissions,
    badges,
    weeklyXp,
    monthlyXp,
    country,
    joinedAt,
    "subscriber": subscriber-> { _id, name, email }
  }`;

  try {
    const result = await client.fetch(query, { subscriberId });
    return result || null;
  } catch (e) {
    console.error('Error fetching coding profile:', e);
    return null;
  }
};

// Create coding profile
export const createCodingProfile = async (
  subscriberId: string,
  displayName: string,
  username: string
): Promise<UserCodingProfile | null> => {
  try {
    const profile = await writeClient.create({
      _type: 'userCodingProfile',
      subscriber: { _ref: subscriberId, _type: 'reference' },
      displayName,
      username,
      xp: 0,
      level: 1,
      rank: 0,
      tier: 'beginner',
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: new Date().toISOString(),
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      badges: [],
      weeklyXp: 0,
      monthlyXp: 0,
      joinedAt: new Date().toISOString(),
    });
    return profile as UserCodingProfile;
  } catch (e) {
    console.error('Error creating coding profile:', e);
    return null;
  }
};

// Update XP and level
export const addXp = async (profileId: string, xpAmount: number): Promise<void> => {
  try {
    // Get current profile
    const profile = await client.fetch(
      `*[_type == "userCodingProfile" && _id == $profileId][0] { xp, level }`,
      { profileId }
    );

    if (!profile) return;

    const newXp = (profile.xp || 0) + xpAmount;
    const newLevel = getLevelFromXp(newXp);

    await writeClient
      .patch(profileId)
      .set({ xp: newXp, level: newLevel })
      .inc({ weeklyXp: xpAmount, monthlyXp: xpAmount })
      .commit();
  } catch (e) {
    console.error('Error adding XP:', e);
  }
};

// Update solved count
export const updateSolvedCount = async (
  profileId: string,
  difficulty: Difficulty
): Promise<void> => {
  try {
    const difficultyField = `${difficulty}Solved`;
    await writeClient
      .patch(profileId)
      .inc({ totalSolved: 1, [difficultyField]: 1, acceptedSubmissions: 1 })
      .commit();
  } catch (e) {
    console.error('Error updating solved count:', e);
  }
};

// ==================== LEADERBOARD ====================

// Get global leaderboard
export const getLeaderboard = async (
  filter: 'global' | 'weekly' | 'country' = 'global',
  country?: string,
  limit: number = 50,
  offset: number = 0
): Promise<UserCodingProfile[]> => {
  const start = offset;
  const end = offset + limit - 1;

  let filterCondition = '_type == "userCodingProfile"';
  let orderField = 'xp';

  if (filter === 'weekly') {
    orderField = 'weeklyXp';
  }
  if (filter === 'country' && country) {
    filterCondition += ` && country == "${country}"`;
  }

  const query = `*[${filterCondition}] | order(${orderField} desc)[$start...$end] {
    _id,
    displayName,
    username,
    xp,
    level,
    rank,
    tier,
    currentStreak,
    totalSolved,
    weeklyXp,
    country,
    "subscriber": subscriber-> { _id, name }
  }`;

  try {
    const result = await client.fetch(query, { start, end });
    return result || [];
  } catch (e) {
    console.error('Error fetching leaderboard:', e);
    return [];
  }
};

// Get user rank
export const getUserRank = async (profileId: string): Promise<number> => {
  const query = `{
    "userXp": *[_type == "userCodingProfile" && _id == $profileId][0].xp,
    "higherCount": count(*[_type == "userCodingProfile" && xp > *[_type == "userCodingProfile" && _id == $profileId][0].xp])
  }`;

  try {
    const result = await client.fetch(query, { profileId });
    return (result.higherCount || 0) + 1;
  } catch (e) {
    console.error('Error fetching user rank:', e);
    return 0;
  }
};

// ==================== LEARNING PATHS ====================

// Get all learning paths
export const getLearningPaths = async (lang: string = 'en'): Promise<LearningPath[]> => {
  const query = `*[_type == "learningPath" && (language == $lang || (!defined(language) && $lang == "en"))] | order(order asc) {
    _id,
    title,
    slug,
    description,
    icon,
    color,
    totalXp,
    estimatedHours,
    enrolledCount,
    completedCount,
    difficulty,
    prerequisites,
    "chapters": chapters[]-> {
      _id,
      title,
      order,
      description,
      xpReward,
      "lessons": lessons[]-> {
        _id,
        title,
        slug,
        order,
        type,
        xpReward,
        estimatedMinutes
      }
    }
  }`;

  const normalizedLang = normalizeLang(lang);
  try {
    const result = await client.fetch(query, { lang: normalizedLang });
    return result || [];
  } catch (e) {
    console.error('Error fetching learning paths:', e);
    return [];
  }
};

// Get single learning path
export const getLearningPath = async (slug: string, lang: string = 'en'): Promise<LearningPath | null> => {
  const query = `*[_type == "learningPath" && slug.current == $slug && (language == $lang || (!defined(language) && $lang == "en"))][0] {
    _id,
    title,
    slug,
    description,
    icon,
    color,
    totalXp,
    estimatedHours,
    enrolledCount,
    completedCount,
    difficulty,
    prerequisites,
    "chapters": chapters[]-> {
      _id,
      title,
      order,
      description,
      xpReward,
      "lessons": lessons[]-> {
        _id,
        title,
        slug,
        order,
        type,
        xpReward,
        estimatedMinutes,
        content,
        "challenge": challenge-> { _id, title, slug }
      }
    }
  }`;

  const normalizedLang = normalizeLang(lang);
  try {
    const result = await client.fetch(query, { slug, lang: normalizedLang });
    return result || null;
  } catch (e) {
    console.error('Error fetching learning path:', e);
    return null;
  }
};

// Get user progress for a learning path
export const getUserPathProgress = async (
  userId: string,
  pathId: string
): Promise<UserProgress | null> => {
  const query = `*[_type == "userProgress" && user._ref == $userId && learningPath._ref == $pathId][0]`;

  try {
    const result = await client.fetch(query, { userId, pathId });
    return result || null;
  } catch (e) {
    console.error('Error fetching user progress:', e);
    return null;
  }
};

// Update user progress
export const updateUserProgress = async (
  userId: string,
  pathId: string,
  lessonId: string,
  xpEarned: number
): Promise<void> => {
  try {
    // Check if progress exists
    const existing = await getUserPathProgress(userId, pathId);

    if (existing) {
      await writeClient
        .patch(existing._id)
        .setIfMissing({ completedLessons: [] })
        .append('completedLessons', [lessonId])
        .set({ currentLesson: lessonId })
        .inc({ xpEarned })
        .commit();
    } else {
      await writeClient.create({
        _type: 'userProgress',
        user: { _ref: userId, _type: 'reference' },
        learningPath: { _ref: pathId, _type: 'reference' },
        completedLessons: [lessonId],
        currentLesson: lessonId,
        startedAt: new Date().toISOString(),
        xpEarned,
      });
    }
  } catch (e) {
    console.error('Error updating progress:', e);
  }
};

// Check if user has solved a challenge
export const hasUserSolvedChallenge = async (
  userId: string,
  challengeId: string
): Promise<boolean> => {
  const query = `count(*[_type == "submission" && user._ref == $userId && challenge._ref == $challengeId && status == "accepted"]) > 0`;

  try {
    return await client.fetch(query, { userId, challengeId });
  } catch (e) {
    console.error('Error checking solved status:', e);
    return false;
  }
};

