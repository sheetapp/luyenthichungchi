'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { AuthWall } from '@/components/auth/AuthWall'
import { FileText, ChevronRight, Search, Play, AlertCircle, Clock, Award, BarChart3, HelpCircle } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'
import Link from 'next/link'
import { removeVietnameseTones } from '@/lib/utils/vietnamese'
import { GuideModal } from '@/components/practice/GuideModal'
import { ThemeToggle } from '@/components/theme/ThemeContext'

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
    const [isGuideOpen, setIsGuideOpen] = useState(false)

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
        <div className="min-h-screen bg-apple-bg py-6 space-y-6 font-sans transition-colors duration-300">
            {/* Sticky Header */}
            {showSticky && (
                <div className="fixed top-0 left-0 right-0 bg-apple-card/70 backdrop-blur-xl z-50 py-3 px-6 border-b border-apple-border shadow-sm">
                    <div className="max-w-7xl mx-auto flex items-center gap-4">
                        <ThemeToggle />
                        {/* Hạng Tabs */}
                        <div className="flex p-1 bg-apple-border rounded-[12px]">
                            {HANG_TABS.map(hang => (
                                <button
                                    key={hang}
                                    onClick={() => setSelectedHang(hang)}
                                    className={`px-6 py-2 rounded-[10px] text-sm font-semibold transition-all ${selectedHang === hang
                                        ? 'bg-apple-card text-apple-blue shadow-sm'
                                        : 'text-apple-text-secondary hover:text-apple-text'
                                        }`}
                                >
                                    {hang}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="flex-1 relative max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-apple-text-secondary w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm chuyên ngành..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-apple-card/50 border border-apple-border rounded-[10px] outline-none focus:ring-2 focus:ring-apple-blue/20 shadow-sm text-sm"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="px-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-black text-apple-text tracking-tight mb-2">Hệ thống thi thử</h1>
                        <ThemeToggle />
                        <button
                            onClick={() => setIsGuideOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-apple-card/70 backdrop-blur-md text-apple-blue rounded-[10px] text-xs font-semibold uppercase tracking-wider border border-apple-glass-border hover:bg-apple-card/90 transition-all shadow-sm active:scale-95"
                        >
                            <HelpCircle className="w-4 h-4" />
                            Xem hướng dẫn
                        </button>
                    </div>
                    <p className="text-apple-text-secondary flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4" />
                        Mô phỏng kỳ thi thực tế theo Nghị định 175/2024/NĐ-CP
                    </p>
                </div>
            </div>

            {/* Exam Rules */}
            <div className="mx-6 bg-gradient-to-br from-[#FF9500]/5 to-[#FF9500]/10 border border-[#FF9500]/10 rounded-[24px] p-6 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-[#FF9500] shrink-0 mt-0.5" />
                <div className="space-y-4">
                    <h4 className="font-semibold text-apple-text text-lg tracking-tight">Quy tắc thi sát hạch</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-apple-card/40 backdrop-blur-sm rounded-[16px] p-4 border border-apple-glass-border shadow-sm">
                            <div className="text-[#FF9500] font-bold text-[10px] uppercase tracking-wider mb-2">Cấu trúc đề thi</div>
                            <div className="text-apple-text font-medium leading-relaxed">30 câu hỏi chuyên sâu<br /><span className="text-apple-text-secondary text-xs">(10 Pháp luật • 20 Chuyên môn)</span></div>
                        </div>
                        <div className="bg-apple-card/40 backdrop-blur-sm rounded-[16px] p-4 border border-apple-glass-border shadow-sm">
                            <div className="text-[#FF9500] font-bold text-[10px] uppercase tracking-wider mb-2">Thời gian</div>
                            <div className="text-apple-text font-medium leading-relaxed uppercase">30 Phút<br /><span className="text-apple-text-secondary text-xs font-normal normal-case">Làm bài liên tục không ngừng</span></div>
                        </div>
                        <div className="bg-apple-card/40 backdrop-blur-sm rounded-xl p-4 border border-apple-glass-border shadow-apple-shadow">
                            <div className="text-[#FF9500] font-bold text-[10px] uppercase tracking-wider mb-2">Điều kiện đạt</div>
                            <div className="text-apple-text font-medium leading-relaxed">Pháp luật ≥ 7 <span className="text-apple-text-secondary">&</span> Tổng ≥ 21</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hạng Selection + Search */}
            <div className="px-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Hạng Tabs */}
                    <div className="flex p-1 bg-apple-card rounded-2xl border border-apple-border shadow-sm">
                        {HANG_TABS.map(hang => (
                            <button
                                key={hang}
                                onClick={() => setSelectedHang(hang)}
                                className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedHang === hang
                                    ? 'bg-apple-blue text-white shadow-lg shadow-apple-blue/20'
                                    : 'text-apple-text-secondary hover:text-apple-text hover:bg-apple-bg'
                                    }`}
                            >
                                {hang}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="flex-1 relative w-full md:max-w-md md:ml-auto">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-apple-text-secondary w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm chuyên ngành sát hạch..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-apple-card border border-apple-border rounded-xl text-sm font-medium text-apple-text placeholder:text-apple-text-secondary focus:outline-none focus:ring-2 focus:ring-apple-blue/10 shadow-apple-shadow"
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
                                className="group bg-apple-card border border-apple-border rounded-2xl p-6 hover:shadow-apple-shadow transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-apple-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-start gap-5">
                                    <div className="w-14 h-14 bg-apple-bg rounded-2xl border border-apple-border flex items-center justify-center group-hover:bg-apple-blue/5 transition-all shadow-sm">
                                        <Award className="w-7 h-7 text-apple-text-secondary group-hover:text-apple-blue transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-black text-[15px] text-apple-text leading-tight group-hover:text-apple-blue transition-colors tracking-tight">
                                            {category}
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3 h-3 text-orange-text" />
                                                <span className="text-[10px] font-black text-apple-text-secondary uppercase tracking-widest">30 Phút</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <FileText className="w-3 h-3 text-apple-blue" />
                                                <span className="text-[10px] font-black text-apple-text-secondary uppercase tracking-widest">30 Câu</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-apple-blue rounded-full animate-pulse" />
                                                <span className="text-[10px] font-black text-apple-text-secondary uppercase tracking-widest">{selectedHang}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={`/thi-thu/${encodeURIComponent(category)}`}
                                    onClick={() => {
                                        setSelectedCategory(category)
                                        setLastExamCategory(category)
                                    }}
                                    className="flex items-center gap-2 px-8 py-3 bg-[#1d1d1f] text-white font-semibold rounded-[10px] hover:bg-black transition-all shadow-md active:scale-95 flex-shrink-0"
                                >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    Vào thi ngay
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <GuideModal
                isOpen={isGuideOpen}
                onClose={() => setIsGuideOpen(false)}
                type="exam"
            />
        </div>
    )
}
