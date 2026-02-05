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

const CHUYEN_NGANH_OPTIONS = [
    'Khảo sát địa hình',
    'Khảo sát địa chất công trình',
    'Thiết kế quy hoạch xây dựng',
    'Thiết kế xây dựng công trình - Kết cấu công trình',
    'Thiết kế xây dựng công trình - Công trình Khai thác mỏ',
    'Thiết kế xây dựng công trình - Công trình Đường bộ',
    'Thiết kế xây dựng công trình - Công trình Đường sắt',
    'Thiết kế xây dựng công trình - Công trình Cầu - Hầm',
    'Thiết kế xây dựng công trình - Công trình Đường thủy nội địa - Hàng hải',
    'Thiết kế xây dựng công trình - Công trình Thủy lợi, đê điều',
    'Thiết kế xây dựng công trình - Công trình Cấp nước - thoát nước',
    'Thiết kế xây dựng công trình - Công trình Xử lý chất thải rắn',
    'Thiết kế cơ - điện công trình - Hệ thống điện',
    'Thiết kế cơ - điện công trình - Hệ thống cấp - thoát nước công trình',
    'Thiết kế cơ - điện công trình - Hệ thống thông gió - cấp thoát nhiệt',
    'Giám sát công tác xây dựng công trình',
    'Giám sát công tác lắp đặt thiết bị công trình',
    'Định giá xây dựng',
    'Quản lý dự án đầu tư xây dựng'
]

interface Question {
    id: number
    stt: number
    cau_hoi: string
    chuyen_nganh: string | null
}

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
    const [selectedChuyenNganh, setSelectedChuyenNganh] = useState(CHUYEN_NGANH_OPTIONS[0])
    const [selectedPhanThi, setSelectedPhanThi] = useState(PHAN_THI_OPTIONS[0])
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [loadingQuestions, setLoadingQuestions] = useState(false)

    const selectedType = FEEDBACK_TYPES.find(t => t.value === feedbackType)

    // Auto-load questions when Hạng, Chuyên ngành, or Phần thi changes
    useEffect(() => {
        if (!selectedType?.requiresQuestion) {
            setQuestions([])
            return
        }

        const loadQuestions = async () => {
            setLoadingQuestions(true)
            try {
                let query = supabase
                    .from('questions')
                    .select('id, stt, cau_hoi, chuyen_nganh')
                    .eq('hang', selectedHang)
                    .eq('chuyen_nganh', selectedChuyenNganh)
                    .eq('phan_thi', selectedPhanThi)
                    .order('stt', { ascending: true })

                const { data, error } = await query

                if (!error && data) {
                    setQuestions(data)
                } else {
                    setQuestions([])
                }
            } catch (error) {
                console.error('Error loading questions:', error)
                setQuestions([])
            } finally {
                setLoadingQuestions(false)
            }
        }

        loadQuestions()
        setSelectedQuestionId(null) // Reset selection when filters change
    }, [selectedHang, selectedChuyenNganh, selectedPhanThi, selectedType])

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

        if (selectedType?.requiresQuestion && !selectedQuestionId) {
            alert('Vui lòng chọn câu hỏi cần báo sai!')
            return
        }

        if (!content.trim() && !selectedType?.requiresRating) {
            alert('Vui lòng nhập nội dung góp ý!')
            return
        }

        setLoading(true)
        try {
            // Find selected question details
            const selectedQuestion = questions.find(q => q.id === selectedQuestionId)

            // Direct Supabase insert to user_feedback table
            const { error } = await supabase
                .from('user_feedback')
                .insert({
                    user_id: user.id,
                    question_id: selectedType?.requiresQuestion ? selectedQuestionId : null,
                    feedback_type: feedbackType,
                    content: content || '',
                    rating: selectedType?.requiresRating ? rating : null,
                    status: feedbackType === 'app_rating' ? 'resolved' : 'pending',
                    email: user.email || user.user_metadata?.email || null,
                    // Denormalized question data for easier querying
                    hang: selectedType?.requiresQuestion ? selectedHang : null,
                    phan_thi: selectedType?.requiresQuestion ? selectedPhanThi : null,
                    stt: selectedType?.requiresQuestion && selectedQuestion ? selectedQuestion.stt : null,
                    chuyen_nganh: selectedType?.requiresQuestion ? (selectedPhanThi === 'Câu hỏi Chuyên môn' ? selectedChuyenNganh : selectedQuestion?.chuyen_nganh) : null
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
                setSelectedQuestionId(null)
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
            <div className="bg-apple-card border border-apple-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                                <label className="text-xs font-bold text-apple-text">1. Chọn Hạng</label>
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

                            {/* Chuyên ngành - Always visible */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-apple-text">2. Chọn Chuyên ngành</label>
                                <select
                                    value={selectedChuyenNganh}
                                    onChange={(e) => setSelectedChuyenNganh(e.target.value)}
                                    className="w-full px-3 py-2 bg-apple-bg border border-apple-border rounded-lg text-sm text-apple-text outline-none focus:ring-2 focus:ring-apple-blue/20"
                                >
                                    {CHUYEN_NGANH_OPTIONS.map((cn) => (
                                        <option key={cn} value={cn}>{cn}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Phần thi */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-apple-text">3. Chọn Phần thi</label>
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

                            {/* Question Dropdown */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-apple-text">4. Chọn câu hỏi</label>
                                {loadingQuestions ? (
                                    <div className="flex items-center justify-center py-4 text-apple-text-secondary">
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        <span className="text-sm">Đang tải câu hỏi...</span>
                                    </div>
                                ) : questions.length > 0 ? (
                                    <select
                                        value={selectedQuestionId || ''}
                                        onChange={(e) => setSelectedQuestionId(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full px-3 py-2 bg-apple-bg border border-apple-border rounded-lg text-sm text-apple-text outline-none focus:ring-2 focus:ring-apple-blue/20"
                                    >
                                        <option value="">-- Chọn câu hỏi --</option>
                                        {questions.map((q) => (
                                            <option key={q.id} value={q.id}>
                                                STT {q.stt}: {q.cau_hoi.substring(0, 100)}{q.cau_hoi.length > 100 ? '...' : ''}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-xs text-apple-text-secondary py-2">
                                        Không có câu hỏi nào với tiêu chí đã chọn
                                    </p>
                                )}
                                {selectedQuestionId && (
                                    <p className="text-xs text-green-600">✓ Đã chọn câu hỏi</p>
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
