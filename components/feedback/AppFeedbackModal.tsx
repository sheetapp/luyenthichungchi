'use client'

import { useState } from 'react'
import { Star, Send, X, MessageSquare, Loader2, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { useRef } from 'react'

interface AppFeedbackModalProps {
    isOpen: boolean
    onClose: () => void
    user: any
}

export function AppFeedbackModal({ isOpen, onClose, user }: AppFeedbackModalProps) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
    const [honeypot, setHoneypot] = useState('')
    const turnstileRef = useRef<TurnstileInstance>(null)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Anti-spam checks
        if (honeypot) {
            console.warn('Bot detected via honeypot')
            return
        }

        if (!turnstileToken) {
            alert('Vui lòng hoàn thành xác minh bảo mật!')
            return
        }

        if (rating === 0) {
            alert('Vui lòng chọn số sao để đánh giá!')
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase
                .from('app_evaluations')
                .insert({
                    user_id: user.id,
                    rating,
                    content,
                })

            if (error) throw error
            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                setRating(0)
                setContent('')
                setTurnstileToken(null)
                onClose()
            }, 2500)
        } catch (error: any) {
            console.error('Error submitting feedback:', error)
            const errorMsg = error.message.includes('Rate limit exceeded')
                ? 'Bạn gửi góp ý quá nhanh. Vui lòng đợi 1 phút.'
                : (error.message || 'Có lỗi xảy ra khi gửi góp ý.')
            alert(`${errorMsg} Vui lòng thử lại sau.`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-apple-card w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-apple-border overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                {/* Header */}
                <div className="p-6 text-center relative border-b border-apple-border/50">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-apple-bg rounded-full transition-colors text-apple-text-secondary"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="w-16 h-16 bg-apple-blue/10 text-apple-blue rounded-[1.25rem] flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-apple-text tracking-tight">Góp ý ứng dụng</h3>
                    <p className="text-apple-text-secondary text-xs font-medium mt-1 uppercase tracking-widest">Trải nghiệm của bạn thế nào?</p>
                </div>

                {success ? (
                    <div className="p-12 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Send className="w-10 h-10" />
                        </div>
                        <h4 className="text-2xl font-bold text-apple-text mb-2">Cảm ơn bạn!</h4>
                        <p className="text-apple-text-secondary font-medium text-sm leading-relaxed px-4">Đóng góp của bạn giúp chúng tôi hoàn thiện ứng dụng mỗi ngày.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Star Rating Section */}
                        <div className="flex flex-col items-center gap-4 py-2">
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-all duration-300 hover:scale-125 active:scale-90"
                                    >
                                        <Star
                                            className={`w-10 h-10 ${(hoverRating || rating) >= star
                                                ? 'fill-yellow-400 text-yellow-400 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                                                : 'text-apple-text-secondary/20 fill-apple-text-secondary/5 stroke-[1.5px]'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-[0.2em]">
                                {rating > 0 ? (['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tuyệt vời'][rating - 1]) : 'Chọn số sao'}
                            </span>
                        </div>

                        {/* Content Area */}
                        <div className="space-y-3">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Góp ý chung hoặc tính năng bạn muốn thêm vào... (không bắt buộc)"
                                className="w-full min-h-[120px] p-5 bg-apple-bg/50 border border-apple-border rounded-[1.5rem] text-sm font-medium focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue focus:outline-none transition-all placeholder:text-apple-text-secondary/50 resize-none"
                            />
                        </div>

                        {/* Security Verification */}
                        <div className="space-y-4">
                            {/* Honeypot field - Hidden from users */}
                            <div className="hidden" aria-hidden="true">
                                <input
                                    type="text"
                                    name="full_name_verification"
                                    value={honeypot}
                                    onChange={(e) => setHoneypot(e.target.value)}
                                    tabIndex={-1}
                                    autoComplete="off"
                                />
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div className="scale-90 origin-center min-h-[65px]">
                                    <Turnstile
                                        ref={turnstileRef}
                                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                                        onSuccess={setTurnstileToken}
                                        onExpire={() => setTurnstileToken(null)}
                                        onError={() => setTurnstileToken(null)}
                                        options={{
                                            theme: 'light',
                                            size: 'normal',
                                        }}
                                    />
                                </div>
                                {!turnstileToken && (
                                    <p className="text-[10px] text-orange-500 font-semibold flex items-center gap-1 animate-pulse">
                                        <ShieldCheck className="w-3 h-3" />
                                        Vui lòng xác minh để bảo mật hệ thống
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || rating === 0 || !turnstileToken}
                                className="w-full py-4 bg-apple-text text-apple-bg rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl hover:bg-apple-blue hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                <span>Gửi góp ý</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
