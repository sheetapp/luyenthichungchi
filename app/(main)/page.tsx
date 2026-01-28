'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, BookOpen, Search, Filter, Award, Sparkles } from 'lucide-react'
import { removeVietnameseTones } from '@/lib/utils/vietnamese'

const CATEGORIES = [
    'Thiết kế cơ - điện công trình - Hệ thống điện',
    'Giám sát công tác lắp đặt thiết bị công trình',
    'Giám sát công tác xây dựng công trình',
    'Khảo sát địa chất công trình',
    'Khảo sát địa hình',
    'Quản lý dự án đầu tư xây dựng',
    'Thiết kế cơ - điện công trình - Hệ thống cấp - thoát nước công trình',
    'Thiết kế cơ - điện công trình - Hệ thống thông gió - cấp thoát nhiệt',
    'Thiết kế quy hoạch xây dựng',
    'Thiết kế xây dựng công trình - Công trình Cầu - Hầm',
    'Thiết kế xây dựng công trình - Công trình Khai thác mỏ',
    'Thiết kế xây dựng công trình - Công trình đường sắt',
    'Thiết kế xây dựng công trình - Kết cấu công trình',
    'TK XD công trình - Công trình Thủy lợi, đê điều',
    'TK XD công trình - Công trình Xử lý chất thải rắn',
    'TK XD công trình - Công trình đường bộ',
    'TK XD công trình - Công trình đường thủy nội địa - Hàng hải',
    'TKXD công trình - Công trình Cấp nước-thoát nước-hạng I',
    'Định giá Xây dựng',
]

const HANG_OPTIONS = ['Hạng I', 'Hạng II', 'Hạng III']

export default function MainHomePage() {
    const [selectedHang, setSelectedHang] = useState('Hạng I')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return CATEGORIES

        const searchNormalized = removeVietnameseTones(searchQuery.toLowerCase())
        return CATEGORIES.filter(cat =>
            removeVietnameseTones(cat.toLowerCase()).includes(searchNormalized)
        )
    }, [searchQuery])

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-6 space-y-6">
            {/* Standardized Header Section */}
            <div className="px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                        <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Hệ Thống Luyện Thi</h1>
                        <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                            <Award className="w-4 h-4 text-blue-500" />
                            Nền tảng ôn tập chứng chỉ hành nghề xây dựng chuyên nghiệp
                        </p>
                    </div>
                </div>

                {/* Search Bar - Unified Style */}
                <div className="relative w-full md:w-[400px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm chuyên ngành, chứng chỉ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Selection Controls - Tabs style aligned with ERP */}
            <div className="px-6">
                <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit">
                    {HANG_OPTIONS.map((hang) => (
                        <button
                            key={hang}
                            onClick={() => setSelectedHang(hang)}
                            className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${selectedHang === hang
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
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
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            Danh mục chứng chỉ {selectedHang}
                        </h2>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {filteredCategories.length} Kết quả
                    </span>
                </div>

                {/* Categories Grid - 2 columns on large screens for ERP density */}
                <div className="grid md:grid-cols-2 gap-4">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((category, index) => (
                            <Link
                                key={index}
                                href={`/on-tap?hang=${encodeURIComponent(selectedHang)}&chuyen_nganh=${encodeURIComponent(category)}`}
                                className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/[0.03] hover:border-blue-200 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-blue-100/50 transition-all" />

                                <div className="relative flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                            <BookOpen className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-[14px] text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                                                {category}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                                    {selectedHang}
                                                </span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">
                                                    Ôn tập thực tế
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200 mb-6">
                                <Search className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">Không tìm thấy kết quả</h3>
                            <p className="text-slate-400 font-medium">Vui lòng thử tìm kiếm bằng từ khóa khác</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
