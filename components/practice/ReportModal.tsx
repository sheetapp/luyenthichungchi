'use client'

import { useState, useRef } from 'react'
import { AlertTriangle, Send, X, MessageSquare, Info, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

interface ReportModalProps {
    isOpen: boolean
    onClose: () => void
    user: any
    question: {
        id: number | string // Support bigint from Supabase
        stt: number
        hang: string
        phan_thi: string
        cau_hoi: string
    }
}

type FeedbackType = 'error' | 'suggestion' | 'other'

export function ReportModal({ isOpen, onClose, user, question }: ReportModalProps) {
    const [type, setType] = useState<FeedbackType>('error')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
    const turnstileRef = useRef<TurnstileInstance>(null)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate CAPTCHA
        if (!turnstileToken) {
            alert('Vui lòng hoàn thành xác minh bảo mật!')
            return
        }

        if (!content.trim()) return

        setLoading(true)

        // Prepare detailed meta content
        const detailedContent = `[Hạng: ${question.hang}] [Phần: ${question.phan_thi}] [Câu ${question.stt}] \nNội dung: ${question.cau_hoi}\n\nPhản hồi từ user: ${content}`

        try {
            const { error } = await supabase
                .from('user_feedback')
                .insert({
                    user_id: user.id,
                    question_id: question.id,
                    feedback_type: type,
                    content: detailedContent,
                    status: 'pending'
                })

            if (error) throw error
            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                setContent('')
                setTurnstileToken(null)
                turnstileRef.current?.reset()
                onClose()
            }, 2000)
        } catch (error) {
            console.error('Error submitting feedback:', error)
            alert('Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại sau.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Báo cáo sai sót</h3>
                            <p className="text-slate-500 text-xs font-medium">Giúp chúng tôi cải thiện bộ câu hỏi</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {success ? (
                    <div className="p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 scale-in animate-in zoom-in">
                            <Send className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900">Gửi báo cáo thành công!</h4>
                        <p className="text-slate-500 font-medium">Cảm ơn bạn đã đóng góp ý kiến. Chúng tôi sẽ xem xét sớm nhất.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Question Info Summary */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                            <div className="flex gap-2">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-md uppercase">Hạng: {question.hang}</span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-md uppercase">{question.phan_thi}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-700 line-clamp-2">
                                Câu {question.stt}: {question.cau_hoi}
                            </p>
                        </div>

                        {/* Type Selection */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Loại phản hồi</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'error', label: 'Báo sai', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
                                    { id: 'suggestion', label: 'Góp ý', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                                    { id: 'other', label: 'Khác', icon: Info, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setType(item.id as FeedbackType)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${type === item.id
                                            ? `border-blue-500 ${item.bg} scale-[1.02] shadow-sm`
                                            : 'border-slate-100 bg-white hover:border-slate-200'
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 mb-1 ${item.color}`} />
                                        <span className={`text-[11px] font-bold ${type === item.id ? 'text-blue-700' : 'text-slate-600'}`}>
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Chi tiết sai sót hoặc góp ý</label>
                            <textarea
                                required
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Vui lòng mô tả chi tiết lỗi (ví dụ: đáp án bị sai, câu hỏi thiếu thông tin...)"
                                className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Security Verification */}
                        <div className="space-y-3">
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

                        {/* Footer */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3.5 px-6 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !content.trim() || !turnstileToken}
                                className="flex-[1.5] py-3.5 px-6 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                <span>Gửi báo cáo</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
