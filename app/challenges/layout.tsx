import type { Metadata } from "next";
import { AcademyHeader, AcademyFooter } from "../../src/components/AcademyLayout";

export const metadata: Metadata = {
    title: "Learning Paths | Bot & Beam Academy",
    description: "Structured coding courses and challenges",
    icons: {
        icon: "data:image/svg+xml,<svg width='64' height='64' viewBox='25 0 50 62' fill='none' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='academyLogoGradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%2310b981'></stop><stop offset='100%25' stop-color='%2306b6d4'></stop></linearGradient></defs><path d='M50 10 L70 22.5 L70 47.5 L50 60 L30 47.5 L30 22.5 Z' fill='url(%23academyLogoGradient)' stroke='%2306b6d4' stroke-width='0.5' opacity='0.9'></path><circle cx='42' cy='35' r='4' fill='white' opacity='0.95'></circle><circle cx='58' cy='35' r='4' fill='white' opacity='0.95'></circle><path d='M50 10 L50 2' stroke='url(%23academyLogoGradient)' stroke-width='2.5' stroke-linecap='round'></path><circle cx='50' cy='2' r='2.5' fill='url(%23academyLogoGradient)'></circle><g opacity='0.4' stroke='white' stroke-width='1.5' fill='none'><path d='M35 30 L38 30 L38 27'></path><path d='M62 30 L65 30 L65 27'></path><circle cx='38' cy='27' r='1.5' fill='white'></circle><circle cx='65' cy='27' r='1.5' fill='white'></circle></g><rect x='45' y='40' width='10' height='8' rx='1' fill='white' opacity='0.3'></rect><circle cx='50' cy='44' r='2' fill='url(%23academyLogoGradient)'></circle></svg>",
    },
};

export default function ChallengesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-950 animate-fade-in">
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 animate-gradient"></div>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
            </div>

            <AcademyHeader />
            <main className="flex-grow animate-slide-up">
                {children}
            </main>
            <AcademyFooter />
        </div>
    );
}
