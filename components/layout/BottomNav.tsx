'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Coffee, FileText, User } from 'lucide-react'

const navItems = [
    { icon: Home, label: 'Trang chủ', href: '/' },
    { icon: BookOpen, label: 'Ôn tập', href: '/on-tap' },
    { icon: Coffee, label: 'Coffee', href: '/buy-me-coffee' },
    { icon: FileText, label: 'Thi thử', href: '/thi-thu' },
    { icon: User, label: 'Cá nhân', href: '/tai-khoan' },
]

export function BottomNav() {
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200">
            <div className="flex justify-around items-center h-16 safe-area-bottom">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center flex-1 py-2 transition-all active:scale-95"
                        >
                            <Icon className={`w-6 h-6 mb-0.5 ${isActive ? 'text-emerald-500 stroke-[2.5px]' : 'text-slate-400 stroke-2'}`} />
                            <span className={`text-[11px] font-semibold ${isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
