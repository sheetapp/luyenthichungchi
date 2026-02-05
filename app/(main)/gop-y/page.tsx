'use client'

import { useState, useEffect, Suspense } from 'react'
import { Star, MessageSquare, Plus, Loader2, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { AppFeedbackModal } from '@/components/feedback/AppFeedbackModal'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

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
    admin_response: string | null
    admin_responded_at: string | null
    admin_user_id: string | null
    answer: any | null
}

const FEEDBACK_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
    app_rating: { label: 'Đánh giá ứng dụng', icon: Star, color: 'text-yellow-600' },
    app_feedback: { label: 'Góp ý chung', icon: MessageSquare, color: 'text-blue-600' },
    app_bug: { label: 'Báo lỗi ứng dụng', icon: AlertTriangle, color: 'text-red-600' },
    question_error: { label: 'Báo sai câu hỏi', icon: AlertTriangle, color: 'text-orange-600' },
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    reviewed: { label: 'Đã xem', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    resolved: { label: 'Đã xử lý', color: 'bg-green-100 text-green-800 border-green-200' },
}

export default function FeedbackHistoryPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-apple-bg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
            </div>
        }>
            <FeedbackHistoryContent />
        </Suspense>
    )
}

function FeedbackHistoryContent() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)
    const [showFeedbackModal, setShowFeedbackModal] = useState(false)

    // New state for tab-based filtering
    const [activeFeedbackType, setActiveFeedbackType] = useState<string | null>(null)
    const [activeStatus, setActiveStatus] = useState<'processing' | 'completed'>('processing')

    useEffect(() => {
        const getUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser()

            if (!authUser) {
                router.push('/login?redirect=/gop-y')
                return
            }

            setUser(authUser)
            fetchFeedbacks(authUser.id)
        }
        getUser()
    }, [router])

    const fetchFeedbacks = async (userId: string) => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('user_feedback')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setFeedbacks(data || [])
        } catch (error) {
            console.error('Error fetching feedbacks:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFeedbackSubmitted = () => {
        if (user) {
            fetchFeedbacks(user.id)
        }
    }

    // Auto-select first feedback type when feedbacks load
    useEffect(() => {
        if (feedbacks.length > 0 && !activeFeedbackType) {
            const firstType = feedbacks[0].feedback_type
            setActiveFeedbackType(firstType)
        }
    }, [feedbacks, activeFeedbackType])

    // Get unique feedback types from feedbacks
    const availableFeedbackTypes = Array.from(new Set(feedbacks.map(f => f.feedback_type)))

    // Filter feedbacks based on active tabs
    const filteredFeedbacks = feedbacks.filter(feedback => {
        // Filter by feedback type
        if (activeFeedbackType && feedback.feedback_type !== activeFeedbackType) {
            return false
        }

        // For non-rating types, filter by status
        if (activeFeedbackType !== 'app_rating') {
            if (activeStatus === 'processing') {
                return feedback.status === 'pending' || feedback.status === 'reviewed'
            } else {
                return feedback.status === 'resolved'
            }
        }

        return true
    })

    if (!user || loading) {
        return (
            <div className="min-h-screen bg-apple-bg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-apple-bg">
            {/* Header */}
            <div className="flex-shrink-0 px-4 md:px-6 pt-4 md:pt-6 pb-4 flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-apple-text tracking-tight">
                        Lịch sử góp ý
                    </h1>
                    <p className="text-apple-text-secondary text-xs md:text-sm font-normal">
                        Xem và quản lý các góp ý của bạn
                    </p>
                </div>

                {/* Desktop Button */}
                <div className="hidden md:flex items-center gap-3">
                    <button
                        onClick={() => setShowFeedbackModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-apple-blue text-white rounded-[10px] text-sm font-bold hover:bg-apple-blue/90 transition-all shadow-lg active:scale-97"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Thêm góp ý</span>
                    </button>
                </div>

                {/* Mobile Button */}
                <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="md:hidden fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 bg-apple-blue text-white rounded-full font-bold shadow-2xl active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>Thêm góp ý</span>
                </button>
            </div>

            {/* Content */}
            {feedbacks.length === 0 ? (
                // Empty State
                <div className="px-4 md:px-6 py-20 text-center">
                    <div className="w-20 h-20 bg-apple-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-10 h-10 text-apple-blue" />
                    </div>
                    <h3 className="text-xl font-bold text-apple-text mb-2">
                        Chưa có góp ý nào
                    </h3>
                    <p className="text-apple-text-secondary mb-6 max-w-md mx-auto">
                        Chia sẻ trải nghiệm của bạn với chúng tôi để giúp ứng dụng ngày càng hoàn thiện hơn
                    </p>
                    <button
                        onClick={() => setShowFeedbackModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-apple-blue text-white rounded-xl font-bold hover:bg-apple-blue/90 transition-all shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Thêm góp ý đầu tiên
                    </button>
                </div>
            ) : (
                <>
                    {/* Feedback Type Tabs - Horizontal */}
                    <div className="px-4 md:px-6 mb-6">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {availableFeedbackTypes.map((type) => {
                                const typeInfo = FEEDBACK_TYPE_LABELS[type] || FEEDBACK_TYPE_LABELS.app_feedback
                                const TypeIcon = typeInfo.icon
                                const isActive = activeFeedbackType === type
                                const count = feedbacks.filter(f => f.feedback_type === type).length

                                return (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setActiveFeedbackType(type)
                                            setActiveStatus('processing') // Reset status when changing type
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${isActive
                                            ? 'bg-apple-blue text-white shadow-md'
                                            : 'bg-apple-card border border-apple-border text-apple-text hover:bg-apple-border/50'
                                            }`}
                                    >
                                        <TypeIcon className="w-4 h-4" />
                                        <span>{typeInfo.label}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20' : 'bg-apple-border'
                                            }`}>
                                            {count}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Status Filter - Only for non-rating types */}
                    {activeFeedbackType && activeFeedbackType !== 'app_rating' && (
                        <div className="px-4 md:px-6 mb-6">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveStatus('processing')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeStatus === 'processing'
                                        ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                                        : 'bg-apple-card text-apple-text border border-apple-border hover:border-apple-text/30'
                                        }`}
                                >
                                    Đang xử lý
                                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-yellow-200 text-yellow-900">
                                        {feedbacks.filter(f =>
                                            f.feedback_type === activeFeedbackType &&
                                            (f.status === 'pending' || f.status === 'reviewed')
                                        ).length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setActiveStatus('completed')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeStatus === 'completed'
                                        ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                        : 'bg-apple-card text-apple-text border border-apple-border hover:border-apple-text/30'
                                        }`}
                                >
                                    Đã xử lý
                                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-200 text-green-900">
                                        {feedbacks.filter(f =>
                                            f.feedback_type === activeFeedbackType &&
                                            f.status === 'resolved'
                                        ).length}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Feedback Cards */}
                    <div className="px-4 md:px-6 pb-20">
                        {filteredFeedbacks.length === 0 ? (
                            <div className="text-center py-20 bg-apple-card rounded-2xl border-2 border-dashed border-apple-border">
                                <p className="text-apple-text-secondary font-bold">Không có góp ý nào trong danh mục này</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredFeedbacks.map((feedback) => {
                                    const typeInfo = FEEDBACK_TYPE_LABELS[feedback.feedback_type] || FEEDBACK_TYPE_LABELS.app_feedback
                                    const statusInfo = STATUS_LABELS[feedback.status] || STATUS_LABELS.pending
                                    const TypeIcon = typeInfo.icon

                                    return (
                                        <div
                                            key={feedback.id}
                                            className="bg-apple-card border border-apple-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
                                        >
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                                                    <span className="text-sm font-bold text-apple-text">{typeInfo.label}</span>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>

                                            {/* Rating (if exists) */}
                                            {feedback.rating && (
                                                <div className="flex gap-1 mb-3">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-5 h-5 ${star <= feedback.rating!
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-apple-text-secondary/20'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* Question Info (if exists) */}
                                            {feedback.question_id && (
                                                <div className="mb-3 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                                                    <div className="flex flex-wrap gap-2 items-center">
                                                        <span className="text-xs font-bold text-orange-600">📌 Câu hỏi:</span>
                                                        {feedback.hang && (
                                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                                                                {feedback.hang}
                                                            </span>
                                                        )}
                                                        {feedback.phan_thi && (
                                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                                                                {feedback.phan_thi}
                                                            </span>
                                                        )}
                                                        {feedback.chuyen_nganh && (
                                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                                                                {feedback.chuyen_nganh}
                                                            </span>
                                                        )}
                                                        {feedback.stt && (
                                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                                                                STT: {feedback.stt}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Content */}
                                            {feedback.content && (
                                                <p className="text-apple-text mb-3 leading-relaxed">
                                                    {feedback.content}
                                                </p>
                                            )}

                                            {/* Admin Response */}
                                            {(feedback.admin_response || feedback.answer) && (
                                                <div className="mt-4 p-4 bg-apple-blue/5 rounded-xl border border-apple-blue/10">
                                                    <div className="flex items-center gap-2 mb-2 text-apple-blue">
                                                        <MessageSquare className="w-4 h-4" />
                                                        <span className="text-xs font-bold">Phản hồi từ Admin:</span>
                                                    </div>
                                                    <p className="text-sm text-apple-text italic">
                                                        {feedback.admin_response || feedback.answer?.content}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Date */}
                                            <p className="text-xs text-apple-text-secondary mt-3">
                                                {formatDistanceToNow(new Date(feedback.created_at), {
                                                    addSuffix: true,
                                                    locale: vi,
                                                })}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Feedback Modal */}
            <AppFeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => {
                    setShowFeedbackModal(false)
                    handleFeedbackSubmitted()
                }}
                user={user}
            />
        </div>
    )
}
