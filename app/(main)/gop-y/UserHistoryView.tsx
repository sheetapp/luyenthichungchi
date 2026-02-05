'use client'

import { useState, useEffect } from 'react'
import { Star, MessageSquare, Plus, Loader2, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Feedback, FEEDBACK_TYPE_LABELS, STATUS_LABELS } from './types'

interface UserHistoryViewProps {
    feedbacks: Feedback[]
    loading: boolean
    onOpenModal: () => void
}

export function UserHistoryView({ feedbacks, loading, onOpenModal }: UserHistoryViewProps) {
    const [activeFeedbackType, setActiveFeedbackType] = useState<string | null>(null)
    const [activeStatus, setActiveStatus] = useState<'processing' | 'completed'>('processing')

    // Auto-select first feedback type when feedbacks load
    useEffect(() => {
        if (feedbacks.length > 0 && !activeFeedbackType) {
            const firstType = feedbacks[0].feedback_type
            setActiveFeedbackType(firstType)
        }
    }, [feedbacks, activeFeedbackType])

    const availableFeedbackTypes = Array.from(new Set(feedbacks.map(f => f.feedback_type)))

    const filteredFeedbacks = feedbacks.filter(feedback => {
        if (activeFeedbackType && feedback.feedback_type !== activeFeedbackType) return false
        if (activeFeedbackType !== 'app_rating') {
            if (activeStatus === 'processing') {
                return feedback.status === 'pending' || feedback.status === 'reviewed'
            } else {
                return feedback.status === 'resolved'
            }
        }
        return true
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
            </div>
        )
    }

    if (feedbacks.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="w-20 h-20 bg-apple-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-10 h-10 text-apple-blue" />
                </div>
                <h3 className="text-xl font-bold text-apple-text mb-2">Chưa có góp ý nào</h3>
                <p className="text-apple-text-secondary mb-6 max-w-md mx-auto">
                    Chia sẻ trải nghiệm của bạn với chúng tôi để giúp ứng dụng ngày càng hoàn thiện hơn
                </p>
                <button
                    onClick={onOpenModal}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-apple-blue text-white rounded-xl font-bold hover:bg-apple-blue/90 transition-all shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Thêm góp ý đầu tiên
                </button>
            </div>
        )
    }

    return (
        <div className="px-4 md:px-6 py-4 md:py-6">
            {/* Type Tabs */}
            <div className="hidden md:block mb-6">
                <div className="flex gap-2 border-b border-apple-border pb-2">
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
                                    setActiveStatus('processing')
                                }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-semibold text-sm transition-all ${isActive
                                    ? 'bg-apple-blue text-white shadow-md'
                                    : 'bg-apple-bg text-apple-text hover:bg-apple-border/50'
                                    }`}
                            >
                                <TypeIcon className="w-4 h-4" />
                                <span>{typeInfo.label}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20' : 'bg-apple-border'}`}>
                                    {count}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Status Sub-tabs */}
            {activeFeedbackType && activeFeedbackType !== 'app_rating' && (
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveStatus('processing')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeStatus === 'processing'
                            ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                            : 'bg-apple-bg text-apple-text border border-apple-border hover:border-apple-text/30'
                            }`}
                    >
                        Đang xử lý
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-yellow-200 text-yellow-900">
                            {feedbacks.filter(f => f.feedback_type === activeFeedbackType && (f.status === 'pending' || f.status === 'reviewed')).length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveStatus('completed')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeStatus === 'completed'
                            ? 'bg-green-100 text-green-800 border-2 border-green-300'
                            : 'bg-apple-bg text-apple-text border border-apple-border hover:border-apple-text/30'
                            }`}
                    >
                        Hoàn tất
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-200 text-green-900">
                            {feedbacks.filter(f => f.feedback_type === activeFeedbackType && f.status === 'resolved').length}
                        </span>
                    </button>
                </div>
            )}

            {filteredFeedbacks.length === 0 ? (
                <div className="text-center py-20 bg-apple-bg rounded-2xl border-2 border-dashed border-apple-border">
                    <p className="text-apple-text-secondary font-bold">Không có góp ý nào trong danh mục này</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredFeedbacks.map((feedback) => {
                        const typeInfo = FEEDBACK_TYPE_LABELS[feedback.feedback_type] || FEEDBACK_TYPE_LABELS.app_feedback
                        const statusInfo = STATUS_LABELS[feedback.status] || STATUS_LABELS.pending
                        const TypeIcon = typeInfo.icon

                        return (
                            <div key={feedback.id} className="bg-apple-card border border-apple-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                                        <span className="text-sm font-bold text-apple-text">{typeInfo.label}</span>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                                        {statusInfo.label}
                                    </span>
                                </div>

                                {feedback.rating && (
                                    <div className="flex gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-5 h-5 ${star <= feedback.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-apple-text-secondary/20'}`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {feedback.question_id && (
                                    <div className="mb-3 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg text-xs">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className="font-bold text-orange-600">📌 Câu hỏi:</span>
                                            {feedback.hang && <span className="px-1.5 py-0.5 bg-orange-100 rounded">{feedback.hang}</span>}
                                            {feedback.phan_thi && <span className="px-1.5 py-0.5 bg-orange-100 rounded">{feedback.phan_thi}</span>}
                                            {feedback.stt && <span className="px-1.5 py-0.5 bg-orange-100 rounded">STT: {feedback.stt}</span>}
                                        </div>
                                    </div>
                                )}

                                {feedback.content && <p className="text-apple-text mb-3 leading-relaxed">{feedback.content}</p>}

                                {feedback.admin_response && (
                                    <div className="mt-4 p-4 bg-apple-blue/5 rounded-xl border border-apple-blue/10">
                                        <p className="text-xs font-bold text-apple-blue mb-1">Phản hồi từ Admin:</p>
                                        <p className="text-sm text-apple-text italic">{feedback.admin_response}</p>
                                    </div>
                                )}

                                <p className="text-[10px] text-apple-text-secondary mt-3">
                                    {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true, locale: vi })}
                                </p>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
