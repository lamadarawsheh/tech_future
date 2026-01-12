import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createSubscriber, getSubscriberByEmail } from '../services/sanity';
import { Subscriber } from '../types';

interface SubscribeFormProps {
  onSubscribed?: (subscriber: Subscriber) => void;
  variant?: 'default' | 'compact' | 'inline';
}

export const SubscribeForm: React.FC<SubscribeFormProps> = ({
  onSubscribed,
  variant = 'default',
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError(t('subscribe.errors.emailRequired'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if already subscribed
      const existing = await getSubscriberByEmail(email);

      if (existing) {
        if (existing.isSubscribed) {
          setError(t('subscribe.errors.alreadySubscribed'));
        } else {
          onSubscribed?.(existing);
          setSuccess(true);
        }
      } else {
        // Create new subscriber
        const subscriber = await createSubscriber(name || 'Anonymous', email);
        if (subscriber) {
          onSubscribed?.(subscriber);
          setSuccess(true);
        } else {
          setError(t('subscribe.errors.failed'));
        }
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError(t('subscribe.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`${variant === 'compact' ? 'p-4' : 'p-6'} bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800`}>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-green-500 text-2xl">check_circle</span>
          <div>
            <h4 className="font-bold text-green-800 dark:text-green-300">{t('subscribe.success.title')}</h4>
            <p className="text-sm text-green-600 dark:text-green-400">
              {t('subscribe.success.desc')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('subscribe.emailPlaceholder')}
          className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? '...' : t('subscribe.button')}
        </button>
      </form>
    );
  }

  return (
    <div className={`${variant === 'compact' ? 'p-4' : 'p-6 md:p-8'} bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-700`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <span className="material-symbols-outlined text-primary">mail</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          {t('subscribe.title')}
        </h3>
      </div>

      <p className="text-slate-600 dark:text-slate-300 mb-6">
        {t('subscribe.desc')}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t('subscribe.name')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('subscribe.namePlaceholder')}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t('subscribe.email')} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('subscribe.emailPlaceholder')}
            required
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              {t('subscribe.subscribing')}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
              {t('subscribe.button')}
            </>
          )}
        </button>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          {t('subscribe.disclaimer')}
        </p>
      </form>

      {/* Benefits */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          {t('subscribe.benefits')}
        </p>
        <ul className="space-y-2">
          {[
            t('subscribe.list.newsletter'),
            t('subscribe.list.like'),
            t('subscribe.list.access'),
            t('subscribe.list.community')
          ].map((benefit, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="material-symbols-outlined text-green-500 text-[16px]">check_circle</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

