'use client'

import { useState, useEffect } from 'react'
import { Star, MessageSquare, Plus, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { AppFeedbackModal } from '@/components/feedback/AppFeedbackModal'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Feedback {
    id: string
    rating: number
    content: string | null
    created_at: string
}

export default function FeedbackHistoryPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)
    const [showFeedbackModal, setShowFeedbackModal] = useState(false)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login?redirect=/gop-y')
                return
            }

            setUser(user)
            fetchFeedbacks(user.id)
        }
        getUser()
    }, [router])

    const fetchFeedbacks = async (userId: string) => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('app_evaluations')
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
            <div className="px-4 md:px-6 py-4 md:py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
                    </div>
                ) : feedbacks.length === 0 ? (
                    // Empty State
                    <div className="text-center py-20">
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
                    // Feedback List
                    <div className="space-y-4">
                        {feedbacks.map((feedback) => (
                            <div
                                key={feedback.id}
                                className="bg-apple-card border border-apple-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
                            >
                                {/* Rating */}
                                <div className="flex gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-5 h-5 ${star <= feedback.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-apple-text-secondary/20'
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Content */}
                                {feedback.content && (
                                    <p className="text-apple-text mb-3 leading-relaxed">
                                        {feedback.content}
                                    </p>
                                )}

                                {/* Date */}
                                <p className="text-xs text-apple-text-secondary">
                                    {formatDistanceToNow(new Date(feedback.created_at), {
                                        addSuffix: true,
                                        locale: vi,
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
