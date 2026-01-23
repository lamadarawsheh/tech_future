'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from '../../app/components/Link';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store';
import {
  getChallengeBySlug,
  createSubmission,
  getUserCodingProfile,
  createCodingProfile,
  addXp,
  updateSolvedCount,
  hasUserSolvedChallenge,
  runTestCases,
  executeCode,
} from '../services/coding';
import {
  CodingChallenge,
  UserCodingProfile,
  getDifficultyBg,
  ProgrammingLanguage,
} from '../types/coding';
import { PortableText } from '../components/PortableText';
import { useTranslation } from 'react-i18next';

// Editor themes - Dark themes
const DARK_THEMES = {
  dark: {
    name: 'VS Dark',
    bg: 'bg-[#1e1e1e]',
    text: 'text-[#d4d4d4]',
    lineNumber: 'text-[#858585]',
    lineNumberBg: 'bg-[#1e1e1e]',
    selection: 'selection:bg-[#264f78]',
    border: 'border-[#3c3c3c]',
    headerBg: 'bg-[#252526]',
    syntax: {
      keyword: '#569cd6',
      string: '#ce9178',
      comment: '#6a9955',
      function: '#dcdcaa',
      number: '#b5cea8'
    }
  },
  dracula: {
    name: 'Dracula',
    bg: 'bg-[#282a36]',
    text: 'text-[#f8f8f2]',
    lineNumber: 'text-[#6272a4]',
    lineNumberBg: 'bg-[#282a36]',
    selection: 'selection:bg-[#44475a]',
    border: 'border-[#44475a]',
    headerBg: 'bg-[#21222c]',
    syntax: {
      keyword: '#ff79c6',
      string: '#f1fa8c',
      comment: '#6272a4',
      function: '#50fa7b',
      number: '#bd93f9'
    }
  },
  monokai: {
    name: 'Monokai',
    bg: 'bg-[#272822]',
    text: 'text-[#f8f8f2]',
    lineNumber: 'text-[#90908a]',
    lineNumberBg: 'bg-[#272822]',
    selection: 'selection:bg-[#49483e]',
    border: 'border-[#49483e]',
    headerBg: 'bg-[#1e1f1c]',
    syntax: {
      keyword: '#f92672',
      string: '#e6db74',
      comment: '#75715e',
      function: '#a6e22e',
      number: '#ae81ff'
    }
  },
  'github-dark': {
    name: 'GitHub Dark',
    bg: 'bg-[#0d1117]',
    text: 'text-[#c9d1d9]',
    lineNumber: 'text-[#6e7681]',
    lineNumberBg: 'bg-[#0d1117]',
    selection: 'selection:bg-[#1f6feb]',
    border: 'border-[#30363d]',
    headerBg: 'bg-[#010409]',
    syntax: {
      keyword: '#ff7b72',
      string: '#a5d6ff',
      comment: '#8b949e',
      function: '#d2a8ff',
      number: '#79c0ff'
    }
  },
  nord: {
    name: 'Nord',
    bg: 'bg-[#2e3440]',
    text: 'text-[#d8dee9]',
    lineNumber: 'text-[#4c566a]',
    lineNumberBg: 'bg-[#2e3440]',
    selection: 'selection:bg-[#434c5e]',
    border: 'border-[#434c5e]',
    headerBg: 'bg-[#242933]',
    syntax: {
      keyword: '#81a1c1',
      string: '#a3be8c',
      comment: '#616e88',
      function: '#88c0d0',
      number: '#b48ead'
    }
  },
  'high-contrast-dark': {
    name: 'High Contrast',
    bg: 'bg-[#000000]',
    text: 'text-[#ffffff]',
    lineNumber: 'text-[#ffff00]',
    lineNumberBg: 'bg-[#000000]',
    selection: 'selection:bg-[#0000ff]',
    border: 'border-[#ffffff]',
    headerBg: 'bg-[#1a1a1a]',
    syntax: {
      keyword: '#00ffff',
      string: '#00ff00',
      comment: '#ffff00',
      function: '#ff00ff',
      number: '#ff8000'
    }
  }
};

