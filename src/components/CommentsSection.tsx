import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { getCommentsByPost, createComment } from '../services/sanity';
import { useAuth } from '../contexts/AuthContext';
import { Comment } from '../types';

interface CommentsSectionProps {
  postId: string;
  allowComments: boolean;
  subscriberId?: string | null;
  isSubscribed?: boolean;
  onCommentAdded?: (newCount: number) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  postId,
  allowComments,
  subscriberId,
  isSubscribed = false,
  onCommentAdded,
}) => {
  const { t } = useTranslation();
  const { subscriber: currentSubscriber } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      const data = await getCommentsByPost(postId);
      setComments(data);
      setLoading(false);
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subscriberId || !isSubscribed) {
      alert(t('comments.alerts.signIn'));
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = await createComment(postId, subscriberId, newComment, replyTo || undefined);
      if (comment) {
        // Construct comment with full subscriber data for immediate display
        const commentWithSubscriber: Comment = {
          ...comment,
          subscriber: currentSubscriber ? {
            _id: currentSubscriber._id,
            _type: 'subscriber',
            name: currentSubscriber.name,
            email: currentSubscriber.email,
            avatar: currentSubscriber.avatar,
            avatarUrl: currentSubscriber.avatarUrl,
            isSubscribed: currentSubscriber.isSubscribed,
            createdAt: currentSubscriber.createdAt,
            subscriptionTier: currentSubscriber.subscriptionTier,
          } : comment.subscriber,
        };
        // Add to local state immediately - comments show instantly (no approval needed)
        setComments(prev => [commentWithSubscriber, ...prev]); // Add to top of list
        onCommentAdded?.(comments.length + 1);
        setNewComment('');
        setReplyTo(null);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      alert(t('comments.alerts.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  // Get tier badge color
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
      case 'basic':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
    }
  };

  if (!allowComments) {
    return (
      <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center">
        <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">comments_disabled</span>
        <p className="text-slate-500 dark:text-slate-400">{t('comments.disabled')}</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-primary">chat</span>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
          {t('comments.title')} ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
          {replyTo && (
            <div className="flex items-center gap-2 mb-3 text-sm text-slate-500">
              <span>{t('comments.replyingTo')}</span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-red-500 hover:text-red-600"
              >
                {t('comments.cancel')}
              </button>
            </div>
          )}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isSubscribed ? t('comments.placeholder') : t('comments.signInPlaceholder')}
            disabled={!isSubscribed || submitting}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={3}
          />
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-slate-500">
              {isSubscribed ? t('comments.immediate') : t('comments.signInJoin')}
            </p>
            <button
              type="submit"
              disabled={!isSubscribed || submitting || !newComment.trim()}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  {t('comments.posting')}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  {t('comments.post')}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/30 rounded-xl">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">forum</span>
          <p className="text-slate-500 dark:text-slate-400">{t('comments.empty')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className={`p-4 rounded-xl ${comment.featured
                ? 'bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20'
                : 'bg-slate-50 dark:bg-slate-900/30'
                }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {comment.subscriber?.avatar || comment.subscriber?.avatarUrl ? (
                    <img
                      src={comment.subscriber.avatarUrl || (typeof comment.subscriber.avatar === 'string' ? comment.subscriber.avatar : comment.subscriber.avatar?.asset?.url) || ''}
                      alt={comment.subscriber.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">
                        {comment.subscriber?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {comment.subscriber?.name || t('comments.anonymous')}
                    </span>
                    {comment.subscriber?.subscriptionTier && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getTierBadge(comment.subscriber.subscriptionTier)}`}>
                        {comment.subscriber.subscriptionTier}
                      </span>
                    )}
                    {comment.featured && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        ⭐ {t('comments.featured')}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-2">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <time>
                      {format(new Date(comment.createdAt), 'MMM d, yyyy · h:mm a')}
                    </time>
                    {comment.editedAt && (
                      <span className="italic">{t('comments.edited')}</span>
                    )}
                    {isSubscribed && (
                      <button
                        onClick={() => setReplyTo(comment._id)}
                        className="text-primary hover:underline"
                      >
                        {t('comments.reply')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

