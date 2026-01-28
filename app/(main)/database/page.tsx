'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Search, Filter, ChevronDown, ChevronUp, Database as DatabaseIcon, ArrowUp, CheckCircle2 } from 'lucide-react'
import { removeVietnameseTones } from '@/lib/utils/vietnamese'
import { useSidebar } from '@/contexts/SidebarContext'

const HANG_OPTIONS = ['Tất cả', 'Hạng I', 'Hạng II', 'Hạng III']

const CHUYEN_NGANH_OPTIONS = [
    'Tất cả',
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

const PHAN_THI_OPTIONS = [
    'Tất cả',
    'Câu hỏi Pháp luật chung',
    'Câu hỏi Pháp luật riêng',
    'Câu hỏi Chuyên môn'
]

interface Question {
    id: number
    cau_hoi: string
    dap_an_a: string
    dap_an_b: string
    dap_an_c: string
    dap_an_d: string
    dap_an_dung: string
    hang: string
    phan_thi: string
    chuyen_nganh: string
}

export default function DatabasePage() {
    const { collapsed } = useSidebar()
    const [questions, setQuestions] = useState<Question[]>([])
    const [allQuestions, setAllQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [showStickyHeader, setShowStickyHeader] = useState(false)

    // Filters
    const [selectedHang, setSelectedHang] = useState('Tất cả')
    const [selectedChuyenNganh, setSelectedChuyenNganh] = useState('Tất cả')
    const [selectedPhanThi, setSelectedPhanThi] = useState('Tất cả')
    const [searchQuery, setSearchQuery] = useState('')

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20

    useEffect(() => {
        loadQuestions()
    }, [selectedHang, selectedChuyenNganh, selectedPhanThi, currentPage, searchQuery])

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400)
            setShowStickyHeader(window.scrollY > 200)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    async function loadQuestions() {
        setLoading(true)

        try {
            let query = supabase
                .from('questions')
                .select('*', { count: 'exact' })

            // Apply filters
            if (selectedHang !== 'Tất cả') {
                query = query.eq('hang', selectedHang)
            }
            if (selectedChuyenNganh !== 'Tất cả') {
                query = query.eq('chuyen_nganh', selectedChuyenNganh)
            }
            if (selectedPhanThi !== 'Tất cả') {
                query = query.eq('phan_thi', selectedPhanThi)
            }

            const { data, error, count } = await query.order('id', { ascending: true })

            if (error) {
                console.error('❌ Supabase Error:', error)
            }

            if (data) {
                // Vietnamese unaccented search (client-side)
                let filteredData = data
                if (searchQuery.trim()) {
                    const searchNormalized = removeVietnameseTones(searchQuery.trim().toLowerCase())
                    filteredData = data.filter(q =>
                        removeVietnameseTones(q.cau_hoi.toLowerCase()).includes(searchNormalized)
                    )
                }

                setAllQuestions(filteredData)
                setTotalCount(filteredData.length)

                // Pagination
                const from = (currentPage - 1) * itemsPerPage
                const to = from + itemsPerPage
                setQuestions(filteredData.slice(from, to))
            } else {
                setQuestions([])
                setAllQuestions([])
                setTotalCount(0)
            }
        } catch (err) {
            console.error('💥 Exception:', err)
        }

        setLoading(false)
    }

    const totalPages = Math.ceil(totalCount / itemsPerPage)

    const getAnswerLabel = (answer: string) => {
        const labels: { [key: string]: string } = { a: 'A', b: 'B', c: 'C', d: 'D' }
        return labels[answer.toLowerCase()] || answer
    }

    return (
        <div className="min-h-screen bg-slate-50 py-6">
            {/* Sticky Filter Header */}
            {showStickyHeader && (
                <div className={`fixed top-0 right-0 bg-white shadow-lg z-40 py-3 px-6 border-b border-slate-200 transition-all duration-300 ${collapsed ? 'left-0 md:left-20' : 'left-0 md:left-72'
                    }`}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-bold text-slate-700">Đang xem:</span>
                            {selectedHang !== 'Tất cả' && (
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">
                                    {selectedHang}
                                </span>
                            )}
                            {selectedChuyenNganh !== 'Tất cả' && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg">
                                    {selectedChuyenNganh}
                                </span>
                            )}
                            {selectedPhanThi !== 'Tất cả' && (
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg">
                                    {selectedPhanThi}
                                </span>
                            )}
                            {selectedHang === 'Tất cả' && selectedChuyenNganh === 'Tất cả' && selectedPhanThi === 'Tất cả' && (
                                <span className="text-sm text-slate-500 italic">Tất cả câu hỏi</span>
                            )}
                        </div>

                        {/* Search in Sticky Header */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setCurrentPage(1)
                                    }
                                }}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full">
                {/* Header with Search */}
                <div className="mb-6 px-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                        {/* Left: Title */}
                        <div className="flex items-center gap-3">
                            <DatabaseIcon className="w-8 h-8 text-blue-600" />
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">Database Questions</h1>
                                <p className="text-slate-600 font-medium mt-1">
                                    Tổng: <span className="text-blue-600 font-bold">{totalCount}</span> câu hỏi
                                </p>
                            </div>
                        </div>

                        {/* Right: Search */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo nội dung câu hỏi (bấm Enter)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setCurrentPage(1)
                                    }
                                }}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 mx-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Hạng */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Hạng</label>
                            <select
                                value={selectedHang}
                                onChange={(e) => {
                                    setSelectedHang(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                {HANG_OPTIONS.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        {/* Chuyên ngành */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Chuyên ngành</label>
                            <select
                                value={selectedChuyenNganh}
                                onChange={(e) => {
                                    setSelectedChuyenNganh(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                {CHUYEN_NGANH_OPTIONS.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        {/* Phần thi */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Phần thi</label>
                            <select
                                value={selectedPhanThi}
                                onChange={(e) => {
                                    setSelectedPhanThi(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                {PHAN_THI_OPTIONS.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Questions List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : questions.length > 0 ? (
                    <div className="space-y-4 mx-4">
                        {questions.map((q, index) => {
                            const isExpanded = expandedId === q.id
                            const correctAnswerLetter = getAnswerLabel(q.dap_an_dung)

                            // Get full answer content based on correct answer letter
                            const answerMap: { [key: string]: string } = {
                                'A': q.dap_an_a,
                                'B': q.dap_an_b,
                                'C': q.dap_an_c,
                                'D': q.dap_an_d
                            }
                            const correctAnswerContent = answerMap[correctAnswerLetter] || ''

                            return (
                                <div key={q.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                    {/* Header */}
                                    <div
                                        onClick={() => setExpandedId(isExpanded ? null : q.id)}
                                        className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                {/* Tags Row */}
                                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-lg">
                                                        #{(currentPage - 1) * itemsPerPage + index + 1}
                                                    </span>
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">
                                                        {q.hang}
                                                    </span>
                                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg">
                                                        {q.phan_thi}
                                                    </span>
                                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg">
                                                        {q.chuyen_nganh}
                                                    </span>
                                                </div>

                                                {/* Question Text */}
                                                <p className="text-slate-900 font-bold leading-relaxed mb-3">
                                                    {q.cau_hoi}
                                                </p>

                                                {/* Correct Answer Below */}
                                                <div className="flex items-start gap-2.5 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-base text-slate-900 font-black flex-shrink-0">
                                                        {correctAnswerLetter}
                                                    </span>
                                                    <span className="text-sm text-slate-900 font-semibold leading-relaxed">
                                                        {correctAnswerContent}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Expand Icon */}
                                            <div className="flex-shrink-0">
                                                {isExpanded ? (
                                                    <ChevronUp className="w-6 h-6 text-slate-400" />
                                                ) : (
                                                    <ChevronDown className="w-6 h-6 text-slate-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-100 bg-slate-50">
                                            <div className="px-5 py-4">
                                                <h3 className="text-sm font-bold text-slate-700 mb-3">Nội dung đáp án</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-5 pb-5">
                                                {[
                                                    { label: 'A', value: q.dap_an_a },
                                                    { label: 'B', value: q.dap_an_b },
                                                    { label: 'C', value: q.dap_an_c },
                                                    { label: 'D', value: q.dap_an_d },
                                                ].map(answer => {
                                                    const isCorrect = answer.label === correctAnswerLetter
                                                    return (
                                                        <div
                                                            key={answer.label}
                                                            className={`p-4 rounded-xl border-2 ${isCorrect
                                                                ? 'bg-green-50 border-green-500'
                                                                : 'bg-white border-slate-200'
                                                                }`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${isCorrect
                                                                    ? 'bg-green-500 text-white'
                                                                    : 'bg-slate-200 text-slate-700'
                                                                    }`}>
                                                                    {answer.label}
                                                                </span>
                                                                <p className={`text-sm leading-relaxed ${isCorrect ? 'text-green-900 font-semibold' : 'text-slate-700'
                                                                    }`}>
                                                                    {answer.value}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 mx-4">
                        <DatabaseIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold text-lg">Không tìm thấy câu hỏi nào</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-200 mx-4">
                        <p className="text-sm text-slate-600 font-medium">
                            Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} của {totalCount} câu hỏi
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                ◀ Trước
                            </button>
                            <span className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Sau ▶
                            </button>
                        </div>
                    </div>
                )}

                {/* Scroll to Top Button */}
                {showScrollTop && (
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed right-6 bottom-24 md:bottom-24 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all z-50 flex items-center justify-center"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    )
}