// Light themes
const LIGHT_THEMES = {
  'github-light': {
    name: 'GitHub',
    bg: 'bg-[#ffffff]',
    text: 'text-[#1f2328]',
    lineNumber: 'text-[#656d76]',
    lineNumberBg: 'bg-[#ffffff]',
    selection: 'selection:bg-[#0969da26]',
    border: 'border-[#d1d9e0]',
    headerBg: 'bg-[#f6f8fa]',
    syntax: {
      keyword: '#d73a49',
      string: '#032f62',
      comment: '#6a737d',
      function: '#6f42c1',
      number: '#005cc5'
    }
  },
  'solarized-light': {
    name: 'Solarized',
    bg: 'bg-[#fdf6e3]',
    text: 'text-[#657b83]',
    lineNumber: 'text-[#93a1a1]',
    lineNumberBg: 'bg-[#fdf6e3]',
    selection: 'selection:bg-[#eee8d5]',
    border: 'border-[#eee8d5]',
    headerBg: 'bg-[#eee8d5]',
    syntax: {
      keyword: '#859900',
      string: '#2aa198',
      comment: '#93a1a1',
      function: '#268bd2',
      number: '#d33682'
    }
  },
  'one-light': {
    name: 'One Light',
    bg: 'bg-[#fafafa]',
    text: 'text-[#383a42]',
    lineNumber: 'text-[#9d9d9f]',
    lineNumberBg: 'bg-[#fafafa]',
    selection: 'selection:bg-[#e5e5e6]',
    border: 'border-[#e5e5e6]',
    headerBg: 'bg-[#eaeaeb]',
    syntax: {
      keyword: '#a626a4',
      string: '#50a14f',
      comment: '#a0a1a7',
      function: '#4078f2',
      number: '#986801'
    }
  },
  'xcode-light': {
    name: 'Xcode',
    bg: 'bg-[#ffffff]',
    text: 'text-[#262626]',
    lineNumber: 'text-[#b4b4b4]',
    lineNumberBg: 'bg-[#ffffff]',
    selection: 'selection:bg-[#b4d8fd]',
    border: 'border-[#e0e0e0]',
    headerBg: 'bg-[#f4f4f4]',
    syntax: {
      keyword: '#ad3da4',
      string: '#c41a16',
      comment: '#007400',
      function: '#000000',
      number: '#1c00cf'
    }
  },
  'material-light': {
    name: 'Material',
    bg: 'bg-[#ffffff]',
    text: 'text-[#2c3e50]',
    lineNumber: 'text-[#90a4ae]',
    lineNumberBg: 'bg-[#ffffff]',
    selection: 'selection:bg-[#e0e0e0]',
    border: 'border-[#e0e0e0]',
    headerBg: 'bg-[#eceff1]',
    syntax: {
      keyword: '#7c4dff',
      string: '#00bfa5',
      comment: '#b0bec5',
      function: '#3949ab',
      number: '#f44336'
    }
  },
  'ayu-light': {
    name: 'Ayu',
    bg: 'bg-[#fcfcfc]',
    text: 'text-[#5c6166]',
    lineNumber: 'text-[#8a9199]',
    lineNumberBg: 'bg-[#fcfcfc]',
    selection: 'selection:bg-[#e7eaed]',
    border: 'border-[#d9dce0]',
    headerBg: 'bg-[#f3f4f5]',
    syntax: {
      keyword: '#fa8d3e',
      string: '#86b300',
      comment: '#abb0b6',
      function: '#f29718',
      number: '#a37acc'
    }
  },
  'high-contrast-light': {
    name: 'High Contrast',
    bg: 'bg-[#ffffff]',
    text: 'text-[#000000]',
    lineNumber: 'text-[#000080]',
    lineNumberBg: 'bg-[#ffffff]',
    selection: 'selection:bg-[#b3d4fc]',
    border: 'border-[#000000]',
    headerBg: 'bg-[#f0f0f0]',
    syntax: {
      keyword: '#0000ff',
      string: '#008000',
      comment: '#d00000',
      function: '#800080',
      number: '#000080'
    }
  }
};

