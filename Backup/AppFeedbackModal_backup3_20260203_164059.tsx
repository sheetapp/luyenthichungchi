'use client'

import { useState, useEffect } from 'react'
import { Star, Send, X, MessageSquare, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { useRef } from 'react'

interface AppFeedbackModalProps {
    isOpen: boolean
    onClose: () => void
    user: any
}

const FEEDBACK_TYPES = [
    { value: 'app_rating', label: 'Đánh giá ứng dụng', icon: Star, requiresRating: true, requiresQuestion: false },
    { value: 'app_feedback', label: 'Góp ý chung', icon: MessageSquare, requiresRating: false, requiresQuestion: false },
    { value: 'app_bug', label: 'Báo lỗi ứng dụng', icon: AlertTriangle, requiresRating: false, requiresQuestion: false },
    { value: 'question_error', label: 'Báo sai dữ liệu câu hỏi', icon: AlertTriangle, requiresRating: false, requiresQuestion: true },
]

const HANG_OPTIONS = ['Hạng I', 'Hạng II', 'Hạng III']
const PHAN_THI_OPTIONS = ['Câu hỏi Pháp luật chung', 'Câu hỏi Pháp luật riêng', 'Câu hỏi Chuyên môn']

export function AppFeedbackModal({ isOpen, onClose, user }: AppFeedbackModalProps) {
    const [feedbackType, setFeedbackType] = useState('app_rating')
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
    const [honeypot, setHoneypot] = useState('')
    const turnstileRef = useRef<TurnstileInstance>(null)

    // Question selector states
    const [selectedHang, setSelectedHang] = useState('Hạng I')
    const [selectedPhanThi, setSelectedPhanThi] = useState(PHAN_THI_OPTIONS[0])
    const [questionSTT, setQuestionSTT] = useState('')
    const [questionId, setQuestionId] = useState<string | null>(null)
    const [questionChuyenNganh, setQuestionChuyenNganh] = useState<string | null>(null)

    const selectedType = FEEDBACK_TYPES.find(t => t.value === feedbackType)

    // Fetch question by STT when user enters it
    useEffect(() => {
        if (!selectedType?.requiresQuestion || !questionSTT) {
            setQuestionId(null)
            return
        }

        const fetchQuestion = async () => {
            const stt = parseInt(questionSTT)
            if (isNaN(stt)) return

            const { data, error } = await supabase
                .from('questions')
                .select('id, chuyen_nganh')
                .eq('hang', selectedHang)
                .eq('phan_thi', selectedPhanThi)
                .eq('stt', stt)
                .single()

            if (!error && data) {
                setQuestionId(data.id)
                setQuestionChuyenNganh(data.chuyen_nganh || null)
            } else {
                setQuestionId(null)
                setQuestionChuyenNganh(null)
            }
        }

        const debounce = setTimeout(fetchQuestion, 500)
        return () => clearTimeout(debounce)
    }, [questionSTT, selectedHang, selectedPhanThi, selectedType])

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

        // Validation based on feedback type
        if (selectedType?.requiresRating && rating === 0) {
            alert('Vui lòng chọn số sao để đánh giá!')
            return
        }

        if (selectedType?.requiresQuestion) {
            if (!questionSTT) {
                alert('Vui lòng nhập số thứ tự câu hỏi!')
                return
            }
            if (!questionId) {
                alert('Không tìm thấy câu hỏi với thông tin đã nhập. Vui lòng kiểm tra lại Hạng, Phần và STT.')
                return
            }
        }

        if (!content.trim() && !selectedType?.requiresRating) {
            alert('Vui lòng nhập nội dung góp ý!')
            return
        }

        setLoading(true)
        try {
            // Direct Supabase insert to user_feedback table
            const { error } = await supabase
                .from('user_feedback')
                .insert({
                    user_id: user.id,
                    question_id: selectedType?.requiresQuestion ? questionId : null,
                    feedback_type: feedbackType,
                    content: content || '',
                    rating: selectedType?.requiresRating ? rating : null,
                    status: 'pending',
                    // Denormalized question data for easier querying
                    hang: selectedType?.requiresQuestion ? selectedHang : null,
                    phan_thi: selectedType?.requiresQuestion ? selectedPhanThi : null,
                    stt: selectedType?.requiresQuestion && questionSTT ? parseInt(questionSTT) : null,
                    chuyen_nganh: selectedType?.requiresQuestion ? questionChuyenNganh : null
                })

            if (error) {
                // Check for rate limit error
                if (error.message.includes('Rate limit exceeded')) {
                    throw new Error('Bạn gửi góp ý quá nhanh. Vui lòng đợi 5 phút.')
                }
                throw error
            }

            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                setFeedbackType('app_rating')
                setRating(0)
                setContent('')
                setQuestionSTT('')
                setQuestionId(null)
                setTurnstileToken(null)
                turnstileRef.current?.reset()
                onClose()
            }, 2000)
        } catch (error: any) {
            console.error('Error submitting feedback:', error)
            alert(error.message || 'Có lỗi xảy ra khi gửi góp ý. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-apple-card border border-apple-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-apple-card border-b border-apple-border p-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-apple-blue/10 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-apple-blue" />
                        </div>
                        <h2 className="text-xl font-bold text-apple-text">Góp ý</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-apple-border transition-colors flex items-center justify-center"
                    >
                        <X className="w-5 h-5 text-apple-text-secondary" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Feedback Type Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-apple-text">Loại góp ý</label>
                        <div className="grid grid-cols-1 gap-2">
                            {FEEDBACK_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFeedbackType(type.value)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${feedbackType === type.value
                                        ? 'bg-apple-blue/10 border-apple-blue text-apple-blue'
                                        : 'bg-apple-bg border-apple-border text-apple-text hover:border-apple-text/30'
                                        }`}
                                >
                                    <type.icon className="w-5 h-5 shrink-0" />
                                    <span className="text-sm font-semibold">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Question Selector (only for question_error type) */}
                    {selectedType?.requiresQuestion && (
                        <div className="space-y-4 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                            <div className="flex items-center gap-2 text-orange-600">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-xs font-bold">Thông tin câu hỏi cần báo sai</span>
                            </div>

                            {/* Hạng */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-apple-text">Hạng</label>
                                <div className="flex gap-2">
                                    {HANG_OPTIONS.map((hang) => (
                                        <button
                                            key={hang}
                                            type="button"
                                            onClick={() => setSelectedHang(hang)}
                                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${selectedHang === hang
                                                ? 'bg-apple-blue text-white'
                                                : 'bg-apple-bg border border-apple-border text-apple-text'
                                                }`}
                                        >
                                            {hang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Phần thi */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-apple-text">Phần thi</label>
                                <select
                                    value={selectedPhanThi}
                                    onChange={(e) => setSelectedPhanThi(e.target.value)}
                                    className="w-full px-3 py-2 bg-apple-bg border border-apple-border rounded-lg text-sm text-apple-text outline-none focus:ring-2 focus:ring-apple-blue/20"
                                >
                                    {PHAN_THI_OPTIONS.map((phan) => (
                                        <option key={phan} value={phan}>{phan}</option>
                                    ))}
                                </select>
                            </div>

                            {/* STT */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-apple-text">Số thứ tự câu hỏi</label>
                                <input
                                    type="number"
                                    value={questionSTT}
                                    onChange={(e) => setQuestionSTT(e.target.value)}
                                    placeholder="Nhập STT câu hỏi"
                                    className="w-full px-3 py-2 bg-apple-bg border border-apple-border rounded-lg text-sm text-apple-text outline-none focus:ring-2 focus:ring-apple-blue/20"
                                    min="1"
                                />
                                {questionSTT && questionId && (
                                    <p className="text-xs text-green-600">✓ Đã tìm thấy câu hỏi</p>
                                )}
                                {questionSTT && !questionId && (
                                    <p className="text-xs text-red-600">✗ Không tìm thấy câu hỏi</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Rating (only for app_rating type) */}
                    {selectedType?.requiresRating && (
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-apple-text">Đánh giá của bạn</label>
                            <div className="flex gap-2 justify-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <Star
                                            className={`w-10 h-10 ${star <= (hoverRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-apple-text-secondary/20'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-apple-text">
                            Nội dung {selectedType?.requiresRating && '(Tùy chọn)'}
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={
                                selectedType?.requiresQuestion
                                    ? 'Mô tả chi tiết lỗi sai trong câu hỏi...'
                                    : 'Chia sẻ ý kiến của bạn về ứng dụng...'
                            }
                            className="w-full px-4 py-3 bg-apple-bg border border-apple-border rounded-xl outline-none focus:ring-2 focus:ring-apple-blue/20 text-sm text-apple-text resize-none"
                            rows={4}
                        />
                    </div>

                    {/* Honeypot */}
                    <input
                        type="text"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                    />

                    {/* Turnstile CAPTCHA */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-apple-text-secondary">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs font-bold">Xác minh bảo mật</span>
                        </div>
                        <div className="flex justify-center">
                            <Turnstile
                                ref={turnstileRef}
                                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                                onSuccess={(token) => setTurnstileToken(token)}
                                options={{
                                    theme: 'light',
                                    size: 'normal',
                                }}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !turnstileToken || success}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${success
                            ? 'bg-green-500 text-white'
                            : loading || !turnstileToken
                                ? 'bg-apple-border text-apple-text-secondary cursor-not-allowed'
                                : 'bg-apple-blue text-white hover:bg-apple-blue/90 active:scale-98 shadow-lg'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Đang gửi...</span>
                            </>
                        ) : success ? (
                            <>
                                <span>✓ Đã gửi thành công!</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span>Gửi góp ý</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
