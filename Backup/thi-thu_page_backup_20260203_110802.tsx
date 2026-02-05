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
        <div className="min-h-screen bg-apple-bg py-4 md:py-6 space-y-4 md:space-y-6 font-sans transition-colors duration-300">
            {/* Sticky Header */}
            {showSticky && (
                <div className="fixed top-0 left-0 right-0 bg-apple-card/80 backdrop-blur-xl z-[60] py-3 px-4 md:px-6 border-b border-apple-border shadow-sm">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsGuideOpen(true)}
                                    className="md:hidden flex items-center justify-center w-9 h-9 bg-apple-card border border-apple-border rounded-xl text-apple-blue shadow-sm active:scale-90 transition-all"
                                    title="Xem hướng dẫn"
                                >
                                    <HelpCircle className="w-4.5 h-4.5" />
                                </button>
                                <ThemeToggle />
                            </div>
                            <div className="md:hidden flex p-1 bg-apple-border rounded-[10px]">
                                {HANG_TABS.map(hang => (
                                    <button
                                        key={hang}
                                        onClick={() => setSelectedHang(hang)}
                                        className={`px-3 py-1.5 rounded-[8px] text-[11px] font-semibold transition-all ${selectedHang === hang
                                            ? 'bg-apple-card text-apple-blue shadow-sm'
                                            : 'text-apple-text-secondary'
                                            }`}
                                    >
                                        {hang}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PC Hạng Tabs */}
                        <div className="hidden md:flex p-1 bg-apple-border rounded-[12px]">
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
                        <div className="flex-1 relative">
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
            <div className="px-4 md:px-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center justify-between md:justify-start gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-apple-text tracking-tight mb-0 md:mb-2">Hệ thống thi thử</h1>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsGuideOpen(true)}
                                className="md:hidden flex items-center justify-center w-10 h-10 bg-apple-card border border-apple-border rounded-xl text-apple-blue shadow-sm active:scale-90 transition-all"
                                title="Xem hướng dẫn"
                            >
                                <HelpCircle className="w-5 h-5" />
                            </button>
                            <ThemeToggle />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2">
                        <p className="text-apple-text-secondary flex items-center gap-2 text-xs md:text-sm">
                            <FileText className="w-4 h-4" />
                            Mô phỏng kỳ thi thực tế theo QĐ 163/QĐ-BXD ngày 18/2/2025 của Bộ Xây dựng
                        </p>
                        <button
                            onClick={() => setIsGuideOpen(true)}
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-apple-blue/5 text-apple-blue rounded-[10px] text-[11px] font-bold border border-apple-blue/10 hover:bg-apple-blue/10 transition-all active:scale-95"
                        >
                            <HelpCircle className="w-3.5 h-3.5" />
                            Xem hướng dẫn
                        </button>
                    </div>
                </div>
            </div>

            {/* Exam Rules - Hidden on Mobile */}
            <div className="hidden md:flex mx-4 md:mx-6 bg-apple-card border border-apple-border rounded-[20px] md:rounded-[24px] p-4 md:p-6 flex-col md:flex-row items-start gap-3 md:gap-4 font-sans">
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-[#FF9500] shrink-0 md:mt-0.5" />
                <div className="space-y-4 w-full">
                    <h4 className="font-bold text-apple-text text-base md:text-lg tracking-tight">Quy tắc thi sát hạch</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                        <div className="bg-apple-card/40 backdrop-blur-sm rounded-[16px] p-3 md:p-4 border border-apple-glass-border shadow-sm">
                            <div className="text-[#FF9500] font-bold text-[10px] md:text-xs mb-1 md:mb-2 lowercase tracking-wider">Cấu trúc đề thi</div>
                            <div className="text-apple-text text-sm md:text-base font-bold leading-snug">30 câu hỏi <span className="text-apple-text-secondary text-[11px] font-medium">(10 Pháp luật • 20 CM)</span></div>
                        </div>
                        <div className="bg-apple-card/40 backdrop-blur-sm rounded-[16px] p-3 md:p-4 border border-apple-glass-border shadow-sm">
                            <div className="text-[#FF9500] font-bold text-[10px] md:text-xs mb-1 md:mb-2 lowercase tracking-wider">Thời gian</div>
                            <div className="text-apple-text text-sm md:text-base font-bold leading-snug">30 Phút <span className="text-apple-text-secondary text-[11px] font-medium">làm bài liên tục</span></div>
                        </div>
                        <div className="bg-apple-card/40 backdrop-blur-sm rounded-[16px] p-3 md:p-4 border border-apple-glass-border shadow-sm">
                            <div className="text-[#FF9500] font-bold text-[10px] md:text-xs mb-1 md:mb-2 lowercase tracking-wider">Điều kiện đạt</div>
                            <div className="text-apple-text text-sm md:text-base font-bold leading-snug">PL ≥ 7 <span className="text-apple-text-secondary font-medium">&</span> Tổng ≥ 21</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hạng Selection + Search */}
            <div className="px-4 md:px-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Hạng Tabs */}
                    <div className="flex p-1 bg-apple-card rounded-2xl border border-apple-border shadow-sm w-full md:w-fit">
                        {HANG_TABS.map(hang => (
                            <button
                                key={hang}
                                onClick={() => setSelectedHang(hang)}
                                className={`flex-1 md:flex-none px-4 md:px-8 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${selectedHang === hang
                                    ? 'bg-apple-blue text-white shadow-lg shadow-apple-blue/10'
                                    : 'text-apple-text-secondary hover:bg-apple-bg'
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
                            className="w-full pl-10 pr-4 py-3 bg-apple-card border border-apple-border rounded-xl text-sm font-bold text-apple-text placeholder:text-apple-text-secondary focus:outline-none focus:ring-2 focus:ring-apple-blue/10 shadow-sm transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Categories List */}
            <div className="px-4 md:px-6 pb-20 md:pb-6">
                {!mounted ? (
                    <div className="grid gap-3 md:gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 bg-apple-card animate-pulse rounded-2xl border border-apple-border" />
                        ))}
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-20 bg-apple-card rounded-[32px] border-2 border-dashed border-apple-border">
                        <FileText className="w-16 h-16 text-apple-text-secondary/20 mx-auto mb-4" />
                        <p className="text-apple-text-secondary font-bold">Không tìm thấy chuyên ngành sát hạch</p>
                    </div>
                ) : (
                    <div className="grid gap-3 md:gap-4">
                        {filteredCategories.map((category, index) => (
                            <div
                                key={index}
                                className="group bg-apple-card border border-apple-border rounded-[24px] p-5 md:p-6 md:hover:shadow-apple-shadow transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-apple-blue opacity-0 md:group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-start gap-4 md:gap-5">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-apple-bg rounded-xl md:rounded-2xl border border-apple-border flex items-center justify-center shrink-0">
                                        <Award className="w-6 h-6 md:w-7 md:h-7 text-apple-text-secondary group-active:text-apple-blue md:group-hover:text-apple-blue transition-colors" />
                                    </div>
                                    <div className="space-y-1.5 md:space-y-2 min-w-0">
                                        <h3 className="font-bold text-[14px] md:text-[15px] text-apple-text leading-tight group-active:text-apple-blue md:group-hover:text-apple-blue transition-colors tracking-tight">
                                            {category}
                                        </h3>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-orange-text" />
                                                <span className="text-[10px] md:text-xs font-bold text-apple-text-secondary">30 Phút</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FileText className="w-3 h-3 text-apple-blue" />
                                                <span className="text-[10px] md:text-xs font-bold text-apple-text-secondary">30 Câu</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-1 h-1 bg-apple-blue rounded-full" />
                                                <span className="text-[10px] md:text-xs font-bold text-apple-text-secondary">{selectedHang}</span>
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
                                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-apple-text text-apple-bg font-bold rounded-xl md:rounded-[10px] hover:bg-black transition-all shadow-md active:scale-95 flex-shrink-0 text-sm"
                                >
                                    <Play className="w-3 h-3 fill-current" />
                                    Bắt đầu sát hạch
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
