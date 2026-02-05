'use client'

import { Search, Phone, Menu, X, User, LogOut, Coffee, ChevronRight, HelpCircle, Shield, FileText, Mail, Library } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme/ThemeContext'

const SEARCH_CATEGORIES = [
    'Thiết kế cơ - điện công trình - Hệ thống điện',
    'Giám sát công tác lắp đặt thiết bị công trình',
    'Giám sát công tác xây dựng công trình',
    'Khảo sát địa chất công trình',
    'Khảo sát địa hình',
    'Quản lý dự án đầu tư xây dựng',
    'Thiết kế quy hoạch xây dựng',
    'Định giá Xây dựng',
]

export function MobileHeader() {
    const [searchQuery, setSearchQuery] = useState('')
    const [showResults, setShowResults] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setIsMenuOpen(false)
        router.push('/login')
        router.refresh()
    }

    const filteredCategories = searchQuery.trim()
        ? SEARCH_CATEGORIES.filter(cat =>
            cat.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : []

    return (
        <>
            <header className="sticky top-0 z-50 bg-apple-bg/80 dark:bg-apple-card/80 backdrop-blur-md border-b border-apple-border">
                {/* Top Bar */}
                <div className="px-4 py-2.5 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-apple-blue">
                        <div className="w-10 h-10 bg-apple-blue rounded-xl flex items-center justify-center shadow-lg shadow-apple-blue/20 transition-transform active:scale-95">
                            <Library className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-lg font-black tracking-tighter text-apple-text">Luyện thi CCXD</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <a href="tel:0989256894" className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                            <Phone className="w-5 h-5" />
                        </a>
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2.5 hover:bg-apple-input-bg rounded-xl transition-colors active:scale-95"
                        >
                            <Menu className="w-6 h-6 text-apple-text" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Slide-over Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Menu Content */}
                    <div className="relative w-[300px] h-full bg-apple-bg shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-apple-border/50">
                        {/* Menu Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-apple-border">
                            <span className="font-bold text-lg text-apple-text">Menu</span>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 bg-apple-input-bg rounded-lg hover:border-apple-border transition-colors active:scale-95"
                            >
                                <X className="w-5 h-5 text-apple-text-secondary" />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                            <MenuItem href="/quan-tri" icon={Shield} label="Quản trị" onClick={() => setIsMenuOpen(false)} />
                            <MenuItem href="/gioi-thieu" icon={HelpCircle} label="Giới thiệu" onClick={() => setIsMenuOpen(false)} />
                            <MenuItem href="/chinh-sach-bao-mat" icon={Shield} label="Chính sách bảo mật" onClick={() => setIsMenuOpen(false)} />
                            <MenuItem href="/dieu-khoan-su-dung" icon={FileText} label="Điều khoản sử dụng" onClick={() => setIsMenuOpen(false)} />
                            <MenuItem href="/lien-he" icon={Mail} label="Liên hệ" onClick={() => setIsMenuOpen(false)} />
                        </div>

                        {/* Auth Section */}
                        <div className="p-4 border-t border-apple-border bg-apple-input-bg space-y-3">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 p-3 bg-apple-card border border-apple-border rounded-xl shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue font-bold border border-apple-blue/20">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-apple-text truncate">{user.email}</div>
                                            <div className="text-xs text-apple-text-secondary font-medium">Thành viên</div>
                                        </div>
                                    </div>

                                    <Link
                                        href="/buy-me-coffee"
                                        className="flex items-center gap-3 w-full p-3 text-sm font-bold text-pink-600 bg-pink-500/5 hover:bg-pink-500/10 rounded-xl transition-colors border border-pink-500/10"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Coffee className="w-5 h-5" />
                                        Buy me a coffee
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full p-3 text-sm font-bold text-red-500 hover:bg-red-500/5 rounded-xl transition-colors border border-transparent hover:border-red-500/10"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Đăng xuất
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-2 w-full p-3 bg-apple-blue text-white font-bold rounded-xl shadow-lg shadow-apple-blue/30 active:scale-95 transition-all"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <User className="w-5 h-5" />
                                    Đăng nhập
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

function MenuItem({ href, icon: Icon, label, onClick }: any) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-apple-input-bg transition-colors group border border-transparent hover:border-apple-border"
        >
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-apple-input-bg flex items-center justify-center text-apple-text-secondary group-hover:bg-apple-blue/10 group-hover:text-apple-blue transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-apple-text tracking-tight">{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-apple-text-secondary/30 group-hover:text-apple-blue transition-colors" />
        </Link>
    )
}
