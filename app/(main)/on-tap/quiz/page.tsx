'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, XCircle } from 'lucide-react'

interface Question {
    id: string
    id_cauhoi?: string // From database schema
    stt: number
    hang: string
    chuyen_nganh: string
    phan_thi: string
    question_text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_answer: string
}

interface PracticeHistory {
    [questionId: string]: {
        attempts: number
        wrongAttempts: number
        lastAnswer: string
        isCorrect: boolean
    }
}

const PHAN_THI_OPTIONS = ['Pháp luật chung', 'Pháp luật riêng', 'Chuyên môn']

function QuizContent() {
    console.log('🚀 QUIZ CONTENT RENDERED - Version: 1.1 (Supabase Sync Ready)')
    const router = useRouter()
    const searchParams = useSearchParams()

    const [selectedHang, setSelectedHang] = useState(searchParams.get('hang') || 'Hạng I')
    const [selectedChuyenNganh, setSelectedChuyenNganh] = useState(searchParams.get('chuyen_nganh') || '')
    const [selectedPhanThi, setSelectedPhanThi] = useState('Pháp luật chung')

    const [questions, setQuestions] = useState<Question[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<string>('')
    const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [practiceHistory, setPracticeHistory] = useState<PracticeHistory>({})
    const [user, setUser] = useState<any>(null)

    // Check auth status
    useEffect(() => {
        console.log('👤 Checking Auth Status...')
        async function getAuth() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                console.log('👤 Auth Result:', user ? `Logged in as ${user.email}` : 'Not logged in')
                setUser(user)
                // For manual debug in console
                if (typeof window !== 'undefined') {
                    (window as any).__QUIZ_USER = user
                }
            } catch (err) {
                console.error('👤 Auth Check Error:', err)
            }
        }
        getAuth()
    }, [])

    // Fetch questions and practice history (Merge Supabase + LocalStorage)
    useEffect(() => {
        async function fetchData() {
            if (!selectedChuyenNganh) return

            console.log('📥 Fetching Questions & History for:', { selectedHang, selectedChuyenNganh, selectedPhanThi })
            setLoading(true)

            // 1. Fetch Questions
            const { data: questionData, error: qError } = await supabase
                .from('questions')
                .select('*')
                .eq('hang', selectedHang)
                .eq('chuyen_nganh', selectedChuyenNganh)
                .eq('phan_thi', selectedPhanThi)
                .order('stt', { ascending: true })

            if (qError) {
                console.error('❌ Questions Fetch Error:', qError)
            } else if (questionData) {
                console.log('✅ Questions Fetched:', questionData.length)
                setQuestions(questionData)
            }

            // 2. Fetch Practice History from Supabase
            let cloudHistory: PracticeHistory = {}
            if (user) {
                console.log('☁️ Fetching History from Cloud...')
                const { data: statsData, error: sError } = await supabase
                    .from('user_practice_stats')
                    .select('history')
                    .eq('user_id', user.id)
                    .single()

                if (sError) {
                    if (sError.code === 'PGRST116') {
                        console.log('☁️ First time user: No cloud history found yet')
                    } else {
                        console.error('☁️ Cloud History Fetch Error:', sError)
                    }
                } else if (statsData?.history) {
                    cloudHistory = statsData.history as PracticeHistory
                    console.log('☁️ Cloud History Loaded:', Object.keys(cloudHistory).length, 'items')
                }
            }

            // 3. Get Local History
            const storageKey = `practice_${selectedHang}_${selectedChuyenNganh}_${selectedPhanThi}`
            const localSaved = localStorage.getItem(storageKey)
            const localHistory: PracticeHistory = localSaved ? JSON.parse(localSaved) : {}
            console.log('🏠 Local History Loaded:', Object.keys(localHistory).length, 'items')

            // 4. Merge (Cloud takes priority for conflicted keys, or combine)
            const mergedHistory = { ...localHistory, ...cloudHistory }
            setPracticeHistory(mergedHistory)

            setLoading(false)
        }

        fetchData()
    }, [selectedHang, selectedChuyenNganh, selectedPhanThi, user])

    // Sync practice history to Supabase (Debounced)
    useEffect(() => {
        console.log('🔄 Sync Effect Triggered:', { hasUser: !!user, historySize: Object.keys(practiceHistory).length })

        if (!user) {
            console.log('⚠️ Sync skipped: No user logged in')
            return
        }

        if (Object.keys(practiceHistory).length === 0) {
            console.log('ℹ️ Sync skipped: History is empty')
            return
        }

        console.log('⏱️ Starting 1s sync timer...')

        const syncTimeout = setTimeout(async () => {
            try {
                console.log('🚀 Syncing to Supabase...', practiceHistory)
                // Upsert history to Supabase
                const { error, data } = await supabase
                    .from('user_practice_stats')
                    .upsert({
                        user_id: user.id,
                        history: practiceHistory,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'user_id'
                    })
                    .select()

                if (error) {
                    console.error('❌ Supabase Sync Error:', error.message, error.details)
                } else {
                    console.log('✅ Sync successful!', data)
                }
            } catch (err) {
                console.error('❌ Failed to sync history (Exception):', err)
            }
        }, 1000) // Reduced to 1s for better responsiveness

        return () => {
            clearTimeout(syncTimeout)
        }
    }, [practiceHistory, user])

    // Backup to localStorage (Always do this as safety)
    useEffect(() => {
        if (Object.keys(practiceHistory).length > 0) {
            const storageKey = `practice_${selectedHang}_${selectedChuyenNganh}_${selectedPhanThi}`
            localStorage.setItem(storageKey, JSON.stringify(practiceHistory))
        }
    }, [practiceHistory, selectedHang, selectedChuyenNganh, selectedPhanThi])

    const currentQuestion = questions[currentIndex]

    // Handle answer selection
    function handleAnswerSelect(answer: string) {
        if (!currentQuestion) return

        console.log('🖱️ Answer Selected:', answer, 'for question:', currentQuestion.id_cauhoi || currentQuestion.id)
        setSelectedAnswer(answer)
        const isCorrect = answer === currentQuestion.correct_answer

        // Update practice history
        setPracticeHistory(prev => {
            const questionId = currentQuestion.id_cauhoi || currentQuestion.id // Supports both legacy and new schema
            const existing = prev[questionId] || { attempts: 0, wrongAttempts: 0, lastAnswer: '', isCorrect: false }

            console.log('📊 Updating History for:', questionId)
            return {
                ...prev,
                [questionId]: {
                    attempts: existing.attempts + 1,
                    wrongAttempts: isCorrect ? existing.wrongAttempts : existing.wrongAttempts + 1,
                    lastAnswer: answer,
                    isCorrect
                }
            }
        })

        // Show feedback
        setFeedback({
            isCorrect,
            message: isCorrect ? '✓ Đã trả lời đúng!' : '✗ Đã trả lời sai!'
        })

        // Auto-advance after 1.5 seconds

        // Auto-advance after 1.5 seconds
        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                handleNext()
            }
        }, 1500)
    }

    function handleNext() {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setSelectedAnswer('')
            setFeedback(null)
        }
    }

    function handlePrevious() {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
            setSelectedAnswer('')
            setFeedback(null)
        }
    }

    function jumpToQuestion(index: number) {
        setCurrentIndex(index)
        setSelectedAnswer('')
        setFeedback(null)
    }

    function getQuestionButtonClass(index: number, question: Question) {
        const baseClass = "w-10 h-10 rounded-lg font-bold transition-all text-sm"

        if (index === currentIndex) {
            return `${baseClass} bg-blue-600 text-white ring-4 ring-blue-300 scale-110`
        }

        // Use consistent ID key
        const questionId = question.id_cauhoi || question.id
        const history = practiceHistory[questionId]

        if (!history || history.attempts === 0) {
            return `${baseClass} bg-slate-200 text-slate-600 hover:bg-slate-300`
        }

        // Frequently wrong (more than 2 wrong attempts)
        if (history.wrongAttempts > 2) {
            return `${baseClass} bg-orange-500 text-white`
        }

        // Last attempt was correct
        if (history.isCorrect) {
            return `${baseClass} bg-green-500 text-white`
        } else {
            return `${baseClass} bg-red-500 text-white`
        }
    }

    if (!selectedChuyenNganh) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Vui lòng chọn Hạng và Chuyên ngành để bắt đầu ôn tập</p>
                    <button
                        onClick={() => router.push('/on-tap')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Quay lại trang chọn
                    </button>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Đang tải câu hỏi...</p>
                </div>
            </div>
        )
    }

    if (questions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Không có câu hỏi nào cho bộ lọc này</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-6 px-4">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900 mb-2">Ôn Tập - {selectedChuyenNganh}</h1>
                <p className="text-slate-600 font-medium">{selectedHang}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {PHAN_THI_OPTIONS.map(phan => (
                    <button
                        key={phan}
                        onClick={() => {
                            setSelectedPhanThi(phan)
                            setCurrentIndex(0)
                            setSelectedAnswer('')
                            setFeedback(null)
                        }}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedPhanThi === phan
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {phan}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-[280px_1fr] gap-6">
                {/* Question Grid Panel */}
                <aside className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-fit sticky top-6">
                    <h3 className="font-bold text-slate-800 mb-4">Danh sách câu hỏi</h3>
                    <div className="grid grid-cols-6 gap-2">
                        {questions.map((q, index) => (
                            <button
                                key={q.id}
                                onClick={() => jumpToQuestion(index)}
                                className={getQuestionButtonClass(index, q)}
                                title={`Câu ${q.stt || index + 1}`}
                            >
                                {q.stt || index + 1}
                            </button>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-600 rounded" />
                            <span className="text-slate-600">Câu hiện tại</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded" />
                            <span className="text-slate-600">Đã trả lời đúng</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded" />
                            <span className="text-slate-600">Đã trả lời sai</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500 rounded" />
                            <span className="text-slate-600">Hay sai ({'>'}2 lần)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-slate-200 rounded" />
                            <span className="text-slate-600">Chưa ôn</span>
                        </div>
                    </div>
                </aside>

                {/* Question Display */}
                <main className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                    {currentQuestion && (
                        <>
                            {/* Question Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg text-sm">
                                        Câu {currentQuestion.stt || currentIndex + 1}
                                    </span>
                                    <span className="text-slate-500 text-sm font-medium">
                                        {currentQuestion.phan_thi}
                                    </span>
                                </div>
                                <span className="text-slate-400 text-sm font-medium">
                                    {currentIndex + 1} / {questions.length}
                                </span>
                            </div>

                            {/* Question Text */}
                            <p className="text-lg text-slate-900 font-medium mb-8 leading-relaxed">
                                {currentQuestion.question_text}
                            </p>

                            {/* Options */}
                            <div className="space-y-3 mb-8">
                                {['a', 'b', 'c', 'd'].map(option => {
                                    const optionText = currentQuestion[`option_${option}` as keyof Question] as string
                                    const isSelected = selectedAnswer === option
                                    const isCorrect = option === currentQuestion.correct_answer
                                    const showCorrect = feedback && isCorrect
                                    const showWrong = feedback && isSelected && !isCorrect

                                    return (
                                        <label
                                            key={option}
                                            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${showCorrect
                                                ? 'border-green-500 bg-green-50'
                                                : showWrong
                                                    ? 'border-red-500 bg-red-50'
                                                    : isSelected
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="answer"
                                                value={option}
                                                checked={isSelected}
                                                onChange={() => handleAnswerSelect(option)}
                                                className="mt-1 w-5 h-5 text-blue-600"
                                            />
                                            <div className="flex-1">
                                                <span className={`font-medium ${showCorrect ? 'text-green-700' : showWrong ? 'text-red-700' : 'text-slate-900'
                                                    }`}>
                                                    {option.toUpperCase()}. {optionText}
                                                </span>
                                                {showCorrect && (
                                                    <CheckCircle className="inline-block ml-2 w-5 h-5 text-green-600" />
                                                )}
                                                {showWrong && (
                                                    <XCircle className="inline-block ml-2 w-5 h-5 text-red-600" />
                                                )}
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>

                            {/* Feedback */}
                            {feedback && (
                                <div className={`p-4 rounded-xl mb-6 ${feedback.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    <p className="font-bold text-center">{feedback.message}</p>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentIndex === 0}
                                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Câu trước
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={currentIndex === questions.length - 1}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Câu sau
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}

export default function PracticeQuizPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Đang tải...</p>
                </div>
            </div>
        }>
            <QuizContent />
        </Suspense>
    )
}
