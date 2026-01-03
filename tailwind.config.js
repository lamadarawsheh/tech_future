/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#6366f1', // Indigo 500
                'primary-dark': '#4f46e5', // Indigo 600
                secondary: '#a855f7', // Purple 500
                'background-light': '#f8fafc', // Slate 50
                'background-dark': '#020617', // Slate 950
                'surface-light': '#ffffff',
                'surface-dark': '#0f172a', // Slate 900
                'surface-darker': '#0b1120',
                'border-light': '#e2e8f0',
                'border-dark': '#1e293b',
            },
            fontFamily: {
                display: ['Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
            animation: {
                shine: 'shine 1s',
                'text-shine': 'text-shine 3s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
            },
            keyframes: {
                shine: {
                    '100%': { left: '125%' },
                },
                'text-shine': {
                    '0%, 100%': { 'background-position': '0% center' },
                    '50%': { 'background-position': '200% center' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.8', transform: 'scale(1.05)' },
                },
            },
        },
    },
    plugins: [],
}
