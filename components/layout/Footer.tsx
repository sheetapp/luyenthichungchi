'use client'

import React, { useState, useEffect } from 'react' // Added React import
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/contexts/SidebarContext'
import { AppFeedbackModal } from '@/components/feedback/AppFeedbackModal' // Verify path
import { GuideModal } from '@/components/practice/GuideModal' // Verify path
import { supabase } from '@/lib/supabase/client'
import { MessageSquare, BookOpen, Shield, FileText, Info, HelpCircle } from 'lucide-react'

export function Footer() {
    const { collapsed } = useSidebar()
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
    const [isGuideOpen, setIsGuideOpen] = useState(false)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    // Footer Links Data
    const links = [
        { label: 'Giới thiệu', href: '/gioi-thieu', icon: Info },
        { label: 'Chính sách bảo mật', href: '/chinh-sach-bao-mat', icon: Shield },
        { label: 'Điều khoản sử dụng', href: '/dieu-khoan-su-dung', icon: FileText },
        { label: 'Liên hệ', href: '/lien-he', icon: MessageSquare },
        { label: 'Tài liệu', href: '/tai-lieu', icon: BookOpen },
    ]

    return (
        <>
            <footer className={`hidden md:flex flex-row py-4 px-8 border-t border-white/5 bg-[#1d1d1f]/90 backdrop-blur-md text-[#a1a1a6] transition-all duration-300 items-center justify-between fixed bottom-0 right-0 z-40 ${collapsed ? 'left-20' : 'left-72'}`}>
                {/* Copyright */}
                <div className="text-[11px] font-medium flex-shrink-0">
                    <span className="opacity-80">© {new Date().getFullYear()} Luyện thi CCXD.</span>
                </div>

                {/* Navigation Links */}
                <nav className="flex items-center gap-6">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-[11px] hover:text-white transition-colors flex items-center gap-1.5 ${pathname === link.href ? 'font-bold text-white' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <button
                        onClick={() => setIsGuideOpen(true)}
                        className="text-[11px] hover:text-white transition-colors flex items-center gap-1.5 font-medium group"
                    >
                        <HelpCircle className="w-3 h-3 group-hover:scale-110 transition-transform" />
                        Hướng dẫn
                    </button>
                    <div className="h-3 w-px bg-white/10" />
                    <button
                        onClick={() => setIsFeedbackOpen(true)}
                        className="text-[11px] hover:text-[#FF3B30] transition-colors flex items-center gap-1.5 font-medium group"
                    >
                        <MessageSquare className="w-3 h-3 group-hover:scale-110 transition-transform" />
                        Báo lỗi
                    </button>
                </div>
            </footer>

            {/* Global Modals */}
            <AppFeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
                user={user}
            />
            <GuideModal
                isOpen={isGuideOpen}
                onClose={() => setIsGuideOpen(false)}
                type="practice" // Default to practice guide from footer
            />
        </>
    )
}
