'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, BookOpen, Search, Filter, Award, Sparkles, HelpCircle } from 'lucide-react'
import { removeVietnameseTones } from '@/lib/utils/vietnamese'
import { ThemeToggle } from '@/components/theme/ThemeContext'
import { useEffect } from 'react'

const CATEGORIES = [
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

const HANG_OPTIONS = ['Hạng I', 'Hạng II', 'Hạng III']

export default function MainHomePage() {
    const [selectedHang, setSelectedHang] = useState('Hạng I')
    const [searchQuery, setSearchQuery] = useState('')
    const [showSticky, setShowSticky] = useState(false)

    // Sticky header on scroll
    useEffect(() => {
        const handleScroll = () => {
            setShowSticky(window.scrollY > 100)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return CATEGORIES

        const searchNormalized = removeVietnameseTones(searchQuery.toLowerCase())
        return CATEGORIES.filter(cat =>
            removeVietnameseTones(cat.toLowerCase()).includes(searchNormalized)
        )
    }, [searchQuery])

    return (
        <div className="min-h-screen bg-apple-bg py-4 md:py-6 space-y-6">
            {/* Sticky Header - Mobile Only */}
            {showSticky && (
                <div className="fixed top-0 left-0 right-0 bg-apple-card/80 backdrop-blur-xl z-[60] py-3 px-4 md:hidden border-b border-apple-border shadow-sm animate-in fade-in slide-in-from-top duration-300">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <ThemeToggle />
                            <div className="flex p-1 bg-apple-border rounded-[10px]">
                                {HANG_OPTIONS.map(hang => (
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

                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-apple-text-secondary w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm chuyên ngành..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-apple-card/50 border border-apple-border rounded-[10px] outline-none focus:ring-2 focus:ring-apple-blue/20 shadow-sm text-[13px] font-bold text-apple-text"
                            />
                        </div>
                    </div>
                </div>
            )}
            {/* Standardized Header Section */}
            <div className="px-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-apple-card border border-apple-border rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
                        <Sparkles className="w-6 h-6 text-apple-blue" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-apple-text tracking-tight">Hệ Thống Luyện Thi</h1>
                        <p className="text-apple-text-secondary text-xs md:text-sm font-medium flex items-center gap-2 mt-1">
                            <Award className="w-4 h-4 text-apple-blue" />
                            Ôn tập chứng chỉ hành nghề xây dựng chuyên nghiệp
                        </p>
                    </div>
                </div>

                {/* Search Bar - Unified Style */}
                <div className="relative w-full md:w-[400px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-text-secondary" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm chuyên ngành, chứng chỉ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-apple-card border border-apple-border rounded-2xl text-sm font-bold text-apple-text placeholder:text-apple-text-secondary focus:outline-none focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/5 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Selection Controls - Tabs style aligned with ERP */}
            <div className="px-6">
                <div className="flex bg-apple-card p-1 rounded-2xl border border-apple-border shadow-sm w-fit">
                    {HANG_OPTIONS.map((hang) => (
                        <button
                            key={hang}
                            onClick={() => setSelectedHang(hang)}
                            className={`px-8 py-2.5 rounded-xl font-semibold text-sm transition-all ${selectedHang === hang
                                ? 'bg-apple-blue text-white shadow-lg shadow-apple-blue/10'
                                : 'text-apple-text-secondary hover:text-apple-text hover:bg-apple-bg'
                                }`}
                        >
                            {hang}
                        </button>
                    ))}
                </div>
            </div>

            {/* Performance Content Area */}
            <div className="px-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-apple-blue rounded-full" />
                        <h2 className="text-xl font-bold text-apple-text tracking-tight">
                            Danh mục chứng chỉ {selectedHang}
                        </h2>
                    </div>
                    <span className="text-xs font-semibold text-apple-text-secondary">
                        {filteredCategories.length} Kết quả
                    </span>
                </div>

                {/* Categories Grid - 2 columns on large screens for ERP density */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((category, index) => (
                            <Link
                                key={index}
                                href={`/on-tap?hang=${encodeURIComponent(selectedHang)}&chuyen_nganh=${encodeURIComponent(category)}`}
                                className="group bg-apple-card rounded-2xl p-4 md:p-5 border border-apple-border shadow-sm active:scale-[0.98] md:hover:shadow-xl md:hover:shadow-apple-blue/5 md:hover:border-apple-blue transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-apple-blue/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-apple-blue/10 transition-all" />

                                <div className="relative flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-apple-bg rounded-xl flex items-center justify-center shrink-0 group-active:bg-apple-blue/5 transition-colors">
                                            <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-apple-text-secondary group-active:text-apple-blue transition-colors" />
                                        </div>
                                        <div className="space-y-0.5 md:space-y-1 min-w-0">
                                            <h3 className="font-bold text-[13px] md:text-[14px] text-apple-text leading-snug group-active:text-apple-blue transition-colors truncate">
                                                {category}
                                            </h3>
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="text-[10px] md:text-xs font-semibold text-apple-text-secondary leading-none shrink-0">
                                                    {selectedHang}
                                                </span>
                                                <span className="hidden md:block w-1 h-1 bg-apple-border rounded-full shrink-0" />
                                                <span className="hidden md:inline text-[10px] md:text-xs font-semibold text-apple-blue leading-none truncate">
                                                    Ôn tập thực tế
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-apple-border flex items-center justify-center shrink-0 group-active:bg-apple-blue group-active:border-apple-blue transition-all">
                                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-apple-text-secondary group-active:text-white transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-apple-card rounded-3xl border border-dashed border-apple-border">
                            <div className="w-20 h-20 bg-apple-bg rounded-2xl flex items-center justify-center mx-auto text-apple-text-secondary mb-6">
                                <Search className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-apple-text mb-1">Không tìm thấy kết quả</h3>
                            <p className="text-apple-text-secondary font-medium">Vui lòng thử tìm kiếm bằng từ khóa khác</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
