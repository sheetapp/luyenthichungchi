'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { AuthWall } from '@/components/auth/AuthWall'
import {
    ChevronLeft, ChevronRight, Search,
    BookOpen, Target, CheckCircle, TrendingUp, RotateCcw
} from 'lucide-react'
import { removeVietnameseTones } from '@/lib/utils/vietnamese'
import { useAppStore } from '@/lib/store/useAppStore'
import { ReportModal } from '@/components/practice/ReportModal'
import { GuideModal } from '@/components/practice/GuideModal'
import { ThemeToggle } from '@/components/theme/ThemeContext'
import { AlertTriangle, HelpCircle } from 'lucide-react'

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

interface PracticeHistory {
    [questionId: string]: {
        attempts: number
        wrongAttempts: number
        lastAnswer: string
        isCorrect: boolean
    }
}

const HANG_TABS = ['Hạng I', 'Hạng II', 'Hạng III']
const PHAN_THI_OPTIONS = ['Câu hỏi Pháp luật chung', 'Câu hỏi Pháp luật riêng', 'Câu hỏi Chuyên môn']

const CHUYEN_NGANH_OPTIONS = [
    'Tất cả',
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

function OnTapContent() {
    const searchParams = useSearchParams()
    const reviewMode = searchParams.get('mode') === 'exam_review'
    const resultId = searchParams.get('resultId')

    const [user, setUser] = useState<any>(null)
    const [authLoading, setAuthLoading] = useState(true)

    const [selectedHang, setSelectedHang] = useState('Hạng I')
    const [selectedChuyenNganh, setSelectedChuyenNganh] = useState(CHUYEN_NGANH_OPTIONS[1])
    const [selectedPhanThi, setSelectedPhanThi] = useState('Câu hỏi Pháp luật chung')
    const [searchQuery, setSearchQuery] = useState('')

    const [allQuestions, setAllQuestions] = useState<Question[]>([])
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<string>('')
    const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null)
    const [loading, setLoading] = useState(false)
    const [practiceHistory, setPracticeHistory] = useState<PracticeHistory>({})
    const [phanThiCounts, setPhanThiCounts] = useState<Record<string, number>>({})
    const [isShuffled, setIsShuffled] = useState(false)

    // Keyboard Navigation States
    const [kbArea, setKbArea] = useState<'sidebar' | 'main'>('sidebar')
    const [kbFocusIndex, setKbFocusIndex] = useState(0)

    // Report Modal State
    const [isReportModalOpen, setIsReportModalOpen] = useState(false)
    const [isGuideOpen, setIsGuideOpen] = useState(false)

    // Check authentication and load preferences
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('preferences')
                    .eq('id', user.id)
                    .single()

                if (profile?.preferences) {
                    if (profile.preferences.rank) setSelectedHang(profile.preferences.rank)
                    if (profile.preferences.specialty) setSelectedChuyenNganh(profile.preferences.specialty)
                }
            }
            setAuthLoading(false)
        }
        checkAuth()
    }, [])

    // Sync preferences back to profile and global store when changed
    useEffect(() => {
        if (!user || authLoading) return

        const syncPrefs = async () => {
            // Update Supabase
            await supabase
                .from('profiles')
                .update({
                    preferences: {
                        rank: selectedHang,
                        specialty: selectedChuyenNganh
                    }
                })
                .eq('id', user.id)

            // Update Global Store
            useAppStore.getState().setSelectedHang(selectedHang)
            useAppStore.getState().setSelectedCategory(selectedChuyenNganh)
        }

        syncPrefs()
    }, [selectedHang, selectedChuyenNganh, user, authLoading])

    // Fetch counts for all phan thi in current category
    useEffect(() => {
        async function fetchCounts() {
            if (!selectedChuyenNganh || reviewMode) return

            const { data, error } = await supabase
                .from('questions')
                .select('phan_thi')
                .eq('hang', selectedHang)
                .eq('chuyen_nganh', selectedChuyenNganh)

            if (data && !error) {
                const counts: Record<string, number> = {}
                data.forEach((q: any) => {
                    counts[q.phan_thi] = (counts[q.phan_thi] || 0) + 1
                })
                setPhanThiCounts(counts)
            }
        }
        fetchCounts()
    }, [selectedHang, selectedChuyenNganh, reviewMode])

    // Fetch questions and practice history (Merge Supabase + LocalStorage)
    useEffect(() => {
        async function fetchData() {
            setLoading(true)

            if (reviewMode && resultId) {
                // SPECIAL MODE: Review mistakes from a specific exam
                try {
                    const { data: resultData, error: resultError } = await supabase
                        .from('exam_results')
                        .select('answers, hang, chuyen_nganh')
                        .eq('id', resultId)
                        .single()

                    if (resultError || !resultData) throw new Error('Không tìm thấy kết quả thi.')

                    const mistakes = (resultData.answers as any[]).filter(a => a.correct === false)
                    const qIds = mistakes.map(m => m.q_id)

                    if (qIds.length === 0) {
                        alert('Bài thi này không có câu hỏi sai nào!')
                        return
                    }

                    // Fetch those questions
                    const { data: wrongQs, error: qError } = await supabase
                        .from('questions')
                        .select('*')
                        .in('id', qIds)

                    if (qError || !wrongQs) throw qError

                    // Sort to maintain consistency if needed
                    setQuestions(wrongQs)
                    setAllQuestions(wrongQs)

                    // Update selectors to match the exam context (optional but helpful)
                    if (resultData.hang) setSelectedHang(resultData.hang)
                    if (resultData.chuyen_nganh) setSelectedChuyenNganh(resultData.chuyen_nganh)
                } catch (error) {
                    console.error('Error loading review session:', error)
                    alert('Có lỗi xảy ra khi tải dữ liệu ôn tập.')
                }
            } else {
                // NORMAL MODE: Practice by category
                if (!selectedChuyenNganh) return

                // 1. Fetch Questions
                const { data, error } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('hang', selectedHang)
                    .eq('chuyen_nganh', selectedChuyenNganh)
                    .eq('phan_thi', selectedPhanThi)
                    .order('stt', { ascending: true })

                if (data && !error) {
                    setAllQuestions(data)

                    // Apply search filter (if any)
                    let filteredData = data
                    if (searchQuery.trim()) {
                        const searchNormalized = removeVietnameseTones(searchQuery.trim().toLowerCase())
                        filteredData = data.filter(q =>
                            removeVietnameseTones(q.cau_hoi.toLowerCase()).includes(searchNormalized)
                        )
                    }
                    setQuestions(filteredData)
                }
            }

            // Common: Fetch Practice History (Always helpful)
            let cloudHistory: PracticeHistory = {}
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            if (currentUser) {
                const { data: statsData, error: sError } = await supabase
                    .from('user_practice_stats')
                    .select('history')
                    .eq('user_id', currentUser.id)
                    .single()

                if (!sError && statsData?.history) {
                    cloudHistory = statsData.history as PracticeHistory
                }
            }

            const storageKey = `practice_${selectedHang}_${selectedChuyenNganh}_${selectedPhanThi}`
            const localSaved = localStorage.getItem(storageKey)
            const localHistory: PracticeHistory = localSaved ? JSON.parse(localSaved) : {}
            setPracticeHistory({ ...localHistory, ...cloudHistory })

            setLoading(false)
        }

        fetchData()
        setCurrentIndex(0)
    }, [selectedHang, selectedChuyenNganh, selectedPhanThi, searchQuery, user, reviewMode, resultId])

    // Handle Shuffling
    useEffect(() => {
        if (questions.length === 0) return

        if (isShuffled) {
            const shuffled = [...questions].sort(() => Math.random() - 0.5)
            setQuestions(shuffled)
            setCurrentIndex(0)
        } else {
            // Re-apply original sorting (already handled by the fetch effect normally, 
            // but we need to re-fetch/re-filter from allQuestions to restore order)
            let filteredData = allQuestions
            if (searchQuery.trim()) {
                const searchNormalized = removeVietnameseTones(searchQuery.trim().toLowerCase())
                filteredData = allQuestions.filter(q =>
                    removeVietnameseTones(q.cau_hoi.toLowerCase()).includes(searchNormalized)
                )
            }
            setQuestions(filteredData)
            setCurrentIndex(0)
        }
    }, [isShuffled])

    // Standardized Keyboard Navigation Logic
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Disable when typing in search or other inputs
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                return
            }

            // Report Modal Toggle: 'r' key
            if (e.key.toLowerCase() === 'r' && !isReportModalOpen) {
                e.preventDefault()
                setIsReportModalOpen(true)
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
                    const rowCount = 6
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
                            jumpToQuestion(kbFocusIndex)
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
                            handleNext()
                            setKbFocusIndex(0)
                            break
                        case 'ArrowLeft':
                            handlePrevious()
                            setKbFocusIndex(0)
                            break
                        case ' ':
                        case 'Enter':
                            const options = ['a', 'b', 'c', 'd']
                            handleAnswerSelect(options[kbFocusIndex])
                            break
                    }
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [kbArea, kbFocusIndex, questions, currentIndex, feedback, isReportModalOpen])

    // Sync state when current question changes or history is updated
    useEffect(() => {
        const q = questions[currentIndex]
        if (!q) return

        const history = practiceHistory[q.id]
        if (history && history.attempts > 0) {
            // Only update if different to avoid redundant re-renders during active answering
            if (selectedAnswer !== history.lastAnswer) {
                setSelectedAnswer(history.lastAnswer)
                setFeedback({
                    isCorrect: history.isCorrect,
                    message: history.isCorrect ? 'Đã trả lời đúng!' : 'Đã trả lời sai!'
                })
            }
        } else {
            // Reset if no history exists for this question (prevents carrying over previous question's state)
            if (selectedAnswer !== '') {
                setSelectedAnswer('')
                setFeedback(null)
            }
        }
    }, [currentIndex, questions, practiceHistory])

    // Sync practice history to Supabase (Debounced)
    useEffect(() => {
        if (!user || Object.keys(practiceHistory).length === 0) return

        const syncTimeout = setTimeout(async () => {
            try {
                const { error } = await supabase
                    .from('user_practice_stats')
                    .upsert({
                        user_id: user.id,
                        history: practiceHistory,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'user_id'
                    })

                if (error) console.error('Error syncing practice history:', error.message)
            } catch (err) {
                console.error('Failed to sync history:', err)
            }
        }, 3000) // 3s debounce

        return () => clearTimeout(syncTimeout)
    }, [practiceHistory, user])

    // LocalStorage Backup
    useEffect(() => {
        if (Object.keys(practiceHistory).length > 0 && selectedChuyenNganh) {
            const storageKey = `practice_${selectedHang}_${selectedChuyenNganh}_${selectedPhanThi}`
            localStorage.setItem(storageKey, JSON.stringify(practiceHistory))
        }
    }, [practiceHistory, selectedHang, selectedChuyenNganh, selectedPhanThi])

    const currentQuestion = questions[currentIndex]

    // Handle answer selection
    function handleAnswerSelect(answer: string) {
        if (!currentQuestion) return

        setSelectedAnswer(answer)
        const isCorrect = answer === currentQuestion.dap_an_dung

        setPracticeHistory(prev => {
            const existing = prev[currentQuestion.id] || { attempts: 0, wrongAttempts: 0, lastAnswer: '', isCorrect: false }
            return {
                ...prev,
                [currentQuestion.id]: {
                    attempts: existing.attempts + 1,
                    wrongAttempts: isCorrect ? existing.wrongAttempts : existing.wrongAttempts + 1,
                    lastAnswer: answer,
                    isCorrect
                }
            }
        })

        setFeedback({
            isCorrect,
            message: isCorrect ? 'Đã trả lời đúng!' : 'Đã trả lời sai!'
        })
    }

    function handleNext() {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
        }
    }

    function handlePrevious() {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
        }
    }

    function jumpToQuestion(index: number) {
        setCurrentIndex(index)
        setKbFocusIndex(index)
    }

    function getQuestionButtonClass(index: number, question: Question) {
        const baseClass = "w-10 h-10 rounded-xl font-semibold transition-all text-xs flex items-center justify-center relative active:scale-90 border"
        const isKbFocused = kbArea === 'sidebar' && kbFocusIndex === index
        const focusRing = isKbFocused ? "ring-[3px] ring-apple-blue/30 z-10 scale-110" : ""

        if (index === currentIndex) {
            return `${baseClass} bg-[#0A84FF] border-[#0A84FF] text-white shadow-apple-shadow scale-105 z-10 ${focusRing}`
        }

        const history = practiceHistory[question.id]
        if (!history || history.attempts === 0) {
            return `${baseClass} bg-transparent border-apple-border text-apple-text-secondary hover:border-apple-text/30 cursor-pointer ${focusRing}`
        }

        if (history.wrongAttempts > 2) {
            return `${baseClass} bg-red-muted border-red-soft text-red-text cursor-pointer ${focusRing}`
        }

        if (history.isCorrect) {
            return `${baseClass} bg-emerald-muted border-emerald-soft text-emerald-text cursor-pointer ${focusRing}`
        } else {
            return `${baseClass} bg-red-muted border-red-soft text-red-text cursor-pointer ${focusRing}`
        }
    }

    const stats = {
        done: Object.keys(practiceHistory).filter(id => practiceHistory[id].attempts > 0).length,
        notDone: questions.length - Object.keys(practiceHistory).filter(id => practiceHistory[id].attempts > 0).length,
        correct: Object.keys(practiceHistory).filter(id => practiceHistory[id].isCorrect).length,
        wrong: Object.keys(practiceHistory).filter(id => !practiceHistory[id].isCorrect && practiceHistory[id].attempts > 0).length
    }

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    // Show landing page if not authenticated
    if (!user) {
        return (
            <AuthWall
                title="Hệ thống ôn tập"
                description="Luyện tập với bộ câu hỏi sát hạch chứng chỉ hành nghề xây dựng được cập nhật mới nhất. Theo dõi tiến độ và củng cố kiến thức hiệu quả. Truy cập miễn phí hơn 1000+ câu hỏi ôn tập."
                features={[
                    { icon: BookOpen, text: "1.000+ Câu hỏi" },
                    { icon: Target, text: "Phân loại chuyên ngành" },
                    { icon: CheckCircle, text: "Giải thích chi tiết" },
                    { icon: TrendingUp, text: "Theo dõi tiến độ" }
                ]}
                redirectPath="/on-tap"
            />
        )
    }

    // Show practice content for authenticated users

    return (
        <div className="min-h-screen bg-apple-bg py-6 space-y-6 flex flex-col font-sans transition-colors duration-300">
            {/* Header */}
            <div className="flex-shrink-0 px-6 flex items-start justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-black text-apple-text tracking-tight mb-2">Hệ thống ôn tập</h1>
                        <button
                            onClick={() => setIsGuideOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-apple-card/70 backdrop-blur-md text-apple-blue rounded-[10px] text-xs font-semibold uppercase tracking-wider border border-apple-glass-border hover:bg-apple-card/90 transition-all shadow-sm active:scale-95 mb-1.5"
                        >
                            <HelpCircle className="w-4 h-4" />
                            Xem hướng dẫn
                        </button>
                    </div>
                    <p className="text-apple-text-secondary text-sm font-normal">Lựa chọn hạng và lĩnh vực để bắt đầu học</p>
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsShuffled(!isShuffled)}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-[10px] text-sm font-semibold transition-all border ${isShuffled
                            ? 'bg-[#FF9500] border-[#FF9500] text-white shadow-lg shadow-orange-500/20 active:scale-97'
                            : 'bg-apple-card dark:text-[#1d1d1f] text-apple-text border-[#apple-border] hover:bg-apple-bg shadow-sm'
                            }`}
                    >
                        <RotateCcw className={`w-4 h-4 ${isShuffled ? 'animate-spin-slow' : ''}`} />
                        <span>Trộn câu hỏi</span>
                        {isShuffled && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                    </button>
                </div>
            </div>

            {/* Top Controls */}
            <div className="flex items-center gap-4 flex-shrink-0 px-6">
                <div className="flex p-1 bg-apple-bg rounded-xl border border-apple-border shadow-sm">
                    {HANG_TABS.map(hang => (
                        <button
                            key={hang}
                            onClick={() => setSelectedHang(hang)}
                            className={`px-6 py-2 rounded-lg text-sm font-black uppercase tracking-tight transition-all ${selectedHang === hang
                                ? 'bg-apple-card text-apple-blue shadow-md'
                                : 'text-apple-text-secondary hover:text-apple-text'
                                }`}
                        >
                            {hang}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <select
                        value={selectedChuyenNganh}
                        onChange={(e) => setSelectedChuyenNganh(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-2.5 bg-apple-card border border-apple-border rounded-[10px] outline-none focus:ring-2 focus:ring-apple-blue/20 shadow-sm transition-all text-sm font-black tracking-tight"
                    >
                        {CHUYEN_NGANH_OPTIONS.map((option) => (
                            <option key={option} value={option} className="bg-apple-card text-apple-text">
                                {option}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-apple-text-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                <div className="relative flex-1 max-w-md ml-auto">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-secondary" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm nội dung..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-apple-card border border-apple-border rounded-xl text-sm font-medium text-apple-text placeholder:text-apple-text-secondary focus:outline-none focus:ring-2 focus:ring-apple-blue/10 shadow-apple-shadow"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex px-6 border-b border-apple-border flex-shrink-0">
                {PHAN_THI_OPTIONS.map((phan) => {
                    const count = phanThiCounts[phan] || 0
                    const isActive = selectedPhanThi === phan
                    return (
                        <button
                            key={phan}
                            onClick={() => setSelectedPhanThi(phan)}
                            className={`px-6 py-4 text-sm font-semibold transition-all relative flex items-center gap-2 ${isActive ? 'text-apple-blue' : 'text-apple-text-secondary hover:text-apple-text'
                                }`}
                        >
                            <span>{phan.replace('Câu hỏi ', '')}</span>
                            {count > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-apple-blue text-white' : 'bg-apple-bg border border-apple-border text-apple-text-secondary'
                                    }`}>
                                    {count}
                                </span>
                            )}
                            {isActive && (
                                <div className="absolute bottom-0 left-6 right-6 h-[2.5px] bg-apple-blue rounded-t-full shadow-[0_-2px_8px_rgba(0,122,255,0.4)]" />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Navigation & Statistics */}
            <div className="mx-6 bg-apple-card/80 backdrop-blur-[20px] rounded-2xl p-6 border border-apple-border shadow-apple-shadow flex-shrink-0">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2 px-5 py-2.5 bg-apple-bg border border-apple-border text-apple-text font-semibold rounded-xl hover:bg-apple-border/50 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm active:scale-97"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Câu trước
                    </button>

                    <div className="text-center">
                        {feedback ? (
                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold border ${feedback.isCorrect ? 'bg-emerald-muted text-emerald-text border-emerald-soft' : 'bg-red-muted text-red-text border-red-soft'}`}>
                                {feedback.message}
                            </span>
                        ) : (
                            <span className="text-apple-text-secondary text-[11px] font-bold uppercase tracking-widest bg-apple-bg px-4 py-1.5 rounded-full border border-apple-border">Chưa trả lời</span>
                        )}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={currentIndex === questions.length - 1}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#007AFF] text-white font-semibold rounded-[10px] hover:bg-[#0062CC] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/10 active:scale-97"
                    >
                        Câu tiếp
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0 px-6">
                    <button
                        onClick={() => {
                            const firstActiveIndex = questions.findIndex(q => {
                                const history = practiceHistory[q.id]
                                return history && history.attempts > 0
                            })
                            if (firstActiveIndex !== -1) jumpToQuestion(firstActiveIndex)
                        }}
                        className="bg-apple-card rounded-2xl p-4 border border-apple-border hover:border-apple-text/10 transition-all text-left group shadow-sm"
                    >
                        <div className="text-apple-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-1 group-hover:text-apple-text">Đã làm</div>
                        <div className="flex items-end justify-between">
                            <div className="text-2xl font-bold text-apple-text tracking-tight">{stats.done}</div>
                            <div className="text-[10px] text-apple-text-secondary opacity-60 mb-1 font-medium">{Math.round((stats.done / questions.length) * 100) || 0}%</div>
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            const firstNotDoneIndex = questions.findIndex(q => {
                                const history = practiceHistory[q.id]
                                return !history || history.attempts === 0
                            })
                            if (firstNotDoneIndex !== -1) jumpToQuestion(firstNotDoneIndex)
                        }}
                        className="bg-apple-card rounded-2xl p-4 border border-apple-border hover:border-apple-text/10 transition-all text-left group shadow-sm"
                    >
                        <div className="text-apple-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-1 group-hover:text-apple-text">Chưa làm</div>
                        <div className="text-2xl font-bold text-apple-text">{stats.notDone}</div>
                    </button>

                    <button
                        onClick={() => {
                            const firstCorrectIndex = questions.findIndex(q => {
                                const history = practiceHistory[q.id]
                                return history && history.isCorrect
                            })
                            if (firstCorrectIndex !== -1) jumpToQuestion(firstCorrectIndex)
                        }}
                        className="bg-emerald-muted rounded-2xl p-4 border border-emerald-soft hover:bg-emerald-muted/80 transition-all text-left group shadow-sm"
                    >
                        <div className="text-emerald-text text-[10px] font-bold uppercase tracking-wider mb-1">Trả lời đúng</div>
                        <div className="text-2xl font-bold text-emerald-text">{stats.correct}</div>
                    </button>

                    <button
                        onClick={() => {
                            const firstWrongIndex = questions.findIndex(q => {
                                const history = practiceHistory[q.id]
                                return history && !history.isCorrect && history.attempts > 0
                            })
                            if (firstWrongIndex !== -1) jumpToQuestion(firstWrongIndex)
                        }}
                        className="bg-red-muted rounded-2xl p-4 border border-red-soft hover:bg-red-muted/80 transition-all text-left group shadow-sm"
                    >
                        <div className="text-red-text text-[10px] font-bold uppercase tracking-wider mb-1">Trả lời sai</div>
                        <div className="text-2xl font-bold text-red-text">{stats.wrong}</div>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-[300px_1fr] gap-6 flex-1 min-h-0 px-6 pb-6">
                <div className="bg-apple-card/80 backdrop-blur-[20px] rounded-2xl p-6 shadow-apple-shadow border border-apple-border flex flex-col overflow-hidden">
                    <h3 className="font-semibold text-apple-text mb-4 flex items-center justify-between flex-shrink-0">
                        <span className="text-[10px] uppercase tracking-wider text-apple-text-secondary font-black">Danh sách câu hỏi</span>
                        <span className="text-[10px] font-bold text-apple-text-secondary bg-apple-bg px-2 py-0.5 rounded-full ring-1 ring-apple-border">{questions.length}</span>
                    </h3>

                    {loading ? (
                        <div className="text-center py-10 flex-1 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-apple-blue border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-y-auto flex-1 pr-2 no-scrollbar">
                            <div className="grid grid-cols-6 gap-2">
                                {questions.map((q, index) => (
                                    <button
                                        key={q.id}
                                        onClick={() => jumpToQuestion(index)}
                                        className={getQuestionButtonClass(index, q)}
                                        title={`Câu ${q.stt || index + 1}`}
                                        onMouseEnter={() => {
                                            if (kbArea !== 'sidebar') setKbArea('sidebar')
                                            setKbFocusIndex(index)
                                        }}
                                    >
                                        {q.stt || index + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-apple-card rounded-2xl shadow-apple-shadow border border-apple-border flex flex-col overflow-hidden">
                    {loading ? (
                        <div className="text-center py-20 flex-1 flex items-center justify-center">
                            <div>
                                <div className="w-12 h-12 border-4 border-apple-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-apple-text-secondary font-medium">Đang tải câu hỏi...</p>
                            </div>
                        </div>
                    ) : currentQuestion ? (
                        <div className="overflow-y-auto flex-1 p-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4 pb-6 border-b border-apple-border">
                                    <span className="px-4 py-2 bg-apple-blue/10 text-apple-blue font-bold rounded-xl text-[11px] flex-shrink-0 ring-1 ring-apple-blue/20">
                                        Câu {currentQuestion.stt || currentIndex + 1}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <p className="text-apple-text text-xl font-semibold leading-relaxed tracking-tight">
                                                {currentQuestion.cau_hoi}
                                            </p>
                                            <button
                                                onClick={() => setIsReportModalOpen(true)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF9500]/10 text-[#FF9500] rounded-[8px] text-[10px] font-bold uppercase tracking-widest border border-[#FF9500]/20 hover:bg-[#FF9500]/20 transition-all flex-shrink-0"
                                                title="Báo cáo sai sót (Phím R)"
                                            >
                                                <AlertTriangle className="w-3 h-3" />
                                                Phản hồi
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 text-apple-text-secondary text-sm">
                                            <span className="font-medium opacity-60">Bộ đề:</span>
                                            <span className="font-medium text-apple-text/80 italic">{selectedChuyenNganh}</span>
                                            <span className="mx-1">•</span>
                                            <span className="font-medium">{currentIndex + 1} / {questions.length}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {['a', 'b', 'c', 'd'].map((option) => {
                                        const optionText = currentQuestion[`dap_an_${option}` as keyof Question] as string
                                        const isSelected = selectedAnswer === option
                                        const isCorrect = option === currentQuestion.dap_an_dung
                                        const showCorrect = feedback && isCorrect
                                        const showWrong = feedback && isSelected && !isCorrect

                                        const isKbFocused = kbArea === 'main' && kbFocusIndex === ['a', 'b', 'c', 'd'].indexOf(option)
                                        const focusRing = isKbFocused ? 'ring-4 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10' : ''

                                        return (
                                            <label
                                                key={option}
                                                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all relative cursor-pointer group shadow-sm ${isKbFocused ? 'ring-[3px] ring-apple-blue/30 border-apple-blue' : ''} ${showCorrect
                                                    ? 'border-emerald-soft bg-emerald-muted'
                                                    : showWrong
                                                        ? 'border-red-soft bg-red-muted'
                                                        : isSelected
                                                            ? 'border-apple-blue bg-apple-blue/10 scale-[1.01]'
                                                            : 'border-apple-border bg-apple-card hover:bg-apple-bg hover:border-apple-text/10'
                                                    }`}
                                                onMouseEnter={() => {
                                                    setKbArea('main')
                                                    setKbFocusIndex(['a', 'b', 'c', 'd'].indexOf(option))
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="answer"
                                                    value={option}
                                                    checked={isSelected}
                                                    onChange={() => handleAnswerSelect(option)}
                                                    className="mt-1 w-5 h-5 accent-[#007AFF] cursor-pointer"
                                                />
                                                <div className="flex-1 flex items-center justify-between gap-4">
                                                    <span className={`font-medium text-[15px] leading-relaxed ${showCorrect ? 'text-emerald-text' : showWrong ? 'text-red-text' : 'text-apple-text-secondary group-hover:text-apple-text'
                                                        }`}>
                                                        <span className="opacity-50 font-bold mr-2">{option.toUpperCase()}.</span>
                                                        {optionText}
                                                    </span>
                                                </div>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 flex-1 flex items-center justify-center">
                            <p className="text-slate-500 font-medium">Không có câu hỏi nào</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Components */}
            {
                currentQuestion && (
                    <ReportModal
                        isOpen={isReportModalOpen}
                        onClose={() => setIsReportModalOpen(false)}
                        user={user}
                        question={{
                            id: currentQuestion.id,
                            stt: currentQuestion.stt || currentIndex + 1,
                            hang: currentQuestion.hang,
                            phan_thi: currentQuestion.phan_thi,
                            cau_hoi: currentQuestion.cau_hoi
                        }}
                    />
                )
            }

            <GuideModal
                isOpen={isGuideOpen}
                onClose={() => setIsGuideOpen(false)}
            />
        </div >
    )
}

export default function OnTapPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-apple-bg flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-apple-blue border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-apple-text-secondary font-bold animate-pulse uppercase tracking-widest text-xs">Đang tải dữ liệu ôn tập...</p>
                </div>
            </div>
        }>
            <OnTapContent />
        </Suspense>
    )
}
