'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { AuthWall } from '@/components/auth/AuthWall'
import {
    Trophy, Medal, TrendingUp, Users, Star, Lock,
    Award, Target, Flame, ChevronRight, User, CheckCircle,
    Calendar, Filter, RefreshCcw, LayoutGrid
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/components/theme/ThemeContext'

type RankItem = {
    id: string
    display_name: string
    avatar_url: string
    avg_score: number
    total_exams: number
    rank: number
    isCurrentUser?: boolean
}

export default function XepHangPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [rankings, setRankings] = useState<RankItem[]>([])
    const [activeTab, setActiveTab] = useState<'all' | 'monthly' | 'weekly'>('all')

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                await fetchRankings(user.id)
            }

            setLoading(false)
        }
        loadInitialData()
    }, [])

    const fetchRankings = async (currentUserId: string) => {
        try {
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, display_name, avata, stats')
                .order('stats->highest_score', { ascending: false })
                .limit(20)

            if (error) throw error

            const formattedRankings: RankItem[] = (profiles || []).map((p, index) => ({
                id: p.id,
                display_name: p.display_name || 'Học viên ẩn danh',
                avatar_url: p.avata || '',
                avg_score: p.stats?.avg_score || 0,
                total_exams: p.stats?.total_exams || 0,
                rank: index + 1,
                isCurrentUser: p.id === currentUserId
            }))

            setRankings(formattedRankings)
        } catch (err) {
            console.error('Error fetching rankings:', err)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="w-8 h-8 border-2 border-apple-border border-t-apple-blue rounded-full animate-spin" />
            </div>
        )
    }

    // AUTH VIEW: ERP Professional Leaderboard aligned with System
    if (user) {
        return (
            <div className="min-h-screen bg-apple-bg py-6 space-y-6">
                {/* Unified Header Section */}
                <div className="px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-apple-card border border-apple-border rounded-xl flex items-center justify-center shadow-sm">
                            <Trophy className="w-6 h-6 text-apple-blue" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-apple-text tracking-tight">Bảng Xếp Hạng Thành Tích</h1>
                            <p className="text-apple-text-secondary font-medium flex items-center gap-2 mt-1">
                                <Award className="w-4 h-4 text-orange-500" />
                                Hệ thống vinh danh học viên thực tế
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        {/* Filter Tabs - Move here to align with other pages' control areas */}
                        <div className="flex bg-apple-card p-1 rounded-xl border border-apple-border shadow-apple-shadow">
                            {[
                                { id: 'all', label: 'Tất cả' },
                                { id: 'monthly', label: 'Tháng này' },
                                { id: 'weekly', label: 'Tuần này' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id
                                        ? 'bg-apple-blue text-white shadow-sm'
                                        : 'text-apple-text-secondary hover:text-apple-text hover:bg-apple-bg'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Area - px-6 for fluid alignment */}
                <div className="px-6 space-y-8">
                    {/* Podium Row - Flat & Balanced */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1st Place - Centered Focus */}
                        <div className="md:col-start-2 order-1 md:order-2 bg-apple-card border border-apple-border rounded-2xl p-6 shadow-apple-shadow relative group overflow-hidden">
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-apple-blue" />
                            <div className="flex items-center gap-5">
                                <div className="relative shrink-0">
                                    <div className="w-20 h-20 rounded-xl bg-apple-bg overflow-hidden border border-apple-border">
                                        {rankings[0]?.avatar_url ? (
                                            <Image src={rankings[0].avatar_url} alt={rankings[0].display_name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-apple-text-secondary">
                                                <User className="w-10 h-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -top-2 -left-2 w-7 h-7 bg-yellow-400 text-white rounded-lg flex items-center justify-center font-black text-xs shadow-md ring-2 ring-apple-card">1</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-apple-blue uppercase tracking-[0.2em] mb-1">Quán quân</div>
                                    <h3 className="text-base font-black text-apple-text truncate tracking-tight">{rankings[0]?.display_name}</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="bg-apple-blue/10 px-2 py-0.5 rounded text-[10px] font-black text-apple-blue border border-apple-blue/20 uppercase tracking-widest">
                                            {rankings[0]?.avg_score}% Đạt
                                        </div>
                                        <div className="text-[10px] text-apple-text-secondary font-bold uppercase tracking-tighter">
                                            {rankings[0]?.total_exams} bài thi
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2nd Place */}
                        <div className="md:col-start-1 order-2 md:order-1 bg-apple-card border border-apple-border rounded-2xl p-6 shadow-apple-shadow relative group">
                            <div className="flex items-center gap-5">
                                <div className="relative shrink-0">
                                    <div className="w-20 h-20 rounded-xl bg-apple-bg overflow-hidden border border-apple-border">
                                        {rankings[1]?.avatar_url ? (
                                            <Image src={rankings[1].avatar_url} alt={rankings[1].display_name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-apple-text-secondary">
                                                <User className="w-10 h-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -top-2 -left-2 w-7 h-7 bg-slate-400 text-white rounded-lg flex items-center justify-center font-black text-xs shadow-md ring-2 ring-apple-card">2</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-apple-text-secondary uppercase tracking-widest mb-1">Á quân I</div>
                                    <h3 className="text-base font-bold text-apple-text truncate">{rankings[1]?.display_name}</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="bg-apple-card px-2 py-0.5 rounded text-[10px] font-bold text-apple-text-secondary border border-apple-border">
                                            {rankings[1]?.avg_score}% Đạt
                                        </div>
                                        <div className="text-[10px] text-apple-text-secondary font-medium">
                                            {rankings[1]?.total_exams} bài thi
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="md:col-start-3 order-3 bg-apple-card border border-apple-border rounded-2xl p-6 shadow-apple-shadow relative group">
                            <div className="flex items-center gap-5">
                                <div className="relative shrink-0">
                                    <div className="w-20 h-20 rounded-xl bg-apple-bg overflow-hidden border border-apple-border">
                                        {rankings[2]?.avatar_url ? (
                                            <Image src={rankings[2].avatar_url} alt={rankings[2].display_name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-apple-text-secondary">
                                                <User className="w-10 h-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -top-2 -left-2 w-7 h-7 bg-orange-400 text-white rounded-lg flex items-center justify-center font-black text-xs shadow-md ring-2 ring-apple-card">3</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Á quân II</div>
                                    <h3 className="text-base font-bold text-apple-text truncate">{rankings[2]?.display_name}</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="bg-orange-muted dark:bg-orange-50/10 px-2 py-0.5 rounded text-[10px] font-bold text-orange-600 border border-orange-200 dark:border-orange-500/20">
                                            {rankings[2]?.avg_score}% Đạt
                                        </div>
                                        <div className="text-[10px] text-apple-text-secondary font-medium">
                                            {rankings[2]?.total_exams} bài thi
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area - ERP Table style */}
                    <div className="bg-apple-card border border-apple-border rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-apple-border flex items-center justify-between bg-apple-bg/30">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-apple-blue/10 rounded-lg flex items-center justify-center border border-apple-blue/10">
                                    <LayoutGrid className="w-4 h-4 text-apple-blue" />
                                </div>
                                <span className="text-sm font-black text-apple-text uppercase tracking-tight">Danh sách xếp hạng học viên</span>
                            </div>
                            <div className="flex items-center gap-4 text-apple-text-secondary pr-2">
                                <Users className="w-4 h-4" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">{rankings.length} Học viên ưu tú</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-apple-border">
                                        <th className="px-8 py-5 text-[10px] font-black text-apple-text-secondary uppercase tracking-[0.2em] w-24">Thứ hạng</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-apple-text-secondary uppercase tracking-[0.2em]">Học viên thực tế</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-apple-text-secondary uppercase tracking-[0.2em] w-64 text-center">Năng lực (Avg)</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-apple-text-secondary uppercase tracking-[0.2em] w-40 text-right">Bài thi đã đạt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-apple-border/50">
                                    {rankings.map((rk) => (
                                        <tr key={rk.id} className={`group hover:bg-apple-card/50 transition-all ${rk.isCurrentUser ? 'bg-apple-blue/10 relative' : ''}`}>
                                            <td className="px-8 py-5">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-inset ${rk.rank === 1 ? 'bg-yellow-400/10 text-yellow-600 ring-yellow-400/20' :
                                                    rk.rank === 2 ? 'bg-apple-text-secondary/10 text-apple-text-secondary ring-apple-border' :
                                                        rk.rank === 3 ? 'bg-orange-400/10 text-orange-600 ring-orange-400/20' :
                                                            'bg-apple-card text-apple-text-secondary ring-apple-border/50'
                                                    }`}>
                                                    {rk.rank}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-xl bg-apple-bg overflow-hidden relative shrink-0 border border-apple-border">
                                                        {rk.avatar_url ? (
                                                            <Image src={rk.avatar_url} alt={rk.display_name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-apple-text-secondary">
                                                                <User className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-black text-apple-text flex items-center gap-2 group-hover:text-apple-blue transition-colors truncate tracking-tight">
                                                            {rk.display_name}
                                                            {rk.isCurrentUser && (
                                                                <span className="px-2 py-0.5 bg-apple-blue text-[9px] text-white rounded font-black uppercase tracking-wider">Học tập của tôi</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] font-black text-apple-text-secondary uppercase tracking-[0.1em] mt-1 opacity-70">CCHN Xây dựng</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-full max-w-[140px] h-2 bg-apple-bg rounded-full overflow-hidden border border-apple-border">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${rk.avg_score >= 80 ? 'bg-emerald-500 dark:bg-emerald-600 shadow-sm' :
                                                                rk.avg_score >= 50 ? 'bg-apple-blue shadow-sm' : 'bg-apple-text-secondary/20'
                                                                }`}
                                                            style={{ width: `${rk.avg_score}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-apple-text mt-2">{rk.avg_score}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="text-base font-bold text-apple-text">{rk.total_exams}</div>
                                                <div className="text-[10px] font-bold text-apple-text-secondary uppercase tracking-tighter">Bài thi</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-8 py-5 bg-apple-bg/30 border-t border-apple-border italic text-[11px] text-apple-text-secondary flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Dữ liệu được cập nhật thời gian thực dựa trên kết quả ôn luyện của cộng đồng.
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // GUEST VIEW - Professional AuthWall
    return (
        <AuthWall
            title="Bảng xếp hạng thành tích"
            description="Nơi quy tụ những học viên có kết quả ôn luyện xuất sắc nhất. Tham gia thi đua để khẳng định năng lực và lọt vào bảng vàng vinh danh."
            features={[
                { icon: Trophy, text: "Vinh danh Top học viên" },
                { icon: Award, text: "Chứng nhận năng lực" },
                { icon: Users, text: "Cộng đồng học thuật" },
                { icon: TrendingUp, text: "Cập nhật thời gian thực" }
            ]}
            redirectPath="/xep-hang"
            gradientFrom="from-slate-800"
            gradientTo="to-slate-900"
        />
    )
}
