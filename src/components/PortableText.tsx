import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { urlFor } from '../lib/sanity';

interface PortableTextProps {
  content: any[] | null | undefined;
  className?: string;
}

// Language display names and icons
const languageConfig: Record<string, { name: string; color: string }> = {
  javascript: { name: 'JavaScript', color: 'text-yellow-400' },
  js: { name: 'JavaScript', color: 'text-yellow-400' },
  typescript: { name: 'TypeScript', color: 'text-blue-400' },
  ts: { name: 'TypeScript', color: 'text-blue-400' },
  tsx: { name: 'TypeScript React', color: 'text-blue-400' },
  jsx: { name: 'JavaScript React', color: 'text-yellow-400' },
  python: { name: 'Python', color: 'text-green-400' },
  py: { name: 'Python', color: 'text-green-400' },
  html: { name: 'HTML', color: 'text-orange-400' },
  css: { name: 'CSS', color: 'text-pink-400' },
  scss: { name: 'SCSS', color: 'text-pink-400' },
  json: { name: 'JSON', color: 'text-amber-400' },
  bash: { name: 'Bash', color: 'text-green-300' },
  shell: { name: 'Shell', color: 'text-green-300' },
  sh: { name: 'Shell', color: 'text-green-300' },
  sql: { name: 'SQL', color: 'text-cyan-400' },
  graphql: { name: 'GraphQL', color: 'text-pink-500' },
  yaml: { name: 'YAML', color: 'text-red-400' },
  yml: { name: 'YAML', color: 'text-red-400' },
  markdown: { name: 'Markdown', color: 'text-slate-300' },
  md: { name: 'Markdown', color: 'text-slate-300' },
  rust: { name: 'Rust', color: 'text-orange-500' },
  go: { name: 'Go', color: 'text-cyan-400' },
  java: { name: 'Java', color: 'text-red-400' },
  kotlin: { name: 'Kotlin', color: 'text-purple-400' },
  swift: { name: 'Swift', color: 'text-orange-400' },
  php: { name: 'PHP', color: 'text-indigo-400' },
  ruby: { name: 'Ruby', color: 'text-red-500' },
  c: { name: 'C', color: 'text-blue-300' },
  cpp: { name: 'C++', color: 'text-blue-400' },
  csharp: { name: 'C#', color: 'text-purple-500' },
  cs: { name: 'C#', color: 'text-purple-500' },
  docker: { name: 'Dockerfile', color: 'text-blue-400' },
  dockerfile: { name: 'Dockerfile', color: 'text-blue-400' },
};

