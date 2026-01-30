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
            <div className="px-4 py-3 flex items-center justify-between border-b border-apple-border">
                <Link href="/" className="text-xl font-bold tracking-tight text-apple-blue">
                    Luyện thi CCXD
                </Link>

                <div className="flex items-center gap-2">
                    <a href="tel:0987726236" className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-2 rounded-full text-[10px] font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                        <Phone className="w-3.5 h-3.5" />
                        0987 726 236
                    </a>
                    <button className="p-2.5 hover:bg-apple-bg rounded-xl transition-colors active:scale-95">
                        <Menu className="w-6 h-6 text-apple-text" />
                    </button>
                </div>
            </div>
        </header>
    )
}
