'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Search, ChevronDown, Database as DatabaseIcon, ArrowUp, BookOpen, FileText, ExternalLink, X, Calendar, Download } from 'lucide-react'
import { removeVietnameseTones } from '@/lib/utils/vietnamese'
import { useSidebar } from '@/contexts/SidebarContext'
import { Post } from '@/constants/library-data'

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

type TabType = 'database' | 'manual' | 'news'

export default function DatabasePage() {
    const { collapsed } = useSidebar()
    const [activeTab, setActiveTab] = useState<TabType>('database')

    // Database State
    const [questions, setQuestions] = useState<Question[]>([])
    const [allQuestions, setAllQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [showScrollTop, setShowScrollTop] = useState(false)

    // Posts State
    const [posts, setPosts] = useState<Post[]>([])
    const [selectedPost, setSelectedPost] = useState<Post | null>(null)

    // Filters
    const [selectedHang, setSelectedHang] = useState('Tất cả')
    const [selectedChuyenNganh, setSelectedChuyenNganh] = useState('Tất cả')
    const [selectedPhanThi, setSelectedPhanThi] = useState('Tất cả')
    const [searchQuery, setSearchQuery] = useState('')

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20

    useEffect(() => {
        if (activeTab === 'database') {
            loadQuestions()
        } else {
            loadPosts()
        }
    }, [activeTab, selectedHang, selectedChuyenNganh, selectedPhanThi, currentPage, searchQuery])

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Load Posts from Supabase + Local Constants
    async function loadPosts() {
        setLoading(true)
        try {
            const tabCategory = activeTab === 'manual' ? 'guide' : 'news'
            const localCategory = activeTab === 'manual' ? 'huong-dan' : 'news'

            // Fetch from DB
            const { data: dbPosts, error } = await supabase
                .from('library_posts')
                .select('*')
                .eq('category', tabCategory)
                .eq('is_published', true)
                .order('created_at', { ascending: false })

            if (error) console.error('Error fetching DB posts:', error)

            // Map DB posts to Post interface
            const mappedDbPosts: Post[] = (dbPosts || []).map(p => ({
                id: p.id,
                title: p.title,
                slug: p.slug,
                content: p.content,
                excerpt: p.excerpt,
                category: activeTab === 'manual' ? 'huong-dan' : 'news',
                type: p.type as any,
                thumbnail_url: p.thumbnail_url,
                attachments: p.attachments,
                created_at: p.created_at
            }))

            setPosts(mappedDbPosts)
        } catch (err) {
            console.error('Exception loading posts:', err)
        }
        setLoading(false)
    }

    async function loadQuestions() {
        setLoading(true)
        try {
            let query = supabase
                .from('questions')
                .select('*', { count: 'exact' })

            // Apply filters
            if (activeTab === 'database') {
                if (selectedHang !== 'Tất cả') query = query.eq('hang', selectedHang)
                if (selectedChuyenNganh !== 'Tất cả') query = query.eq('chuyen_nganh', selectedChuyenNganh)
                if (selectedPhanThi !== 'Tất cả') query = query.eq('phan_thi', selectedPhanThi)
            }

            const { data, error } = await query.order('id', { ascending: true })

            if (data) {
                let filteredData = data
                if (searchQuery.trim()) {
                    const searchNormalized = removeVietnameseTones(searchQuery.trim().toLowerCase())
                    filteredData = data.filter(q =>
                        removeVietnameseTones(q.cau_hoi.toLowerCase()).includes(searchNormalized)
                    )
                }

                setAllQuestions(filteredData)
                setTotalCount(filteredData.length)

                const from = (currentPage - 1) * itemsPerPage
                const to = from + itemsPerPage
                setQuestions(filteredData.slice(from, to))
            } else {
                setQuestions([])
                setAllQuestions([])
                setTotalCount(0)
            }
        } catch (err) {
            console.error('Exception:', err)
        }
        setLoading(false)
    }

    const totalPages = Math.ceil(totalCount / itemsPerPage)

    const getAnswerLabel = (answer: string) => {
        const labels: { [key: string]: string } = { a: 'A', b: 'B', c: 'C', d: 'D' }
        return labels[answer.toLowerCase()] || answer
    }

    return (
        <div className="min-h-screen bg-apple-bg py-6 transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto py-8">
                {/* Header Section */}
                <div className="mb-8 px-4">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-apple-blue/10 text-apple-blue rounded-[22px] flex items-center justify-center shadow-inner">
                                <DatabaseIcon size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-apple-text tracking-tight mb-1">Thư viện</h1>
                                <p className="text-sm font-medium text-apple-text-secondary">
                                    Kho dữ liệu và tài liệu ôn tập chuẩn
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 no-scrollbar">
                        {[
                            { id: 'database', label: 'Cơ sở dữ liệu', icon: DatabaseIcon },
                            { id: 'manual', label: 'Hướng dẫn sử dụng', icon: BookOpen },
                            { id: 'news', label: 'Tin tức', icon: FileText },
                        ].map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id as TabType)
                                        setCurrentPage(1)
                                        setSearchQuery('')
                                        setSelectedPost(null)
                                    }}
                                    className={`
                                        flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all
                                        ${isActive
                                            ? 'bg-apple-blue text-white shadow-lg shadow-apple-blue/30'
                                            : 'bg-apple-card text-apple-text-secondary hover:bg-apple-input border border-transparent hover:border-apple-border shadow-sm'
                                        }
                                    `}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-apple-card/50 backdrop-blur-xl rounded-3xl p-6 border border-apple-border/50 shadow-apple-shadow mx-4 min-h-[500px]">

                    {/* Database Tab Content */}
                    {activeTab === 'database' && (
                        <>
                            {/* Search & Filters */}
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                                <div className="lg:col-span-1 relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-text-secondary group-focus-within:text-apple-blue transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-apple-card border border-apple-border rounded-xl text-sm font-medium text-apple-text focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue transition-all"
                                    />
                                </div>
                                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <select
                                        value={selectedHang}
                                        onChange={(e) => setSelectedHang(e.target.value)}
                                        className="w-full px-4 py-3 bg-apple-card border border-apple-border rounded-xl text-sm font-bold text-apple-text focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
                                    >
                                        {HANG_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-apple-card">{opt}</option>)}
                                    </select>
                                    <select
                                        value={selectedChuyenNganh}
                                        onChange={(e) => setSelectedChuyenNganh(e.target.value)}
                                        className="w-full px-4 py-3 bg-apple-card border border-apple-border rounded-xl text-sm font-bold text-apple-text focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
                                    >
                                        {CHUYEN_NGANH_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-apple-card">{opt}</option>)}
                                    </select>
                                    <select
                                        value={selectedPhanThi}
                                        onChange={(e) => setSelectedPhanThi(e.target.value)}
                                        className="w-full px-4 py-3 bg-apple-card border border-apple-border rounded-xl text-sm font-bold text-apple-text focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
                                    >
                                        {PHAN_THI_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-apple-card">{opt}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Questions List */}
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl" />)}
                                </div>
                            ) : questions.length > 0 ? (
                                <div className="space-y-6">
                                    {questions.map((q, index) => {
                                        const isExpanded = expandedId === q.id
                                        const correctAnswerLetter = getAnswerLabel(q.dap_an_dung)
                                        const answerMap: any = { 'A': q.dap_an_a, 'B': q.dap_an_b, 'C': q.dap_an_c, 'D': q.dap_an_d }
                                        const correctAnswerContent = answerMap[correctAnswerLetter] || ''

                                        return (
                                            <div key={q.id} className="bg-apple-card rounded-2xl border border-apple-border shadow-sm overflow-hidden group hover:shadow-md transition-all">
                                                <div
                                                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                                                    className="p-6 cursor-pointer"
                                                >
                                                    <div className="flex gap-4">
                                                        <span className="px-3 py-1 h-fit bg-apple-blue/10 text-apple-blue text-xs font-black rounded-lg">
                                                            #{(currentPage - 1) * itemsPerPage + index + 1}
                                                        </span>
                                                        <div className="flex-1 space-y-3">
                                                            <div className="flex gap-2 flex-wrap">
                                                                <span className="text-[10px] font-bold px-2 py-1 bg-apple-bg text-apple-text-secondary rounded">
                                                                    {q.hang}
                                                                </span>
                                                                <span className="text-[10px] font-bold px-2 py-1 bg-apple-bg text-apple-text-secondary rounded">
                                                                    {q.phan_thi}
                                                                </span>
                                                            </div>
                                                            <p className="font-bold text-apple-text text-lg">{q.cau_hoi}</p>

                                                            <div className="flex items-center gap-3 p-3 bg-emerald-muted rounded-xl border border-emerald-soft">
                                                                <div className="w-6 h-6 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                                                                    {correctAnswerLetter}
                                                                </div>
                                                                <p className="text-sm font-bold text-emerald-text">{correctAnswerContent}</p>
                                                            </div>
                                                        </div>
                                                        <ChevronDown className={`w-5 h-5 text-apple-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="border-t border-apple-border bg-apple-bg/50 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {[
                                                            { l: 'A', v: q.dap_an_a }, { l: 'B', v: q.dap_an_b },
                                                            { l: 'C', v: q.dap_an_c }, { l: 'D', v: q.dap_an_d }
                                                        ].map(opt => (
                                                            <div key={opt.l} className={`p-4 rounded-xl border ${opt.l === correctAnswerLetter ? 'bg-emerald-muted border-emerald-soft text-emerald-text' : 'bg-apple-card border-apple-border text-apple-text'}`}>
                                                                <span className="font-bold text-apple-blue mr-2">{opt.l}.</span> {opt.v}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-apple-border/50">
                                            <button
                                                onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); scrollToTop() }}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 bg-apple-card border border-apple-border text-apple-text rounded-xl font-bold text-sm disabled:opacity-50"
                                            >
                                                Trước
                                            </button>
                                            <span className="font-bold text-sm text-apple-text-secondary">
                                                Trang {currentPage} / {totalPages}
                                            </span>
                                            <button
                                                onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); scrollToTop() }}
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 bg-apple-card border border-apple-border text-apple-text rounded-xl font-bold text-sm disabled:opacity-50"
                                            >
                                                Sau
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <DatabaseIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold">Không tìm thấy dữ liệu</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Posts Tabs Content (Manual & News) */}
                    {(activeTab === 'manual' || activeTab === 'news') && (
                        <div className="space-y-6">
                            {posts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {posts.map(post => (
                                        <div
                                            key={post.id}
                                            onClick={() => setSelectedPost(post)}
                                            className="bg-apple-card rounded-2xl border border-apple-border shadow-sm overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full cursor-pointer hover:border-apple-blue/50"
                                        >
                                            <div className="h-40 bg-apple-bg relative overflow-hidden">
                                                {post.thumbnail_url ? (
                                                    <img
                                                        src={post.thumbnail_url}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-apple-bg to-apple-input text-apple-text-secondary group-hover:text-apple-blue transition-colors">
                                                        {post.type === 'guide' ? <BookOpen size={48} /> : <FileText size={48} />}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-apple-text line-clamp-2 mb-2 group-hover:text-apple-blue transition-colors">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-sm text-apple-text-secondary line-clamp-3 mb-4">
                                                        {post.excerpt}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-apple-border">
                                                    <span className="flex items-center gap-1 text-xs font-bold text-apple-text-secondary">
                                                        <Calendar size={12} />
                                                        {new Date(post.created_at).toLocaleDateString('vi-VN')}
                                                    </span>
                                                    <button className="flex items-center gap-1 text-xs font-bold text-apple-blue hover:underline">
                                                        Xem chi tiết <ExternalLink size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold">Chưa có bài viết nào trong mục này</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Post Detail Modal */}
                {selectedPost && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-apple-card w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-apple-border">
                            {/* Close Button - Floating */}
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="absolute top-4 right-4 z-10 p-2 bg-apple-card/90 backdrop-blur-sm hover:bg-apple-bg rounded-full transition-colors text-apple-text shadow-lg border border-apple-border"
                            >
                                <X size={24} />
                            </button>

                            {/* Featured Image */}
                            {selectedPost.thumbnail_url && (
                                <div className="w-full h-64 md:h-80 overflow-hidden bg-apple-bg">
                                    <img
                                        src={selectedPost.thumbnail_url}
                                        alt={selectedPost.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="overflow-y-auto flex-1">
                                {/* Header */}
                                <div className="p-6 md:p-8 border-b border-apple-border bg-apple-bg/50">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg border ${selectedPost.type === 'guide'
                                            ? 'bg-apple-blue/10 text-apple-blue border-apple-blue/20'
                                            : selectedPost.type === 'article'
                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                : 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                                            }`}>
                                            {selectedPost.type === 'guide' ? 'Hướng dẫn' : selectedPost.type === 'article' ? 'Tin tức' : 'Tài liệu'}
                                        </span>
                                        <span className="text-xs font-medium text-apple-text-secondary flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(selectedPost.created_at).toLocaleDateString('vi-VN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-apple-text leading-tight mb-3">
                                        {selectedPost.title}
                                    </h2>
                                    {selectedPost.excerpt && (
                                        <p className="text-lg text-apple-text-secondary font-medium leading-relaxed italic border-l-4 border-apple-blue pl-4">
                                            {selectedPost.excerpt}
                                        </p>
                                    )}
                                </div>

                                {/* Article Body */}
                                <div className="p-6 md:p-8 bg-apple-card">
                                    <div
                                        className="prose prose-lg prose-apple max-w-none text-apple-text prose-headings:text-apple-text prose-headings:font-black prose-p:text-apple-text prose-p:leading-relaxed prose-a:text-apple-blue prose-strong:text-apple-text prose-ul:text-apple-text prose-ol:text-apple-text"
                                        dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                                    />

                                    {/* Attachments */}
                                    {selectedPost.attachments && (selectedPost.attachments as any[]).length > 0 && (
                                        <div className="border-t border-apple-border pt-8 mt-8">
                                            <h4 className="text-sm font-black text-apple-text mb-4 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-apple-blue" />
                                                Tài liệu đính kèm
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {(selectedPost.attachments as any[]).map((file, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-4 bg-apple-bg border border-apple-border rounded-2xl hover:border-apple-blue/50 group transition-all"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-apple-blue/10 text-apple-blue flex items-center justify-center group-hover:bg-apple-blue group-hover:text-white transition-colors">
                                                                <Download size={20} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-apple-text line-clamp-1">{file.name}</span>
                                                                {file.size && <span className="text-[10px] text-apple-text-secondary font-medium">{file.size}</span>}
                                                            </div>
                                                        </div>
                                                        <ExternalLink size={16} className="text-apple-text-secondary group-hover:text-apple-blue transition-colors" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-apple-border bg-apple-bg/50 flex justify-end">
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="px-6 py-2.5 bg-apple-bg text-apple-text font-bold rounded-xl hover:bg-apple-input transition-colors border border-apple-border"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scroll to Top */}
                {showScrollTop && (
                    <button
                        onClick={scrollToTop}
                        className="fixed right-8 bottom-12 w-12 h-12 bg-apple-blue text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-40"
                    >
                        <ArrowUp size={20} />
                    </button>
                )}
            </div>
        </div>
    )
}
