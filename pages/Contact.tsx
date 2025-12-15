import React, { useState } from 'react';

export const Contact: React.FC = () => {
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
            <span className="text-primary font-bold uppercase tracking-wider text-sm mb-2 block">Get in touch</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white font-display leading-tight">
               Let's build something <br/> extraordinary together.
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-6 text-lg leading-relaxed">
               Have a question about a recent article? Want to partner with us? Or just want to say hi? We'd love to hear from you.
            </p>
         </div>

         <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm">
               <div className="size-12 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined">mail</span>
               </div>
               <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Chat to us</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Our friendly team is here to help.</p>
                  <a href="mailto:hello@techblogfuture.com" className="text-primary font-semibold hover:underline">hello@techblogfuture.com</a>
               </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm">
               <div className="size-12 rounded-full bg-purple-50 dark:bg-slate-800 flex items-center justify-center text-secondary flex-shrink-0">
                  <span className="material-symbols-outlined">location_on</span>
               </div>
               <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Visit us</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Come say hello at our office HQ.</p>
                  <span className="text-slate-600 dark:text-slate-300 text-sm">100 Innovation Drive, Tech City, TC 94043</span>
               </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm">
               <div className="size-12 rounded-full bg-green-50 dark:bg-slate-800 flex items-center justify-center text-green-500 flex-shrink-0">
                  <span className="material-symbols-outlined">call</span>
               </div>
               <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Call us</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Mon-Fri from 8am to 5pm.</p>
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
                  <label htmlFor="firstName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">First Name</label>
                  <input 
                     type="text" 
                     id="firstName" 
                     required
                     placeholder="Jane" 
                     className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 transition-all"
                  />
               </div>
               <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Last Name</label>
                  <input 
                     type="text" 
                     id="lastName" 
                     required
                     placeholder="Doe" 
                     className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 transition-all"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
               <input 
                  type="email" 
                  id="email" 
                  required
                  placeholder="jane@example.com" 
                  className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 transition-all"
               />
            </div>

             <div className="space-y-2">
               <label htmlFor="subject" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject</label>
               <select 
                  id="subject" 
                  className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 transition-all"
               >
                  <option>General Inquiry</option>
                  <option>Editorial Feedback</option>
                  <option>Partnership Proposal</option>
                  <option>Technical Issue</option>
               </select>
            </div>

            <div className="space-y-2">
               <label htmlFor="message" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Message</label>
               <textarea 
                  id="message" 
                  required
                  rows={4}
                  placeholder="Leave us a message..." 
                  className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 transition-all"
               ></textarea>
            </div>

            <div className="pt-2">
               <button type="submit" className="w-full rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all active:scale-[0.98]">
                  {submitted ? "Message Sent!" : "Send Message"}
               </button>
               {submitted && <p className="text-center text-green-500 font-bold mt-2 animate-fadeIn">We'll get back to you soon.</p>}
            </div>
         </form>
      </div>
    </div>
  );
};