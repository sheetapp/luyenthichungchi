'use client'

import { useState, useEffect } from 'react'
import { Star, MessageSquare, Plus, Loader2, AlertTriangle, Shield, Database, Search, Filter, Edit, Trash2, ChevronDown, ChevronUp, Check, X, FileText, Info, TrendingUp, Target, Users, BarChart3, BookOpen, Phone, Briefcase, User } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { isAdmin } from '@/constants/admin'
import { removeVietnameseTones } from '@/lib/utils/vietnamese'
import { HANG_OPTIONS, PHAN_THI_OPTIONS, CHUYEN_NGANH_OPTIONS } from '@/constants/categories'
import RichTextEditor from '@/components/ui/RichTextEditor'

const FILTER_HANG_OPTIONS = ['Tất cả', ...HANG_OPTIONS]
const FILTER_PHAN_THI_OPTIONS = ['Tất cả', ...PHAN_THI_OPTIONS]
const FILTER_CHUYEN_NGANH_OPTIONS = ['Tất cả', ...CHUYEN_NGANH_OPTIONS]

interface Feedback {
    id: string
    user_id: string
    rating: number | null
    content: string | null
    feedback_type: string
    status: string
    created_at: string
    question_id: string | null
    hang: string | null
    phan_thi: string | null
    stt: number | null
    chuyen_nganh: string | null
    email: string | null
    displayName?: string | null
    answer: {
        content: string
        responded_at: string
        admin_id: string
    } | null
}

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

const FEEDBACK_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
    app_rating: { label: 'Đánh giá ứng dụng', icon: Star, color: 'text-yellow-500' },
    app_feedback: { label: 'Góp ý chung', icon: MessageSquare, color: 'text-blue-500' },
    bug_report: { label: 'Báo lỗi ứng dụng', icon: AlertTriangle, color: 'text-red-500' },
    question_error: { label: 'Báo sai câu hỏi', icon: AlertTriangle, color: 'text-orange-500' },
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: 'Chờ xử lý', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
    reviewed: { label: 'Đã xem', color: 'bg-apple-blue/10 text-apple-blue border-apple-blue/20' },
    resolved: { label: 'Đã xử lý', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
}

