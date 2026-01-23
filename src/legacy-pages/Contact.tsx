import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const Contact: React.FC = () => {
   const { t } = useTranslation();
   const [submitted, setSubmitted] = useState(false);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);
      // Reset after a delay
      setTimeout(() => setSubmitted(false), 5000);
   }

   return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start pb-12">

         {/* Contact Info Side */}
         <div className="space-y-10 lg:sticky lg:top-32">
            <div>
               <span className="text-primary font-bold uppercase tracking-wider text-sm mb-2 block">{t('contact.label')}</span>
               <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white font-display leading-tight">
                  {t('contact.title')}
               </h1>
               <p className="text-slate-600 dark:text-slate-400 mt-6 text-lg leading-relaxed">
                  {t('contact.description')}
               </p>
            </div>

            <div className="space-y-6">
               <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="size-12 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-primary flex-shrink-0">
                     <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                     <h3 className="font-bold text-slate-900 dark:text-white">{t('contact.chat.title')}</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('contact.chat.desc')}</p>
                     <a href="mailto:hello@techblogfuture.com" className="text-primary font-semibold hover:underline">hello@techblogfuture.com</a>
                  </div>
               </div>

               <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="size-12 rounded-full bg-purple-50 dark:bg-slate-800 flex items-center justify-center text-secondary flex-shrink-0">
                     <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                     <h3 className="font-bold text-slate-900 dark:text-white">{t('contact.visit.title')}</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('contact.visit.desc')}</p>
                     <span className="text-slate-600 dark:text-slate-300 text-sm">100 Innovation Drive, Tech City, TC 94043</span>
                  </div>
               </div>

               <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="size-12 rounded-full bg-green-50 dark:bg-slate-800 flex items-center justify-center text-green-500 flex-shrink-0">
                     <span className="material-symbols-outlined">call</span>
                  </div>
                  <div>
                     <h3 className="font-bold text-slate-900 dark:text-white">{t('contact.call.title')}</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('contact.call.desc')}</p>
                     <span className="text-slate-600 dark:text-slate-300 text-sm">+1 (555) 000-0000</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Form Side */}
         <div className="bg-white dark:bg-surface-dark p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none">
            <form className="space-y-6" onSubmit={handleSubmit}>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label htmlFor="firstName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('contact.form.firstName')}</label>
                     <input
                        type="text"
                        id="firstName"
                        required
                        placeholder={t('contact.form.placeholder.firstName')}
                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 transition-all"
                     />
                  </div>
                  <div className="space-y-2">
                     <label htmlFor="lastName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('contact.form.lastName')}</label>
                     <input
                        type="text"
                        id="lastName"
                        required
                        placeholder={t('contact.form.placeholder.lastName')}
                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 transition-all"
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('contact.form.email')}</label>
                  <input
                     type="email"
                     id="email"
                     required
                     placeholder={t('contact.form.placeholder.email')}
                     className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 transition-all"
                  />
               </div>

               <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('contact.form.subject')}</label>
                  <select
                     id="subject"
                     className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 transition-all"
                  >
                     <option>{t('contact.form.options.general')}</option>
                     <option>{t('contact.form.options.editorial')}</option>
                     <option>{t('contact.form.options.partnership')}</option>
                     <option>{t('contact.form.options.technical')}</option>
                  </select>
               </div>

               <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('contact.form.message')}</label>
                  <textarea
                     id="message"
                     required
                     rows={4}
                     placeholder={t('contact.form.placeholder.message')}
                     className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 transition-all"
                  ></textarea>
               </div>

               <div className="pt-2">
                  <button type="submit" className="w-full rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all active:scale-[0.98]">
                     {submitted ? t('contact.form.submitted') : t('contact.form.submit')}
                  </button>
                  {submitted && <p className="text-center text-green-500 font-bold mt-2 animate-fadeIn">{t('contact.form.success')}</p>}
               </div>
            </form>
         </div>
      </div>
   );
};