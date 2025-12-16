// components/ArticleCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { BlogPost, getSlug } from '../types';

interface ArticleCardProps {
  post: BlogPost;
  variant?: 'grid' | 'list';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ post, variant = 'list' }) => {
  const articleSlug = getSlug(post.slug);
  const imageUrl = typeof post.image === 'string' ? post.image : post.image?.asset?.url || '';
  const authorImage = typeof post.author?.image === 'string' ? post.author.image : '';

  // Grid variant - compact card layout
  if (variant === 'grid') {
    return (
      <Link 
        to={`/article/${articleSlug}`}
        className="group flex flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300"
      >
        {imageUrl && (
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={imageUrl}
              alt={post.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {post.categories?.slice(0, 1).map((category) => (
              <span
                key={category._id}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary"
              >
                {category.title}
              </span>
            ))}
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              {authorImage && (
                <img
                  className="h-6 w-6 rounded-full"
                  src={authorImage}
                  alt={post.author?.name || 'Author'}
                />
              )}
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {post.author?.name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">visibility</span>
                {post.viewCount || 0}
              </span>
              <span className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">favorite</span>
                {post.likeCount || 0}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // List variant - original horizontal layout
  return (
    <div className="flex flex-col overflow-hidden rounded-lg shadow-lg bg-white dark:bg-slate-800 transition-transform hover:scale-[1.02]">
      {imageUrl && (
        <div className="flex-shrink-0">
          <img
            className="h-48 w-full object-cover"
            src={imageUrl}
            alt={post.title}
          />
        </div>
      )}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            {post.categories?.map((category) => (
              <span
                key={category._id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
              >
                {category.title}
              </span>
            ))}
          </div>
          <Link 
            to={`/article/${articleSlug}`} 
  className="block mt-2"
>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white line-clamp-2">
              {post.title}
            </h3>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400 line-clamp-3">
              {post.excerpt}
            </p>
          </Link>
        </div>
        
        {/* Engagement Stats */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-[14px]">visibility</span>
            {post.viewCount || 0}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-[14px]">favorite</span>
            {post.likeCount || 0}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
            {post.commentCount || 0}
          </span>
        </div>

        <div className="mt-4 flex items-center">
          <div className="flex-shrink-0">
            {authorImage && (
              <img
                className="h-10 w-10 rounded-full"
                src={authorImage}
                alt={post.author?.name || 'Author'}
              />
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {post.author?.name}
            </p>
            <div className="flex space-x-1 text-sm text-slate-500 dark:text-slate-400">
              {post.publishedDate && (
              <time dateTime={post.publishedDate}>
                {format(new Date(post.publishedDate), 'MMM d, yyyy')}
              </time>
              )}
              <span aria-hidden="true">&middot;</span>
              <span>{post.readingTime || 5} min read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
