'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, BookOpen, FileText, Trophy, User, Coffee, LayoutGrid, Database, ChevronLeft, ChevronRight, LogOut, LogIn, UserCircle } from 'lucide-react'
import { useSidebar } from '@/contexts/SidebarContext'
import { supabase } from '@/lib/supabase/client'

const navItems = [
    { icon: Home, label: 'Trang chủ', href: '/', requireAuth: false },
    { icon: BookOpen, label: 'Ôn tập', href: '/on-tap', requireAuth: true },
    { icon: FileText, label: 'Thi thử', href: '/thi-thu', requireAuth: true },
    { icon: Trophy, label: 'Xếp hạng', href: '/xep-hang', requireAuth: true },
    { icon: Database, label: 'Cơ sở dữ liệu', href: '/database', requireAuth: false },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const { collapsed, toggleCollapsed } = useSidebar()

    useEffect(() => {
        setMounted(true)

        // Get initial user
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setProfile(profileData)
            }
        }
        getUser()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()
                    .then(({ data }) => setProfile(data))
            } else {
                setProfile(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (!mounted) return (
        <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-slate-900" />
    )

    return (
        <aside className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-slate-900 text-white shadow-2xl z-50 transition-all duration-300 ${collapsed ? 'md:w-20' : 'md:w-72'}`}>
            {/* Logo */}
            <div className="flex items-center justify-between h-24 px-6 border-b border-slate-800">
                {!collapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <LayoutGrid className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-black tracking-tight leading-tight text-white">
                            CCHN <span className="text-blue-400">Xây dựng</span>
                        </h1>
                    </div>
                )}
                <button
                    onClick={toggleCollapsed}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <ChevronLeft className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* User Profile Section */}
            {!collapsed && user && (
                <Link href="/tai-khoan" className="block px-6 py-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0">
                            {profile?.avata ? (
                                <img src={profile.avata} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <UserCircle className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                                {profile?.display_name || user.email?.split('@')[0]}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                </Link>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                {!collapsed && (
                    <div className="px-4 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Menu chính</div>
                )}
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex items-center ${collapsed ? 'justify-center' : ''} px-4 py-3.5 rounded-2xl transition-all duration-200 group
                                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }
                            `}
                            title={collapsed ? item.label : ''}
                        >
                            <Icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            {!collapsed && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div className="p-6 border-t border-slate-800">
                    {/* Auth Button */}
                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 p-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500/20 transition-all border border-red-500/20 mb-6 group"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-wider">Đăng xuất</span>
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="w-full flex items-center gap-3 p-4 bg-blue-500/10 text-blue-400 rounded-2xl hover:bg-blue-500/20 transition-all border border-blue-500/20 mb-6 group"
                        >
                            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-wider">Đăng nhập</span>
                        </Link>
                    )}


                    <p className="text-[10px] text-slate-500 font-medium px-2">
                        Nghị định 175/2024/NĐ-CP
                        <br />
                        © 2026 Admin CCHN
                    </p>
                </div>
            )}
        </aside>
    )
}

