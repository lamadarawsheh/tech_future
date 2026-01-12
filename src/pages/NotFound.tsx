// pages/NotFound.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">404</h1>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('notFound.title')}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('notFound.message')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
          >
            ← {t('notFound.goBack')}
          </button>
          <Link
            to="/"
            className="px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            {t('notFound.goHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};