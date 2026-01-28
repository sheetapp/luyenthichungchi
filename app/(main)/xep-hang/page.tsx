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
                <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        )
    }

    // AUTH VIEW: ERP Professional Leaderboard aligned with System
    if (user) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] py-6 space-y-6">
                {/* Unified Header Section */}
                <div className="px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                            <Trophy className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">Bảng Xếp Hạng Thành Tích</h1>
                            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                                <Award className="w-4 h-4 text-orange-500" />
                                Hệ thống vinh danh học viên thực tế
                            </p>
                        </div>
                    </div>

                    {/* Filter Tabs - Move here to align with other pages' control areas */}
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        {[
                            { id: 'all', label: 'Tất cả' },
                            { id: 'monthly', label: 'Tháng này' },
                            { id: 'weekly', label: 'Tuần này' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area - px-6 for fluid alignment */}
                <div className="px-6 space-y-8">
                    {/* Podium Row - Flat & Balanced */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1st Place - Centered Focus */}
                        <div className="md:col-start-2 order-1 md:order-2 bg-white border border-blue-100 rounded-xl p-6 shadow-sm relative group overflow-hidden">
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-600" />
                            <div className="flex items-center gap-5">
                                <div className="relative shrink-0">
                                    <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-100">
                                        {rankings[0]?.avatar_url ? (
                                            <Image src={rankings[0].avatar_url} alt={rankings[0].display_name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <User className="w-10 h-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -top-2 -left-2 w-7 h-7 bg-yellow-400 text-white rounded-lg flex items-center justify-center font-black text-xs shadow-md ring-2 ring-white">1</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Quán quân</div>
                                    <h3 className="text-base font-bold text-slate-900 truncate">{rankings[0]?.display_name}</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold text-blue-700 border border-blue-100">
                                            {rankings[0]?.avg_score}% Đạt
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            {rankings[0]?.total_exams} bài thi
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2nd Place */}
                        <div className="md:col-start-1 order-2 md:order-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative group">
                            <div className="flex items-center gap-5">
                                <div className="relative shrink-0">
                                    <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-100">
                                        {rankings[1]?.avatar_url ? (
                                            <Image src={rankings[1].avatar_url} alt={rankings[1].display_name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <User className="w-10 h-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -top-2 -left-2 w-7 h-7 bg-slate-400 text-white rounded-lg flex items-center justify-center font-black text-xs shadow-md ring-2 ring-white">2</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Á quân I</div>
                                    <h3 className="text-base font-bold text-slate-900 truncate">{rankings[1]?.display_name}</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="bg-slate-50 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 border border-slate-100">
                                            {rankings[1]?.avg_score}% Đạt
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            {rankings[1]?.total_exams} bài thi
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="md:col-start-3 order-3 bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative group">
                            <div className="flex items-center gap-5">
                                <div className="relative shrink-0">
                                    <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-100">
                                        {rankings[2]?.avatar_url ? (
                                            <Image src={rankings[2].avatar_url} alt={rankings[2].display_name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <User className="w-10 h-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -top-2 -left-2 w-7 h-7 bg-orange-400 text-white rounded-lg flex items-center justify-center font-black text-xs shadow-md ring-2 ring-white">3</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Á quân II</div>
                                    <h3 className="text-base font-bold text-slate-900 truncate">{rankings[2]?.display_name}</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="bg-orange-50 px-2 py-0.5 rounded text-[10px] font-bold text-orange-600 border border-orange-100">
                                            {rankings[2]?.avg_score}% Đạt
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            {rankings[2]?.total_exams} bài thi
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area - ERP Table style */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <LayoutGrid className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-800">Danh sách xếp hạng học viên</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-400 pr-2">
                                <Users className="w-4 h-4" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">{rankings.length} Học viên ưu tú</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-24">Thứ hạng</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Học viên thực tế</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-64 text-center">Năng lực (Avg)</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-40 text-right">Bài thi đã đạt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rankings.map((rk) => (
                                        <tr key={rk.id} className={`group hover:bg-slate-50/80 transition-all ${rk.isCurrentUser ? 'bg-blue-50/40 relative' : ''}`}>
                                            <td className="px-8 py-5">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-inset ${rk.rank === 1 ? 'bg-yellow-50 text-yellow-600 ring-yellow-200' :
                                                    rk.rank === 2 ? 'bg-slate-50 text-slate-500 ring-slate-200' :
                                                        rk.rank === 3 ? 'bg-orange-50 text-orange-600 ring-orange-200' :
                                                            'bg-white text-slate-400 ring-slate-100'
                                                    }`}>
                                                    {rk.rank}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200">
                                                        {rk.avatar_url ? (
                                                            <Image src={rk.avatar_url} alt={rk.display_name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                <User className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2 group-hover:text-blue-600 transition-colors truncate">
                                                            {rk.display_name}
                                                            {rk.isCurrentUser && (
                                                                <span className="px-2 py-0.5 bg-blue-600 text-[9px] text-white rounded font-black uppercase tracking-wider">Học tập của tôi</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">CCHN Xây dựng</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-full max-w-[140px] h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${rk.avg_score >= 80 ? 'bg-green-500' :
                                                                rk.avg_score >= 50 ? 'bg-blue-500' : 'bg-slate-300'
                                                                }`}
                                                            style={{ width: `${rk.avg_score}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[11px] font-black text-slate-700 mt-2">{rk.avg_score}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="text-base font-black text-slate-900">{rk.total_exams}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Bài thi</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 italic text-[11px] text-slate-400 flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Dự liệu được cập nhật thời gian thực dựa trên kết quả ôn luyện của cộng đồng.
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
