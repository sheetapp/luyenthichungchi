/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2563eb',
                    dark: '#1d4ed8',
                    light: '#60a5fa',
                },
                accent: {
                    DEFAULT: '#ef4444',
                    dark: '#dc2626',
                    light: '#f87171',
                },
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
