import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signInError } = await signInWithEmail(email);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSent(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Content */}
        <div className="p-8">
          {sent ? (
            // Success state
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-green-500">mark_email_read</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 font-display">
                Check your email!
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-2">
                We sent a magic link to
              </p>
              <p className="font-semibold text-primary mb-6">{email}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Click the link in the email to sign in. Check your spam folder if you don't see it.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 px-6 py-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              >
                Close this window
              </button>
            </div>
          ) : (
            // Form state
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-white">person</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
                  Sign in to continue
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  Enter your email to receive a magic link
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {error}
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Sending link...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">magic_button</span>
                      Send Magic Link
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                  By signing in, you'll be able to:
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    { icon: 'favorite', text: 'Like your favorite articles' },
                    { icon: 'chat', text: 'Join the conversation with comments' },
                    { icon: 'notifications', text: 'Get notified about new content' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span className="material-symbols-outlined text-primary text-[18px]">{item.icon}</span>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