export default function QuanTriPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [isUserAdmin, setIsUserAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    const [activeAdminTab, setActiveAdminTab] = useState<'feedback' | 'questions' | 'practice' | 'exams' | 'profiles' | 'news'>('feedback')
    const [allFeedbacks, setAllFeedbacks] = useState<Feedback[]>([])
    const [adminLoading, setAdminLoading] = useState(false)

    // Feedback filters
    const [feedbackFilter, setFeedbackFilter] = useState<'pending' | 'resolved'>('pending')
    const [selectedEmail, setSelectedEmail] = useState('Tất cả')
    const [searchType, setSearchType] = useState('Tất cả')
    const [feedbackSortConfig, setFeedbackSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'created_at', direction: 'desc' })

    const requestFeedbackSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'desc'
        if (feedbackSortConfig.key === key && feedbackSortConfig.direction === 'desc') {
            direction = 'asc'
        } else if (feedbackSortConfig.key === key && feedbackSortConfig.direction === 'asc') {
            direction = null
        }
        setFeedbackSortConfig({ key, direction })
    }

    useEffect(() => {
        checkUser()
    }, [])

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        if (!isAdmin(user.email)) {
            router.push('/')
            return
        }

        setUser(user)
        setIsUserAdmin(true)
        setLoading(false)
        fetchAllFeedbacks()
    }

    async function fetchAllFeedbacks() {
        setAdminLoading(true)
        try {
            const [feedbackRes, profilesRes] = await Promise.all([
                supabase.from('user_feedback').select('*').order('created_at', { ascending: false }),
                supabase.from('profiles').select('id, email, display_name, user_name')
            ])

            if (feedbackRes.error) throw feedbackRes.error
            if (profilesRes.error) throw profilesRes.error

            const profilesMap = new Map(profilesRes.data.map(p => [p.id, p.display_name || p.user_name || p.email]))

            const feedbacksWithNames = (feedbackRes.data || []).map(fb => ({
                ...fb,
                displayName: profilesMap.get(fb.user_id) || fb.email || 'Người dùng ẩn danh'
            }))

            setAllFeedbacks(feedbacksWithNames)
        } catch (error) {
            console.error('Error fetching all feedbacks:', error)
        } finally {
            setAdminLoading(false)
        }
    }

    const updateFeedbackStatus = async (feedbackId: string, newStatus: string, adminResponse?: string) => {
        try {
            const updateData: any = { status: newStatus }

            if (adminResponse) {
                updateData.answer = {
                    content: adminResponse,
                    responded_at: new Date().toISOString(),
                    admin_id: user?.id
                }
            }

            const { error } = await supabase
                .from('user_feedback')
                .update(updateData)
                .eq('id', feedbackId)

            if (error) throw error

            fetchAllFeedbacks()
            alert('Cập nhật thành công!')
        } catch (error) {
            console.error('Error updating feedback:', error)
            alert('Có lỗi xảy ra khi cập nhật.')
        }
    }

    const deleteFeedback = async (feedbackId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa góp ý này không?')) return

        try {
            const { error } = await supabase
                .from('user_feedback')
                .delete()
                .eq('id', feedbackId)

            if (error) throw error

            fetchAllFeedbacks()
            alert('Đã xóa góp ý thành công!')
        } catch (error) {
            console.error('Error deleting feedback:', error)
            alert('Có lỗi xảy ra khi xóa.')
        }
    }

    if (!user || loading) {
        return (
            <div className="min-h-screen bg-apple-bg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
            </div>
        )
    }

    // Calculate counts
    const pendingGeneralCount = allFeedbacks.filter(f => f.status !== 'resolved' && !f.question_id).length
    const pendingQuestionCount = allFeedbacks.filter(f => f.status !== 'resolved' && f.question_id).length

    // Filter for "Quản trị góp ý" (exclude question feedbacks)
    const generalFeedbacks = allFeedbacks.filter(f => !f.question_id)

    return (
        <div className="min-h-screen bg-apple-bg">
            {/* Header */}
            <div className="flex-shrink-0 px-4 md:px-6 pt-4 md:pt-6 pb-4 flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-apple-text tracking-tight">
                        Bảng quản trị
                    </h1>
                    <p className="text-apple-text-secondary text-xs md:text-sm font-normal">
                        Quản lý hệ thống và yêu cầu người dùng
                    </p>
                </div>
            </div>

            {/* Admin Tabs */}
            <div className="px-4 md:px-6 mb-4 flex gap-6 border-b border-apple-border">
                <button
                    onClick={() => setActiveAdminTab('feedback')}
                    className={`pb-3 px-2 text-sm font-bold transition-all relative flex items-center gap-2 ${activeAdminTab === 'feedback'
                        ? 'text-apple-blue'
                        : 'text-apple-text-secondary hover:text-apple-text'
                        }`}
                >
                    <MessageSquare className="w-4 h-4" />
                    Quản trị góp ý
                    {pendingGeneralCount > 0 && <span className="text-red-500">({pendingGeneralCount})</span>}
                    {activeAdminTab === 'feedback' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-blue" />
                    )}
                </button>
                <button
                    onClick={() => setActiveAdminTab('questions')}
                    className={`pb-3 px-2 text-sm font-bold transition-all relative flex items-center gap-2 ${activeAdminTab === 'questions'
                        ? 'text-apple-blue'
                        : 'text-apple-text-secondary hover:text-apple-text'
                        }`}
                >
                    <Database className="w-4 h-4" />
                    Quản trị câu hỏi
                    {pendingQuestionCount > 0 && <span className="text-red-500">({pendingQuestionCount})</span>}
                    {activeAdminTab === 'questions' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-blue" />
                    )}
                </button>
                <button
                    onClick={() => setActiveAdminTab('practice')}
                    className={`pb-3 px-2 text-sm font-bold transition-all relative flex items-center gap-2 ${activeAdminTab === 'practice'
                        ? 'text-apple-blue'
                        : 'text-apple-text-secondary hover:text-apple-text'
                        }`}
                >
                    <BookOpen className="w-4 h-4" />
                    Quản trị ôn tập
                    {activeAdminTab === 'practice' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-blue" />
                    )}
                </button>
                <button
                    onClick={() => setActiveAdminTab('exams')}
                    className={`pb-3 px-2 text-sm font-bold transition-all relative flex items-center gap-2 ${activeAdminTab === 'exams'
                        ? 'text-apple-blue'
                        : 'text-apple-text-secondary hover:text-apple-text'
                        }`}
                >
                    <BarChart3 className="w-4 h-4" />
                    Quản trị Thi thử
                    {activeAdminTab === 'exams' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-blue" />
                    )}
                </button>
                <button
                    onClick={() => setActiveAdminTab('profiles')}
                    className={`pb-3 px-2 text-sm font-bold transition-all relative flex items-center gap-2 ${activeAdminTab === 'profiles'
                        ? 'text-apple-blue'
                        : 'text-apple-text-secondary hover:text-apple-text'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Quản trị Tài khoản
                    {activeAdminTab === 'profiles' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-blue" />
                    )}
                </button>
                <button
                    onClick={() => setActiveAdminTab('news')}
                    className={`pb-3 px-2 text-sm font-bold transition-all relative flex items-center gap-2 ${activeAdminTab === 'news'
                        ? 'text-apple-blue'
                        : 'text-apple-text-secondary hover:text-apple-text'
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    Quản trị Tin tức
                    {activeAdminTab === 'news' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-blue" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="px-4 md:px-6 py-4 md:py-6">
                {activeAdminTab === 'feedback' ? (
                    <>
                        {adminLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* ... (previous filters and table) */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setFeedbackFilter('pending')}
                                            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all border ${feedbackFilter === 'pending'
                                                ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                                : 'bg-apple-card text-apple-text-secondary border-apple-border hover:border-apple-text/30'
                                                }`}
                                        >
                                            Chờ xử lý
                                            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-yellow-500/20 text-yellow-700">
                                                {generalFeedbacks.filter(f => f.status !== 'resolved').length}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => setFeedbackFilter('resolved')}
                                            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all border ${feedbackFilter === 'resolved'
                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                : 'bg-apple-card text-apple-text-secondary border-apple-border hover:border-apple-text/30'
                                                }`}
                                        >
                                            Đã xử lý
                                            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-700">
                                                {generalFeedbacks.filter(f => f.status === 'resolved').length}
                                            </span>
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <select
                                            value={selectedEmail}
                                            onChange={(e) => setSelectedEmail(e.target.value)}
                                            className="min-w-[240px] px-3 py-2 bg-apple-card border border-apple-border rounded-xl text-xs font-bold text-apple-text outline-none focus:border-apple-blue/30 transition-colors"
                                        >
                                            <option value="Tất cả" className="bg-apple-card">Tất cả Email</option>
                                            {Array.from(new Set(generalFeedbacks.map(fb => fb.email).filter(Boolean)))
                                                .sort()
                                                .map((email) => (
                                                    <option key={email} value={email!} className="bg-apple-card">{email}</option>
                                                ))}
                                        </select>
                                        <select
                                            value={searchType}
                                            onChange={(e) => setSearchType(e.target.value)}
                                            className="px-3 py-2 bg-apple-card border border-apple-border rounded-xl text-xs font-bold text-apple-text outline-none focus:border-apple-blue/30 transition-colors"
                                        >
                                            <option value="Tất cả" className="bg-apple-card">Tất cả loại góp ý</option>
                                            {Object.entries(FEEDBACK_TYPE_LABELS).map(([key, info]) => (
                                                <option key={key} value={key} className="bg-apple-card">{info.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-apple-card border border-apple-border rounded-2xl overflow-x-auto shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-apple-bg border-b border-apple-border">
                                            <tr>
                                                <th
                                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary cursor-pointer hover:text-apple-blue transition-colors group"
                                                    onClick={() => requestFeedbackSort('displayName')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Người gửi
                                                        <ChevronDown className={`w-3 h-3 transition-transform ${feedbackSortConfig.key === 'displayName' ? (feedbackSortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                                    </div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary cursor-pointer hover:text-apple-blue transition-colors group"
                                                    onClick={() => requestFeedbackSort('created_at')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Ngày gửi
                                                        <ChevronDown className={`w-3 h-3 transition-transform ${feedbackSortConfig.key === 'created_at' ? (feedbackSortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                                    </div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary cursor-pointer hover:text-apple-blue transition-colors group"
                                                    onClick={() => requestFeedbackSort('feedback_type')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Phân loại
                                                        <ChevronDown className={`w-3 h-3 transition-transform ${feedbackSortConfig.key === 'feedback_type' ? (feedbackSortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-xs font-semibold text-apple-text-secondary">Nội dung</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-apple-text-secondary text-center">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {generalFeedbacks
                                                .filter(fb => {
                                                    const statusMatch = feedbackFilter === 'pending' ? fb.status !== 'resolved' : fb.status === 'resolved'
                                                    const typeMatch = searchType === 'Tất cả' || fb.feedback_type === searchType
                                                    const emailMatch = selectedEmail === 'Tất cả' || fb.email === selectedEmail
                                                    return statusMatch && typeMatch && emailMatch
                                                })
                                                .sort((a, b) => {
                                                    if (!feedbackSortConfig.direction) return 0
                                                    const key = feedbackSortConfig.key as keyof Feedback
                                                    const isAsc = feedbackSortConfig.direction === 'asc'

                                                    let valA: any = a[key]
                                                    let valB: any = b[key]

                                                    if (key === 'displayName') {
                                                        valA = (a.displayName || '').toLowerCase()
                                                        valB = (b.displayName || '').toLowerCase()
                                                    } else if (key === 'created_at') {
                                                        valA = new Date(a.created_at).getTime()
                                                        valB = new Date(b.created_at).getTime()
                                                    }

                                                    if (valA < valB) return isAsc ? -1 : 1
                                                    if (valA > valB) return isAsc ? 1 : -1
                                                    return 0
                                                })
                                                .map((fb) => (
                                                    <AdminFeedbackRow
                                                        key={fb.id}
                                                        feedback={fb}
                                                        onUpdateStatus={updateFeedbackStatus}
                                                        onDelete={deleteFeedback}
                                                    />
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                ) : activeAdminTab === 'questions' ? (
                    <AdminQuestionManager onDataChange={fetchAllFeedbacks} allFeedbacks={allFeedbacks} />
                ) : activeAdminTab === 'practice' ? (
                    <AdminPracticeManager />
                ) : activeAdminTab === 'exams' ? (
                    <AdminExamManager />
                ) : activeAdminTab === 'profiles' ? (
                    <AdminProfilesManager />
                ) : (
                    <AdminNewsManager />
                )}
            </div>
        </div>
    )
}

function AdminQuestionManager({ onDataChange, allFeedbacks }: { onDataChange: () => void, allFeedbacks: Feedback[] }) {
    // Determine active tab
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'resolved'>('all')
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [totalCount, setTotalCount] = useState(0) // Count of questions in DB

    // Filters for "All" tab
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedHang, setSelectedHang] = useState('Tất cả')
    const [selectedChuyenNganh, setSelectedChuyenNganh] = useState('Tất cả')
    const [selectedPhanThi, setSelectedPhanThi] = useState('Tất cả')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null)
    const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null)
    const [activeModalTab, setActiveModalTab] = useState<'feedback' | 'details'>('details')
    const [isSaving, setIsSaving] = useState(false)

    // User session for admin actions
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
        // Fetch total questions count initially
        fetchTotalQuestionsCount()
    }, [])

    useEffect(() => {
        if (activeTab === 'all') {
            loadQuestions()
        }
    }, [activeTab, selectedHang, selectedChuyenNganh, selectedPhanThi, currentPage, searchQuery])

    // Derived states for feedback
    const questionFeedbacks = allFeedbacks.filter(f => f.question_id)
    const pendingFeedbacks = questionFeedbacks.filter(f => f.status !== 'resolved')
    const resolvedFeedbacks = questionFeedbacks.filter(f => f.status === 'resolved')

    // Current list to display based on tab
    const displayFeedbacks = activeTab === 'pending' ? pendingFeedbacks : activeTab === 'resolved' ? resolvedFeedbacks : []

    async function fetchTotalQuestionsCount() {
        try {
            const { count, error } = await supabase.from('questions').select('*', { count: 'exact', head: true })
            if (!error && count !== null) {
                setTotalCount(count)
            }
        } catch (error) {
            console.error('Error fetching count:', error)
        }
    }

    async function loadQuestions() {
        setLoading(true)
        try {
            let query = supabase
                .from('questions')
                .select('*', { count: 'exact' })

            if (selectedHang !== 'Tất cả') query = query.eq('hang', selectedHang)
            if (selectedChuyenNganh !== 'Tất cả') query = query.eq('chuyen_nganh', selectedChuyenNganh)
            if (selectedPhanThi !== 'Tất cả') query = query.eq('phan_thi', selectedPhanThi)

            const { data, error, count } = await query.order('id', { ascending: false })

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

                // If we are filtering/searching, we probably want to update the displayed count for the list
                // but the tab count usually shows TOTAL database questions.
                // We'll keep totalCount as DB count, unless filters apply? 
                // Creating a separate state for 'filteredCount' if needed, but for now reuse filteredData.length
                // actually setQuestions is sliced.

                // For the pagination
                // If filters apply, use filtered length
                const currentTotal = filteredData.length

                const from = (currentPage - 1) * itemsPerPage
                const to = from + itemsPerPage
                setQuestions(filteredData.slice(from, to))

                // Only update totalCount if no filters (approx logic, or keep separated)
                // The user asked for "Tong so luong o tren moi tab".
                // Usually this means total available in that category. Filtered results are separate.
            }
        } catch (error) {
            console.error('Error loading questions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingQuestion) return

        setIsSaving(true)
        try {
            const { id, ...data } = editingQuestion

            if (id) {
                const { error } = await supabase
                    .from('questions')
                    .update(data)
                    .eq('id', id)
                if (error) throw error
                alert('Cập nhật câu hỏi thành công!')
            } else {
                const { error } = await supabase
                    .from('questions')
                    .insert([data])
                if (error) throw error
                alert('Thêm câu hỏi mới thành công!')
                fetchTotalQuestionsCount() // Update count
            }

            setIsModalOpen(false)
            if (activeTab === 'all') loadQuestions()
        } catch (error) {
            console.error('Error saving question:', error)
            alert('Có lỗi xảy ra khi lưu câu hỏi.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) return

        try {
            const { error } = await supabase
                .from('questions')
                .delete()
                .eq('id', id)

            if (error) throw error
            alert('Đã xóa câu hỏi thành công!')
            loadQuestions()
            fetchTotalQuestionsCount() // Update count
        } catch (error) {
            console.error('Error deleting question:', error)
            alert('Có lỗi xảy ra khi xóa.')
        }
    }

    const openEditModal = async (q: Question | number | null = null, feedback: Feedback | null = null) => {
        if (typeof q === 'number') {
            const { data } = await supabase.from('questions').select('*').eq('id', q).single()
            if (data) {
                setEditingQuestion(data)
                setEditingFeedback(feedback)
                setActiveModalTab(feedback ? 'feedback' : 'details')
                setIsModalOpen(true)
            } else {
                alert('Không tìm thấy câu hỏi này (có thể đã bị xóa).')
            }
            return
        }

        setEditingQuestion(q || {
            cau_hoi: '',
            dap_an_a: '',
            dap_an_b: '',
            dap_an_c: '',
            dap_an_d: '',
            dap_an_dung: 'A',
            hang: HANG_OPTIONS[0],
            phan_thi: PHAN_THI_OPTIONS[0],
            chuyen_nganh: CHUYEN_NGANH_OPTIONS[0]
        })
        setEditingFeedback(feedback)
        setActiveModalTab(feedback ? 'feedback' : 'details')
        setIsModalOpen(true)
    }

    const updateFeedbackStatus = async (feedbackId: string, newStatus: string, adminResponse?: string) => {
        try {
            const updateData: any = { status: newStatus }
            if (adminResponse) {
                updateData.answer = {
                    content: adminResponse,
                    responded_at: new Date().toISOString(),
                    admin_id: user?.id
                }
            }
            const { error } = await supabase.from('user_feedback').update(updateData).eq('id', feedbackId)
            if (error) throw error
            onDataChange() // Sync parent
            alert('Cập nhật thành công!')
        } catch (error) {
            console.error('Error:', error)
            alert('Lỗi cập nhật.')
        }
    }

    const deleteFeedbackItem = async (feedbackId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa góp ý này?')) return
        try {
            const { error } = await supabase.from('user_feedback').delete().eq('id', feedbackId)
            if (error) throw error
            onDataChange() // Sync parent
            alert('Đã xóa góp ý.')
        } catch (err) {
            console.error(err)
            alert('Lỗi khi xóa.')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {/* Sub-tabs with Counts */}
                    <div className="flex p-1 bg-apple-bg border border-apple-border rounded-xl">
                        {[
                            { id: 'all', label: 'Tất cả', count: totalCount },
                            { id: 'pending', label: 'Chờ xử lý', count: pendingFeedbacks.length },
                            { id: 'resolved', label: 'Đã xử lý', count: resolvedFeedbacks.length }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-apple-card text-apple-text shadow-sm'
                                    : 'text-apple-text-secondary hover:text-apple-text'
                                    }`}
                            >
                                {tab.label}
                                <span className="text-apple-blue">({tab.count})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'all' && (
                    <button
                        onClick={() => openEditModal()}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-apple-blue text-white rounded-xl text-sm font-bold hover:bg-apple-blue/90 transition-all shadow-sm active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm câu hỏi mới
                    </button>
                )}
            </div>

            {/* Content Switcher */}
            {activeTab === 'all' ? (
                <>
                    {/* Filters */}
                    <div className="bg-apple-card border border-apple-border rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-secondary" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm nội dung..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="w-full pl-9 pr-3 py-2 bg-apple-bg border border-apple-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-apple-blue"
                                />
                            </div>
                            <select
                                value={selectedHang}
                                onChange={(e) => {
                                    setSelectedHang(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="px-3 py-2 bg-apple-bg border border-apple-border rounded-lg text-sm text-apple-text outline-none focus:border-apple-blue/30"
                            >
                                {FILTER_HANG_OPTIONS.map(h => <option key={h} value={h} className="bg-apple-card">{h}</option>)}
                            </select>
                            <select
                                value={selectedPhanThi}
                                onChange={(e) => {
                                    setSelectedPhanThi(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="px-3 py-2 bg-apple-bg border border-apple-border rounded-lg text-sm text-apple-text outline-none focus:border-apple-blue/30"
                            >
                                {FILTER_PHAN_THI_OPTIONS.map(p => <option key={p} value={p} className="bg-apple-card">{p}</option>)}
                            </select>
                            <select
                                value={selectedChuyenNganh}
                                onChange={(e) => {
                                    setSelectedChuyenNganh(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="px-3 py-2 bg-apple-bg border border-apple-border rounded-lg text-sm text-apple-text outline-none focus:border-apple-blue/30"
                            >
                                {FILTER_CHUYEN_NGANH_OPTIONS.map(c => <option key={c} value={c} className="bg-apple-card">{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Question List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="text-center py-20 bg-apple-bg rounded-2xl border-2 border-dashed border-apple-border">
                                <p className="text-apple-text-secondary font-bold">Không tìm thấy câu hỏi nào</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-apple-card border border-apple-border rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-apple-bg border-b border-apple-border">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-semibold text-apple-text-secondary w-16 text-center">ID</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-apple-text-secondary">Nội dung câu hỏi</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-apple-text-secondary w-40">Phân loại</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-apple-text-secondary w-32 text-center">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {questions.map((q) => (
                                                <tr key={q.id} className="border-b border-apple-border hover:bg-apple-bg/30 transition-colors">
                                                    <td className="px-6 py-4 text-xs font-bold text-apple-text-secondary text-center">{q.id}</td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-bold text-apple-text line-clamp-2 mb-1">{q.cau_hoi}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600`}>
                                                                Đáp án: {q.dap_an_dung}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-apple-blue uppercase whitespace-nowrap">{q.hang}</p>
                                                            <p className="text-[10px] text-apple-text-secondary line-clamp-1">{q.phan_thi}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => openEditModal(q)}
                                                                className="p-2 text-apple-text-secondary hover:text-apple-blue hover:bg-apple-blue/5 rounded-lg transition-all"
                                                                title="Sửa"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(q.id)}
                                                                className="p-2 text-apple-text-secondary hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination (uses totalCount of filtered if filtered, or totalCount) - Simplification: basic pagination logic based on current questions length might be tricky without exact query count in filtered mode. But we have 'count' in select. Let's rely on standard UI */}
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex gap-2">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => p - 1)}
                                            className="p-2 bg-apple-card border border-apple-border text-apple-text rounded-lg disabled:opacity-30"
                                        >
                                            <ChevronDown className="w-4 h-4 rotate-90" />
                                        </button>
                                        <button
                                            // Simple check: if we got full itemsPerPage, assume there might be next page or rely on total count
                                            disabled={questions.length < itemsPerPage && currentPage * itemsPerPage >= totalCount}
                                            onClick={() => setCurrentPage(p => p + 1)}
                                            className="p-2 bg-apple-card border border-apple-border text-apple-text rounded-lg disabled:opacity-30"
                                        >
                                            <ChevronDown className="w-4 h-4 -rotate-90" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-apple-card border border-apple-border rounded-2xl overflow-hidden shadow-sm">
                    {displayFeedbacks.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-apple-text-secondary font-bold">Không có yêu cầu nào</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-apple-bg border-b border-apple-border">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-apple-text-secondary uppercase tracking-wider">Người gửi</th>
                                    <th className="px-6 py-4 text-xs font-black text-apple-text-secondary uppercase tracking-wider">Câu hỏi liên quan</th>
                                    <th className="px-6 py-4 text-xs font-black text-apple-text-secondary uppercase tracking-wider">Nội dung</th>
                                    <th className="px-6 py-4 text-xs font-black text-apple-text-secondary uppercase tracking-wider text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayFeedbacks.map((fb) => (
                                    <tr key={fb.id} className="border-b border-apple-border hover:bg-apple-bg/30">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-apple-text text-sm">{fb.email || 'N/A'}</span>
                                                <span className="text-[10px] text-apple-text-secondary text-xs">{formatDistanceToNow(new Date(fb.created_at), { addSuffix: true, locale: vi })}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => openEditModal(parseInt(fb.question_id!), fb)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-apple-blue/10 text-apple-blue rounded-lg text-xs font-bold hover:bg-apple-blue/20 transition-all"
                                            >
                                                ID: {fb.question_id}
                                                <Edit className="w-3 h-3" />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-apple-text max-w-[400px]">{fb.content}</p>
                                            {fb.answer && (
                                                <div className="mt-2 text-xs text-apple-text-secondary italic pl-2 border-l-2 border-apple-blue">
                                                    Admin: {fb.answer.content}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {activeTab === 'pending' ? (
                                                    <button
                                                        onClick={() => updateFeedbackStatus(fb.id, 'resolved', 'Đã kiểm tra và xử lý.')}
                                                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-emerald-500/20"
                                                    >
                                                        Xử lý xong
                                                    </button>
                                                ) : (
                                                    <span className="px-3 py-1.5 bg-apple-input text-apple-text-secondary rounded-lg text-xs font-bold">Đã xong</span>
                                                )}

                                                <button
                                                    onClick={() => deleteFeedbackItem(fb.id)}
                                                    className="p-2 text-apple-text-secondary hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Edit/Add Modal */}
            {isModalOpen && editingQuestion && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-apple-card w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-apple-border">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-apple-border flex items-center justify-between bg-apple-bg/50">
                            <div>
                                <h3 className="text-xl font-bold text-apple-text">
                                    {editingQuestion.id ? `Chỉnh sửa câu hỏi #${editingQuestion.id}` : 'Thêm câu hỏi mới'}
                                </h3>
                                <p className="text-xs text-apple-text-secondary mt-1">
                                    {editingFeedback
                                        ? 'Xem góp ý và cập nhật thông tin câu hỏi'
                                        : 'Vui lòng nhập đầy đủ thông tin bên dưới'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-apple-border/50 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-apple-text-secondary" />
                            </button>
                        </div>

                        {/* Modal Tabs (only if feedback exists) */}
                        {editingFeedback && (
                            <div className="flex border-b border-apple-border px-8">
                                <button
                                    onClick={() => setActiveModalTab('feedback')}
                                    className={`py-3 px-4 text-sm font-bold transition-all relative ${activeModalTab === 'feedback'
                                        ? 'text-apple-blue'
                                        : 'text-apple-text-secondary hover:text-apple-text'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Nội dung góp ý
                                    </div>
                                    {activeModalTab === 'feedback' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-blue" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveModalTab('details')}
                                    className={`py-3 px-4 text-sm font-bold transition-all relative ${activeModalTab === 'details'
                                        ? 'text-apple-blue'
                                        : 'text-apple-text-secondary hover:text-apple-text'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Thông tin chi tiết
                                    </div>
                                    {activeModalTab === 'details' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-blue" />
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Modal Content */}
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 bg-apple-bg/30">
                            {/* Tab 1: Feedback Content */}
                            {editingFeedback && activeModalTab === 'feedback' && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-orange-500 uppercase tracking-wide">Người dùng báo cáo</p>
                                                <p className="text-sm font-bold text-apple-text">{editingFeedback.email || 'Ẩn danh'}</p>
                                            </div>
                                            <div className="ml-auto text-xs text-apple-text-secondary">
                                                {format(new Date(editingFeedback.created_at), 'dd/MM/yyyy HH:mm:ss')}
                                            </div>
                                        </div>
                                        <div className="bg-apple-card p-4 rounded-xl border border-apple-border shadow-sm">
                                            <p className="text-apple-text text-sm italic">"{editingFeedback.content}"</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setActiveModalTab('details')}
                                            className="px-6 py-2 bg-apple-blue text-white rounded-xl text-sm font-bold shadow hover:bg-apple-blue/90"
                                        >
                                            Chuyển sang sửa câu hỏi &rarr;
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Question Details */}
                            {(!editingFeedback || activeModalTab === 'details') && (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">

                                    {/* Section 1: Question Content & Answers */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 text-apple-text">
                                            <FileText className="w-5 h-5 text-apple-blue" />
                                            <h4 className="text-sm font-black uppercase tracking-wider">Nội dung câu hỏi & Đáp án</h4>
                                        </div>

                                        <div className="bg-apple-card border border-apple-border rounded-2xl p-6 shadow-sm space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black text-apple-text-secondary uppercase tracking-[0.2em]">Câu hỏi</label>
                                                <textarea
                                                    required
                                                    value={editingQuestion.cau_hoi}
                                                    onChange={(e) => setEditingQuestion({ ...editingQuestion, cau_hoi: e.target.value })}
                                                    className="w-full px-5 py-4 bg-apple-bg border border-apple-border rounded-xl text-[15px] font-bold text-apple-text focus:outline-none focus:ring-4 focus:ring-apple-blue/5 focus:border-apple-blue/30 transition-all min-h-[100px]"
                                                    placeholder="Nhập nội dung câu hỏi..."
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {[
                                                    { key: 'dap_an_a', label: 'Đáp án A' },
                                                    { key: 'dap_an_b', label: 'Đáp án B' },
                                                    { key: 'dap_an_c', label: 'Đáp án C' },
                                                    { key: 'dap_an_d', label: 'Đáp án D' }
                                                ].map((item) => (
                                                    <div key={item.key} className="space-y-2">
                                                        <label className="text-[11px] font-black text-apple-text-secondary uppercase tracking-[0.2em]">{item.label}</label>
                                                        <div className="relative group">
                                                            <input
                                                                type="text"
                                                                required={item.key !== 'dap_an_d'}
                                                                value={(editingQuestion as any)[item.key] || ''}
                                                                onChange={(e) => setEditingQuestion({ ...editingQuestion, [item.key]: e.target.value })}
                                                                className="w-full px-5 py-4 bg-apple-bg border border-apple-border rounded-xl text-[14px] font-bold text-apple-text focus:outline-none focus:ring-4 focus:ring-apple-blue/5 focus:border-apple-blue/30 transition-all"
                                                                placeholder={`Nội dung ${item.label}...`}
                                                            />
                                                            {(editingQuestion as any).dap_an_dung === item.key.split('_')[2].toUpperCase() && (
                                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                                                                    <Check className="w-4 h-4 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black text-apple-text-secondary uppercase tracking-[0.2em]">Đáp án đúng</label>
                                                <select
                                                    value={editingQuestion.dap_an_dung}
                                                    onChange={(e) => setEditingQuestion({ ...editingQuestion, dap_an_dung: e.target.value })}
                                                    className="w-full px-5 py-4 bg-apple-bg border border-apple-border rounded-xl text-[14px] font-bold text-apple-text outline-none focus:border-apple-blue/30 transition-all"
                                                >
                                                    <option value="A">Câu A</option>
                                                    <option value="B">Câu B</option>
                                                    <option value="C">Câu C</option>
                                                    <option value="D">Câu D</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Metadata */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 text-apple-text">
                                            <Info className="w-5 h-5 text-apple-blue" />
                                            <h4 className="text-sm font-black uppercase tracking-wider">Thông tin phân loại</h4>
                                        </div>

                                        <div className="bg-apple-blue/5 border border-apple-blue/10 rounded-2xl p-6 shadow-sm">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-black text-apple-text-secondary uppercase tracking-[0.2em]">Hạng mục</label>
                                                    <select
                                                        value={editingQuestion.hang}
                                                        onChange={(e) => setEditingQuestion({ ...editingQuestion, hang: e.target.value })}
                                                        className="w-full px-5 py-4 bg-apple-card border border-apple-border rounded-xl text-[14px] font-bold text-apple-text outline-none focus:border-apple-blue/30 transition-all"
                                                    >
                                                        {HANG_OPTIONS.map(h => <option key={h} value={h} className="bg-apple-card">{h}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-black text-apple-text-secondary uppercase tracking-[0.2em]">Phần thi</label>
                                                    <select
                                                        value={editingQuestion.phan_thi}
                                                        onChange={(e) => setEditingQuestion({ ...editingQuestion, phan_thi: e.target.value })}
                                                        className="w-full px-5 py-4 bg-apple-card border border-apple-border rounded-xl text-[14px] font-bold text-apple-text outline-none focus:border-apple-blue/30 transition-all"
                                                    >
                                                        {PHAN_THI_OPTIONS.map(p => <option key={p} value={p} className="bg-apple-card">{p}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-[11px] font-black text-apple-text-secondary uppercase tracking-[0.2em]">Chuyên ngành</label>
                                                    <select
                                                        value={editingQuestion.chuyen_nganh}
                                                        onChange={(e) => setEditingQuestion({ ...editingQuestion, chuyen_nganh: e.target.value })}
                                                        className="w-full px-5 py-4 bg-apple-card border border-apple-border rounded-xl text-[14px] font-bold text-apple-text outline-none focus:border-apple-blue/30 transition-all"
                                                    >
                                                        {CHUYEN_NGANH_OPTIONS.map(c => <option key={c} value={c} className="bg-apple-card">{c}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Footer */}
                        <div className="px-8 py-6 border-t border-apple-border bg-apple-bg/50 flex items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 bg-apple-card border border-apple-border text-apple-text text-sm font-bold rounded-2xl hover:bg-apple-input transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-8 py-3 bg-apple-blue text-white text-sm font-bold rounded-2xl hover:bg-apple-blue/90 shadow-lg shadow-apple-blue/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                {editingQuestion.id ? 'Lưu thay đổi' : 'Thêm mới ngay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function AdminFeedbackRow({ feedback, onUpdateStatus, onDelete }: { feedback: Feedback, onUpdateStatus: any, onDelete: any }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [adminResponse, setAdminResponse] = useState(feedback.answer?.content || '')
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

    const statusInfo = STATUS_LABELS[feedback.status] || STATUS_LABELS.pending

    return (
        <>
            <tr className={`border-b border-apple-border hover:bg-apple-bg/50 transition-colors ${isExpanded ? 'bg-apple-blue/[0.02]' : ''}`}>
                <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-apple-text">{feedback.displayName || feedback.email || 'N/A'}</span>
                        <span className="text-[10px] text-apple-text-secondary">{feedback.email} • UID: {feedback.user_id.substring(0, 8)}...</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-xs text-apple-text-secondary">
                    {format(new Date(feedback.created_at), 'dd/MM/yyyy HH:mm:ss')}
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                        <span className="text-xs font-bold text-apple-text">{typeInfo.label}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-apple-text line-clamp-2 max-w-[400px]">{feedback.content}</p>

                        {feedback.answer && (
                            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                <p className="text-[10px] font-bold text-emerald-600 mb-0.5 flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Admin đã trả lời:
                                </p>
                                <p className="text-xs text-emerald-700 line-clamp-2 italic">
                                    "{feedback.answer.content}"
                                </p>
                            </div>
                        )}

                        <span className={`w-fit px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                            {statusInfo.label}
                        </span>
                    </div>
                </td>
                <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setIsExpanded(!isExpanded)} className={`p-2 rounded-lg transition-all ${isExpanded ? 'bg-apple-blue text-white' : 'text-apple-text-secondary hover:bg-apple-border'}`} title="Chi tiết">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                        </button>
                        <button onClick={() => onDelete(feedback.id)} className="p-2 text-apple-text-secondary hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </tr>
            {isExpanded && (
                <tr>
                    <td colSpan={5} className="px-8 py-6 bg-apple-bg/30 border-b border-apple-border">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-4">
                                <h4 className="text-[11px] font-black text-apple-text-secondary uppercase tracking-wider">Nội dung từ người dùng</h4>
                                <div className="p-4 bg-apple-card border border-apple-border rounded-2xl shadow-sm italic text-sm text-apple-text">
                                    {feedback.content}
                                </div>
                                {feedback.question_id && (
                                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className="font-bold text-orange-500">📌 Câu hỏi:</span>
                                            <span className="bg-orange-500/10 px-1.5 py-0.5 rounded text-apple-text">{feedback.hang}</span>
                                            <span className="bg-orange-500/10 px-1.5 py-0.5 rounded text-apple-text">{feedback.phan_thi}</span>
                                            <span className="bg-orange-500/10 px-1.5 py-0.5 rounded text-apple-text">STT: {feedback.stt}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-4">
                                <h4 className="text-[11px] font-black text-apple-text-secondary uppercase tracking-wider">Phản hồi của Admin</h4>
                                {feedback.answer ? (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                        <p className="text-xs text-emerald-600 font-bold mb-1 italic">
                                            Đã phản hồi vào {format(new Date(feedback.answer.responded_at), 'dd/MM/yyyy HH:mm:ss')}
                                        </p>
                                        <p className="text-sm text-emerald-700">{feedback.answer.content}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <textarea
                                            value={adminResponse}
                                            onChange={(e) => setAdminResponse(e.target.value)}
                                            className="w-full p-3 bg-apple-card border border-apple-border rounded-xl text-sm text-apple-text outline-none focus:ring-2 focus:ring-apple-blue/20 min-h-[100px]"
                                            placeholder="Nhập nội dung phản hồi..."
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={handleSendResponse} disabled={isSubmitting} className="px-6 py-2 bg-apple-blue text-white text-xs font-bold rounded-lg shadow hover:scale-105 transition-all">
                                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gửi phản hồi & Đã xử lý'}
                                            </button>
                                            <button
                                                onClick={() => onUpdateStatus(feedback.id, 'reviewed')}
                                                className="px-4 py-2 bg-apple-card border border-apple-border text-apple-text text-xs font-bold rounded-lg hover:bg-apple-input transition-all"
                                            >
                                                Đánh dấu đã xem
                                            </button>
                                        </div>
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

// --- New Activity Tracking Components ---

function AdminProfilesManager() {
    const [loading, setLoading] = useState(true)
    const [profiles, setProfiles] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'created_at', direction: 'desc' })
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])

    useEffect(() => {
        fetchProfiles()
    }, [])

    async function fetchProfiles() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setProfiles(data || [])
        } catch (error) {
            console.error('Error fetching profiles:', error)
        } finally {
            setLoading(false)
        }
    }

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'desc'
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc'
        } else if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = null
        }
        setSortConfig({ key, direction })
    }

    const deleteUser = async (userId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này? Toàn bộ dữ liệu liên quan sẽ bị xóa.')) return
        try {
            const { error } = await supabase.from('profiles').delete().eq('id', userId)
            if (error) throw error
            setProfiles(prev => prev.filter(p => p.id !== userId))
            setSelectedUsers(prev => prev.filter(id => id !== userId))
            alert('Đã xóa thành công!')
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Có lỗi xảy ra khi xóa.')
        }
    }

    const deleteSelectedUsers = async () => {
        if (!confirm(`Bạn có chắc muốn xóa ${selectedUsers.length} tài khoản đã chọn không?`)) return
        try {
            const { error } = await supabase.from('profiles').delete().in('id', selectedUsers)
            if (error) throw error
            setProfiles(prev => prev.filter(p => !selectedUsers.includes(p.id)))
            setSelectedUsers([])
            alert('Đã xóa thành công!')
        } catch (error) {
            console.error('Error deleting users:', error)
            alert('Có lỗi xảy ra khi xóa.')
        }
    }

    const toggleSelectAll = () => {
        if (selectedUsers.length === filteredProfiles.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(filteredProfiles.map(p => p.id))
        }
    }

    const toggleSelectUser = (id: string) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(prev => prev.filter(uid => uid !== id))
        } else {
            setSelectedUsers(prev => [...prev, id])
        }
    }

    const filteredProfiles = profiles.filter(p => {
        const query = searchQuery.toLowerCase()
        return (
            p.email?.toLowerCase().includes(query) ||
            p.display_name?.toLowerCase().includes(query) ||
            p.user_name?.toLowerCase().includes(query) ||
            p.phone?.toLowerCase().includes(query)
        )
    }).sort((a, b) => {
        if (!sortConfig.direction) return 0
        const key = sortConfig.key
        const isAsc = sortConfig.direction === 'asc'

        let valA: any
        let valB: any

        if (key === 'displayName') {
            valA = (a.display_name || a.user_name || '').toLowerCase()
            valB = (b.display_name || b.user_name || '').toLowerCase()
        } else if (key === 'specialty') {
            valA = (a.preferences?.specialty || '').toLowerCase()
            valB = (b.preferences?.specialty || '').toLowerCase()
        } else if (key === 'rank') {
            valA = (a.preferences?.rank || '').toLowerCase()
            valB = (b.preferences?.rank || '').toLowerCase()
        } else if (key === 'created_at') {
            valA = new Date(a.created_at).getTime()
            valB = new Date(b.created_at).getTime()
        } else {
            valA = a[key]
            valB = b[key]
        }

        if (valA < valB) return isAsc ? -1 : 1
        if (valA > valB) return isAsc ? 1 : -1
        return 0
    })

    return (
        <div className="space-y-6">
            <div className="bg-apple-card border border-apple-border rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-secondary" />
                        <input
                            type="text"
                            placeholder="Tìm tên, email, username, SĐT..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-apple-bg border border-apple-border rounded-xl text-sm font-medium text-apple-text outline-none focus:border-apple-blue/30 transition-colors"
                        />
                    </div>

                    {selectedUsers.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-apple-text-secondary">
                                Đã chọn {selectedUsers.length}
                            </span>
                            <button
                                onClick={deleteSelectedUsers}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20"
                            >
                                <Trash2 className="w-4 h-4" />
                                Xóa đã chọn
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
                </div>
            ) : (
                <div className="bg-apple-card border border-apple-border rounded-2xl overflow-x-auto shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-apple-bg border-b border-apple-border">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length === filteredProfiles.length && filteredProfiles.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-apple-border text-apple-blue focus:ring-apple-blue/20"
                                    />
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary cursor-pointer hover:text-apple-blue transition-colors group"
                                    onClick={() => requestSort('displayName')}
                                >
                                    <div className="flex items-center gap-1">
                                        Người dùng
                                        <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'displayName' ? (sortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary cursor-pointer hover:text-apple-blue transition-colors group"
                                    onClick={() => requestSort('user_name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Username
                                        <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'user_name' ? (sortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-apple-text-secondary">Thông tin chung</th>
                                <th
                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary cursor-pointer hover:text-apple-blue transition-colors group"
                                    onClick={() => requestSort('specialty')}
                                >
                                    <div className="flex items-center gap-1">
                                        Chuyên ngành
                                        <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'specialty' ? (sortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary cursor-pointer hover:text-apple-blue transition-colors group"
                                    onClick={() => requestSort('rank')}
                                >
                                    <div className="flex items-center gap-1">
                                        Hạng
                                        <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'rank' ? (sortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary cursor-pointer hover:text-apple-blue transition-colors group"
                                    onClick={() => requestSort('created_at')}
                                >
                                    <div className="flex items-center gap-1">
                                        Ngày tham gia
                                        <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'created_at' ? (sortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-apple-text-secondary text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-apple-border">
                            {filteredProfiles.map((item) => (
                                <tr key={item.id} className={`hover:bg-apple-bg/50 transition-colors ${selectedUsers.includes(item.id) ? 'bg-apple-blue/5' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(item.id)}
                                            onChange={() => toggleSelectUser(item.id)}
                                            className="w-4 h-4 rounded border-apple-border text-apple-blue focus:ring-apple-blue/20"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-apple-bg border border-apple-border flex-shrink-0">
                                                {item.avata ? (
                                                    <img src={item.avata} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-apple-blue/10 text-apple-blue">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-apple-text">{item.display_name || 'N/A'}</span>
                                                <span className="text-[10px] text-apple-text-secondary font-medium">{item.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium text-apple-text-secondary">@{item.user_name || 'n/a'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1 text-[10px] text-apple-text-secondary font-medium">
                                                <Phone className="w-2.5 h-2.5" /> {item.phone || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-apple-text-secondary font-medium">
                                                <Briefcase className="w-2.5 h-2.5" /> {item.job_title || 'N/A'}
                                            </div>
                                            <div className="text-[10px] text-apple-text-secondary font-medium italic">
                                                Giới tính: {item.gender || 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold text-apple-text">{item.preferences?.specialty || 'Chưa chọn'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-[10px] font-bold rounded-lg bg-apple-blue/10 text-apple-blue border border-apple-blue/20">
                                            {item.preferences?.rank || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-apple-text-secondary font-medium">
                                            {format(new Date(item.created_at), 'dd/MM/yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => deleteUser(item.id)}
                                            className="p-2 text-apple-text-secondary hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                                            title="Xóa tài khoản"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function AdminPracticeManager() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedHang, setSelectedHang] = useState('Tất cả')
    const [selectedChuyenNganh, setSelectedChuyenNganh] = useState('Tất cả')
    const [practiceSortConfig, setPracticeSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'updatedAt', direction: 'desc' })

    const requestPracticeSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'desc'
        if (practiceSortConfig.key === key && practiceSortConfig.direction === 'desc') {
            direction = 'asc'
        } else if (practiceSortConfig.key === key && practiceSortConfig.direction === 'asc') {
            direction = null
        }
        setPracticeSortConfig({ key, direction })
    }

    useEffect(() => {
        fetchPracticeStats()
    }, [])

    async function fetchPracticeStats() {
        setLoading(true)
        try {
            // Fetch all profiles and practice stats
            const [profilesRes, statsRes] = await Promise.all([
                supabase.from('profiles').select('id, email, preferences, display_name, user_name'),
                supabase.from('user_practice_stats').select('user_id, updated_at, history')
            ])

            if (profilesRes.error) throw profilesRes.error
            if (statsRes.error) throw statsRes.error

            const profiles = profilesRes.data || []
            const practiceData = statsRes.data || []

            // Merge data
            const merged = profiles.map(profile => {
                const userStats = practiceData.find(s => s.user_id === profile.id)
                const history = (userStats?.history as any) || {}

                return {
                    id: profile.id,
                    email: profile.email,
                    displayName: profile.display_name || profile.user_name || 'Chưa đặt tên',
                    preferences: profile.preferences as any,
                    totalPracticed: Object.keys(history).length,
                    updatedAt: userStats?.updated_at || null,
                    // For filtering
                    hang: (profile.preferences as any)?.rank || 'Chưa chọn',
                    chuyenNganh: (profile.preferences as any)?.specialty || 'Chưa chọn'
                }
            }).sort((a, b) => {
                const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
                const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
                return dateB - dateA
            })

            setStats(merged)
        } catch (error) {
            console.error('Error fetching practice stats:', error)
        } finally {
            setLoading(false)
        }
    }

    async function deletePracticeData(userId: string) {
        if (!confirm('Bạn có chắc chắn muốn xóa tất cả lịch sử ôn tập của người dùng này không? Hành động này không thể hoàn tác.')) return

        try {
            const { error } = await supabase
                .from('user_practice_stats')
                .delete()
                .eq('user_id', userId)

            if (error) throw error

            // Update local state
            setStats(prev => prev.map(s => s.id === userId ? { ...s, totalPracticed: 0, updatedAt: null } : s))
            alert('Đã xóa dữ liệu ôn tập thành công!')
        } catch (error) {
            console.error('Error deleting practice data:', error)
            alert('Có lỗi xảy ra khi xóa dữ liệu.')
        }
    }

    const filteredStats = stats.filter(s => {
        const emailMatch = !searchQuery || s.email.toLowerCase().includes(searchQuery.toLowerCase()) || s.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
        const hangMatch = selectedHang === 'Tất cả' || s.hang === selectedHang
        const chuyenNganhMatch = selectedChuyenNganh === 'Tất cả' || s.chuyenNganh === selectedChuyenNganh
        return emailMatch && hangMatch && chuyenNganhMatch
    }).sort((a, b) => {
        if (!practiceSortConfig.direction) return 0
        const key = practiceSortConfig.key
        const isAsc = practiceSortConfig.direction === 'asc'

        let valA: any
        let valB: any

        if (key === 'displayName') {
            valA = a.displayName.toLowerCase()
            valB = b.displayName.toLowerCase()
        } else if (key === 'updatedAt') {
            valA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
            valB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        } else {
            valA = a[key]
            valB = b[key]
        }

        if (valA < valB) return isAsc ? -1 : 1
        if (valA > valB) return isAsc ? 1 : -1
        return 0
    })

    return (
        <div className="space-y-6">
            <div className="bg-apple-card border border-apple-border rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-secondary" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm user..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-apple-bg border border-apple-border rounded-xl text-sm font-medium text-apple-text outline-none focus:border-apple-blue/30 transition-colors"
                        />
                    </div>
                    <select
                        value={selectedHang}
                        onChange={(e) => setSelectedHang(e.target.value)}
                        className="px-4 py-2 bg-apple-bg border border-apple-border rounded-xl text-sm font-bold text-apple-text outline-none focus:border-apple-blue/30 transition-colors"
                    >
                        <option value="Tất cả">Tất cả Hạng</option>
                        {HANG_OPTIONS.map(hang => <option key={hang} value={hang}>{hang}</option>)}
                    </select>
                    <select
                        value={selectedChuyenNganh}
                        onChange={(e) => setSelectedChuyenNganh(e.target.value)}
                        className="px-4 py-2 bg-apple-bg border border-apple-border rounded-xl text-sm font-bold text-apple-text outline-none focus:border-apple-blue/30 transition-colors"
                    >
                        <option value="Tất cả">Tất cả Chuyên ngành</option>
                        {CHUYEN_NGANH_OPTIONS.map(cn => <option key={cn} value={cn}>{cn}</option>)}
                    </select>
                    <div className="flex items-center justify-end">
                        <span className="text-xs font-bold text-apple-text-secondary">
                            Tổng số: {filteredStats.length} user
                        </span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
                </div>
            ) : (
                <div className="bg-apple-card border border-apple-border rounded-2xl overflow-x-auto shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-apple-bg border-b border-apple-border">
                            <tr>
                                <th
                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary cursor-pointer hover:text-apple-blue transition-colors group"
                                    onClick={() => requestPracticeSort('displayName')}
                                >
                                    <div className="flex items-center gap-1">
                                        User (Tên & Email)
                                        <ChevronDown className={`w-3 h-3 transition-transform ${practiceSortConfig.key === 'displayName' ? (practiceSortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-apple-text-secondary">Hạng quan tâm</th>
                                <th className="px-6 py-4 text-xs font-semibold text-apple-text-secondary">Chuyên ngành</th>
                                <th
                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary text-center cursor-pointer hover:text-apple-blue transition-colors group"
                                    onClick={() => requestPracticeSort('totalPracticed')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Số câu đã ôn
                                        <ChevronDown className={`w-3 h-3 transition-transform ${practiceSortConfig.key === 'totalPracticed' ? (practiceSortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary cursor-pointer hover:text-apple-blue transition-colors group"
                                    onClick={() => requestPracticeSort('updatedAt')}
                                >
                                    <div className="flex items-center gap-1">
                                        Hoạt động cuối
                                        <ChevronDown className={`w-3 h-3 transition-transform ${practiceSortConfig.key === 'updatedAt' ? (practiceSortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-apple-text-secondary text-center w-20">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-apple-border">
                            {filteredStats.map((item) => (
                                <tr key={item.id} className="hover:bg-apple-bg/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-apple-text">{item.displayName}</div>
                                        <div className="text-[10px] text-apple-text-secondary font-medium">{item.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-[10px] font-bold rounded-lg bg-apple-blue/10 text-apple-blue border border-apple-blue/20">
                                            {item.hang}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold text-apple-text">{item.chuyenNganh}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-black border border-emerald-500/20">
                                            <Target className="w-3 h-3" />
                                            {item.totalPracticed}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-xs text-apple-text-secondary font-medium">
                                            <Users className="w-3 h-3 text-apple-blue" />
                                            {item.updatedAt
                                                ? format(new Date(item.updatedAt), 'dd/MM/yyyy HH:mm:ss')
                                                : 'Chưa bắt đầu'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => deletePracticeData(item.id)}
                                            className="p-2 text-apple-text-secondary hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                                            title="Xóa dữ liệu ôn tập"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredStats.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-apple-text-secondary">
                                            <Database className="w-8 h-8 opacity-20" />
                                            <p className="font-medium">Không tìm thấy dữ liệu ôn tập nào</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function AdminExamManager() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedHang, setSelectedHang] = useState('Tất cả')
    const [selectedChuyenNganh, setSelectedChuyenNganh] = useState('Tất cả')
    const [sortBy, setSortBy] = useState('newest')
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'lastExam', direction: 'desc' })

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'desc'
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc'
        } else if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = null
        }
        setSortConfig({ key, direction })

        // Sync dropdown if possible
        if (key === 'lastExam' && direction === 'desc') setSortBy('newest')
        else if (key === 'lastExam' && direction === 'asc') setSortBy('oldest')
        else if (key === 'max' && direction === 'desc') setSortBy('max_score')
        else if (key === 'max' && direction === 'asc') setSortBy('min_score')
        else if (key === 'total' && direction === 'desc') setSortBy('most_exams')
        else if (key === 'total' && direction === 'asc') setSortBy('least_exams')
        else if (key === 'passRate' && direction === 'desc') setSortBy('most_passed')
        else if (key === 'passRate' && direction === 'asc') setSortBy('most_failed')
    }

    useEffect(() => {
        fetchExamStats()
    }, [])

    async function fetchExamStats() {
        setLoading(true)
        try {
            const [profilesRes, examsRes] = await Promise.all([
                supabase.from('profiles').select('id, email, display_name, user_name'),
                supabase.from('exam_results').select('*')
            ])

            if (profilesRes.error) throw profilesRes.error
            if (examsRes.error) throw examsRes.error

            const profiles = profilesRes.data || []
            const exams = examsRes.data || []

            // Group exams by user
            const grouped = profiles.map(profile => {
                const userExams = exams.filter(e => e.user_id === profile.id)
                if (userExams.length === 0) return {
                    id: profile.id,
                    email: profile.email,
                    displayName: profile.display_name || profile.user_name || 'Chưa đặt tên',
                    total: 0,
                    max: 0,
                    min: 0,
                    passCount: 0,
                    lastExam: null,
                    hang: 'N/A',
                    chuyenNganh: 'N/A'
                }

                const scores = userExams.map(e => e.score || 0)
                const latest = [...userExams].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

                return {
                    id: profile.id,
                    email: profile.email,
                    displayName: profile.display_name || profile.user_name || 'Chưa đặt tên',
                    total: userExams.length,
                    max: Math.max(...scores),
                    min: Math.min(...scores),
                    passCount: userExams.filter(e => e.passed).length,
                    lastExam: latest.created_at,
                    hang: latest.hang || 'N/A',
                    chuyenNganh: latest.chuyen_nganh || 'N/A'
                }
            })

            setStats(grouped)
        } catch (error) {
            console.error('Error fetching exam stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredStats = stats.filter(s => {
        const emailMatch = !searchQuery || s.email.toLowerCase().includes(searchQuery.toLowerCase()) || s.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
        const hangMatch = selectedHang === 'Tất cả' || s.hang === selectedHang
        const chuyenNganhMatch = selectedChuyenNganh === 'Tất cả' || s.chuyenNganh === selectedChuyenNganh
        return emailMatch && hangMatch && chuyenNganhMatch
    }).sort((a, b) => {
        if (sortConfig.direction) {
            const key = sortConfig.key
            const isAsc = sortConfig.direction === 'asc'

            let valA: any
            let valB: any

            if (key === 'displayName') {
                valA = a.displayName.toLowerCase()
                valB = b.displayName.toLowerCase()
            } else if (key === 'lastExam') {
                valA = a.lastExam ? new Date(a.lastExam).getTime() : 0
                valB = b.lastExam ? new Date(b.lastExam).getTime() : 0
            } else if (key === 'passRate') {
                valA = a.total > 0 ? a.passCount / a.total : 0
                valB = b.total > 0 ? b.passCount / b.total : 0
            } else {
                valA = a[key]
                valB = b[key]
            }

            if (valA < valB) return isAsc ? -1 : 1
            if (valA > valB) return isAsc ? 1 : -1
            return 0
        }

        switch (sortBy) {
            case 'newest':
                return (b.lastExam ? new Date(b.lastExam).getTime() : 0) - (a.lastExam ? new Date(a.lastExam).getTime() : 0)
            case 'oldest':
                const dateA = a.lastExam ? new Date(a.lastExam).getTime() : Infinity
                const dateB = b.lastExam ? new Date(b.lastExam).getTime() : Infinity
                return dateA - dateB
            case 'max_score':
                return b.max - a.max
            case 'min_score':
                return a.min - b.min
            case 'most_exams':
                return b.total - a.total
            case 'least_exams':
                return a.total - b.total
            case 'most_passed':
                return (b.total > 0 ? b.passCount / b.total : 0) - (a.total > 0 ? a.passCount / a.total : 0)
            case 'most_failed':
                return (a.total > 0 ? a.passCount / a.total : 0) - (b.total > 0 ? b.passCount / b.total : 0)
            default:
                return 0
        }
    })

    return (
        <div className="space-y-6">
            <div className="bg-apple-card border border-apple-border rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-secondary" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm user..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-apple-bg border border-apple-border rounded-xl text-sm font-medium text-apple-text outline-none focus:border-apple-blue/30 transition-colors"
                        />
                    </div>
                    <select
                        value={selectedHang}
                        onChange={(e) => setSelectedHang(e.target.value)}
                        className="px-4 py-2 bg-apple-bg border border-apple-border rounded-xl text-sm font-bold text-apple-text outline-none focus:border-apple-blue/30 transition-colors"
                    >
                        <option value="Tất cả">Tất cả Hạng</option>
                        {HANG_OPTIONS.map(hang => <option key={hang} value={hang}>{hang}</option>)}
                    </select>
                    <select
                        value={selectedChuyenNganh}
                        onChange={(e) => setSelectedChuyenNganh(e.target.value)}
                        className="px-4 py-2 bg-apple-bg border border-apple-border rounded-xl text-sm font-bold text-apple-text outline-none focus:border-apple-blue/30 transition-colors"
                    >
                        <option value="Tất cả">Tất cả Chuyên ngành</option>
                        {CHUYEN_NGANH_OPTIONS.map(cn => <option key={cn} value={cn}>{cn}</option>)}
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 bg-apple-bg border border-apple-border rounded-xl text-sm font-bold text-apple-text outline-none focus:border-apple-blue/30 transition-colors"
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="max_score">Điểm cao nhất</option>
                        <option value="min_score">Điểm thấp nhất</option>
                        <option value="most_exams">Thi nhiều nhất</option>
                        <option value="least_exams">Thi ít nhất</option>
                        <option value="most_passed">Đậu nhiều nhất</option>
                        <option value="most_failed">Rớt nhiều nhất</option>
                    </select>
                    <div className="flex items-center justify-end">
                        <span className="text-xs font-bold text-apple-text-secondary">
                            Tổng: {filteredStats.length} user
                        </span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
                </div>
            ) : (
                <div className="bg-apple-card border border-apple-border rounded-2xl overflow-x-auto shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-apple-bg border-b border-apple-border">
                            <tr>
                                <th
                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary cursor-pointer hover:text-apple-blue transition-colors group"
                                    onClick={() => requestSort('displayName')}
                                >
                                    <div className="flex items-center gap-1">
                                        User (Tên & Email)
                                        <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'displayName' ? (sortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-apple-text-secondary">Hạng</th>
                                <th className="px-6 py-4 text-xs font-semibold text-apple-text-secondary">Chuyên ngành</th>
                                <th
                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary text-center cursor-pointer hover:text-apple-blue transition-colors group"
                                    onClick={() => requestSort('total')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Lượt thi
                                        <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'total' ? (sortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary text-center cursor-pointer hover:text-apple-blue transition-colors group"
                                    onClick={() => requestSort('max')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Cao nhất
                                        <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'max' ? (sortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary text-center cursor-pointer hover:text-apple-blue transition-colors group"
                                    onClick={() => requestSort('min')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Thấp nhất
                                        <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'min' ? (sortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary text-center cursor-pointer hover:text-apple-blue transition-colors group"
                                    onClick={() => requestSort('passRate')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Tỷ lệ đậu
                                        <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'passRate' ? (sortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary cursor-pointer hover:text-apple-blue transition-colors group"
                                    onClick={() => requestSort('lastExam')}
                                >
                                    <div className="flex items-center gap-1">
                                        Lần thi cuối
                                        <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'lastExam' ? (sortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-apple-border">
                            {filteredStats.map((item) => (
                                <tr key={item.id} className="hover:bg-apple-bg/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-apple-text">{item.displayName}</div>
                                        <div className="text-[10px] text-apple-text-secondary font-medium mt-0.5">
                                            {item.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[10px] font-bold rounded-lg ${item.hang !== 'N/A'
                                            ? 'bg-apple-blue/10 text-apple-blue border border-apple-blue/20'
                                            : 'bg-apple-text-secondary/10 text-apple-text-secondary border border-apple-border'
                                            }`}>
                                            {item.hang}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-apple-text-secondary line-clamp-1 max-w-[150px]" title={item.chuyenNganh}>
                                            {item.chuyenNganh}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2 text-sm font-bold text-apple-text">
                                            <FileText className="w-4 h-4 text-apple-blue" />
                                            {item.total} lượt
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-black border border-emerald-500/20">
                                            {item.max}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2.5 py-1 bg-red-500/10 text-red-600 rounded-lg text-xs font-black border border-red-500/20">
                                            {item.min}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-sm font-black text-apple-text">
                                            {item.total > 0 ? Math.round((item.passCount / item.total) * 100) : 0}%
                                        </div>
                                        <div className="text-[10px] text-apple-text-secondary font-bold">
                                            ({item.passCount}/{item.total})
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-xs text-apple-text-secondary font-medium">
                                            <TrendingUp className="w-3 h-3 text-apple-blue" />
                                            {item.lastExam
                                                ? format(new Date(item.lastExam), 'dd/MM/yyyy HH:mm:ss')
                                                : 'Chưa thi'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredStats.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-apple-text-secondary">
                                            <BarChart3 className="w-8 h-8 opacity-20" />
                                            <p className="font-medium">Không tìm thấy dữ liệu thi thử nào</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function AdminNewsManager() {
    const [loading, setLoading] = useState(true)
    const [posts, setPosts] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'created_at', direction: 'desc' })
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPost, setEditingPost] = useState<any>(null)

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        thumbnail_url: '',
        category: 'news',
        type: 'article',
        attachments: [] as { name: string, url: string, size?: string }[],
        is_published: true
    })

    useEffect(() => {
        fetchPosts()
    }, [])

    async function fetchPosts() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('library_posts')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setPosts(data || [])
        } catch (error) {
            console.error('Error fetching posts:', error)
        } finally {
            setLoading(false)
        }
    }

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'desc'
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc'
        } else if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = null
        }
        setSortConfig({ key, direction })
    }

    const generateSlug = (title: string) => {
        return removeVietnameseTones(title)
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
    }

    const handleOpenModal = (post: any = null) => {
        if (post) {
            setEditingPost(post)
            setFormData({
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt || '',
                content: post.content || '',
                thumbnail_url: post.thumbnail_url || '',
                category: post.category || 'news',
                type: post.type || 'article',
                attachments: post.attachments || [],
                is_published: post.is_published
            })
        } else {
            setEditingPost(null)
            setFormData({
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                thumbnail_url: '',
                category: 'news',
                type: 'article',
                attachments: [],
                is_published: true
            })
        }
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!formData.title || !formData.slug) {
            alert('Vui lòng nhập Tiêu đề và Slug')
            return
        }

        setLoading(true)
        try {
            if (editingPost) {
                const { error } = await supabase
                    .from('library_posts')
                    .update(formData)
                    .eq('id', editingPost.id)
                if (error) throw error
                alert('Cập nhật bài viết thành công!')
            } else {
                const { error } = await supabase
                    .from('library_posts')
                    .insert([formData])
                if (error) throw error
                alert('Thêm bài viết mới thành công!')
            }
            setIsModalOpen(false)
            fetchPosts()
        } catch (error: any) {
            console.error('Error saving post:', error)
            alert('Có lỗi xảy ra: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('library_posts')
                .delete()
                .eq('id', id)
            if (error) throw error
            fetchPosts()
            alert('Đã xóa bài viết thành công!')
        } catch (error) {
            console.error('Error deleting post:', error)
            alert('Có lỗi xảy ra khi xóa.')
        } finally {
            setLoading(false)
        }
    }

    const handleAddAttachment = () => {
        setFormData({
            ...formData,
            attachments: [...formData.attachments, { name: '', url: '', size: '' }]
        })
    }

    const handleRemoveAttachment = (index: number) => {
        const newAttachments = [...formData.attachments]
        newAttachments.splice(index, 1)
        setFormData({ ...formData, attachments: newAttachments })
    }

    const updateAttachment = (index: number, field: string, value: string) => {
        const newAttachments = [...formData.attachments]
        newAttachments[index] = { ...newAttachments[index], [field]: value }
        setFormData({ ...formData, attachments: newAttachments })
    }

    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        if (!sortConfig.direction) return 0
        const isAsc = sortConfig.direction === 'asc'
        const valA = a[sortConfig.key]
        const valB = b[sortConfig.key]
        if (valA < valB) return isAsc ? -1 : 1
        if (valA > valB) return isAsc ? 1 : -1
        return 0
    })

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-apple-card border border-apple-border rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex-1 w-full md:max-w-md relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-secondary" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài viết..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-apple-bg border border-apple-border rounded-xl text-sm font-medium text-apple-text outline-none focus:border-apple-blue/30 transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="w-full md:w-auto px-6 py-2 bg-apple-blue text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-apple-blue/90 transition-all shadow-lg shadow-apple-blue/20"
                    >
                        <Plus className="w-5 h-5" />
                        Thêm bài viết mới
                    </button>
                </div>
            </div>

            {/* Posts Table */}
            {loading && posts.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
                </div>
            ) : (
                <div className="bg-apple-card border border-apple-border rounded-2xl overflow-x-auto shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-apple-bg border-b border-apple-border">
                            <tr>
                                <th
                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary cursor-pointer hover:text-apple-blue transition-colors group"
                                    onClick={() => requestSort('title')}
                                >
                                    <div className="flex items-center gap-1">
                                        Tiêu đề & Slug
                                        <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-apple-text-secondary">Phân loại / Loại</th>
                                <th className="px-6 py-4 text-xs font-semibold text-apple-text-secondary">Trạng thái</th>
                                <th
                                    className="px-6 py-4 text-xs font-semibold text-apple-text-secondary cursor-pointer hover:text-apple-blue transition-colors group"
                                    onClick={() => requestSort('created_at')}
                                >
                                    <div className="flex items-center gap-1">
                                        Ngày đăng
                                        <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.key === 'created_at' ? (sortConfig.direction === 'asc' ? 'rotate-180 text-apple-blue' : 'text-apple-blue') : 'opacity-0 group-hover:opacity-50'}`} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-apple-text-secondary text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-apple-border">
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="hover:bg-apple-bg/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {post.thumbnail_url && (
                                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-apple-border flex-shrink-0">
                                                    <img src={post.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-apple-text line-clamp-1">{post.title}</span>
                                                <span className="text-[10px] text-apple-text-secondary font-medium">/{post.slug}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-apple-blue/10 text-apple-blue w-fit">
                                                {post.category === 'news' ? 'Tin tức' : post.category === 'guide' ? 'Hướng dẫn' : post.category}
                                            </span>
                                            <span className="text-[10px] text-apple-text-secondary font-bold uppercase ml-1">
                                                {post.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {post.is_published ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                <Check className="w-2.5 h-2.5" /> Công khai
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-apple-text-secondary/10 text-apple-text-secondary border border-apple-border">
                                                <X className="w-2.5 h-2.5" /> Bản nháp
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs text-apple-text-secondary font-medium">
                                            {format(new Date(post.created_at), 'dd/MM/yyyy HH:mm')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(post)}
                                                className="p-2 text-apple-text-secondary hover:text-apple-blue hover:bg-apple-blue/5 rounded-lg transition-all"
                                                title="Sửa bài viết"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-2 text-apple-text-secondary hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                                                title="Xóa bài viết"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredPosts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-apple-text-secondary">
                                        Không tìm thấy bài viết nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-apple-card w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-apple-border">
                        <div className="p-6 border-b border-apple-border flex items-center justify-between bg-apple-bg/50">
                            <h2 className="text-lg font-black text-apple-text">
                                {editingPost ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-apple-bg rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-apple-blue uppercase tracking-wider">Thông tin chi tiết</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-apple-text ml-1 text-apple-text-secondary italic">Tiêu đề bài viết</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => {
                                                const title = e.target.value
                                                setFormData({ ...formData, title, slug: editingPost ? formData.slug : generateSlug(title) })
                                            }}
                                            className="w-full px-4 py-3 bg-apple-bg border border-apple-border rounded-xl text-sm font-medium focus:border-apple-blue focus:ring-1 focus:ring-apple-blue/20 outline-none"
                                            placeholder="Tiêu đề..."
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-apple-text ml-1 text-apple-text-secondary italic">Slug (URL)</label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full px-4 py-3 bg-apple-bg border border-apple-border rounded-xl text-sm font-medium focus:border-apple-blue focus:ring-1 focus:ring-apple-blue/20 outline-none"
                                            placeholder="slug-bai-viet"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-apple-text ml-1 text-apple-text-secondary italic">Phân loại</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-apple-bg border border-apple-border rounded-xl text-sm font-bold focus:border-apple-blue outline-none"
                                        >
                                            <option value="news">Tin tức</option>
                                            <option value="guide">Hướng dẫn</option>
                                            <option value="document">Văn bản</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-apple-text ml-1 text-apple-text-secondary italic">Loại nội dung</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-3 bg-apple-bg border border-apple-border rounded-xl text-sm font-bold focus:border-apple-blue outline-none"
                                        >
                                            <option value="article">Bài báo / Tin tức</option>
                                            <option value="document">Tài liệu tải về</option>
                                            <option value="guide">Hướng dẫn sử dụng</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-apple-text ml-1 text-apple-text-secondary italic">Trạng thái</label>
                                        <div className="h-[46px] flex items-center gap-4 px-4 bg-apple-bg border border-apple-border rounded-xl">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_published}
                                                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                                    className="w-4 h-4 rounded border-apple-border text-apple-blue focus:ring-apple-blue/20"
                                                />
                                                <span className="text-sm font-bold text-apple-text">Công khai</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Images & Media */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-apple-blue uppercase tracking-wider">Hình ảnh & Media</h3>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-apple-text ml-1 text-apple-text-secondary italic">URL Ảnh đại diện (Thumbnail)</label>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={formData.thumbnail_url}
                                            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                            className="flex-1 px-4 py-3 bg-apple-bg border border-apple-border rounded-xl text-sm font-medium focus:border-apple-blue focus:ring-1 focus:ring-apple-blue/20 outline-none"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {formData.thumbnail_url && (
                                            <div className="w-[46px] h-[46px] rounded-xl overflow-hidden border border-apple-border flex-shrink-0">
                                                <img src={formData.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-apple-blue uppercase tracking-wider">Nội dung bài viết</h3>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-apple-text ml-1 text-apple-text-secondary italic">Tóm tắt (Excerpt)</label>
                                    <textarea
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                        className="w-full px-4 py-3 bg-apple-bg border border-apple-border rounded-xl text-sm font-medium focus:border-apple-blue focus:ring-1 focus:ring-apple-blue/20 outline-none min-h-[80px]"
                                        placeholder="Tóm tắt ngắn gọn bài viết..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-apple-text ml-1 text-apple-text-secondary italic">Nội dung chi tiết (Rich Text)</label>
                                    <div className="min-h-[400px]">
                                        <RichTextEditor
                                            content={formData.content}
                                            onChange={(newContent: string) => setFormData({ ...formData, content: newContent })}
                                            placeholder="Nhập nội dung bài viết..."
                                        />
                                    </div>
                                    <p className="text-[10px] text-apple-text-secondary italic mt-1">Mẹo: Bạn có thể copy nội dung từ Word hoặc trang web khác và dán vào đây.</p>
                                </div>
                            </div>

                            {/* Attachments */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black text-apple-blue uppercase tracking-wider">File đính kèm & Link tải</h3>
                                    <button
                                        onClick={handleAddAttachment}
                                        className="px-3 py-1.5 bg-apple-bg border border-apple-border rounded-lg text-xs font-bold text-apple-text hover:border-apple-blue/50 transition-colors flex items-center gap-2"
                                    >
                                        <Plus size={14} /> Thêm link tải
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.attachments.map((file, index) => (
                                        <div key={index} className="flex gap-3 group animate-in slide-in-from-top-2 duration-200">
                                            <input
                                                type="text"
                                                value={file.name}
                                                onChange={(e) => updateAttachment(index, 'name', e.target.value)}
                                                className="flex-[2] px-3 py-2 bg-apple-bg border border-apple-border rounded-lg text-xs font-bold outline-none focus:border-apple-blue/30"
                                                placeholder="Tên hiển thị (v.d: Tải về PDF)"
                                            />
                                            <input
                                                type="text"
                                                value={file.url}
                                                onChange={(e) => updateAttachment(index, 'url', e.target.value)}
                                                className="flex-[4] px-3 py-2 bg-apple-bg border border-apple-border rounded-lg text-xs font-medium outline-none focus:border-apple-blue/30"
                                                placeholder="Link tải (Drive, OneDrive, v.v.)"
                                            />
                                            <input
                                                type="text"
                                                value={file.size || ''}
                                                onChange={(e) => updateAttachment(index, 'size', e.target.value)}
                                                className="flex-1 px-3 py-2 bg-apple-bg border border-apple-border rounded-lg text-xs font-medium outline-none focus:border-apple-blue/30"
                                                placeholder="Size (v.d: 2MB)"
                                            />
                                            <button
                                                onClick={() => handleRemoveAttachment(index)}
                                                className="p-2 text-apple-text-secondary hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.attachments.length === 0 && (
                                        <p className="text-xs text-apple-text-secondary italic text-center py-4 bg-apple-bg/50 border border-dashed border-apple-border rounded-xl">
                                            Chưa có file đính kèm nào.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-apple-border bg-apple-bg/50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 bg-apple-bg text-apple-text font-bold rounded-xl hover:bg-apple-input transition-colors border border-apple-border"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-8 py-2.5 bg-apple-blue text-white font-bold rounded-xl hover:bg-apple-blue/90 transition-all shadow-lg shadow-apple-blue/20 flex items-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingPost ? 'Lưu thay đổi' : 'Đăng bài viết'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
