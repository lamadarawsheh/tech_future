import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { checkUserLike, toggleLike } from '../services/sanity';

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  subscriberId?: string | null;
  isSubscribed?: boolean;
  onLikeChange?: (newCount: number, isLiked: boolean) => void;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  postId,
  initialLikeCount,
  subscriberId,
  isSubscribed = false,
  onLikeChange,
}) => {
  const { t } = useTranslation();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (subscriberId) {
        const existingLike = await checkUserLike(postId, subscriberId);
        setLiked(!!existingLike);
      }
    };
    checkLikeStatus();
  }, [postId, subscriberId]);

  const handleLike = async () => {
    if (!subscriberId || !isSubscribed) {
      alert(t('like.signIn'));
      return;
    }

    setLoading(true);
    try {
      const isNowLiked = await toggleLike(postId, subscriberId);
      setLiked(isNowLiked);
      const newCount = isNowLiked ? likeCount + 1 : likeCount - 1;
      setLikeCount(newCount);
      onLikeChange?.(newCount, isNowLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${liked
          ? 'bg-red-500 text-white'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="material-symbols-outlined text-[20px]">
        {liked ? 'favorite' : 'favorite_border'}
      </span>
      <span className="font-medium">{likeCount}</span>
    </button>
  );
};

