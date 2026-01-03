import { useEffect } from 'react';

export const useViewTracking = (postId: string) => {
  useEffect(() => {
    if (!postId) return;

    const trackView = async () => {
      try {
        await fetch('/api/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId }),
        });
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();
  }, [postId]);
};
