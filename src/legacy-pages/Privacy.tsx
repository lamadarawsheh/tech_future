import React from 'react';
import { useTranslation } from 'react-i18next';

export const Privacy: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white font-display mb-8">{t('privacy.title')}</h1>

      <div className="prose prose-lg dark:prose-invert prose-slate">
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {t('privacy.updated')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('privacy.intro.title')}</h2>
          <p>
            {t('privacy.intro.text')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('privacy.collect.title')}</h2>
          <p>
            {t('privacy.collect.text')}
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600 dark:text-slate-400">
            <li><strong>{t('privacy.collect.identity')}</strong> {t('privacy.collect.identityDesc')}</li>
            <li><strong>{t('privacy.collect.contact')}</strong> {t('privacy.collect.contactDesc')}</li>
            <li><strong>{t('privacy.collect.technical')}</strong> {t('privacy.collect.technicalDesc')}</li>
            <li><strong>{t('privacy.collect.usage')}</strong> {t('privacy.collect.usageDesc')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('privacy.use.title')}</h2>
          <p>
            {t('privacy.use.text')}
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600 dark:text-slate-400">
            <li>{t('privacy.use.list1')}</li>
            <li>{t('privacy.use.list2')}</li>
            <li>{t('privacy.use.list3')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('privacy.contact.title')}</h2>
          <p>
            {t('privacy.contact.text')}
            <a href="mailto:privacy@techblogfuture.com" className="text-primary hover:underline ml-1">privacy@techblogfuture.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};