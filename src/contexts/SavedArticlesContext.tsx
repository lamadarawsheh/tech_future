import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BlogPost } from '../types';

interface SavedArticle {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  publishedDate: string;
  readingTime?: number;
  savedAt: string;
}

interface SavedArticlesContextType {
  savedArticles: SavedArticle[];
  saveArticle: (post: BlogPost) => void;
  unsaveArticle: (postId: string) => void;
  isArticleSaved: (postId: string) => boolean;
  getSavedCount: () => number;
}

const SavedArticlesContext = createContext<SavedArticlesContextType | undefined>(undefined);

const STORAGE_KEY = 'tech_future_saved_articles';

export const SavedArticlesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);

  // Load saved articles from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedArticles(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading saved articles:', error);
    }
  }, []);

  // Save to localStorage whenever savedArticles changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedArticles));
    } catch (error) {
      console.error('Error saving articles:', error);
    }
  }, [savedArticles]);

  const saveArticle = (post: BlogPost) => {
    const slug = typeof post.slug === 'string' ? post.slug : post.slug?.current || '';
    const image = typeof post.image === 'string' ? post.image : '';
    
    const savedArticle: SavedArticle = {
      _id: post._id,
      title: post.title,
      slug,
      excerpt: post.excerpt,
      image,
      publishedDate: post.publishedDate,
      readingTime: post.readingTime,
      savedAt: new Date().toISOString(),
    };

    setSavedArticles(prev => {
      // Don't add if already saved
      if (prev.some(a => a._id === post._id)) {
        return prev;
      }
      return [savedArticle, ...prev];
    });
  };

  const unsaveArticle = (postId: string) => {
    setSavedArticles(prev => prev.filter(a => a._id !== postId));
  };

  const isArticleSaved = (postId: string) => {
    return savedArticles.some(a => a._id === postId);
  };

  const getSavedCount = () => savedArticles.length;

  return (
    <SavedArticlesContext.Provider
      value={{
        savedArticles,
        saveArticle,
        unsaveArticle,
        isArticleSaved,
        getSavedCount,
      }}
    >
      {children}
    </SavedArticlesContext.Provider>
  );
};

export const useSavedArticles = () => {
  const context = useContext(SavedArticlesContext);
  if (context === undefined) {
    throw new Error('useSavedArticles must be used within a SavedArticlesProvider');
  }
  return context;
};

