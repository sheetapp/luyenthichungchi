'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { AuthWall } from '@/components/auth/AuthWall'
import { FileText, ChevronRight, Search, Play, AlertCircle, Clock, Award, BarChart3 } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'
import Link from 'next/link'
import { removeVietnameseTones } from '@/lib/utils/vietnamese'

const HANG_TABS = ['Hạng I', 'Hạng II', 'Hạng III']

const CHUYEN_NGANH_OPTIONS = [
    'Khảo sát địa hình',
    'Khảo sát địa chất công trình',
    'Thiết kế quy hoạch xây dựng',
    'Thiết kế xây dựng công trình - Kết cấu công trình',
    'Thiết kế xây dựng công trình - Công trình Khai thác mỏ',
    'Thiết kế xây dựng công trình - Công trình Đường bộ',
    'Thiết kế xây dựng công trình - Công trình Đường sắt',
    'Thiết kế xây dựng công trình - Công trình Cầu - Hầm',
    'Thiết kế xây dựng công trình - Công trình Đường thủy nội địa - Hàng hải',
    'Thiết kế xây dựng công trình - Công trình Thủy lợi, đê điều',
    'Thiết kế xây dựng công trình - Công trình Cấp nước - thoát nước',
    'Thiết kế xây dựng công trình - Công trình Xử lý chất thải rắn',
    'Thiết kế cơ - điện công trình - Hệ thống điện',
    'Thiết kế cơ - điện công trình - Hệ thống cấp - thoát nước công trình',
    'Thiết kế cơ - điện công trình - Hệ thống thông gió - cấp thoát nhiệt',
    'Giám sát công tác xây dựng công trình',
    'Giám sát công tác lắp đặt thiết bị công trình',
    'Định giá xây dựng',
    'Quản lý dự án đầu tư xây dựng'
]

export default function ThiThuPage() {
    const [user, setUser] = useState<any>(null)
    const [authLoading, setAuthLoading] = useState(true)

    const { selectedHang, setSelectedHang, setSelectedCategory, setLastExamCategory } = useAppStore()
    const [searchQuery, setSearchQuery] = useState('')
    const [mounted, setMounted] = useState(false)
    const [showSticky, setShowSticky] = useState(false)

    // Check authentication
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setAuthLoading(false)
        }
        checkAuth()
    }, [])

    useEffect(() => {
        setMounted(true)
    }, [])

    // Sticky header on scroll
    useEffect(() => {
        const handleScroll = () => {
            setShowSticky(window.scrollY > 100)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Filter categories based on search
    const filteredCategories = CHUYEN_NGANH_OPTIONS.filter(category => {
        if (!searchQuery.trim()) return true
        const searchNormalized = removeVietnameseTones(searchQuery.trim().toLowerCase())
        return removeVietnameseTones(category.toLowerCase()).includes(searchNormalized)
    })

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    // Show landing page if not authenticated
    if (!user) {
        return (
            <AuthWall
                title="Hệ thống thi thử sát hạch"
                description="Tham gia kỳ thi thử mô phỏng thực tế với cấu trúc 30 câu hỏi trong 30 phút. Đánh giá chính xác năng lực sát hạch chứng chỉ hành nghề theo Nghị định mới nhất."
                features={[
                    { icon: FileText, text: "30 Câu hỏi thực tế" },
                    { icon: Clock, text: "30 Phút làm bài" },
                    { icon: Award, text: "Chấm điểm chuẩn xác" },
                    { icon: BarChart3, text: "Phân tích kết quả" }
                ]}
                redirectPath="/thi-thu"
                gradientFrom="from-orange-600"
                gradientTo="to-red-700"
            />
        )
    }

    // Show exam content for authenticated users

    return (
        <div className="min-h-screen py-6 space-y-6">
            {/* Sticky Header */}
            {showSticky && (
                <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg z-50 py-4 px-6 border-b-2 border-slate-200">
                    <div className="max-w-7xl mx-auto flex items-center gap-4">
                        {/* Hạng Tabs */}
                        <div className="flex gap-2">
                            {HANG_TABS.map(hang => (
                                <button
                                    key={hang}
                                    onClick={() => setSelectedHang(hang)}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${selectedHang === hang
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {hang}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm chuyên ngành..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border-2 border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="px-6">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Thi thử sát hạch</h1>
                <p className="text-slate-600 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Mô phỏng kỳ thi thực tế theo Nghị định 175/2024/NĐ-CP
                </p>
            </div>

            {/* Exam Rules */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6 mx-6 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                    <h4 className="font-bold text-orange-900 text-lg">Quy tắc thi sát hạch</h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white/60 rounded-xl p-3 border border-orange-200">
                            <div className="text-orange-600 font-bold mb-1">📝 Cấu trúc đề thi</div>
                            <div className="text-slate-700">30 câu hỏi<br />(10 Pháp luật + 20 Chuyên môn)</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-3 border border-orange-200">
                            <div className="text-orange-600 font-bold mb-1">⏱️ Thời gian</div>
                            <div className="text-slate-700">30 phút<br />(Tối đa)</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-3 border border-orange-200">
                            <div className="text-orange-600 font-bold mb-1">✅ Điều kiện đạt</div>
                            <div className="text-slate-700">Pháp luật ≥ 7 điểm<br />VÀ Tổng điểm ≥ 21</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hạng Selection + Search */}
            <div className="px-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Hạng Tabs */}
                    <div className="flex gap-3">
                        {HANG_TABS.map(hang => (
                            <button
                                key={hang}
                                onClick={() => setSelectedHang(hang)}
                                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${selectedHang === hang
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200'
                                    }`}
                            >
                                {hang}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm chuyên ngành..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* Categories List */}
            <div className="px-6">
                {!mounted ? (
                    <div className="grid gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Không tìm thấy chuyên ngành phù hợp</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredCategories.map((category, index) => (
                            <div
                                key={index}
                                className="group bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 flex-shrink-0">
                                        <FileText className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 leading-tight mb-2">
                                            {category}
                                        </h4>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold">
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                {selectedHang}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                30 câu hỏi
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                                30 phút
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={`/thi-thu/${encodeURIComponent(category)}`}
                                    onClick={() => {
                                        setSelectedCategory(category)
                                        setLastExamCategory(category)
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 group-hover:scale-105 flex-shrink-0"
                                >
                                    <Play className="w-4 h-4 fill-current" />
                                    Bắt đầu thi
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
