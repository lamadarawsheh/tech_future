import React from 'react';

export const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
);

export const ArticleCardSkeleton = () => (
  <div className="flex flex-col md:flex-row gap-8 p-4 -mx-4 rounded-2xl border border-transparent">
    <Skeleton className="w-full md:w-72 h-52 rounded-2xl flex-shrink-0" />
    <div className="flex flex-col justify-center flex-1 space-y-4">
       <div className="flex gap-2">
         <Skeleton className="w-20 h-6 rounded-md" />
         <Skeleton className="w-24 h-6 rounded-md" />
       </div>
       <Skeleton className="w-3/4 h-8 rounded-lg" />
       <div className="space-y-2">
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-5/6 h-4 rounded" />
       </div>
       <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-col gap-1.5">
             <Skeleton className="w-24 h-3 rounded" />
             <Skeleton className="w-12 h-2 rounded" />
          </div>
          <Skeleton className="ml-auto w-16 h-4 rounded" />
       </div>
    </div>
  </div>
);

export const HeroSkeleton = () => (
    <div className="mb-16 rounded-3xl overflow-hidden relative shadow-sm h-[500px] w-full bg-slate-200 dark:bg-slate-800 animate-pulse">
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-16">
            <div className="max-w-4xl space-y-6">
                <div className="flex gap-4">
                    <div className="w-32 h-8 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                    <div className="w-24 h-8 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                </div>
                <div className="w-3/4 h-16 bg-slate-300 dark:bg-slate-700 rounded-2xl"></div>
                <div className="w-1/2 h-6 bg-slate-300 dark:bg-slate-700 rounded-lg"></div>
                <div className="w-40 h-12 bg-slate-300 dark:bg-slate-700 rounded-full mt-4"></div>
            </div>
        </div>
    </div>
);

export const ArticleDetailSkeleton = () => (
    <div className="max-w-4xl mx-auto animate-pulse">
        <div className="flex flex-col gap-6 mb-8">
            <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="flex gap-2">
                 <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                 <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            </div>
            <div className="w-full h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="flex items-center gap-4 py-6 border-y border-slate-200 dark:border-slate-800">
                 <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                 <div className="flex flex-col gap-2">
                    <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="w-48 h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
                 </div>
            </div>
        </div>
        <div className="w-full aspect-video rounded-3xl bg-slate-200 dark:bg-slate-800 mb-12"></div>
        <div className="space-y-4">
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="w-2/3 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded mt-8"></div>
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
    </div>
);

export const GridCardSkeleton = () => (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 h-full animate-pulse bg-white dark:bg-slate-900/50">
        <div className="w-full aspect-[16/9] rounded-xl bg-slate-200 dark:bg-slate-800"></div>
        <div className="flex flex-col flex-1 space-y-3">
             <div className="flex gap-2">
                <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
             </div>
             <div className="w-full h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
             <div className="w-full h-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
             <div className="mt-auto pt-4 flex justify-between">
                <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="size-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
             </div>
        </div>
    </div>
);

export const AuthorProfileSkeleton = () => (
    <div className="flex flex-col gap-8 animate-pulse">
        <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 flex flex-col gap-8">
                <div className="aspect-square w-full rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
                <div className="space-y-4">
                    <div className="w-3/4 h-8 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="w-1/2 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="w-full h-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
            </div>
            <div className="lg:col-span-8 space-y-8">
                <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="w-24 h-8 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="w-24 h-8 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GridCardSkeleton />
                    <GridCardSkeleton />
                    <GridCardSkeleton />
                    <GridCardSkeleton />
                </div>
            </div>
        </div>
    </div>
);