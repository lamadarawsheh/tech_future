// components/ArticleCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { BlogPost } from '../types';

interface ArticleCardProps {
  post: BlogPost;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ post }) => {

    const getSlug = (slug: any): string => {
    if (!slug) return '';
    return typeof slug === 'string' ? slug : slug.current || '';
  };
  const articleSlug = getSlug(post.slug);
  console.log('ArticleCard post data:', {
  id: post._id,
  title: post.title,
  slug: post.slug,
  slugType: typeof post.slug,
  // hasCurrent: !!post.slug?.current
});
  return (
    <div className="flex flex-col overflow-hidden rounded-lg shadow-lg bg-white dark:bg-slate-800 transition-transform hover:scale-[1.02]">
      {post.image && (
        <div className="flex-shrink-0">
          <img
            className="h-48 w-full object-cover"
            src={post.image}
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
  to={`/article/${ articleSlug}`} 
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
        <div className="mt-6 flex items-center">
          <div className="flex-shrink-0">
            {post.author?.image && (
              <img
                className="h-10 w-10 rounded-full"
                src={post.author.image}
                alt={post.author.name}
              />
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {post.author?.name}
            </p>
            <div className="flex space-x-1 text-sm text-slate-500 dark:text-slate-400">
              <time dateTime={post.publishedDate}>
                {format(new Date(post.publishedDate), 'MMM d, yyyy')}
              </time>
              <span aria-hidden="true">&middot;</span>
              <span>{post.readingTime} min read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};