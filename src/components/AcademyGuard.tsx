'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from '../../app/components/Link';

export function AcademyGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm font-medium animate-pulse">Initializing Academy...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/20 border border-slate-800">
                        <span className="material-symbols-outlined text-4xl text-emerald-500">lock</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-3 font-display">Academy Access Restricted</h1>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Join Bot & Beam Academy to access premium coding challenges, learning paths, and global leaderboards.
                    </p>

                    <div className="space-y-4">
                        <Link
                            to="/"
                            className="block w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                        >
                            Return to Home to Sign In
                        </Link>
                        <p className="text-xs text-slate-500">
                            Authentication is managed via the main portal for security.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
