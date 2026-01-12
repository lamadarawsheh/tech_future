import React from 'react';
import { useTranslation } from 'react-i18next';

export const Terms: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white font-display mb-8">{t('terms.title')}</h1>

      <div className="prose prose-lg dark:prose-invert prose-slate">
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {t('terms.updated')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('terms.acceptance.title')}</h2>
          <p>
            {t('terms.acceptance.text')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('terms.ip.title')}</h2>
          <p>
            {t('terms.ip.text')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('terms.contributions.title')}</h2>
          <p>
            {t('terms.contributions.text')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('terms.termination.title')}</h2>
          <p>
            {t('terms.termination.text')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('terms.law.title')}</h2>
          <p>
            {t('terms.law.text')}
          </p>
        </section>
      </div>
    </div>
  );
};