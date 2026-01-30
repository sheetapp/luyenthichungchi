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
                <div className="px-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-apple-card border border-apple-border rounded-xl flex items-center justify-center shadow-sm shrink-0">
                            <Trophy className="w-5 h-5 md:w-6 md:h-6 text-apple-blue" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-apple-text tracking-tight">Bảng xếp hạng</h1>
                            <p className="text-apple-text-secondary font-medium flex items-center gap-1.5 mt-0.5 text-[10px] md:text-sm">
                                <Award className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                                Vinh danh học viên xuất sắc nhất
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between md:justify-end">
                        <div className="md:hidden">
                            <ThemeToggle />
                        </div>
                        {/* Filter Tabs */}
                        <div className="flex flex-1 md:flex-none bg-apple-card p-1 rounded-xl border border-apple-border shadow-sm overflow-x-auto no-scrollbar">
                            {[
                                { id: 'all', label: 'Tất cả' },
                                { id: 'monthly', label: 'Tháng' },
                                { id: 'weekly', label: 'Tuần' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 md:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-apple-blue text-white shadow-sm'
                                        : 'text-apple-text-secondary hover:bg-apple-bg'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="hidden md:block">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="px-4 md:px-6 space-y-6 md:space-y-8 pb-20 md:pb-6">
                    {/* Podium Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {/* 1st Place */}
                        <div className="md:col-start-2 order-1 md:order-2 bg-apple-card border border-apple-border rounded-2xl p-4 md:p-6 shadow-apple-shadow md:shadow-apple-shadow relative group overflow-hidden active:scale-[0.98] transition-all">
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-apple-blue" />
                            <div className="flex items-center md:flex-col md:text-center gap-4 md:gap-5">
                                <div className="relative shrink-0">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-apple-bg overflow-hidden border border-apple-border">
                                        {rankings[0]?.avatar_url ? (
                                            <Image src={rankings[0].avatar_url} alt={rankings[0].display_name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-apple-text-secondary">
                                                <User className="w-8 h-8 md:w-10 md:h-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-yellow-400 text-white rounded-lg flex items-center justify-center font-bold text-[10px] shadow-md ring-2 ring-apple-card">1</div>
                                </div>
                                <div className="flex-1 min-w-0 md:w-full">
                                    <div className="text-[9px] md:text-[10px] font-bold text-apple-blue mb-0.5 md:mb-1 uppercase tracking-wider">Quán quân</div>
                                    <h3 className="text-[15px] md:text-base font-bold text-apple-text truncate tracking-tight">{rankings[0]?.display_name}</h3>
                                    <div className="flex items-center md:justify-center gap-2 md:gap-3 mt-1.5 md:mt-2">
                                        <div className="bg-apple-blue/5 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold text-apple-blue border border-apple-blue/10">
                                            {rankings[0]?.avg_score}% Đạt
                                        </div>
                                        <div className="text-[9px] md:text-[10px] text-apple-text-secondary font-bold">
                                            {rankings[0]?.total_exams} bài thi
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2nd Place */}
                        <div className="md:col-start-1 order-2 md:order-1 bg-apple-card border border-apple-border rounded-2xl p-4 md:p-6 shadow-sm md:shadow-apple-shadow relative group active:scale-[0.98] transition-all">
                            <div className="flex items-center md:flex-col md:text-center gap-4 md:gap-5">
                                <div className="relative shrink-0">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-apple-bg overflow-hidden border border-apple-border">
                                        {rankings[1]?.avatar_url ? (
                                            <Image src={rankings[1].avatar_url} alt={rankings[1].display_name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-apple-text-secondary">
                                                <User className="w-8 h-8 md:w-10 md:h-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-slate-400 text-white rounded-lg flex items-center justify-center font-bold text-[10px] shadow-md ring-2 ring-apple-card">2</div>
                                </div>
                                <div className="flex-1 min-w-0 md:w-full">
                                    <div className="text-[9px] md:text-[10px] font-bold text-apple-text-secondary mb-0.5 md:mb-1 uppercase tracking-wider">Á quân I</div>
                                    <h3 className="text-[15px] md:text-base font-bold text-apple-text truncate tracking-tight">{rankings[1]?.display_name}</h3>
                                    <div className="flex items-center md:justify-center gap-2 md:gap-3 mt-1.5 md:mt-2">
                                        <div className="bg-apple-bg px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold text-apple-text-secondary border border-apple-border">
                                            {rankings[1]?.avg_score}% Đạt
                                        </div>
                                        <div className="text-[9px] md:text-[10px] text-apple-text-secondary font-bold">
                                            {rankings[1]?.total_exams} bài thi
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="md:col-start-3 order-3 bg-apple-card border border-apple-border rounded-2xl p-4 md:p-6 shadow-sm md:shadow-apple-shadow relative group active:scale-[0.98] transition-all">
                            <div className="flex items-center md:flex-col md:text-center gap-4 md:gap-5">
                                <div className="relative shrink-0">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-apple-bg overflow-hidden border border-apple-border">
                                        {rankings[2]?.avatar_url ? (
                                            <Image src={rankings[2].avatar_url} alt={rankings[2].display_name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-apple-text-secondary">
                                                <User className="w-8 h-8 md:w-10 md:h-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-orange-400 text-white rounded-lg flex items-center justify-center font-bold text-[10px] shadow-md ring-2 ring-apple-card">3</div>
                                </div>
                                <div className="flex-1 min-w-0 md:w-full">
                                    <div className="text-[9px] md:text-[10px] font-bold text-orange-500 mb-0.5 md:mb-1 uppercase tracking-wider">Á quân II</div>
                                    <h3 className="text-[15px] md:text-base font-bold text-apple-text truncate tracking-tight">{rankings[2]?.display_name}</h3>
                                    <div className="flex items-center md:justify-center gap-2 md:gap-3 mt-1.5 md:mt-2">
                                        <div className="bg-orange-muted/20 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold text-orange-600 border border-orange-500/10">
                                            {rankings[2]?.avg_score}% Đạt
                                        </div>
                                        <div className="text-[9px] md:text-[10px] text-apple-text-secondary font-bold">
                                            {rankings[2]?.total_exams} bài thi
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Style List - ERP style */}
                    <div className="bg-apple-card border border-apple-border rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-apple-border flex items-center justify-between bg-apple-bg/30">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-apple-blue/10 rounded-lg flex items-center justify-center border border-apple-blue/10">
                                    <LayoutGrid className="w-4 h-4 text-apple-blue" />
                                </div>
                                <span className="text-[13px] md:text-sm font-bold text-apple-text tracking-tight">Top học viên ưu tú</span>
                            </div>
                            <div className="flex items-center gap-4 text-apple-text-secondary">
                                <Users className="w-4 h-4 hidden sm:block" />
                                <span className="text-[10px] md:text-[11px] font-bold">{rankings.length} học viên</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
                                <thead>
                                    <tr className="border-b border-apple-border bg-apple-bg/10">
                                        <th className="px-5 md:px-8 py-4 text-[10px] font-bold text-apple-text-secondary tracking-wide w-20 md:w-24">Thứ hạng</th>
                                        <th className="px-5 md:px-8 py-4 text-[10px] font-bold text-apple-text-secondary tracking-wide">Học viên</th>
                                        <th className="px-5 md:px-8 py-4 text-[10px] font-bold text-apple-text-secondary tracking-wide w-40 md:w-64 text-center">Năng lực (Avg)</th>
                                        <th className="px-5 md:px-8 py-4 text-[10px] font-bold text-apple-text-secondary tracking-wide w-32 md:w-40 text-right">Thành tích</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-apple-border/50">
                                    {rankings.map((rk) => (
                                        <tr key={rk.id} className={`group hover:bg-apple-card/50 transition-all ${rk.isCurrentUser ? 'bg-apple-blue/5' : ''}`}>
                                            <td className="px-5 md:px-8 py-4 md:py-5">
                                                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-bold text-[10px] md:text-xs shadow-sm ring-1 ring-inset ${rk.rank === 1 ? 'bg-yellow-400/10 text-yellow-600 ring-yellow-400/20' :
                                                    rk.rank === 2 ? 'bg-slate-400/10 text-slate-500 ring-slate-400/20' :
                                                        rk.rank === 3 ? 'bg-orange-400/10 text-orange-600 ring-orange-400/20' :
                                                            'bg-apple-card text-apple-text-secondary ring-apple-border/50'
                                                    }`}>
                                                    {rk.rank}
                                                </div>
                                            </td>
                                            <td className="px-5 md:px-8 py-4 md:py-5">
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-apple-bg overflow-hidden relative shrink-0 border border-apple-border">
                                                        {rk.avatar_url ? (
                                                            <Image src={rk.avatar_url} alt={rk.display_name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-apple-text-secondary">
                                                                <User className="w-5 h-5 md:w-6 md:h-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs md:text-sm font-bold text-apple-text flex items-center gap-2 group-hover:text-apple-blue transition-colors truncate tracking-tight">
                                                            {rk.display_name}
                                                            {rk.isCurrentUser && (
                                                                <span className="hidden sm:block px-1.5 py-0.5 bg-apple-blue text-[8px] text-white rounded font-bold tracking-wider">Tôi</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[9px] md:text-[10px] font-bold text-apple-text-secondary mt-0.5 opacity-60">CCHN Xây dựng</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 md:px-8 py-4 md:py-5">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="w-full max-w-[100px] md:max-w-[140px] h-1.5 md:h-2 bg-apple-bg rounded-full overflow-hidden border border-apple-border">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${rk.avg_score >= 80 ? 'bg-emerald-500' :
                                                                rk.avg_score >= 50 ? 'bg-apple-blue' : 'bg-apple-text-secondary/20'
                                                                }`}
                                                            style={{ width: `${rk.avg_score}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] md:text-[11px] font-bold text-apple-text">{rk.avg_score}%</span>
                                                </div>
                                            </td>
                                            <td className="px-5 md:px-8 py-4 md:py-5 text-right">
                                                <div className="text-[14px] md:text-base font-bold text-apple-text">{rk.total_exams}</div>
                                                <div className="text-[9px] md:text-[10px] font-bold text-apple-text-secondary tracking-tighter">Bài thi đạt</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-5 md:px-8 py-4 bg-apple-bg/30 border-t border-apple-border italic text-[10px] md:text-[11px] text-apple-text-secondary flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Cập nhật thời gian thực dựa trên kết quả ôn luyện.
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
