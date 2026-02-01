'use client'

import { Search, Phone, Menu, X, User, LogOut, Coffee, ChevronRight, HelpCircle, Shield, FileText, Mail } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
            <header className="sticky top-0 z-50 bg-white shadow-sm">
                {/* Top Bar */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-apple-border">
                    <Link href="/" className="text-xl font-bold tracking-tight text-apple-blue">
                        Luyện thi CCXD
                    </Link>

                    <div className="flex items-center gap-2">
                        <a href="tel:0989256894" className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-2 rounded-full text-[10px] font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                            <Phone className="w-3.5 h-3.5" />
                            0989.256.894
                        </a>
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2.5 hover:bg-apple-bg rounded-xl transition-colors active:scale-95"
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
                    <div className="relative w-[300px] h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        {/* Menu Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <span className="font-bold text-lg text-gray-900">Menu</span>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                            <MenuItem href="/gioi-thieu" icon={HelpCircle} label="Giới thiệu" onClick={() => setIsMenuOpen(false)} />
                            <MenuItem href="/chinh-sach-bao-mat" icon={Shield} label="Chính sách bảo mật" onClick={() => setIsMenuOpen(false)} />
                            <MenuItem href="/dieu-khoan-su-dung" icon={FileText} label="Điều khoản sử dụng" onClick={() => setIsMenuOpen(false)} />
                            <MenuItem href="/lien-he" icon={Mail} label="Liên hệ" onClick={() => setIsMenuOpen(false)} />
                        </div>

                        {/* Auth Section */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-gray-900 truncate">{user.email}</div>
                                            <div className="text-xs text-gray-500">Thành viên</div>
                                        </div>
                                    </div>

                                    <Link
                                        href="/buy-me-coffee"
                                        className="flex items-center gap-3 w-full p-3 text-sm font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Coffee className="w-5 h-5" />
                                        Buy me a coffee
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full p-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Đăng xuất
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-2 w-full p-3 bg-[#007AFF] text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
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
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
        >
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
        </Link>
    )
}
