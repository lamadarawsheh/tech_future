// hooks/usePostComments.ts
import { useState, useEffect } from 'react';
import { client } from '../lib/sanity';

interface CommentUser {
  _id: string;
  name: string;
  image?: string;
}

export interface Comment {
  _id: string;
  _createdAt: string;
  user: CommentUser;
  content: string;
  approved: boolean;
  post: {
    _ref: string;
    _type: 'reference';
  };
}

interface UsePostCommentsProps {
  postId: string;
  initialComments: Array<{ _ref: string }>; // Updated to handle reference objects
}

export const usePostComments = ({ postId, initialComments = [] }: UsePostCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch full comment data from references
  useEffect(() => {
    const fetchComments = async () => {
      if (!initialComments.length) return;
      
      try {
        setIsLoading(true);
        // Fetch full comment data using the references
        const commentIds = initialComments.map(comment => comment._ref).filter(Boolean);
        if (commentIds.length === 0) return;

        const query = `*[_type == "comment" && _id in $commentIds] | order(_createdAt desc) {
          _id,
          _createdAt,
          content,
          approved,
          user->{
            _id,
            name,
            image
          },
          post->{
            _id
          }
        }`;

        const result = await client.fetch(query, { commentIds });
        setComments(result || []);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [initialComments]);

  const addComment = async (content: string) => {
    if (!postId || !content.trim()) return false;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/add-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const newComment = await response.json();
      setComments(prev => [newComment, ...prev]);
      return true;
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    comments,
    addComment,
    isLoading,
    error,
  };
};