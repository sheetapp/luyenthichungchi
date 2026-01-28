'use client'

import { Search, Phone, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

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

    const filteredCategories = searchQuery.trim()
        ? SEARCH_CATEGORIES.filter(cat =>
            cat.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : []

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            {/* Top Bar */}
            <div className="px-3 py-2.5 flex items-center justify-between border-b border-slate-100">
                <Link href="/" className="text-lg font-black text-blue-600">
                    Luyện thi CCXD v1
                </Link>

                <div className="flex items-center gap-2">
                    <a href="tel:0987726236" className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-red-600 transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                        0987 726 236
                    </a>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Menu className="w-5 h-5 text-slate-700" />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-3 py-2.5 bg-slate-50 relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm nội dung khóa chứng chỉ..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setShowResults(true)
                        }}
                        onFocus={() => setShowResults(true)}
                        className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery('')
                                setShowResults(false)
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showResults && filteredCategories.length > 0 && (
                    <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                        {filteredCategories.map((category, i) => (
                            <Link
                                key={i}
                                href={`/on-tap/${encodeURIComponent(category)}`}
                                onClick={() => {
                                    setSearchQuery('')
                                    setShowResults(false)
                                }}
                                className="block px-4 py-3 hover:bg-emerald-50 border-b border-slate-100 last:border-0 transition-colors"
                            >
                                <p className="text-sm font-semibold text-slate-900">{category}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </header>
    )
}