const EDITOR_THEMES = { ...DARK_THEMES, ...LIGHT_THEMES };

type ThemeKey = keyof typeof EDITOR_THEMES;

const highlightCode = (code: string, syntax: any) => {
  if (!code) return '';

  const escapeHtml = (str: string) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Token regex: Comments, Strings, Keywords, Functions, Numbers
  const tokenRegex = /(\/\/.*|\/\*[\s\S]*?\*\/|#.*)|(".*?"|'.*?'|`[\s\S]*?`)|(\b(?:def|class|return|if|else|elif|while|for|in|import|from|as|try|except|finally|public|private|protected|void|int|float|double|string|char|boolean|new|this|super|extends|implements|interface|package|static|final|const|let|var|function|await|async|switch|case|break|continue|default|return)\b)|(\b[a-zA-Z_]\w*(?=\())|(\b\d+\b)/g;

  let lastIndex = 0;
  let result = '';
  let match;

  while ((match = tokenRegex.exec(code)) !== null) {
    result += escapeHtml(code.slice(lastIndex, match.index));
    const [fullMatch, comment, string, keyword, func, number] = match;

    if (comment) result += `<span style="color: ${syntax.comment}">${escapeHtml(comment)}</span>`;
    else if (string) result += `<span style="color: ${syntax.string}">${escapeHtml(string)}</span>`;
    else if (keyword) result += `<span style="color: ${syntax.keyword}">${escapeHtml(keyword)}</span>`;
    else if (func) result += `<span style="color: ${syntax.function}">${escapeHtml(func)}</span>`;
    else if (number) result += `<span style="color: ${syntax.number}">${escapeHtml(number)}</span>`;

    lastIndex = tokenRegex.lastIndex;
  }

  result += escapeHtml(code.slice(lastIndex));
  return result;
};

const Problem: React.FC = () => {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const slug = params?.slug as string;
  const { subscriber } = useAuth();
  const { isDarkMode } = useStore();
  const [challenge, setChallenge] = useState<CodingChallenge | null>(null);
  const [profile, setProfile] = useState<UserCodingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<ProgrammingLanguage>('python');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<
    { passed: boolean; input: string; expected: string; actual: string }[]
  >([]);
  const [activeTab, setActiveTab] = useState<
    'description' | 'solutions' | 'submissions'
  >('description');
  const [showHints, setShowHints] = useState(false);
  const [alreadySolved, setAlreadySolved] = useState(false);
  const [editorTheme, setEditorTheme] = useState<ThemeKey>('dracula');
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const codeEditorRef = useRef<HTMLTextAreaElement>(null);
  const hasLoadedRef = useRef(false);
  const currentSlugRef = useRef(slug);

  // Sync editor theme with global dark/light mode
  useEffect(() => {
    const darkThemes: ThemeKey[] = [
      'dark',
      'dracula',
      'monokai',
      'github-dark',
      'nord',
    ];
    const lightThemes: ThemeKey[] = [
      'github-light',
      'solarized-light',
      'one-light',
      'xcode-light',
      'material-light',
      'ayu-light',
    ];

    if (isDarkMode && lightThemes.includes(editorTheme)) {
      setEditorTheme('dracula');
    } else if (!isDarkMode && darkThemes.includes(editorTheme)) {
      setEditorTheme('github-light');
    }
  }, [isDarkMode]);

  // Fetch data only when slug changes
  useEffect(() => {
    // Skip if same slug and already loaded
    if (currentSlugRef.current === slug && hasLoadedRef.current) {
      return;
    }

    currentSlugRef.current = slug;

    const fetchData = async () => {
      if (!slug) return;

      setLoading(true);
      const lang = i18n.language;
      try {
        const challengeData = await getChallengeBySlug(slug, lang);
        setChallenge(challengeData);

        // Set initial code based on language
        if (challengeData?.starterCode) {
          const starterCode = challengeData.starterCode.find(
            (s) => s.language === language
          );
          setCode(starterCode?.code || getDefaultCode(language));
        } else {
          setCode(getDefaultCode(language));
        }

        if (subscriber?._id) {
          const userProfile = await getUserCodingProfile(subscriber._id);
          setProfile(userProfile);

          if (challengeData) {
            const solved = await hasUserSolvedChallenge(
              subscriber._id,
              challengeData._id
            );
            setAlreadySolved(solved);
          }
        }

        hasLoadedRef.current = true;
      } catch (error) {
        console.error('Error fetching challenge:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [slug, i18n.language]); // Only depend on slug and lang

  // Update code when language changes
  useEffect(() => {
    if (challenge?.starterCode) {
      const starterCode = challenge.starterCode.find(
        (s) => s.language === language
      );
      setCode(starterCode?.code || getDefaultCode(language));
    } else {
      setCode(getDefaultCode(language));
    }
  }, [language, challenge]);

  const getDefaultCode = (lang: ProgrammingLanguage): string => {
    switch (lang) {
      case 'python':
        return `def solution(input):\n    # Write your solution here\n    pass`;
      case 'javascript':
        return `function solution(input) {\n    // Write your solution here\n}`;
      case 'java':
        return `class Solution {\n    public Object solve(Object input) {\n        // Write your solution here\n        return null;\n    }\n}`;
      case 'cpp':
        return `class Solution {\npublic:\n    auto solve(auto input) {\n        // Write your solution here\n    }\n};`;
      default:
        return '// Write your solution here';
    }
  };

  const theme = EDITOR_THEMES[editorTheme];

  // Count lines for line numbers
  const lineCount = code.split('\n').length;

  // Clear status after 5 seconds
  useEffect(() => {
    if (status.type) {
      const timer = setTimeout(
        () => setStatus({ type: null, message: '' }),
        5000
      );
      return () => clearTimeout(timer);
    }
  }, [status]);

  const quickRun = async () => {
    setIsRunning(true);
    setOutput(null);
    setTestResults([]);
    setStatus({ type: null, message: '' });

    try {
      setOutput('⏳ Executing code...');
      const result = await executeCode(code, language, '');

      if (result.success) {
        setOutput(
          `✅ Code executed successfully!\n\n📤 Output:\n${result.output || '(no output)'
          }\n\n⏱️ Time: ${result.executionTime}ms`
        );
        setStatus({ type: 'success', message: 'Code executed successfully!' });
      } else {
        setOutput(
          `❌ Execution failed!\n\n🐛 Error:\n${result.error || 'Unknown error'
          }`
        );
        setStatus({
          type: 'error',
          message: 'Execution failed. Check your code.',
        });
      }
    } catch (error) {
      console.error('Quick run error:', error);
      setOutput(
        `❌ Failed to execute code.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'
        }`
      );
      setStatus({ type: 'error', message: 'Failed to execute.' });
    }

    setIsRunning(false);
  };

  const runTests = async () => {
    if (!challenge?.testCases || challenge.testCases.length === 0) {
      setStatus({
        type: 'info',
        message: 'No test cases - running quick execution',
      });
      await quickRun();
      return;
    }

    setIsRunning(true);
    setOutput(null);
    setTestResults([]);
    setStatus({ type: null, message: '' });

    try {
      setOutput('⏳ Running test cases...');

      const visibleTestCases = challenge.testCases
        .filter((tc) => !tc.isHidden)
        .slice(0, 3)
        .map((tc) => ({
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || '',
        }));

      if (visibleTestCases.length === 0) {
        setStatus({ type: 'info', message: 'No visible test cases' });
        await quickRun();
        return;
      }

      const results = await runTestCases(code, language, visibleTestCases);

      const formattedResults = results.results.map((r) => ({
        passed: r.passed,
        input: r.input,
        expected: r.expectedOutput,
        actual: r.error ? `Error: ${r.error}` : r.actualOutput,
      }));

      setTestResults(formattedResults);
      setOutput(
        `📊 ${results.totalPassed}/${results.totalTests} test cases passed\n⏱️ Avg runtime: ${results.averageRuntime}ms`
      );

      if (results.allPassed) {
        setStatus({ type: 'success', message: 'All test cases passed! 🎉' });
      } else if (results.totalPassed > 0) {
        setStatus({
          type: 'info',
          message: `${results.totalPassed}/${results.totalTests} tests passed`,
        });
      } else {
        setStatus({ type: 'error', message: 'Tests failed. Check your code.' });
      }
    } catch (error) {
      console.error('Run tests error:', error);
      setStatus({ type: 'error', message: 'Failed to run tests.' });
      setOutput(
        `❌ Error running tests.\n\n${error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }

    setIsRunning(false);
  };

  const submitSolution = async () => {
    if (!subscriber?._id) {
      setStatus({ type: 'error', message: 'Please sign in to submit' });
      return;
    }

    if (!challenge) {
      setStatus({ type: 'error', message: 'Challenge not found' });
      return;
    }

    setIsRunning(true);
    setStatus({ type: null, message: '' });

    let currentProfile = profile;
    if (!currentProfile) {
      try {
        const username = subscriber.email?.split('@')[0] || 'coder';
        currentProfile = await createCodingProfile(
          subscriber._id,
          subscriber.name || username,
          username
        );
        if (currentProfile) setProfile(currentProfile);
      } catch (error) {
        console.error('Error creating profile:', error);
      }
    }

    const allTestCases = (challenge.testCases || []).map((tc) => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    }));

    if (allTestCases.length === 0) {
      setStatus({ type: 'error', message: 'No test cases available' });
      setIsRunning(false);
      return;
    }

    try {
      const executionResults = await runTestCases(code, language, allTestCases);

      const allPassed = executionResults.allPassed;
      const runtime = executionResults.averageRuntime;
      const memory = Math.floor(Math.random() * 20) + 10;

      const formattedResults = executionResults.results
        .slice(0, 5)
        .map((r) => ({
          passed: r.passed,
          input: r.input,
          expected: r.expectedOutput,
          actual: r.error ? `Error: ${r.error}` : r.actualOutput,
        }));
      setTestResults(formattedResults);

      let submissionStatus:
        | 'accepted'
        | 'wrong_answer'
        | 'runtime_error'
        | 'compile_error' = 'wrong_answer';
      const hasError = executionResults.results.some((r) => r.error);

      if (allPassed) {
        submissionStatus = 'accepted';
      } else if (hasError) {
        const firstError =
          executionResults.results.find((r) => r.error)?.error || '';
        if (
          firstError.toLowerCase().includes('syntax') ||
          firstError.toLowerCase().includes('compile')
        ) {
          submissionStatus = 'compile_error';
        } else {
          submissionStatus = 'runtime_error';
        }
      }

      await createSubmission(
        challenge._id,
        subscriber._id,
        code,
        language,
        submissionStatus,
        {
          runtime,
          memory,
          runtimePercentile: allPassed
            ? Math.floor(Math.random() * 30) + 70
            : Math.floor(Math.random() * 50),
          memoryPercentile: Math.floor(Math.random() * 50) + 25,
          testCasesPassed: executionResults.totalPassed,
          totalTestCases: executionResults.totalTests,
          errorMessage: hasError
            ? executionResults.results.find((r) => r.error)?.error || undefined
            : undefined,
        }
      );

      if (allPassed && !alreadySolved && currentProfile) {
        await addXp(currentProfile._id, challenge.xpReward);
        await updateSolvedCount(currentProfile._id, challenge.difficulty);
        setAlreadySolved(true);
        setOutput(
          `🎉 All ${executionResults.totalTests} tests passed!\n+${challenge.xpReward} XP earned!\nRuntime: ${runtime}ms | Memory: ~${memory}MB`
        );
        setStatus({
          type: 'success',
          message: `+${challenge.xpReward} XP earned! Great job! 🎉`,
        });
      } else if (allPassed) {
        setOutput(
          `✅ All ${executionResults.totalTests} tests passed!\nRuntime: ${runtime}ms | Memory: ~${memory}MB`
        );
        setStatus({ type: 'success', message: 'All test cases passed!' });
      } else {
        setOutput(
          `❌ ${executionResults.totalPassed}/${executionResults.totalTests} tests passed.`
        );
        setStatus({
          type: 'error',
          message: `${executionResults.totalPassed}/${executionResults.totalTests} tests passed`,
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus({ type: 'error', message: 'Failed to submit' });
    }

    setIsRunning(false);
  };

  // Handle tab key in editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      // Set cursor position after tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen -mt-10 -mx-4 sm:-mx-6 lg:-mx-8 flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'
          }`}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
            Loading challenge...
          </p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div
        className={`min-h-screen -mt-10 -mx-4 sm:-mx-6 lg:-mx-8 flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'
          }`}
      >
        <div className="text-center">
          <span
            className={`material-symbols-outlined text-6xl mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'
              }`}
          >
            error
          </span>
          <h2
            className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
          >
            Challenge Not Found
          </h2>
          <p
            className={`mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}
          >
            The challenge you're looking for doesn't exist.
          </p>
          <Link
            to="/practice"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition"
          >
            Back to Practice
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'
        }`}
    >
      {/* Status Banner - Clean inline UI instead of popup */}
      {status.type && (
        <div
          className={`px-4 py-2 flex items-center justify-between ${status.type === 'success'
            ? 'bg-emerald-500/10 border-b border-emerald-500/20'
            : status.type === 'error'
              ? 'bg-red-500/10 border-b border-red-500/20'
              : 'bg-blue-500/10 border-b border-blue-500/20'
            }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined text-sm ${status.type === 'success'
                ? 'text-emerald-400'
                : status.type === 'error'
                  ? 'text-red-400'
                  : 'text-blue-400'
                }`}
            >
              {status.type === 'success'
                ? 'check_circle'
                : status.type === 'error'
                  ? 'error'
                  : 'info'}
            </span>
            <span
              className={`text-sm font-medium ${status.type === 'success'
                ? 'text-emerald-400'
                : status.type === 'error'
                  ? 'text-red-400'
                  : 'text-blue-400'
                }`}
            >
              {status.message}
            </span>
          </div>
          <button
            onClick={() => setStatus({ type: null, message: '' })}
            className="text-slate-400 hover:text-white"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div
        className={`border-b px-4 sm:px-6 lg:px-8 py-4 ${isDarkMode
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200'
          }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/practice"
              className="text-slate-400 hover:text-white transition"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div>
              <h1 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{challenge.title}</h1>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`px-2 py-0.5 rounded ${getDifficultyBg(
                    challenge.difficulty
                  )}`}
                >
                  {challenge.difficulty.charAt(0).toUpperCase() +
                    challenge.difficulty.slice(1)}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400">
                  +{challenge.xpReward} XP
                </span>
                {alreadySolved && (
                  <>
                    <span className="text-slate-500">|</span>
                    <span className="text-green-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">
                        check_circle
                      </span>
                      Solved
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-white transition">
              <span className="material-symbols-outlined">bookmark_border</span>
            </button>
            <button className="text-slate-400 hover:text-white transition">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel - Description */}
        <div
          className={`w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r flex flex-col ${isDarkMode ? 'border-slate-800' : 'border-slate-200 bg-white'
            }`}
        >
          <div
            className={`flex items-center gap-1 px-4 py-2 border-b ${isDarkMode
              ? 'border-slate-800 bg-slate-900/50'
              : 'border-slate-200 bg-slate-50'
              }`}
          >
            {(['description', 'solutions', 'submissions'] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition ${activeTab === tab
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none">
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {challenge.title}
                </h2>

                {challenge.description && (
                  <div className={`mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <PortableText content={challenge.description} />
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-6">
                  {challenge.tags?.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {challenge.testCases && challenge.testCases.length > 0 && (
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Examples
                    </h3>
                    {challenge.testCases
                      .filter((tc) => !tc.isHidden)
                      .slice(0, 3)
                      .map((tc, i) => (
                        <div
                          key={i}
                          className={`rounded-lg p-4 mb-3 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-100 border border-slate-200'}`}
                        >
                          <p className="text-sm text-slate-400 mb-2">
                            Example {i + 1}:
                          </p>
                          <div className="space-y-2 text-sm font-mono" dir="ltr">
                            <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                              <span className="text-slate-500">Input:</span>{' '}
                              {tc.input}
                            </p>
                            <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                              <span className="text-slate-500">Output:</span>{' '}
                              {tc.expectedOutput}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {challenge.hints && challenge.hints.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-medium mb-3"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {showHints ? 'visibility_off' : 'lightbulb'}
                      </span>
                      {showHints ? 'Hide Hints' : 'Show Hints'}
                    </button>
                    {showHints && (
                      <div className="space-y-2">
                        {challenge.hints.map((hint, i) => (
                          <div
                            key={i}
                            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3"
                          >
                            <p className={`text-sm ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
                              <span className="font-semibold">
                                Hint {i + 1}:
                              </span>{' '}
                              {hint}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className={`mt-8 pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        person
                      </span>
                      {challenge.totalSolved?.toLocaleString() || 0} Solved
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        upload
                      </span>
                      {challenge.totalSubmissions?.toLocaleString() || 0}{' '}
                      Submissions
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        percent
                      </span>
                      {challenge.acceptanceRate?.toFixed(1) || 0}% Acceptance
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'solutions' && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-slate-600 mb-3">
                  code
                </span>
                <p className="text-slate-400">
                  Solutions will be available after you solve this problem
                </p>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-slate-600 mb-3">
                  history
                </span>
                <p className="text-slate-500 dark:text-slate-400">
                  Your submissions will appear here
                </p>
                <Link
                  to="/submissions"
                  className="text-emerald-400 hover:text-emerald-300 text-sm mt-2 inline-block"
                >
                  View all submissions →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-[600px] lg:min-h-0">
          {/* Editor Header */}
          <div
            className={`flex items-center justify-between px-4 sm:px-6 py-2 border-b ${isDarkMode
              ? 'border-slate-800 bg-slate-900/50'
              : 'border-slate-200 bg-slate-50'
              }`}
          >
            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as ProgrammingLanguage)
                }
                className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme & Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined text-sm">
                    palette
                  </span>
                  <span className="text-xs font-medium">{theme.name}</span>
                </button>

                {showSettings && (
                  <div
                    className={`absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl z-50 p-4 ${isDarkMode
                      ? 'bg-slate-900 border border-slate-700'
                      : 'bg-white border border-slate-200'
                      }`}
                  >
                    <h4
                      className={`font-medium text-sm mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}
                    >
                      Editor Settings
                    </h4>

                    {/* Theme Selection */}
                    <div className="mb-4">
                      <label className="text-xs text-slate-400 mb-2 block">
                        {isDarkMode ? 'Dark Themes' : 'Light Themes'}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(isDarkMode
                          ? (Object.keys(DARK_THEMES) as ThemeKey[])
                          : (Object.keys(LIGHT_THEMES) as ThemeKey[])
                        ).map((themeName) => (
                          <button
                            key={themeName}
                            onClick={() => setEditorTheme(themeName)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition ${editorTheme === themeName
                              ? 'bg-emerald-500 text-white'
                              : isDarkMode
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                          >
                            {EDITOR_THEMES[themeName].name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Size */}
                    <div>
                      <label className="text-xs text-slate-400 mb-2 block">
                        Font Size: {fontSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="20"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button className="text-slate-400 hover:text-white transition p-1">
                <span className="material-symbols-outlined text-sm">
                  fullscreen
                </span>
              </button>
            </div>
          </div>

          {/* Modern Code Editor */}
          <div className={`flex-1 ${theme.bg} overflow-hidden`}>
            <div className="flex h-full">
              {/* Line Numbers */}
              <div
                dir="ltr"
                className={`${theme.lineNumberBg} px-4 py-4 text-right select-none border-r border-slate-700/30`}
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div
                    key={i}
                    dir="ltr"
                    className={`${theme.lineNumber} font-mono leading-6`}
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Editor Area */}
              <div className="flex-1 relative">
                {/* Syntax Highlighting Layer */}
                <pre
                  aria-hidden="true"
                  dir="ltr"
                  lang="en"
                  className={`absolute inset-0 p-4 m-0 overflow-hidden whitespace-pre pointer-events-none ${theme.bg} ${theme.text}`}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.5rem',
                  }}
                >
                  <code
                    dir="ltr"
                    lang="en"
                    dangerouslySetInnerHTML={{
                      __html: highlightCode(code, theme.syntax || {
                        keyword: '#569cd6',
                        string: '#ce9178',
                        comment: '#6a9955',
                        function: '#dcdcaa',
                        number: '#b5cea8'
                      }) + '<br />'
                    }}
                  />
                </pre>

                {/* Input Layer */}
                <textarea
                  ref={codeEditorRef}
                  value={code}
                  dir="ltr"
                  lang="en"
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onScroll={(e) => {
                    const pre = e.currentTarget.previousSibling as HTMLPreElement;
                    if (pre) {
                      pre.scrollTop = e.currentTarget.scrollTop;
                      pre.scrollLeft = e.currentTarget.scrollLeft;
                    }
                  }}
                  className={`absolute inset-0 w-full h-full p-4 m-0 resize-none focus:outline-none bg-transparent text-transparent whitespace-pre overflow-auto ${theme.selection}`}
                  spellCheck={false}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.5rem',
                    tabSize: 4,
                    caretColor: isDarkMode ? '#fff' : '#000',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Output Panel */}
          {(output || testResults.length > 0) && (
            <div
              className={`h-56 border-t overflow-hidden flex flex-col ${isDarkMode
                ? 'border-slate-800 bg-slate-900/80'
                : 'border-slate-200 bg-slate-50'
                }`}
            >
              <div
                className={`flex items-center justify-between px-4 py-2 border-b ${isDarkMode
                  ? 'border-slate-800 bg-slate-900/50'
                  : 'border-slate-200 bg-white'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Output</span>
                  {testResults.length > 0 && (
                    <span className="text-xs text-slate-400">
                      {testResults.filter((r) => r.passed).length}/
                      {testResults.length} tests passed
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setOutput(null);
                    setTestResults([]);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <span className="material-symbols-outlined text-sm">
                    close
                  </span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {/* Test Results - Compact Cards */}
                {testResults.length > 0 && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {testResults.map((result, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${result.passed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/20 text-red-400 border border-red-500/20'
                          }`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {result.passed ? 'check_circle' : 'cancel'}
                        </span>
                        Test {i + 1}
                      </div>
                    ))}
                  </div>
                )}

                {/* Output Text */}
                {output && (
                  <pre dir="ltr" lang="en" className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                    {output}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div
            className={`border-t px-4 py-3 ${isDarkMode
              ? 'border-slate-800 bg-slate-900'
              : 'border-slate-200 bg-slate-50'
              }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={runTests}
                disabled={isRunning}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isRunning ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-sm">
                    play_arrow
                  </span>
                )}
                Run Tests
              </button>
              <button
                onClick={submitSolution}
                disabled={isRunning}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">
                      cloud_upload
                    </span>
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close settings */}
      {showSettings && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default Problem;
