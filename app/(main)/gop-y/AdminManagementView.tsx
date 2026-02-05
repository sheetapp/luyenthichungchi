'use client'

import { useState, useEffect } from 'react'
import { Shield, MessageSquare, Database, Search, Filter, Edit, Trash2, Plus, Loader2, ChevronDown, ChevronUp, Check, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { supabase } from '@/lib/supabase/client'
import { removeVietnameseTones } from '@/lib/utils/vietnamese'
import {
    Feedback,
    Question,
    HANG_OPTIONS,
    CHUYEN_NGANH_OPTIONS,
    PHAN_THI_OPTIONS,
    FEEDBACK_TYPE_LABELS,
    STATUS_LABELS
} from './types'

interface AdminManagementViewProps {
    allFeedbacks: Feedback[]
    loading: boolean
    onUpdateStatus: (id: string, status: string, response?: string) => Promise<void>
    currentUser: any
}

export function AdminManagementView({ allFeedbacks, loading, onUpdateStatus, currentUser }: AdminManagementViewProps) {
    const [activeTab, setActiveTab] = useState<'feedback' | 'questions'>('feedback')
    const [filter, setFilter] = useState<'pending' | 'resolved'>('pending')
    const [searchUser, setSearchUser] = useState('')
    const [searchType, setSearchType] = useState('Tất cả')

    return (
        <div className="px-4 md:px-6 py-4 md:py-6">
            {/* Sub-tabs */}
            <div className="flex gap-2 mb-6 bg-apple-bg p-1 rounded-xl border border-apple-border w-fit">
                <button
                    onClick={() => setActiveTab('feedback')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'feedback'
                        ? 'bg-white text-apple-blue shadow-sm ring-1 ring-apple-border/50'
                        : 'text-apple-text-secondary hover:text-apple-text'
                        }`}
                >
                    Quản trị góp ý
                </button>
                <button
                    onClick={() => setActiveTab('questions')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'questions'
                        ? 'bg-white text-apple-blue shadow-sm ring-1 ring-apple-border/50'
                        : 'text-apple-text-secondary hover:text-apple-text'
                        }`}
                >
                    Quản trị câu hỏi
                </button>
            </div>

            {activeTab === 'feedback' ? (
                <>
                    {/* Management Filters */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all border ${filter === 'pending'
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    : 'bg-white text-apple-text-secondary border-apple-border hover:border-apple-text/30'
                                    }`}
                            >
                                Chờ xử lý
                                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-yellow-200 text-yellow-900">
                                    {allFeedbacks.filter(f => f.status !== 'resolved').length}
                                </span>
                            </button>
                            <button
                                onClick={() => setFilter('resolved')}
                                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all border ${filter === 'resolved'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-white text-apple-text-secondary border-apple-border hover:border-apple-text/30'
                                    }`}
                            >
                                Đã xử lý
                                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-green-200 text-green-900">
                                    {allFeedbacks.filter(f => f.status === 'resolved').length}
                                </span>
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="relative min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-secondary" />
                                <input
                                    type="text"
                                    placeholder="Tìm Email hoặc UID..."
                                    value={searchUser}
                                    onChange={(e) => setSearchUser(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-apple-border rounded-xl text-xs font-medium outline-none focus:border-apple-blue/30"
                                />
                            </div>
                            <select
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                                className="px-3 py-2 bg-white border border-apple-border rounded-xl text-xs font-bold text-apple-text outline-none focus:border-apple-blue/30"
                            >
                                <option value="Tất cả">Tất cả loại góp ý</option>
                                {Object.entries(FEEDBACK_TYPE_LABELS).map(([key, info]) => (
                                    <option key={key} value={key}>{info.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
                        </div>
                    ) : (
                        <div className="bg-white border border-apple-border rounded-2xl overflow-x-auto shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-apple-bg border-b border-apple-border">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black text-apple-text-secondary uppercase tracking-wider">Người gửi</th>
                                        <th className="px-6 py-4 text-xs font-black text-apple-text-secondary uppercase tracking-wider">Ngày gửi</th>
                                        <th className="px-6 py-4 text-xs font-black text-apple-text-secondary uppercase tracking-wider">Phân loại</th>
                                        <th className="px-6 py-4 text-xs font-black text-apple-text-secondary uppercase tracking-wider">Nội dung</th>
                                        <th className="px-6 py-4 text-xs font-black text-apple-text-secondary uppercase tracking-wider text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allFeedbacks
                                        .filter(fb => {
                                            const statusMatch = filter === 'pending' ? fb.status !== 'resolved' : fb.status === 'resolved'
                                            const typeMatch = searchType === 'Tất cả' || fb.feedback_type === searchType
                                            const query = searchUser.trim().toLowerCase()
                                            const userMatch = !query || fb.user_id.toLowerCase().includes(query) || (fb.email && fb.email.toLowerCase().includes(query))
                                            return statusMatch && typeMatch && userMatch
                                        })
                                        .map((fb) => (
                                            <AdminFeedbackRow
                                                key={fb.id}
                                                feedback={fb}
                                                onUpdateStatus={onUpdateStatus}
                                            />
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            ) : (
                <AdminQuestionManager />
            )}
        </div>
    )
}

function AdminFeedbackRow({ feedback, onUpdateStatus }: { feedback: Feedback, onUpdateStatus: any }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [adminResponse, setAdminResponse] = useState(feedback.admin_response || '')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const typeInfo = FEEDBACK_TYPE_LABELS[feedback.feedback_type] || FEEDBACK_TYPE_LABELS.app_feedback
    const TypeIcon = typeInfo.icon

    const handleSendResponse = async () => {
        if (!adminResponse.trim()) {
            alert('Vui lòng nhập nội dung phản hồi')
            return
        }
        setIsSubmitting(true)
        await onUpdateStatus(feedback.id, 'resolved', adminResponse)
        setIsSubmitting(false)
        setIsExpanded(false)
    }

    return (
        <>
            <tr className={`border-b border-apple-border hover:bg-apple-bg/50 transition-colors ${isExpanded ? 'bg-apple-blue/[0.02]' : ''}`}>
                <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-apple-text">{feedback.email || 'N/A'}</span>
                        <span className="text-[10px] text-apple-text-secondary">UID: {feedback.user_id.substring(0, 8)}...</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-xs text-apple-text-secondary">
                    {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true, locale: vi })}
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                        <span className="text-xs font-bold text-apple-text">{typeInfo.label}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <p className="text-sm text-apple-text line-clamp-1 max-w-[300px]">{feedback.content}</p>
                </td>
                <td className="px-6 py-4 text-center">
                    <button onClick={() => setIsExpanded(!isExpanded)} className={`p-2 rounded-lg transition-all ${isExpanded ? 'bg-apple-blue text-white' : 'text-apple-text-secondary hover:bg-apple-border'}`}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    </button>
                </td>
            </tr>
            {isExpanded && (
                <tr>
                    <td colSpan={5} className="px-8 py-6 bg-apple-bg/30 border-b border-apple-border">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-4">
                                <h4 className="text-[11px] font-black text-apple-text-secondary uppercase tracking-wider">Nội dung từ người dùng</h4>
                                <div className="p-4 bg-white border border-apple-border rounded-2xl shadow-sm italic text-sm text-apple-text">
                                    {feedback.content}
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <h4 className="text-[11px] font-black text-apple-text-secondary uppercase tracking-wider">Phản hồi của Admin</h4>
                                {feedback.answer ? (
                                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                        <p className="text-xs text-emerald-700 font-bold mb-1 italic">
                                            Đã phản hồi vào {new Date(feedback.answer.responded_at).toLocaleDateString('vi-VN')}
                                        </p>
                                        <p className="text-sm text-emerald-900">{feedback.answer.content}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <textarea
                                            value={adminResponse}
                                            onChange={(e) => setAdminResponse(e.target.value)}
                                            className="w-full p-3 bg-white border border-apple-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-apple-blue/20 min-h-[100px]"
                                            placeholder="Nhập nội dung phản hồi..."
                                        />
                                        <button onClick={handleSendResponse} disabled={isSubmitting} className="px-6 py-2 bg-apple-blue text-white text-xs font-bold rounded-lg shadow hover:scale-105 transition-all">
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gửi phản hồi'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    )
}

function AdminQuestionManager() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedHang, setSelectedHang] = useState('Tất cả')
    const [selectedChuyenNganh, setSelectedChuyenNganh] = useState('Tất cả')
    const [selectedPhanThi, setSelectedPhanThi] = useState('Tất cả')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Edit/Add modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        loadQuestions()
    }, [selectedHang, selectedChuyenNganh, selectedPhanThi, currentPage, searchQuery])

    async function loadQuestions() {
        setLoading(true)
        try {
            let query = supabase.from('questions').select('*', { count: 'exact' })
            if (selectedHang !== 'Tất cả') query = query.eq('hang', selectedHang)
            if (selectedChuyenNganh !== 'Tất cả') query = query.eq('chuyen_nganh', selectedChuyenNganh)
            if (selectedPhanThi !== 'Tất cả') query = query.eq('phan_thi', selectedPhanThi)

            const { data, error } = await query.order('id', { ascending: false })
            if (error) throw error
            if (data) {
                let filteredData = data
                if (searchQuery.trim()) {
                    const normalizedQuery = removeVietnameseTones(searchQuery.trim().toLowerCase())
                    filteredData = data.filter(q =>
                        removeVietnameseTones(q.cau_hoi.toLowerCase()).includes(normalizedQuery) ||
                        q.id.toString().includes(normalizedQuery)
                    )
                }
                setTotalCount(filteredData.length)
                const from = (currentPage - 1) * itemsPerPage
                const to = from + itemsPerPage
                setQuestions(filteredData.slice(from, to))
            }
        } catch (error) {
            console.error('Error loading questions:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        if (!editingQuestion) return
        setIsSaving(true)
        try {
            const { id, ...data } = editingQuestion
            if (id) {
                const { error } = await supabase.from('questions').update(data).eq('id', id)
                if (error) throw error
            } else {
                const { error } = await supabase.from('questions').insert([data])
                if (error) throw error
            }
            setIsModalOpen(false)
            loadQuestions()
        } catch (error) {
            console.error('Error saving question:', error)
            alert('Có lỗi xảy ra khi lưu.')
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Bạn có chắc chắn muốn xóa?')) return
        try {
            const { error } = await supabase.from('questions').delete().eq('id', id)
            if (error) throw error
            loadQuestions()
        } catch (error) {
            console.error('Error deleting question:', error)
        }
    }

    function openEditModal(q: Question | null = null) {
        setEditingQuestion(q || {
            cau_hoi: '',
            dap_an_a: '',
            dap_an_b: '',
            dap_an_c: '',
            dap_an_d: '',
            dap_an_dung: 'A',
            hang: 'Hạng I',
            phan_thi: 'Câu hỏi Chuyên môn',
            chuyen_nganh: CHUYEN_NGANH_OPTIONS[1]
        })
        setIsModalOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-apple-text flex items-center gap-2">
                    <Database className="w-5 h-5 text-apple-blue" />
                    Quản trị câu hỏi ({totalCount})
                </h2>
                <button onClick={() => openEditModal()} className="px-4 py-2 bg-apple-blue text-white rounded-xl text-sm font-bold shadow hover:scale-105 transition-all">
                    Thêm mới
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-apple-border shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-secondary" />
                    <input
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-apple-bg border border-apple-border rounded-lg text-sm outline-none"
                    />
                </div>
                <select value={selectedHang} onChange={(e) => setSelectedHang(e.target.value)} className="px-3 py-2 bg-apple-bg border border-apple-border rounded-lg text-sm outline-none">
                    {HANG_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select value={selectedPhanThi} onChange={(e) => setSelectedPhanThi(e.target.value)} className="px-3 py-2 bg-apple-bg border border-apple-border rounded-lg text-sm outline-none">
                    {PHAN_THI_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={selectedChuyenNganh} onChange={(e) => setSelectedChuyenNganh(e.target.value)} className="px-3 py-2 bg-apple-bg border border-apple-border rounded-lg text-sm outline-none">
                    {CHUYEN_NGANH_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white border border-apple-border rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-apple-bg border-b border-apple-border">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-apple-text-secondary uppercase w-16 text-center">ID</th>
                            <th className="px-6 py-4 text-xs font-black text-apple-text-secondary uppercase">Nội dung</th>
                            <th className="px-6 py-4 text-xs font-black text-apple-text-secondary uppercase w-32 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {questions.map((q) => (
                            <tr key={q.id} className="border-b border-apple-border hover:bg-apple-bg/30">
                                <td className="px-6 py-4 text-xs font-bold text-apple-text-secondary text-center">{q.id}</td>
                                <td className="px-6 py-4 text-sm font-bold text-apple-text line-clamp-1">{q.cau_hoi}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => openEditModal(q)} className="p-2 text-apple-blue hover:bg-apple-blue/10 rounded-lg">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(q.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal - Simplified for separation */}
            {isModalOpen && editingQuestion && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 border-b border-apple-border flex justify-between items-center bg-apple-bg/50">
                            <h2 className="text-xl font-bold text-apple-text">Chỉnh sửa câu hỏi</h2>
                            <button onClick={() => setIsModalOpen(false)}><Check className="w-6 h-6 rotate-45" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 overflow-y-auto space-y-4">
                            <textarea
                                required
                                value={editingQuestion.cau_hoi}
                                onChange={(e) => setEditingQuestion({ ...editingQuestion, cau_hoi: e.target.value })}
                                className="w-full p-4 bg-apple-bg border border-apple-border rounded-xl text-sm min-h-[100px]"
                                placeholder="Nội dung câu hỏi..."
                            />
                            {/* Simplified for now as requested strict separation */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border rounded-xl font-bold">Hủy</button>
                                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-apple-blue text-white rounded-xl font-bold">
                                    {isSaving ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
