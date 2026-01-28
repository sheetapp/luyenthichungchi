'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
    Clock, ChevronLeft, ChevronRight, Send,
    ArrowLeft, AlertCircle, CheckCircle2, XCircle, FileText
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store/useAppStore'

const EXAM_TIME = 30 * 60 // 30 minutes in seconds

interface Question {
    id: number
    stt: number
    hang: string
    chuyen_nganh: string
    phan_thi: string
    cau_hoi: string
    dap_an_a: string
    dap_an_b: string
    dap_an_c: string
    dap_an_d: string
    dap_an_dung: string
}

export default function ExamSessionPage() {
    const params = useParams()
    const router = useRouter()
    const { selectedHang } = useAppStore()
    const searchParams = useSearchParams()

    const retakeId = searchParams.get('retake')
    const queryHang = searchParams.get('hang') // Backup if selectedHang is lost

    const effectiveHang = selectedHang || queryHang

    const examId = decodeURIComponent(params.examId as string)

    // States
    const [questions, setQuestions] = useState<Question[]>([])
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [timeLeft, setTimeLeft] = useState(EXAM_TIME)
    const [isFinished, setIsFinished] = useState(false)
    const [startTime] = useState(new Date())
    const [showShareDialog, setShowShareDialog] = useState(false)
    const [sharing, setSharing] = useState(false)
    const [showWrongAnswers, setShowWrongAnswers] = useState(false)
    const [showSubmitDialog, setShowSubmitDialog] = useState(false)
    const [activeModalTab, setActiveModalTab] = useState('Câu hỏi Pháp luật chung')

    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Load Exam Data
    useEffect(() => {
        async function startExam() {
            setLoading(true)

            try {
                // Fetch questions: 10 law (5 common + 5 specific) + 20 specialty

                let allQuestions: Question[] = []

                if (retakeId) {
                    console.log('🔄 Retaking exam from ID:', retakeId)
                    // Fetch original result
                    const { data: resultData, error: resultError } = await supabase
                        .from('exam_results')
                        .select('answers')
                        .eq('id', retakeId)
                        .single()

                    if (resultError || !resultData?.answers) {
                        throw new Error('Không tìm thấy dữ liệu bài thi cũ để thi lại.')
                    }

                    const originalAnswers = resultData.answers as any[]
                    const qIds = originalAnswers.map(a => a.q_id)

                    // Fetch those specific questions
                    const { data: retakeQuestions, error: fetchError } = await supabase
                        .from('questions')
                        .select('*')
                        .in('id', qIds)

                    if (fetchError || !retakeQuestions) {
                        throw new Error('Không thể tải bộ câu hỏi cũ.')
                    }

                    // Sort to match original order if possible, or at least structure (Law first)
                    // We'll trust the database IDs or the original order from the result
                    const sortedQuestions = qIds.map(id => retakeQuestions.find(q => q.id === id)).filter(Boolean) as Question[]
                    allQuestions = sortedQuestions
                } else {
                    // Standard Random Exam Logic
                    // 1. Get 5 common law questions
                    const { data: lawCommon } = await supabase
                        .from('questions')
                        .select('*')
                        .eq('hang', effectiveHang)
                        .eq('chuyen_nganh', examId)
                        .eq('phan_thi', 'Câu hỏi Pháp luật chung')
                        .limit(50)

                    // 2. Get 5 specific law questions
                    const { data: lawSpecific } = await supabase
                        .from('questions')
                        .select('*')
                        .eq('hang', effectiveHang)
                        .eq('chuyen_nganh', examId)
                        .eq('phan_thi', 'Câu hỏi Pháp luật riêng')
                        .limit(50)

                    // 3. Get 20 specialty questions
                    const { data: specialty } = await supabase
                        .from('questions')
                        .select('*')
                        .eq('hang', effectiveHang)
                        .eq('chuyen_nganh', examId)
                        .eq('phan_thi', 'Câu hỏi Chuyên môn')
                        .limit(100)

                    // Randomly select questions
                    const selectedLawCommon = (lawCommon || [])
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 5)

                    const selectedLawSpecific = (lawSpecific || [])
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 5)

                    const selectedSpecialty = (specialty || [])
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 20)

                    // Combine: 10 law questions first, then 20 specialty
                    allQuestions = [
                        ...selectedLawCommon,
                        ...selectedLawSpecific,
                        ...selectedSpecialty
                    ]
                }

                if (allQuestions.length < 30) {
                    alert(`Không đủ câu hỏi cho đề thi này. Hiện có ${allQuestions.length}/30 câu.`)
                    router.push('/thi-thu')
                    return
                }

                setQuestions(allQuestions)
            } catch (error) {
                console.error('Error loading exam:', error)
                router.push('/thi-thu')
            }

            setLoading(false)
        }

        if (effectiveHang && examId) {
            startExam()
        }
    }, [examId, effectiveHang, router, retakeId])

    // Timer Logic
    useEffect(() => {
        if (loading || isFinished) return

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!)
                    handleSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [loading, isFinished])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const selectAnswer = (qId: number, choice: string) => {
        if (isFinished) return
        setUserAnswers(prev => ({ ...prev, [qId]: choice }))
    }

    const confirmSubmit = () => {
        setShowSubmitDialog(false)
        handleSubmit()
    }

    const handleSubmit = async () => {
        if (isFinished) return
        setIsFinished(true)
        if (timerRef.current) clearInterval(timerRef.current)

        // Calculate scores
        const lawQuestions = questions.slice(0, 10) // First 10 are law questions
        const specialtyQuestions = questions.slice(10, 30) // Next 20 are specialty

        const lawCorrect = lawQuestions.filter(q =>
            userAnswers[q.id] === q.dap_an_dung
        ).length

        const specialtyCorrect = specialtyQuestions.filter(q =>
            userAnswers[q.id] === q.dap_an_dung
        ).length

        const totalCorrect = lawCorrect + specialtyCorrect
        const passed = lawCorrect >= 7 && totalCorrect >= 21

        // Save to Supabase
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('exam_results').insert({
                    user_id: user.id,
                    hang: selectedHang,
                    chuyen_nganh: examId,
                    score: totalCorrect,
                    law_correct: lawCorrect,
                    specialist_correct: specialtyCorrect,
                    total_questions: 30,
                    time_taken: EXAM_TIME - timeLeft,
                    passed: passed,
                    answers: questions.map(q => ({
                        q_id: q.id,
                        choice: userAnswers[q.id],
                        correct: userAnswers[q.id] === q.dap_an_dung
                    }))
                })
            }
        } catch (error) {
            console.error('Error saving exam result:', error)
        }
    }

    // Question navigation
    const goNext = () => currentIndex < questions.length - 1 && setCurrentIndex(currentIndex + 1)
    const goPrev = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1)
    const jumpTo = (index: number) => setCurrentIndex(index)

    if (!mounted || loading) return (
        <div className="min-h-screen py-6 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Đang khởi tạo đề thi...</p>
        </div>
    )

    if (!questions.length) return (
        <div className="min-h-screen py-6 flex flex-col items-center justify-center px-6">
            <FileText className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center mb-4">Bộ đề thi hiện không khả dụng. Vui lòng quay lại sau.</p>
            <button
                onClick={() => router.push('/thi-thu')}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
            >
                Quay lại
            </button>
        </div>
    )

    const currentQ = questions[currentIndex]
    const isLawQuestion = currentIndex < 10

    // Results Screen
    if (isFinished) {
        const lawCommonQuestions = questions.slice(0, 5)
        const lawSpecificQuestions = questions.slice(5, 10)
        const specialtyQuestions = questions.slice(10, 30)

        const lawCommonCorrect = lawCommonQuestions.filter(q => userAnswers[q.id] === q.dap_an_dung).length
        const lawSpecificCorrect = lawSpecificQuestions.filter(q => userAnswers[q.id] === q.dap_an_dung).length
        const specialtyCorrect = specialtyQuestions.filter(q => userAnswers[q.id] === q.dap_an_dung).length

        const lawCorrect = lawCommonCorrect + lawSpecificCorrect
        const totalCorrect = lawCorrect + specialtyCorrect
        const totalWrong = 30 - totalCorrect
        const passed = lawCorrect >= 7 && totalCorrect >= 21

        const handleShare = async () => {
            setSharing(true)
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    // Update exam result to be public
                    await supabase
                        .from('exam_results')
                        .update({ is_public: true })
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(1)

                    alert('✅ Kết quả đã được chia sẻ lên bảng xếp hạng!')
                    setShowShareDialog(false)
                }
            } catch (error) {
                console.error('Error sharing result:', error)
                alert('❌ Có lỗi khi chia sẻ kết quả')
            }
            setSharing(false)
        }

        return (
            <div className="min-h-screen py-6 px-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Result Header */}
                    <div className={`p-10 rounded-2xl shadow-2xl text-center relative overflow-hidden ${passed ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'
                        }`}>
                        <div className="relative z-10 text-white">
                            <div className="inline-flex p-4 bg-white/20 rounded-full mb-6">
                                {passed ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                            </div>
                            <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">
                                KẾT QUẢ: {passed ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                            </h1>
                            <p className="text-white/90 text-lg">
                                {passed ? '🎉 Chúc mừng! Bạn đã vượt qua kỳ thi.' : '💪 Đừng nản lòng! Hãy cố gắng lần sau.'}
                            </p>
                        </div>
                    </div>

                    {/* Share Dialog for Passed Exams */}
                    {passed && !showShareDialog && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-blue-900 mb-1">🏆 Chia sẻ thành tích của bạn!</h3>
                                    <p className="text-blue-700 text-sm">Hiển thị kết quả này trên bảng xếp hạng để mọi người cùng biết</p>
                                </div>
                                <button
                                    onClick={() => setShowShareDialog(true)}
                                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                                >
                                    Chia sẻ ngay
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Share Confirmation Dialog */}
                    {showShareDialog && (
                        <div className="bg-white rounded-2xl p-6 border-2 border-blue-500 shadow-xl">
                            <h3 className="font-bold text-slate-900 mb-3 text-lg">Xác nhận chia sẻ kết quả</h3>
                            <p className="text-slate-600 mb-6">
                                Kết quả thi của bạn sẽ được hiển thị công khai trên bảng xếp hạng.
                                Mọi người sẽ thấy điểm số và thông tin của bạn.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowShareDialog(false)}
                                    disabled={sharing}
                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleShare}
                                    disabled={sharing}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
                                >
                                    {sharing ? 'Đang chia sẻ...' : 'Xác nhận chia sẻ'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Score Summary */}
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
                            <div className="text-slate-600 text-sm font-medium mb-2">Điểm Pháp luật</div>
                            <div className={`text-4xl font-black ${lawCorrect >= 7 ? 'text-green-600' : 'text-red-600'}`}>
                                {lawCorrect}/10
                            </div>
                            <div className="text-xs text-slate-500 mt-2">Yêu cầu: ≥ 7 điểm</div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
                            <div className="text-slate-600 text-sm font-medium mb-2">Điểm Chuyên môn</div>
                            <div className="text-4xl font-black text-blue-600">
                                {specialtyCorrect}/20
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
                            <div className="text-slate-600 text-sm font-medium mb-2">Tổng điểm</div>
                            <div className={`text-4xl font-black ${totalCorrect >= 21 ? 'text-green-600' : 'text-red-600'}`}>
                                {totalCorrect}/30
                            </div>
                            <div className="text-xs text-slate-500 mt-2">Yêu cầu: ≥ 21 điểm</div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
                            <div className="text-slate-600 text-sm font-medium mb-2">Thời gian</div>
                            <div className="text-4xl font-black text-slate-700">
                                {formatTime(EXAM_TIME - timeLeft)}
                            </div>
                            <div className="text-xs text-slate-500 mt-2">/ 30:00</div>
                        </div>
                    </div>

                    {/* Correct/Wrong Summary */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-green-700 text-sm font-medium mb-1">Trả lời đúng</div>
                                    <div className="text-4xl font-black text-green-600">{totalCorrect}</div>
                                </div>
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </div>
                        </div>

                        <button
                            onClick={() => setShowWrongAnswers(true)}
                            disabled={totalWrong === 0}
                            className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border-2 border-red-200 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-red-700 text-sm font-medium mb-1">Trả lời sai</div>
                                    <div className="text-4xl font-black text-red-600">{totalWrong}</div>
                                    {totalWrong > 0 && (
                                        <div className="text-xs text-red-600 mt-2 font-medium">👆 Nhấn để xem chi tiết</div>
                                    )}
                                </div>
                                <XCircle className="w-12 h-12 text-red-500" />
                            </div>
                        </button>
                    </div>

                    {/* Wrong Answers Modal */}
                    {showWrongAnswers && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                                {/* Modal Header */}
                                <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black">Các câu trả lời sai</h3>
                                        <p className="text-white/90 text-sm mt-1">Xem lại để học tập và cải thiện</p>
                                    </div>
                                    <button
                                        onClick={() => setShowWrongAnswers(false)}
                                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
                                    {/* Tabs inside Modal */}
                                    <div className="flex border-b-2 border-slate-100 bg-slate-50 px-6 shrink-0">
                                        {['Câu hỏi Pháp luật chung', 'Câu hỏi Pháp luật riêng', 'Câu hỏi Chuyên môn'].map((tab) => {
                                            const wrongInTab = questions.filter(q =>
                                                q.phan_thi === tab &&
                                                userAnswers[q.id] !== q.dap_an_dung
                                            ).length

                                            return (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveModalTab(tab)}
                                                    className={`px-4 py-3 text-sm font-bold transition-all relative flex items-center gap-2 ${activeModalTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                                                        }`}
                                                >
                                                    <span>{tab.replace('Câu hỏi ', '')}</span>
                                                    {wrongInTab > 0 && (
                                                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${activeModalTab === tab ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'
                                                            }`}>
                                                            {wrongInTab}
                                                        </span>
                                                    )}
                                                    {activeModalTab === tab && (
                                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        {questions
                                            .filter(q => q.phan_thi === activeModalTab && userAnswers[q.id] !== q.dap_an_dung)
                                            .map((q, idx) => {
                                                const userAnswer = userAnswers[q.id]
                                                const correctAnswer = q.dap_an_dung
                                                const questionType = q.phan_thi

                                                return (
                                                    <div key={q.id} className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                                        {/* Question Header */}
                                                        <div className="flex items-start gap-3 mb-4">
                                                            <div className="w-8 h-8 rounded-lg bg-red-500 text-white font-bold flex items-center justify-center shrink-0">
                                                                {q.stt}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-xs text-slate-500 mb-1">{questionType}</div>
                                                                <div className="text-slate-900 font-medium leading-relaxed">{q.cau_hoi}</div>
                                                            </div>
                                                        </div>

                                                        {/* Answer Options */}
                                                        <div className="space-y-2">
                                                            {['a', 'b', 'c', 'd'].map(option => {
                                                                const answerText = q[`dap_an_${option}` as keyof Question] as string
                                                                const isUserAnswer = userAnswer === option
                                                                const isCorrectAnswer = correctAnswer === option

                                                                return (
                                                                    <div
                                                                        key={option}
                                                                        className={`p-4 rounded-xl border-2 transition-all ${isCorrectAnswer
                                                                            ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                                                            : isUserAnswer
                                                                                ? 'bg-rose-50 border-rose-200'
                                                                                : 'bg-white border-slate-100'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-start gap-4">
                                                                            <div
                                                                                className={`w-9 h-9 rounded-lg font-black flex items-center justify-center text-sm shrink-0 shadow-sm ${isCorrectAnswer
                                                                                    ? 'bg-emerald-600 text-white'
                                                                                    : isUserAnswer
                                                                                        ? 'bg-rose-600 text-white'
                                                                                        : 'bg-slate-100 text-slate-500'
                                                                                    }`}
                                                                            >
                                                                                {option.toUpperCase()}
                                                                            </div>
                                                                            <div className="flex-1 pt-1.5">
                                                                                <div className={`text-sm leading-relaxed ${isCorrectAnswer
                                                                                    ? 'text-emerald-900 font-semibold'
                                                                                    : isUserAnswer
                                                                                        ? 'text-rose-900 font-semibold'
                                                                                        : 'text-slate-600'
                                                                                    }`}>
                                                                                    {answerText}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )
                                            })}

                                        {/* Empty state if no wrong answers in this category */}
                                        {questions.filter(q => q.phan_thi === activeModalTab && userAnswers[q.id] !== q.dap_an_dung).length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                    <CheckCircle2 className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="font-bold text-slate-500">Tuyệt vời!</p>
                                                <p className="text-sm">Bạn không có câu sai nào trong phần này.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="bg-slate-50 p-4 border-t-2 border-slate-200">
                                    <button
                                        onClick={() => setShowWrongAnswers(false)}
                                        className="w-full px-6 py-3 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detailed Breakdown by Category */}
                    <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 text-lg">Chi tiết theo từng phần</h3>

                        <div className="space-y-3">
                            {/* Common Law Tab */}
                            <details className="group">
                                <summary className="cursor-pointer list-none">
                                    <div className="flex items-center justify-between p-4 bg-orange-50 border-2 border-orange-200 rounded-xl hover:bg-orange-100 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${lawCommonCorrect >= 3 ? 'bg-green-500' : 'bg-red-500'
                                                }`}>
                                                {lawCommonCorrect}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-orange-900">Pháp luật chung</h4>
                                                <p className="text-xs text-orange-700">{lawCommonCorrect}/5 câu đúng</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500 font-medium group-open:hidden">Xem chi tiết</span>
                                            <span className="text-sm text-slate-500 font-medium hidden group-open:inline">Thu gọn</span>
                                            <svg className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </summary>
                                <div className="mt-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                                    <div className="grid grid-cols-5 gap-2">
                                        {lawCommonQuestions.map((q, idx) => {
                                            const isCorrect = userAnswers[q.id] === q.dap_an_dung
                                            return (
                                                <div
                                                    key={q.id}
                                                    className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center text-sm ${isCorrect ? 'bg-white text-green-600 border-2 border-green-500' : 'bg-red-500 text-white'
                                                        }`}
                                                >
                                                    {idx + 1}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </details>

                            {/* Specific Law Tab */}
                            <details className="group">
                                <summary className="cursor-pointer list-none">
                                    <div className="flex items-center justify-between p-4 bg-amber-50 border-2 border-amber-200 rounded-xl hover:bg-amber-100 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${lawSpecificCorrect >= 3 ? 'bg-green-500' : 'bg-red-500'
                                                }`}>
                                                {lawSpecificCorrect}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-amber-900">Pháp luật riêng</h4>
                                                <p className="text-xs text-amber-700">{lawSpecificCorrect}/5 câu đúng</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500 font-medium group-open:hidden">Xem chi tiết</span>
                                            <span className="text-sm text-slate-500 font-medium hidden group-open:inline">Thu gọn</span>
                                            <svg className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </summary>
                                <div className="mt-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                                    <div className="grid grid-cols-5 gap-2">
                                        {lawSpecificQuestions.map((q, idx) => {
                                            const isCorrect = userAnswers[q.id] === q.dap_an_dung
                                            return (
                                                <div
                                                    key={q.id}
                                                    className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center text-sm ${isCorrect ? 'bg-white text-green-600 border-2 border-green-500' : 'bg-red-500 text-white'
                                                        }`}
                                                >
                                                    {idx + 6}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </details>

                            {/* Specialty Tab */}
                            <details className="group">
                                <summary className="cursor-pointer list-none">
                                    <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${specialtyCorrect >= 12 ? 'bg-green-500' : 'bg-red-500'
                                                }`}>
                                                {specialtyCorrect}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-blue-900">Chuyên môn</h4>
                                                <p className="text-xs text-blue-700">{specialtyCorrect}/20 câu đúng</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500 font-medium group-open:hidden">Xem chi tiết</span>
                                            <span className="text-sm text-slate-500 font-medium hidden group-open:inline">Thu gọn</span>
                                            <svg className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </summary>
                                <div className="mt-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                                    <div className="grid grid-cols-10 gap-2">
                                        {specialtyQuestions.map((q, idx) => {
                                            const isCorrect = userAnswers[q.id] === q.dap_an_dung
                                            return (
                                                <div
                                                    key={q.id}
                                                    className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center text-sm ${isCorrect ? 'bg-white text-green-600 border-2 border-green-500' : 'bg-red-500 text-white'
                                                        }`}
                                                >
                                                    {idx + 11}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/thi-thu')}
                            className="flex-1 px-6 py-4 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
                        >
                            Về danh sách đề thi
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex-1 px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                        >
                            Thi lại
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Exam Interface
    return (
        <div className="min-h-screen py-6 space-y-6 flex flex-col">
            {/* Header with Timer */}
            <div className="px-6 flex items-center justify-between flex-shrink-0">
                <button
                    onClick={() => {
                        if (confirm('Bạn có chắc muốn thoát? Kết quả sẽ không được lưu.')) {
                            router.push('/thi-thu')
                        }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Thoát
                </button>

                <div className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    <Clock className="w-5 h-5" />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Exam Info */}
            <div className="px-6 flex-shrink-0">
                <h1 className="text-2xl font-black text-slate-900 mb-1">{examId}</h1>
                <p className="text-slate-600 text-sm">{selectedHang} • Câu {currentIndex + 1}/{questions.length}</p>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-[280px_1fr] gap-6 flex-1 min-h-0 px-6">
                {/* Question Grid */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-200 flex flex-col overflow-hidden">
                    <h3 className="font-bold text-slate-800 mb-4 flex-shrink-0">Danh sách câu hỏi</h3>

                    <div className="overflow-y-auto flex-1">
                        <div className="space-y-4">
                            {/* Law Questions */}
                            <div>
                                <div className="text-xs font-bold text-orange-600 mb-2 uppercase tracking-wider">Pháp luật (10 câu)</div>
                                <div className="grid grid-cols-5 gap-2">
                                    {questions.slice(0, 10).map((q, idx) => (
                                        <button
                                            key={q.id}
                                            onClick={() => jumpTo(idx)}
                                            className={`w-10 h-10 rounded-lg font-bold transition-all text-sm ${idx === currentIndex
                                                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                                : userAnswers[q.id]
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Specialty Questions */}
                            <div>
                                <div className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">Chuyên môn (20 câu)</div>
                                <div className="grid grid-cols-5 gap-2">
                                    {questions.slice(10, 30).map((q, idx) => {
                                        const actualIdx = idx + 10
                                        return (
                                            <button
                                                key={q.id}
                                                onClick={() => jumpTo(actualIdx)}
                                                className={`w-10 h-10 rounded-lg font-bold transition-all text-sm ${actualIdx === currentIndex
                                                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                                    : userAnswers[q.id]
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {actualIdx + 1}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={() => setShowSubmitDialog(true)}
                        className="mt-4 w-full px-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 flex-shrink-0"
                    >
                        <Send className="w-5 h-5" />
                        Nộp bài
                    </button>
                </div>

                {/* Question Display */}
                <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-200 flex flex-col overflow-hidden">
                    <div className="overflow-y-auto flex-1 p-8">
                        <div className="space-y-6">
                            {/* Question Header */}
                            <div className="flex items-start gap-4 pb-4 border-b-2 border-slate-200">
                                <span className={`px-4 py-2 font-bold rounded-lg text-sm flex-shrink-0 ${isLawQuestion
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    Câu {currentIndex + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="text-slate-900 font-bold leading-relaxed">
                                        {currentQ.cau_hoi}
                                    </p>
                                    <span className="text-slate-400 text-sm font-medium mt-2 inline-block">
                                        {isLawQuestion ? '📋 Pháp luật' : '🔧 Chuyên môn'}
                                    </span>
                                </div>
                            </div>

                            {/* Answer Options */}
                            <div className="space-y-3">
                                {['a', 'b', 'c', 'd'].map((option) => {
                                    const optionText = currentQ[`dap_an_${option}` as keyof Question] as string
                                    const isSelected = userAnswers[currentQ.id] === option

                                    return (
                                        <label
                                            key={option}
                                            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${currentQ.id}`}
                                                value={option}
                                                checked={isSelected}
                                                onChange={() => selectAnswer(currentQ.id, option)}
                                                className="mt-1 w-5 h-5 text-blue-600"
                                            />
                                            <div className="flex-1">
                                                <span className="font-medium text-slate-900">
                                                    {option.toUpperCase()}. {optionText}
                                                </span>
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="border-t-2 border-slate-200 p-6 flex items-center justify-between flex-shrink-0">
                        <button
                            onClick={goPrev}
                            disabled={currentIndex === 0}
                            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Câu trước
                        </button>

                        <span className="text-slate-500 font-medium">
                            {Object.keys(userAnswers).length}/{questions.length} đã trả lời
                        </span>

                        {currentIndex === questions.length - 1 ? (
                            Object.keys(userAnswers).length === questions.length ? (
                                <button
                                    onClick={() => setShowSubmitDialog(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Nộp bài
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed transition-all"
                                >
                                    Câu tiếp
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            )
                        ) : (
                            <button
                                onClick={goNext}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                            >
                                Câu tiếp
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Submit Confirmation Dialog */}
                    {showSubmitDialog && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                        <AlertCircle className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-slate-900 mb-2">Xác nhận nộp bài</h3>
                                        <p className="text-slate-600 mb-3">
                                            Bạn có chắc chắn muốn hoàn tất bài thi lúc này không?
                                        </p>

                                        {timeLeft <= 0 && (
                                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 mb-3">
                                                <p className="text-red-700 text-sm font-bold flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    Bạn đã quá thời gian thi!
                                                </p>
                                            </div>
                                        )}

                                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-slate-600">Đã trả lời:</span>
                                                <span className="font-bold text-blue-600">
                                                    {Object.keys(userAnswers).length}/{questions.length} câu
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600">Thời gian còn lại:</span>
                                                <span className={`font-bold ${timeLeft <= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                                    {formatTime(Math.max(0, timeLeft))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowSubmitDialog(false)}
                                        className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={confirmSubmit}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all"
                                    >
                                        Nộp bài
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