// Code Block Component
const CodeBlock: React.FC<{ code: string; language?: string; filename?: string }> = ({
  code,
  language = 'text',
  filename
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const langConfig = languageConfig[language.toLowerCase()] || { name: language || 'Code', color: 'text-slate-400' };
  const lines = code.split('\n');

  return (
    <div className="my-6 rounded-xl overflow-hidden bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-[#161b22] border-b border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>

          {/* Language badge */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${langConfig.color}`}>
              {langConfig.name}
            </span>
            {filename && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-mono">{filename}</span>
              </>
            )}
          </div>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${copied
            ? 'bg-green-500/20 text-green-400'
            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? t('portableText.copied') : t('portableText.copy')}</span>
        </button>
      </div>

      {/* Code content */}
      <div className="relative overflow-x-auto" dir="ltr" lang="en">
        <pre className="p-4 text-sm leading-relaxed font-mono">
          <code className="block font-mono">
            {lines.map((line, i) => (
              <div key={i} className="table-row group">
                {/* Line number */}
                <span className="table-cell pr-4 text-right text-slate-400 dark:text-slate-600 select-none w-[3ch] text-xs font-mono">
                  {i + 1}
                </span>
                {/* Line content */}
                <span className="table-cell text-slate-800 dark:text-slate-100 group-hover:bg-slate-100 dark:group-hover:bg-slate-800/30 pl-4 -ml-4 w-full font-mono whitespace-pre">
                  {highlightSyntax(line, language)}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>

      {/* Footer with line count */}
      <div className="px-4 py-2 bg-slate-100 dark:bg-[#161b22] border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
        <span>{lines.length} {t('portableText.lines')}</span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">code</span>
          {langConfig.name}
        </span>
      </div>
    </div>
  );
};

// Basic syntax highlighting (can be enhanced with a proper library)
const highlightSyntax = (line: string, language: string): React.ReactNode => {
  // Keywords for different languages
  const jsKeywords = /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|try|catch|throw|new|this|super|extends|implements|interface|type|enum|null|undefined|true|false)\b/g;
  const pythonKeywords = /\b(def|class|import|from|return|if|elif|else|for|while|try|except|finally|with|as|lambda|yield|None|True|False|and|or|not|in|is)\b/g;

  // Strings
  const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g;

  // Comments
  const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm;

  // Numbers
  const numbers = /\b(\d+\.?\d*)\b/g;

  // Functions
  const functions = /\b([a-zA-Z_]\w*)\s*(?=\()/g;

  let result = line;

  // This is a simplified highlighter - for production, use Prism.js or highlight.js
  // For now, we'll just return the plain text with some basic highlighting via CSS

  return <span>{line || ' '}</span>;
};

export const PortableText: React.FC<PortableTextProps> = ({ content, className = '' }) => {
  const { t } = useTranslation();

  if (!content || !Array.isArray(content) || content.length === 0) {
    return <p className="text-slate-500 dark:text-slate-400">{t('portableText.noContent')}</p>;
  }

  const renderNode = (node: any, index: number) => {
    if (!node || !node._type) return null;

    // Handle block content
    if (node._type === 'block') {
      const { style = 'normal', children, listItem } = node;

      const renderedChildren = children?.map((child: any, i: number) => {
        if (child._type === 'span') {
          let className = '';
          if (child.marks?.includes('strong')) className += 'font-bold ';
          if (child.marks?.includes('em')) className += 'italic ';
          if (child.marks?.includes('underline')) className += 'underline ';
          if (child.marks?.includes('code')) {
            return (
              <code
                key={i}
                dir="ltr"
                lang="en"
                className="font-mono text-sm bg-slate-100 dark:bg-slate-800 text-primary px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700"
              >
                {child.text}
              </code>
            );
          }

          return (
            <span key={i} className={className || undefined}>
              {child.text}
            </span>
          );
        }
        return null;
      });

      switch (style) {
        case 'h1':
          return <h1 key={index} className="text-4xl font-bold my-6 text-slate-900 dark:text-white">{renderedChildren}</h1>;
        case 'h2':
          return <h2 key={index} className="text-3xl font-bold my-5 text-slate-900 dark:text-white">{renderedChildren}</h2>;
        case 'h3':
          return <h3 key={index} className="text-2xl font-bold my-4 text-slate-900 dark:text-white">{renderedChildren}</h3>;
        case 'h4':
          return <h4 key={index} className="text-xl font-bold my-3 text-slate-900 dark:text-white">{renderedChildren}</h4>;
        case 'blockquote':
          return (
            <blockquote key={index} className="relative border-l-4 border-primary pl-6 py-4 my-6 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent rounded-r-xl">
              <span className="absolute -left-3 -top-2 text-4xl text-primary/30 font-serif">"</span>
              <div className="italic text-slate-700 dark:text-slate-300 text-lg">
                {renderedChildren}
              </div>
            </blockquote>
          );
        default:
          if (listItem === 'bullet') {
            return <li key={index} className="ml-6 list-disc text-slate-700 dark:text-slate-300 mb-2">{renderedChildren}</li>;
          }
          if (listItem === 'number') {
            return <li key={index} className="ml-6 list-decimal text-slate-700 dark:text-slate-300 mb-2">{renderedChildren}</li>;
          }
          return <p key={index} className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300">{renderedChildren}</p>;
      }
    }

    // Handle images
    if (node._type === 'image' && node.asset) {
      const imageUrl = urlFor(node);

      return (
        <figure key={index} className="my-8">
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
            <img
              src={imageUrl}
              alt={node.alt || t('portableText.articleImage')}
              className="w-full h-auto object-cover max-h-[500px] mx-auto"
              loading="lazy"
            />
          </div>
          {node.caption && (
            <figcaption className="text-center text-sm text-slate-500 dark:text-slate-400 mt-3 italic">
              {node.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    // Handle code blocks
    if (node._type === 'code') {
      return (
        <CodeBlock
          key={index}
          code={node.code || ''}
          language={node.language}
          filename={node.filename}
        />
      );
    }

    // Handle custom components
    if (node._type === 'customComponent') {
      return null;
    }

    return null;
  };

  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      {content.map((node, index) => (
        <React.Fragment key={index}>
          {renderNode(node, index)}
        </React.Fragment>
      ))}
    </div>
  );
};
