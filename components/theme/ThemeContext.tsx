'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
        if (savedTheme) {
            setTheme(savedTheme)
            document.documentElement.classList.toggle('dark', savedTheme === 'dark')
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // Optional: Default to system preference
            // setTheme('dark')
            // document.documentElement.classList.add('dark')
        }
    }, [])

    return (
        <>
            {children}
        </>
    )
}

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'))
    }, [])

    const toggleTheme = () => {
        const newTheme = !isDark ? 'dark' : 'light'
        setIsDark(!isDark)
        document.documentElement.classList.toggle('dark')
        localStorage.setItem('theme', newTheme)
    }

    return (
        <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-[12px] bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-apple-text hover:bg-white/90 dark:hover:bg-white/20 transition-all shadow-sm active:scale-95 group"
            title={isDark ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
        >
            {isDark ? (
                <Sun className="w-5 h-5 transition-transform group-hover:rotate-45" />
            ) : (
                <Moon className="w-5 h-5 transition-transform group-hover:-rotate-12" />
            )}
        </button>
    )
}
