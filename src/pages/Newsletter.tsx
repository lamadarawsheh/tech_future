import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';

export const Newsletter: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, subscriber } = useAuth();
  const isAuthenticated = !!user && !!subscriber;

  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <section className="@container">
        <div className="flex flex-col-reverse gap-10 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex flex-col gap-6 lg:w-1/2 justify-center">
            <div className="flex flex-col gap-4 text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-[-0.033em] bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent font-display">
                  The Future of Tech, Delivered to Your Inbox.
              </h1>
              <h2 className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed max-w-xl">
                  Join 15,000+ developers receiving our weekly deep dives into code, design, and architecture. Stay ahead of the curve.
              </h2>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-[520px]">
              {isAuthenticated ? (
                // Already subscribed state
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-green-500 text-2xl">check_circle</span>
                    </div>
                    <div>
                      <p className="font-bold text-green-800 dark:text-green-300">You're subscribed!</p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Signed in as {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Subscribe form
                <div className="group flex flex-col sm:flex-row w-full gap-2 sm:gap-0 sm:items-stretch sm:rounded-lg sm:bg-white sm:dark:bg-slate-800 sm:p-1 sm:shadow-lg sm:border sm:border-slate-200 sm:dark:border-transparent transition-all focus-within:ring-2 focus-within:ring-primary/50">
                <div className="flex items-center pl-3 text-slate-400 dark:text-slate-500 sm:bg-transparent">
                  <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div className="flex-1 bg-white dark:bg-slate-800 sm:bg-transparent border border-slate-300 dark:border-slate-800 sm:border-none text-slate-500 dark:text-slate-400 h-12 px-3 rounded-lg sm:rounded-none flex items-center text-base">
                    Click to subscribe with email
                  </div>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-primary hover:bg-primary-dark text-white font-bold h-12 px-6 rounded-lg transition-all transform active:scale-95 shadow-md shadow-primary/20 whitespace-nowrap flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">magic_button</span>
                    Subscribe Now
                  </button>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                <div className="flex -space-x-3 overflow-hidden p-1">
                  {[
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuCkFkjeqjmu7N9xxC-EqoRGUTTeVZVXm3S7o5axB9WtP0exJncdPifEgzVEzFKcEr5e-i92VjO6MTyZoaSC_B2YfbUfjOZVwnEyY0dvzUoVc3NguvCXHfgGF41KHDvLsryRpTli3tWhkjgANXJMhhIN_NhOLToj11qCT57vHMQxgwQqgwwKA8z3mm6uiutcq3FlZDgCpdj09bK9VqWEndT1bnLuyszX7lta_ElI9LYXU-gX5hGw_7Bgprct2sNNJF4fQYx4R2HxVfI",
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuDUZJcyTxCleWjZ0Gf94za_KZgRfRez5FAtsEa38dtpEPmToEEjIiT5HBtAWIPfnSNuCyC5d_cepX8uHDf7PceyTeJYWaEVU5dYJlJSfJXZ5PJ0bIV-BcvadX2UeI4pE2Tqhd8Vx8OTPwnfxIde_dz9RoMw5JlJbylyfjH6TRkZ4tJNQdeDjYiMWy_vbM3V6CUjRKPQM9obpqeU_mmvjM37BMu6ATPADFyKhZxWIlYc02GMM1-wh36FXUBSdRr4duqV-RThEX564Mw",
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuDlnqYafxrSfSOwRzW0v3CLsntB0-6r5ngiZX_WpJjwX4XNYMPC2vra_Aow5_BmGu8vg-YUaMKFT2w_h9YOuI_wmz-Y5a5tr0fFOIbmI6OKnwaYerSBsRM6QE2ZPJWZpG9DNhlShAmBQYMgE2SisZpsAp6eBi8qTlyJYUCfQOT3y0iGtcyELL-O-18FzhYxHC-HV6z0AfBAuKxhLMMu5BKYy-NrEaqqWxJM0W6iDVWE7UNsr24_n-PkXbx39gv41FCX6XyxB-NuEdY"
                  ].map((src, i) => (
                    <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-cover bg-center" style={{backgroundImage: `url('${src}')`}}></div>
                  ))}
                  <div className="inline-flex h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 items-center justify-center text-[10px] font-bold text-slate-600 dark:text-white border border-slate-200 dark:border-transparent">
                     +2k
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal max-w-xs">
                   Trusted by engineers at Google, Meta, and Stripe. No spam, ever.
                </p>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-full aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="absolute inset-0 opacity-40" style={{backgroundImage: "radial-gradient(#3c4653 1px, transparent 1px)", backgroundSize: "20px 20px"}}></div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80"></div>
              <div className="relative h-full flex flex-col justify-end p-8">
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-lg transform transition-transform hover:-translate-y-1 duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">Latest Issue</span>
                    <span className="text-white/60 text-xs">Oct 24, 2023</span>
                  </div>
                  <h3 className="text-white text-xl md:text-2xl font-bold mb-2">React Server Components: The Complete Guide</h3>
                  <p className="text-white/70 text-sm line-clamp-2">Deep dive into how RSCs change the paradigm of data fetching and component rendering in modern web applications...</p>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                 <svg height="200" viewBox="0 0 200 200" width="200" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.4,82.2,23.1,70.9,34.8C59.6,46.5,48.3,56.2,35.8,63.5C23.3,70.8,9.6,75.7,-3.1,81.1C-15.8,86.5,-27.5,92.4,-38.3,87.6C-49.1,82.8,-59,67.3,-67.6,52.8C-76.2,38.3,-83.5,24.8,-83.6,11.2C-83.7,-2.4,-76.6,-16.1,-67.5,-28.1C-58.4,-40.1,-47.3,-50.4,-35.3,-58.5C-23.3,-66.6,-10.4,-72.5,3.3,-78.2C17,-83.9,30.5,-83.6,44.7,-76.4Z" fill="#6366f1" transform="translate(100 100)"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-slate-200 dark:bg-slate-800"></div>

      {/* Archive Section */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">What you missed last week</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Catch up on our most popular newsletters.</p>
          </div>
          <Link to="/archive" className="text-primary hover:text-primary/80 text-sm font-bold flex items-center gap-1 group">
             View Archive 
             <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
              { cat: 'Design', title: 'UI Trends for 2024: The Return of Skelluomorphism?', time: '5 min read', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmxDGK8_w_54lAlzWV0EyyQGBSI_4am99CJmFNc146DlAyIoww8PHSl-_hp-ChDvyuIYb5hcd7VQOcK0R4vBGGNdnQdyCC9XU7mz4wjCI6E0WrFdqB0iywz7cWyEdS7OMTujn8BtH7qG9saCLTXOEXXhX-x-v5Agn9szqYv1GXpXMhqnEllDxvQ5gSLMeZO98YHjo6i9uXe6TVu_drvoRpyPlNEzr0EoCSRLwZyPURBey0XTtiY7PtwT5dS8U67kP1IHabS_EpjfM' },
              { cat: 'Engineering', title: 'Optimizing Database Queries for Scale', time: '8 min read', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPGPNWMZltcztqbuqlgvQz-3T3545xyRbU5S2Dzc3UF2BnNwE8Zg-8l1rSxY3St4TxZRr6nqdwr6iz6rfssOMnHyluXwQnBE2mzwiAO6P0QiKbcOKTcX0Pw3c98Qn8yyFHDccp5ZYOstYDUmUKfQcQAqXEvWy1myTTa6j67iSXuFYYMjujVXsfuQPLJS0uoe0M15ounTsXikpo_ZTujT3rv2B5IlKyzwOOV9Y8wi3tkEIUB7kgT-ZkdiTQdV_WBTDC_a0WX7vYKII' },
              { cat: 'Security', title: 'The State of Zero Trust Architecture', time: '4 min read', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpfoAOYIRpszSPVfuLUOo2DVjjBXWglhB7021PbRTYeFeC6H10UKAx1Cyug9iUwZklX_-baEMAY5EcoYRECTOv6qxpaLjD52gUhJxMJlrOoNt1Xz14OwKWTOesbJ5_d9Lq2JMW7qR_eQD5EhEn67WBqZh1gdzmwM8OufhfIbjf8evNM9uvOns-cGIoAzI77uRrAnA0JfagsBOY7Vx86s5yRCqMP-J3q6QHA7iTXemBgUIQhxVXiVFr3r48vii1AiFNOep-bQ5DiXM' }
          ].map((item, i) => (
            <article key={i} className="flex flex-col gap-4 group cursor-pointer">
              <div className="aspect-video w-full rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 transition-transform duration-500 group-hover:scale-105 bg-cover bg-center" style={{backgroundImage: `url('${item.img}')`}}></div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">{item.cat}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                </div>
                <h4 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors text-slate-900 dark:text-white font-display">
                    {item.title}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};
