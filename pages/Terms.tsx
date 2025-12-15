import React from 'react';

export const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white font-display mb-8">Terms of Service</h1>
      
      <div className="prose prose-lg dark:prose-invert prose-slate">
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Last updated: October 25, 2023
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using TechBlog Future, you accept and agree to be bound by the terms and provision of this agreement. 
            In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Intellectual Property</h2>
          <p>
            The Site and its original content, features and functionality are and will remain the exclusive property of TechBlog Future and its licensors. 
            The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. User Contributions</h2>
          <p>
            Users may post comments and other content as long as the content is not illegal, obscene, threatening, defamatory, invasive of privacy, 
            infringing of intellectual property rights, or otherwise injurious to third parties or objectionable.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Termination</h2>
          <p>
            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, 
            including without limitation if you breach the Terms.
          </p>
        </section>
        
         <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of United States, without regard to its conflict of law provisions.
          </p>
        </section>
      </div>
    </div>
  );
};