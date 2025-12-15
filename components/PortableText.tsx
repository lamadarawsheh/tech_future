// components/PortableText.tsx
import React from 'react';
import { urlFor } from '../lib/sanity';

interface PortableTextProps {
  content: any[] | null | undefined;
  className?: string;
}

export const PortableText: React.FC<PortableTextProps> = ({ content, className = '' }) => {
  if (!content || !Array.isArray(content) || content.length === 0) {
    return <p className="text-slate-500 dark:text-slate-400">No content available.</p>;
  }

  const renderNode = (node: any, index: number) => {
    if (!node || !node._type) return null;

    // Handle block content
    if (node._type === 'block') {
      const { style = 'normal', children, listItem, level } = node;

      const renderedChildren = children?.map((child: any, i: number) => {
        if (child._type === 'span') {
          let className = '';
          if (child.marks?.includes('strong')) className += 'font-bold ';
          if (child.marks?.includes('em')) className += 'italic ';
          if (child.marks?.includes('underline')) className += 'underline ';
          if (child.marks?.includes('code')) className += 'font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded';

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
          return <blockquote key={index} className="border-l-4 border-primary pl-4 italic text-slate-700 dark:text-slate-300 my-6 text-lg bg-slate-50 dark:bg-slate-800/50 py-2 pr-2 rounded-r">
            {renderedChildren}
          </blockquote>;
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
  const imageUrl = urlFor(node)
    .width(1200)
    .url() || '';
  
  return (
    <div key={index} className="my-8 rounded-xl overflow-hidden">
      <img 
        src={imageUrl} 
        alt={node.alt || 'Article image'} 
        className="w-full h-auto object-cover max-h-[500px] mx-auto"
        loading="lazy"
      />
      {node.caption && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
          {node.caption}
        </p>
      )}
    </div>
  );
}

    // Handle code blocks
    if (node._type === 'code') {
      return (
        <pre key={index} className="bg-slate-900 text-slate-200 p-4 rounded-lg overflow-x-auto my-6 font-mono text-sm border border-slate-700">
          <code>{node.code}</code>
        </pre>
      );
    }

    // Handle custom components
    if (node._type === 'customComponent') {
      // Handle custom components if needed
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