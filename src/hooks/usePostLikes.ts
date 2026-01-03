// hooks/usePostLikes.ts
import { useState, useEffect } from 'react';
import { client } from '../lib/sanity';

interface UsePostLikesProps {
  postId: string;
  initialLikes: Array<{ _ref: string }>; // Updated to handle reference objects
  userId?: string;
}

export const usePostLikes = ({ postId, initialLikes = [], userId = '' }: UsePostLikesProps) => {
  const [likes, setLikes] = useState<Array<{ _ref: string }>>(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local state when initialLikes changes
  useEffect(() => {
    setLikes(initialLikes);
    setIsLiked(userId ? initialLikes.some(like => like._ref === userId) : false);
  }, [initialLikes, userId]);

  const toggleLike = async () => {
    if (!postId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Your existing toggle like logic here
      // Make sure to handle the reference objects correctly
      const response = await fetch('/api/toggle-like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }

      const data = await response.json();
      setLikes(data.likes);
      setIsLiked(data.isLiked);
    } catch (err) {
      console.error('Error toggling like:', err);
      setError('Failed to update like. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    likes,
    isLiked,
    likeCount: likes.length,
    toggleLike,
    isLoading,
    error,
  };
};