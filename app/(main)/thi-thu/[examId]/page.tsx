'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
    Clock, ChevronLeft, ChevronRight, Send, HelpCircle,
    ArrowLeft, AlertCircle, CheckCircle2, XCircle, FileText
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store/useAppStore'
import { GuideModal } from '@/components/practice/GuideModal'
import { ReportModal } from '@/components/practice/ReportModal'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/ThemeContext'

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
    const [user, setUser] = useState<any>(null)
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
    const [isGuideOpen, setIsGuideOpen] = useState(false)

    // Keyboard Navigation States
    const [kbArea, setKbArea] = useState<'sidebar' | 'main'>('sidebar')
    const [kbFocusIndex, setKbFocusIndex] = useState(0)

    const [isMobile, setIsMobile] = useState(false)
    const [isReportModalOpen, setIsReportModalOpen] = useState(false)
    const [isQuestionsGridOpen, setIsQuestionsGridOpen] = useState(false)

    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        setMounted(true)
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)

        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        fetchUser()

        return () => window.removeEventListener('resize', checkMobile)
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
    const jumpTo = (index: number) => {
        setCurrentIndex(index)
        if (!isMobile) setKbFocusIndex(index) // Sync keyboard focus for PC
    }

    // Standardized Keyboard Navigation Logic
    useEffect(() => {
        if (isFinished || loading || isMobile) return

        const handleKeyDown = (e: KeyboardEvent) => {
            // Disable when typing
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                return
            }

            // Navigation Keys handling with Prevent Default
            if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key)) {
                e.preventDefault()

                // Area Toggling with Tab
                if (e.key === 'Tab') {
                    setKbArea(prev => {
                        const newArea = prev === 'sidebar' ? 'main' : 'sidebar'
                        if (newArea === 'sidebar') {
                            setKbFocusIndex(currentIndex)
                        } else {
                            setKbFocusIndex(0)
                        }
                        return newArea
                    })
                    return
                }

                if (kbArea === 'sidebar') {
                    const rowCount = 5 // Exam grid is 5 columns
                    switch (e.key) {
                        case 'ArrowRight':
                            if (kbFocusIndex < questions.length - 1) setKbFocusIndex(prev => prev + 1)
                            break
                        case 'ArrowLeft':
                            if (kbFocusIndex > 0) setKbFocusIndex(prev => prev - 1)
                            break
                        case 'ArrowDown':
                            if (kbFocusIndex + rowCount < questions.length) setKbFocusIndex(prev => prev + rowCount)
                            break
                        case 'ArrowUp':
                            if (kbFocusIndex - rowCount >= 0) setKbFocusIndex(prev => prev - rowCount)
                            break
                        case ' ':
                        case 'Enter':
                            jumpTo(kbFocusIndex)
                            setKbArea('main')
                            setKbFocusIndex(0)
                            break
                    }
                } else { // kbArea === 'main'
                    switch (e.key) {
                        case 'ArrowUp':
                            if (kbFocusIndex > 0) setKbFocusIndex(prev => prev - 1)
                            break
                        case 'ArrowDown':
                            if (kbFocusIndex < 3) setKbFocusIndex(prev => prev + 1)
                            break
                        case 'ArrowRight':
                            goNext()
                            break
                        case 'ArrowLeft':
                            goPrev()
                            break
                        case ' ':
                        case 'Enter':
                            const options = ['a', 'b', 'c', 'd']
                            const currentQ = questions[currentIndex]
                            if (currentQ) selectAnswer(currentQ.id, options[kbFocusIndex])
                            break
                    }
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [kbArea, kbFocusIndex, questions, currentIndex, isFinished, loading, isMobile])


    if (!mounted || loading) return (
        <div className="min-h-0 md:h-[calc(100vh-70px)] bg-[#F5F5F7] flex flex-col items-center justify-center p-6 font-sans">
            <div className="relative">
                <div className="w-16 h-16 border-[5px] border-black/5 rounded-full" />
                <div className="w-16 h-16 border-[5px] border-[#007AFF] border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
            </div>
            <p className="mt-8 text-[#86868b] font-semibold text-xs uppercase tracking-[0.2em] animate-pulse">Khởi tạo đề thi...</p>
        </div>
    )

    if (!questions.length) return (
        <div className="min-h-0 md:h-[calc(100vh-70px)] bg-[#F5F5F7] flex flex-col items-center justify-center px-6 font-sans">
            <div className="w-20 h-20 bg-white rounded-[24px] shadow-sm border border-black/5 flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-[#86868b]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">Không tìm thấy đề thi</h3>
            <p className="text-[#86868b] text-center mb-8 max-w-xs">Bộ đề thi hiện không khả dụng hoặc đã có lỗi xảy ra. Vui lòng quay lại sau.</p>
            <button
                onClick={() => router.push('/thi-thu')}
                className="px-8 py-3 bg-[#1d1d1f] text-white font-semibold rounded-[10px] hover:bg-black transition-all shadow-md active:scale-95"
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
            <div className="min-h-0 md:h-[calc(100vh-70px)] bg-[#F5F5F7] py-6 px-6 font-sans overflow-hidden">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Result Header - Premium Sonoma Style */}
                    <div className={`relative p-12 rounded-[32px] overflow-hidden text-center shadow-2xl ${passed ? 'shadow-green-500/10' : 'shadow-red-500/10'
                        }`}>
                        {/* Dynamic Background Gradient */}
                        <div className={`absolute inset-0 opacity-90 ${passed
                            ? 'bg-gradient-to-br from-[#34C759] via-[#30D158] to-[#28CD41]'
                            : 'bg-gradient-to-br from-[#FF3B30] via-[#FF453A] to-[#E02D24]'
                            }`} />

                        {/* Glass Overlay for Depth */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/10 to-transparent" />

                        <div className="relative z-10 text-white space-y-4">
                            <div className="inline-flex p-5 bg-white/20 backdrop-blur-md rounded-full mb-4 shadow-inner">
                                {passed ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                            </div>
                            <h1 className="text-5xl font-bold tracking-tight mb-2 uppercase">
                                {passed ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                            </h1>
                            <p className="text-white/90 text-xl font-medium max-w-md mx-auto leading-relaxed">
                                {passed
                                    ? '🎉 Chúc mừng! Bạn đã xuất sắc hoàn thành kỳ thi sát hạch.'
                                    : '💪 Đừng nản lòng! Hãy ôn tập thêm và thử sức một lần nữa nhé.'}
                            </p>
                        </div>
                    </div>

                    {/* Share Dialog - Sonoma Card */}
                    {passed && !showShareDialog && (
                        <div className="bg-white/70 backdrop-blur-xl rounded-[24px] p-8 border border-white/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-[#007AFF]/10 rounded-full flex items-center justify-center shrink-0">
                                    <FileText className="w-8 h-8 text-[#007AFF]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-[#1d1d1f] mb-1">Chia sẻ thành tích!</h3>
                                    <p className="text-[#86868b] text-[15px]">Hiển thị kết quả này trên bảng xếp hạng công khai</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowShareDialog(true)}
                                className="px-10 py-4 bg-[#007AFF] text-white font-semibold rounded-[12px] hover:bg-[#0062CC] transition-all shadow-lg shadow-blue-500/20 active:scale-95 whitespace-nowrap"
                            >
                                Công khai kết quả
                            </button>
                        </div>
                    )}

                    {/* Share Confirmation - Simple Modal */}
                    {showShareDialog && (
                        <div className="bg-white rounded-[24px] p-8 border border-black/5 shadow-2xl space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-[#1d1d1f]" />
                                </div>
                                <h3 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">Xác nhận chia sẻ</h3>
                            </div>
                            <p className="text-[#86868b] text-[15px] leading-relaxed">
                                Kết quả thi của bạn sẽ được hiển thị công khai trên bảng xếp hạng của cộng đồng.
                                Những người dùng khác có thể thấy điểm số và hồ sơ của bạn.
                            </p>
                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setShowShareDialog(false)}
                                    disabled={sharing}
                                    className="flex-1 px-6 py-4 bg-white border border-black/5 text-[#1d1d1f] font-semibold rounded-[12px] hover:bg-[#F5F5F7] transition-all disabled:opacity-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleShare}
                                    disabled={sharing}
                                    className="flex-1 px-6 py-4 bg-[#1d1d1f] text-white font-semibold rounded-[12px] hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50 active:scale-95"
                                >
                                    {sharing ? 'Đang thực hiện...' : 'Xác nhận chia sẻ'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Score Summary Grid */}
                    <div className="grid md:grid-cols-4 gap-5">
                        <div className="bg-white/80 backdrop-blur-md rounded-[24px] p-6 border border-white/40 shadow-sm flex flex-col justify-between h-full group hover:shadow-md transition-all">
                            <div className="text-[#86868b] text-[10px] font-bold uppercase tracking-widest mb-4">Pháp luật</div>
                            <div className={`text-4xl font-bold tracking-tight ${lawCorrect >= 7 ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                                {lawCorrect}<span className="text-[#86868b] text-xl ml-1">/ 10</span>
                            </div>
                            <div className="text-[11px] font-medium text-[#86868b] mt-4 flex items-center gap-1.5 opacity-60">
                                {lawCorrect >= 7 ? (
                                    <> <CheckCircle2 className="w-3.5 h-3.5" /> Đạt yêu cầu </>
                                ) : (
                                    <> <XCircle className="w-3.5 h-3.5" /> Cần ≥ 7 điểm </>
                                )}
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-md rounded-[24px] p-6 border border-white/40 shadow-sm flex flex-col justify-between h-full group hover:shadow-md transition-all">
                            <div className="text-[#86868b] text-[10px] font-bold uppercase tracking-widest mb-4">Chuyên môn</div>
                            <div className="text-4xl font-bold tracking-tight text-[#007AFF]">
                                {specialtyCorrect}<span className="text-[#86868b] text-xl ml-1">/ 20</span>
                            </div>
                            <div className="text-[11px] font-medium text-[#86868b] mt-4 opacity-60">
                                Kiển thức chuyên sâu
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-md rounded-[24px] p-6 border border-white/40 shadow-sm flex flex-col justify-between h-full group hover:shadow-md transition-all">
                            <div className="text-[#86868b] text-[10px] font-bold uppercase tracking-widest mb-4">Tổng điểm</div>
                            <div className={`text-4xl font-bold tracking-tight ${totalCorrect >= 21 ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                                {totalCorrect}<span className="text-[#86868b] text-xl ml-1">/ 30</span>
                            </div>
                            <div className="text-[11px] font-medium text-[#86868b] mt-4 flex items-center gap-1.5 opacity-60">
                                {totalCorrect >= 21 ? (
                                    <> <CheckCircle2 className="w-3.5 h-3.5" /> Đạt yêu cầu </>
                                ) : (
                                    <> <XCircle className="w-3.5 h-3.5" /> Cần ≥ 21 điểm </>
                                )}
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-md rounded-[24px] p-6 border border-white/40 shadow-sm flex flex-col justify-between h-full group hover:shadow-md transition-all">
                            <div className="text-[#86868b] text-[10px] font-bold uppercase tracking-widest mb-4">Thời gian</div>
                            <div className="text-4xl font-bold tracking-tight text-[#1d1d1f] tabular-nums">
                                {formatTime(EXAM_TIME - timeLeft)}
                            </div>
                            <div className="text-[11px] font-medium text-[#86868b] mt-4 opacity-60">
                                /{formatTime(EXAM_TIME)}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Cards */}
                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="bg-[#34C759]/5 rounded-[24px] p-6 border border-[#34C759]/10 flex items-center justify-between group hover:bg-[#34C759]/10 transition-all">
                            <div className="space-y-1">
                                <div className="text-[#34C759] text-[10px] font-bold uppercase tracking-widest">Trả lời đúng</div>
                                <div className="text-4xl font-bold text-[#34C759] tabular-nums">{totalCorrect}</div>
                            </div>
                            <div className="w-14 h-14 bg-[#34C759]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="w-7 h-7 text-[#34C759]" />
                            </div>
                        </div>

                        <button
                            onClick={() => setShowWrongAnswers(true)}
                            disabled={totalWrong === 0}
                            className={`rounded-[24px] p-6 flex items-center justify-between text-left transition-all border group ${totalWrong === 0
                                ? 'bg-[#86868b]/5 border-black/5 opacity-50 cursor-not-allowed'
                                : 'bg-[#FF3B30]/5 border-[#FF3B30]/10 hover:bg-[#FF3B30]/10 cursor-pointer active:scale-97'
                                }`}
                        >
                            <div className="space-y-1">
                                <div className="text-[#FF3B30] text-[10px] font-bold uppercase tracking-widest">Trả lời sai</div>
                                <div className="text-4xl font-bold text-[#FF3B30] tabular-nums">{totalWrong}</div>
                                {totalWrong > 0 && <div className="text-[11px] font-semibold text-[#FF3B30] mt-1 opacity-70">Nhấn xem chi tiết ↗</div>}
                            </div>
                            <div className="w-14 h-14 bg-[#FF3B30]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <XCircle className="w-7 h-7 text-[#FF3B30]" />
                            </div>
                        </button>
                    </div>

                    {/* Wrong Answers Modal */}
                    {showWrongAnswers && (
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                            <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-white/40 transform animate-in zoom-in-95 duration-300">
                                {/* Modal Header */}
                                <div className="bg-[#1d1d1f] text-white p-8 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-semibold tracking-tight">Câu trả lời lỗi</h3>
                                        <p className="text-white/60 text-sm font-medium">Phân tích và cải thiện kiến thức của bạn</p>
                                    </div>
                                    <button
                                        onClick={() => setShowWrongAnswers(false)}
                                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group"
                                    >
                                        <XCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
                                    {/* Tabs inside Modal */}
                                    <div className="flex border-b border-black/5 bg-[#F5F5F7] px-8 shrink-0">
                                        {['Câu hỏi Pháp luật chung', 'Câu hỏi Pháp luật riêng', 'Câu hỏi Chuyên môn'].map((tab) => {
                                            const wrongInTab = questions.filter(q =>
                                                q.phan_thi === tab &&
                                                userAnswers[q.id] !== q.dap_an_dung
                                            ).length
                                            const isActive = activeModalTab === tab

                                            return (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveModalTab(tab)}
                                                    className={`px-4 py-4 text-xs font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${isActive ? 'text-[#007AFF]' : 'text-[#86868b] hover:text-[#1d1d1f]'
                                                        }`}
                                                >
                                                    <span>{tab.replace('Câu hỏi ', '')}</span>
                                                    {wrongInTab > 0 && (
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-[#007AFF] text-white' : 'bg-black/5 text-[#86868b]'
                                                            }`}>
                                                            {wrongInTab}
                                                        </span>
                                                    )}
                                                    {isActive && (
                                                        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#007AFF] rounded-t-full" />
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                                        {questions
                                            .filter(q => q.phan_thi === activeModalTab && userAnswers[q.id] !== q.dap_an_dung)
                                            .map((q, idx) => {
                                                const userAnswer = userAnswers[q.id]
                                                const correctAnswer = q.dap_an_dung

                                                return (
                                                    <div key={q.id} className="bg-white border border-black/5 rounded-[20px] p-6 shadow-sm space-y-6">
                                                        {/* Question Header */}
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-8 h-8 rounded-[8px] bg-[#FF3B30] text-white font-bold flex items-center justify-center shrink-0 text-sm">
                                                                {q.stt}
                                                            </div>
                                                            <div className="flex-1 space-y-1">
                                                                <div className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider opacity-60">{q.phan_thi}</div>
                                                                <div className="text-[#1d1d1f] font-semibold leading-relaxed tracking-tight">{q.cau_hoi}</div>
                                                            </div>
                                                        </div>

                                                        {/* Answer Options */}
                                                        <div className="grid gap-2">
                                                            {['a', 'b', 'c', 'd'].map(option => {
                                                                const answerText = q[`dap_an_${option}` as keyof Question] as string
                                                                const isUserAnswer = userAnswer === option
                                                                const isCorrectAnswer = correctAnswer === option

                                                                return (
                                                                    <div
                                                                        key={option}
                                                                        className={`p-4 rounded-[12px] border transition-all ${isCorrectAnswer
                                                                            ? 'bg-[#34C759]/5 border-[#34C759]/20 shadow-sm'
                                                                            : isUserAnswer
                                                                                ? 'bg-[#FF3B30]/5 border-[#FF3B30]/20'
                                                                                : 'bg-[#F5F5F7]/50 border-transparent'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-start gap-4">
                                                                            <div
                                                                                className={`w-8 h-8 rounded-[6px] font-bold flex items-center justify-center text-xs shrink-0 ${isCorrectAnswer
                                                                                    ? 'bg-[#34C759] text-white'
                                                                                    : isUserAnswer
                                                                                        ? 'bg-[#FF3B30] text-white'
                                                                                        : 'bg-black/5 text-[#86868b]'
                                                                                    }`}
                                                                            >
                                                                                {option.toUpperCase()}
                                                                            </div>
                                                                            <div className="flex-1 pt-1.5">
                                                                                <div className={`text-[14px] leading-snug ${isCorrectAnswer
                                                                                    ? 'text-[#1d1d1f] font-semibold'
                                                                                    : isUserAnswer
                                                                                        ? 'text-[#1d1d1f] font-semibold'
                                                                                        : 'text-[#86868b]'
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
                                            <div className="flex flex-col items-center justify-center h-full py-20 text-[#86868b]">
                                                <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6">
                                                    <CheckCircle2 className="w-10 h-10 text-[#34C759]" />
                                                </div>
                                                <p className="font-semibold text-xl text-[#1d1d1f]">Hoàn hảo!</p>
                                                <p className="text-[15px] max-w-[240px] text-center mt-2">Bạn không trả lời sai câu nào trong phần kiến thức này.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="bg-[#F5F5F7] p-6 border-t border-black/5">
                                    <button
                                        onClick={() => setShowWrongAnswers(false)}
                                        className="w-full px-6 py-4 bg-[#1d1d1f] text-white font-semibold rounded-[12px] hover:bg-black transition-all active:scale-97"
                                    >
                                        Đã hiểu
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detailed Breakdown by Category */}
                    <div className="bg-white/50 backdrop-blur-sm rounded-[24px] p-8 border border-white/40 shadow-sm">
                        <h3 className="text-xl font-semibold text-[#1d1d1f] mb-6 tracking-tight">Chi tiết hiệu suất</h3>

                        <div className="space-y-4">
                            {/* Common Law Tab */}
                            <details className="group overflow-hidden rounded-[20px] border border-black/5">
                                <summary className="cursor-pointer list-none outline-none">
                                    <div className="flex items-center justify-between p-5 bg-white group-open:bg-[#F5F5F7] transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center font-bold text-white shadow-lg ${lawCommonCorrect >= 3
                                                ? 'bg-[#34C759] shadow-green-500/20'
                                                : 'bg-[#FF3B30] shadow-red-500/20'
                                                }`}>
                                                {lawCommonCorrect}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-[#1d1d1f]">Pháp luật chung</h4>
                                                <p className="text-[11px] text-[#86868b] font-bold uppercase tracking-wider">{lawCommonCorrect} / 5 câu trả lời đúng</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest group-open:hidden">Chi tiết</span>
                                            <ChevronRight className="w-5 h-5 text-[#86868b] transition-transform group-open:rotate-90" />
                                        </div>
                                    </div>
                                </summary>
                                <div className="p-6 bg-white border-t border-black/5">
                                    <div className="grid grid-cols-5 gap-3">
                                        {lawCommonQuestions.map((q, idx) => {
                                            const isCorrect = userAnswers[q.id] === q.dap_an_dung
                                            return (
                                                <div
                                                    key={q.id}
                                                    className={`aspect-square rounded-[10px] font-bold flex items-center justify-center text-sm transition-all ${isCorrect
                                                        ? 'bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20'
                                                        : 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20'
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
                            <details className="group overflow-hidden rounded-[20px] border border-black/5">
                                <summary className="cursor-pointer list-none outline-none">
                                    <div className="flex items-center justify-between p-5 bg-white group-open:bg-[#F5F5F7] transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center font-bold text-white shadow-lg ${lawSpecificCorrect >= 3
                                                ? 'bg-[#34C759] shadow-green-500/20'
                                                : 'bg-[#FF3B30] shadow-red-500/20'
                                                }`}>
                                                {lawSpecificCorrect}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-[#1d1d1f]">Pháp luật riêng</h4>
                                                <p className="text-[11px] text-[#86868b] font-bold uppercase tracking-wider">{lawSpecificCorrect} / 5 câu trả lời đúng</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest group-open:hidden">Chi tiết</span>
                                            <ChevronRight className="w-5 h-5 text-[#86868b] transition-transform group-open:rotate-90" />
                                        </div>
                                    </div>
                                </summary>
                                <div className="p-6 bg-white border-t border-black/5">
                                    <div className="grid grid-cols-5 gap-3">
                                        {lawSpecificQuestions.map((q, idx) => {
                                            const isCorrect = userAnswers[q.id] === q.dap_an_dung
                                            return (
                                                <div
                                                    key={q.id}
                                                    className={`aspect-square rounded-[10px] font-bold flex items-center justify-center text-sm transition-all ${isCorrect
                                                        ? 'bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20'
                                                        : 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20'
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
                            <details className="group overflow-hidden rounded-[20px] border border-black/5">
                                <summary className="cursor-pointer list-none outline-none">
                                    <div className="flex items-center justify-between p-5 bg-white group-open:bg-[#F5F5F7] transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center font-bold text-white shadow-lg ${specialtyCorrect >= 12
                                                ? 'bg-[#34C759] shadow-green-500/20'
                                                : 'bg-[#FF3B30] shadow-red-500/20'
                                                }`}>
                                                {specialtyCorrect}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-[#1d1d1f]">Chuyên môn</h4>
                                                <p className="text-[11px] text-[#86868b] font-bold uppercase tracking-wider">{specialtyCorrect} / 20 câu trả lời đúng</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest group-open:hidden">Chi tiết</span>
                                            <ChevronRight className="w-5 h-5 text-[#86868b] transition-transform group-open:rotate-90" />
                                        </div>
                                    </div>
                                </summary>
                                <div className="p-6 bg-white border-t border-black/5">
                                    <div className="grid grid-cols-10 gap-2">
                                        {specialtyQuestions.map((q, idx) => {
                                            const isCorrect = userAnswers[q.id] === q.dap_an_dung
                                            return (
                                                <div
                                                    key={q.id}
                                                    className={`aspect-square rounded-[8px] font-bold flex items-center justify-center text-sm transition-all ${isCorrect
                                                        ? 'bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20'
                                                        : 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20'
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
                    <div className="flex flex-col md:flex-row gap-4 pt-4 pb-12">
                        <button
                            onClick={() => router.push('/thi-thu')}
                            className="flex-1 px-8 py-5 bg-white border border-black/5 text-[#1d1d1f] font-semibold rounded-[16px] hover:bg-[#F5F5F7] transition-all shadow-sm active:scale-97"
                        >
                            Về trang chủ
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex-1 px-8 py-5 bg-[#1d1d1f] text-white font-semibold rounded-[16px] hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-97"
                        >
                            Thử thách lại
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Exam Interface
    return (
        <div className="min-h-0 md:h-[calc(100vh-70px)] bg-[#F5F5F7] flex flex-col font-sans md:pt-4 md:pb-1 md:space-y-4 overflow-hidden">
            {/* Desktop Header (Hidden on Mobile) */}
            <div className="hidden md:flex flex-shrink-0 px-6 items-center justify-between">
                <button
                    onClick={() => {
                        if (confirm('Bạn có chắc muốn thoát? Kết quả sẽ không được lưu.')) {
                            router.push('/thi-thu')
                        }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-[#86868b] hover:text-[#1d1d1f] font-medium transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Thoát
                </button>

                <div className={`flex items-center gap-3 px-6 py-2.5 rounded-[12px] font-semibold backdrop-blur-md border ${timeLeft < 300
                    ? 'bg-[#FF3B30]/10 border-[#FF3B30]/20 text-[#FF3B30]'
                    : 'bg-white/70 border-white/40 text-[#1d1d1f] shadow-sm'
                    }`}>
                    <Clock className={`w-4 h-4 ${timeLeft < 300 ? 'animate-pulse' : ''}`} />
                    <span className="tabular-nums text-lg">{formatTime(timeLeft)}</span>
                </div>

                <button
                    onClick={() => setIsGuideOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md text-[#007AFF] rounded-[10px] text-xs font-semibold uppercase tracking-wider border border-white/20 hover:bg-white/90 transition-all shadow-sm active:scale-95"
                >
                    <HelpCircle className="w-4 h-4" />
                    Hướng dẫn
                </button>
            </div>

            {/* Mobile Header (Hidden on Desktop) */}
            <div className="md:hidden flex flex-shrink-0 px-4 h-14 items-center justify-between border-b border-black/5 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
                <button
                    onClick={() => {
                        if (confirm('Bạn có chắc muốn thoát? Kết quả sẽ không được lưu.')) router.push('/thi-thu')
                    }}
                    className="p-2 -ml-2 text-slate-500 active:scale-95 transition-transform"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold tabular-nums text-sm border ${timeLeft < 300 ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-50 text-slate-900 border-slate-100'}`}>
                    <Clock className={`w-3.5 h-3.5 ${timeLeft < 300 ? 'animate-pulse' : ''}`} />
                    {formatTime(timeLeft)}
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={() => setIsReportModalOpen(true)} className="p-2 text-slate-400 active:scale-95 transition-transform">
                        <AlertTriangle className="w-5 h-5" />
                    </button>
                    <div className="scale-75 -mx-1">
                        <ThemeToggle />
                    </div>
                    <button onClick={() => setIsGuideOpen(true)} className="p-2 text-slate-400 active:scale-95 transition-transform">
                        <HelpCircle className="w-5 h-5" />
                    </button>
                    <button onClick={() => setShowSubmitDialog(true)} className="p-2 text-apple-blue font-bold text-sm active:scale-95 transition-transform">
                        Nộp bài
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:grid lg:grid-cols-[280px_1fr] gap-6 md:px-6 min-h-0">
                {/* Desktop Sidebar (Hidden on Mobile) */}
                <div className="hidden md:flex bg-white/80 backdrop-blur-md rounded-[20px] p-6 shadow-sm border border-white/40 flex-col overflow-hidden">
                    <h3 className="font-semibold text-[#86868b] text-[10px] uppercase tracking-wider mb-4 flex-shrink-0">Danh sách câu hỏi</h3>
                    <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="text-[10px] font-bold text-[#FF9500] uppercase tracking-widest opacity-80">Pháp luật (10 câu)</div>
                                <div className="grid grid-cols-5 gap-2">
                                    {questions.slice(0, 10).map((q, idx) => {
                                        const isKbFocused = !isMobile && kbArea === 'sidebar' && kbFocusIndex === idx
                                        return (
                                            <button
                                                key={q.id}
                                                onClick={() => jumpTo(idx)}
                                                className={`w-10 h-10 rounded-[10px] font-semibold transition-all text-xs flex items-center justify-center active:scale-90 relative ${currentIndex === idx ? 'bg-[#007AFF] text-white shadow-md' : !!userAnswers[q.id] ? 'bg-[#34C759] text-white' : 'bg-black/5 text-[#1d1d1f] hover:bg-black/10'} ${isKbFocused ? 'ring-[3px] ring-apple-blue/30 z-10 scale-110' : ''}`}
                                            >
                                                {idx + 1}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="text-[10px] font-bold text-[#007AFF] uppercase tracking-widest opacity-80">Chuyên môn (20 câu)</div>
                                <div className="grid grid-cols-5 gap-2">
                                    {questions.slice(10, 30).map((q, idx) => {
                                        const actualIdx = idx + 10
                                        const isKbFocused = !isMobile && kbArea === 'sidebar' && kbFocusIndex === actualIdx
                                        return (
                                            <button
                                                key={q.id}
                                                onClick={() => jumpTo(actualIdx)}
                                                className={`w-10 h-10 rounded-[10px] font-semibold transition-all text-xs flex items-center justify-center active:scale-90 relative ${currentIndex === actualIdx ? 'bg-[#007AFF] text-white shadow-md' : !!userAnswers[q.id] ? 'bg-[#34C759] text-white' : 'bg-black/5 text-[#1d1d1f] hover:bg-black/10'} ${isKbFocused ? 'ring-[3px] ring-apple-blue/30 z-10 scale-110' : ''}`}
                                            >
                                                {actualIdx + 1}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowSubmitDialog(true)}
                        className="mt-6 w-full px-6 py-4 bg-[#1d1d1f] text-white font-semibold rounded-[12px] hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 flex-shrink-0 active:scale-97"
                    >
                        <Send className="w-4 h-4" />
                        Nộp bài thi
                    </button>
                </div>

                {/* Question Display */}
                <div className="flex-1 bg-white md:rounded-[20px] md:shadow-sm border-t md:border border-black/5 flex flex-col overflow-hidden">
                    <div className="overflow-y-auto flex-1 p-5 md:p-8 pb-32 md:pb-8">
                        {/* Mobile Header Info */}
                        <div className="md:hidden flex flex-wrap items-center gap-2 mb-4">
                            <span className="h-7 flex items-center px-3 bg-apple-blue text-white font-bold rounded-lg text-[10px]">
                                Câu {currentIndex + 1}
                            </span>
                            <span className={`h-7 flex items-center px-3 font-bold rounded-lg text-[10px] ring-1 ring-inset ${isLawQuestion ? 'bg-orange-50 text-orange-600 ring-orange-200' : 'bg-blue-50 text-blue-600 ring-blue-200'}`}>
                                {isLawQuestion ? 'Pháp luật' : 'Chuyên môn'}
                            </span>
                            <span className="h-7 flex items-center px-3 bg-slate-50 text-slate-500 font-bold rounded-lg text-[10px] ring-1 ring-slate-200">
                                {examId}
                            </span>
                        </div>

                        {/* Question Text */}
                        <div className="space-y-6">
                            <div className="hidden md:flex items-start gap-4 pb-6 border-b border-black/5">
                                <span className={`px-4 py-2 font-bold rounded-[10px] text-xs flex-shrink-0 ${isLawQuestion ? 'bg-[#FF9500]/10 text-[#FF9500]' : 'bg-[#007AFF]/10 text-[#007AFF]'}`}>
                                    Câu {currentIndex + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="text-[#1d1d1f] text-lg font-semibold leading-relaxed tracking-tight">{currentQ.cau_hoi}</p>
                                    <div className="flex items-center gap-2 mt-3 text-[#86868b] text-sm">
                                        <span className="font-medium opacity-60">Sát hạch:</span>
                                        <span className={`font-semibold ${isLawQuestion ? 'text-[#FF9500]' : 'text-[#007AFF]'}`}>{isLawQuestion ? 'Pháp luật' : 'Chuyên môn'}</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1" />
                                        <span className="font-medium">{examId}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="md:hidden text-[#1d1d1f] text-base font-semibold leading-relaxed tracking-tight">
                                {currentQ.cau_hoi}
                            </p>

                            {/* Options */}
                            <div className="space-y-2.5 md:space-y-3">
                                {['a', 'b', 'c', 'd'].map((option, index) => {
                                    const optionText = currentQ[`dap_an_${option}` as keyof Question] as string
                                    const isSelected = userAnswers[currentQ.id] === option
                                    const isKbFocused = !isMobile && kbArea === 'main' && kbFocusIndex === index
                                    return (
                                        <label
                                            key={option}
                                            className={`flex items-start gap-3 md:gap-4 p-4 md:p-5 rounded-xl md:rounded-[12px] border transition-all relative cursor-pointer group ${isSelected ? 'border-[#007AFF] bg-[#007AFF]/5' : 'border-black/5 bg-[#F5F5F7]/50 md:bg-[#F5F5F7]/50 hover:bg-white hover:border-black/10'} ${isKbFocused ? 'ring-[3px] ring-apple-blue/50 z-10' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${currentQ.id}`}
                                                value={option}
                                                checked={isSelected}
                                                onChange={() => selectAnswer(currentQ.id, option)}
                                                className="mt-1 w-5 h-5 accent-[#007AFF] cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <span className={`font-medium text-sm md:text-[15px] leading-snug ${isSelected ? 'text-[#007AFF]' : 'text-[#1d1d1f]'}`}>
                                                    <span className="opacity-50 font-bold mr-2 uppercase">{option}.</span>
                                                    {optionText}
                                                </span>
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Footer (Hidden on Mobile) */}
                    <div className="hidden md:flex border-t border-black/5 p-6 items-center justify-between flex-shrink-0 bg-white/50 backdrop-blur-sm">
                        <button
                            onClick={goPrev}
                            disabled={currentIndex === 0}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-black/5 text-[#1d1d1f] font-semibold rounded-[10px] hover:bg-[#F5F5F7] disabled:opacity-30 transition-all shadow-sm active:scale-97"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Câu trước
                        </button>
                        <div className="flex flex-col items-center">
                            <span className="text-[#86868b] text-[10px] font-bold uppercase tracking-widest mb-1">Tiến độ</span>
                            <span className="text-[#1d1d1f] font-semibold tabular-nums">{Object.keys(userAnswers).length} / {questions.length}</span>
                        </div>
                        {currentIndex === questions.length - 1 ? (
                            <button
                                onClick={() => setShowSubmitDialog(true)}
                                className="flex items-center gap-2 px-8 py-3 bg-[#34C759] text-white font-semibold rounded-[10px] hover:bg-[#28A745] transition-all shadow-lg active:scale-97"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Nộp bài ngay
                            </button>
                        ) : (
                            <button onClick={goNext} className="flex items-center gap-2 px-8 py-3 bg-[#007AFF] text-white font-semibold rounded-[10px] hover:bg-[#0062CC] transition-all shadow-lg active:scale-97">
                                Câu tiếp
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>


                {/* Mobile Persistent Navigation (New Style) */}
                <div className="md:hidden fixed bottom-[68px] left-0 right-0 z-50 flex flex-col pointer-events-none px-2 pb-safe">
                    {/* Navigation Pill */}
                    <div className="pb-4 pt-2 flex justify-center">
                        <div className="inline-flex items-center gap-6 px-6 py-2.5 bg-apple-blue rounded-full shadow-2xl pointer-events-auto border border-white/20">
                            <button
                                onClick={goPrev}
                                disabled={currentIndex === 0}
                                className="text-white disabled:opacity-30 active:scale-75 transition-all"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <span className="text-white font-bold text-sm tracking-widest min-w-[60px] text-center">
                                {currentIndex + 1} / {questions.length}
                            </span>
                            <button
                                onClick={goNext}
                                disabled={currentIndex === questions.length - 1}
                                className="text-white disabled:opacity-30 active:scale-75 transition-all"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Persistent Grid Card */}
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 pointer-events-auto shadow-apple-shadow border-t border-black/5 dark:border-white/5">
                        <div className="flex flex-col gap-3">
                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] px-1 truncate">
                                Mã đề: {examId}
                            </div>
                            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar px-1 -mx-4 px-4">
                                {questions.map((q, idx) => (
                                    <button
                                        key={q.id}
                                        onClick={() => jumpTo(idx)}
                                        className={`flex-shrink-0 w-11 h-11 rounded-xl font-bold text-[13px] flex items-center justify-center transition-all active:scale-90 border-2 ${currentIndex === idx ? 'bg-apple-blue text-white border-apple-blue shadow-lg' : !!userAnswers[q.id] ? 'bg-green-500 text-white border-green-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'}`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isQuestionsGridOpen && (
                <div className="md:hidden fixed inset-0 z-[100] animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsQuestionsGridOpen(false)} />
                    <div className="absolute bottom-0 inset-x-0 bg-white dark:bg-slate-900 rounded-t-[32px] p-6 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col border-t border-white/20">
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 shrink-0" />
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Danh sách câu hỏi</h3>
                            <div className="text-sm font-medium text-slate-500">
                                Đã làm: <span className="text-apple-blue font-bold">{Object.keys(userAnswers).length}/{questions.length}</span>
                            </div>
                        </div>

                        <div className="overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest px-1">Pháp luật (10 câu)</div>
                                    <div className="grid grid-cols-5 gap-2.5">
                                        {questions.slice(0, 10).map((q, idx) => (
                                            <button
                                                key={q.id}
                                                onClick={() => { jumpTo(idx); setIsQuestionsGridOpen(false); }}
                                                className={`aspect-square rounded-xl font-bold text-xs flex items-center justify-center transition-all active:scale-90 ${currentIndex === idx ? 'bg-apple-blue text-white shadow-lg ring-4 ring-apple-blue/10' : !!userAnswers[q.id] ? 'bg-green-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="text-[10px] font-bold text-apple-blue uppercase tracking-widest px-1">Chuyên môn (20 câu)</div>
                                    <div className="grid grid-cols-5 gap-2.5">
                                        {questions.slice(10, 30).map((q, idx) => {
                                            const actualIdx = idx + 10
                                            return (
                                                <button
                                                    key={q.id}
                                                    onClick={() => { jumpTo(actualIdx); setIsQuestionsGridOpen(false); }}
                                                    className={`aspect-square rounded-xl font-bold text-xs flex items-center justify-center transition-all active:scale-90 ${currentIndex === actualIdx ? 'bg-apple-blue text-white shadow-lg ring-4 ring-apple-blue/10' : !!userAnswers[q.id] ? 'bg-green-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                                                >
                                                    {actualIdx + 1}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { setIsQuestionsGridOpen(false); setShowSubmitDialog(true); }}
                                className="mt-8 w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                                Nộp bài thi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals & Dialogs */}
            {isReportModalOpen && (
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    user={user}
                    question={currentQ}
                />
            )}

            <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} type="exam" />

            {showSubmitDialog && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[24px] shadow-2xl max-w-md w-full p-8 border border-white/40 dark:border-white/10 transform animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 rounded-full bg-[#FF9500]/10 flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-[#FF9500]" />
                            </div>
                            <h3 className="text-2xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight mb-2">Xác nhận nộp bài</h3>
                            <p className="text-[#86868b] text-[15px] leading-relaxed">
                                Bạn có chắc chắn muốn hoàn tất bài thi và xem kết quả ngay bây giờ không?
                            </p>
                        </div>

                        <div className="space-y-3 mb-8">
                            <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-[12px]">
                                <span className="text-[#86868b] text-sm font-medium">Đã trả lời</span>
                                <span className="text-[#1d1d1f] dark:text-white font-bold">
                                    {Object.keys(userAnswers).length} / {questions.length} câu
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-[12px]">
                                <span className="text-[#86868b] text-sm font-medium">Thời gian còn lại</span>
                                <span className={`font-bold tabular-nums ${timeLeft <= 300 ? 'text-[#FF3B30]' : 'text-[#007AFF]'}`}>
                                    {formatTime(Math.max(0, timeLeft))}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowSubmitDialog(false)}
                                className="px-6 py-3.5 bg-white dark:bg-slate-800 border border-black/5 dark:border-white/5 text-[#1d1d1f] dark:text-white font-semibold rounded-[12px] hover:bg-[#F5F5F7] dark:hover:bg-slate-700 transition-all active:scale-95"
                            >
                                Tiếp tục
                            </button>
                            <button
                                onClick={confirmSubmit}
                                className="px-6 py-3.5 bg-[#34C759] text-white font-semibold rounded-[12px] hover:bg-[#28A745] transition-all shadow-lg shadow-green-500/10 active:scale-95"
                            >
                                Nộp bài
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}
