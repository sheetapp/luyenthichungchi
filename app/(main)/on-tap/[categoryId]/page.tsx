'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Eye, RefreshCw, Shuffle, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function PracticeDetailPage() {
    const { categoryId } = useParams()
    const router = useRouter()

    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)
    const [mode, setMode] = useState<'order' | 'random'>('order')
    const [learnedIds, setLearnedIds] = useState<number[]>([])
    const [wrongIds, setWrongIds] = useState<number[]>([])

    const [mounted, setMounted] = useState(false)

    // Load local progress
    useEffect(() => {
        setMounted(true)
        const learned = JSON.parse(localStorage.getItem('learned_questions') || '[]')
        const wrong = JSON.parse(localStorage.getItem('wrong_questions') || '[]')
        setLearnedIds(learned)
        setWrongIds(wrong)
    }, [])

    useEffect(() => {
        async function fetchQuestions() {
            setLoading(true)
            // Note: We'd normally filter by categoryId here
            // But since the schema uses category names, we might need to fetch the category name first
            const { data: catData } = await supabase
                .from('config')
                .select('data_value')
                .eq('id', categoryId)
                .single()

            if (catData) {
                const { data, error } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('chuyen_nganh', catData.data_value)

                if (!error && data) {
                    setQuestions(data)
                }
            }
            setLoading(false)
        }
        fetchQuestions()
    }, [categoryId])

    const displayQuestions = useMemo(() => {
        if (mode === 'random') {
            return [...questions].sort(() => Math.random() - 0.5)
        }
        return questions
    }, [questions, mode])

    const currentQuestion = displayQuestions[currentIndex]

    const handleNext = () => {
        if (currentIndex < displayQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setShowAnswer(false)
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
            setShowAnswer(false)
        }
    }

    const markAsLearned = (id: number) => {
        const newLearned = [...new Set([...learnedIds, id])]
        setLearnedIds(newLearned)
        localStorage.setItem('learned_questions', JSON.stringify(newLearned))
    }

    if (!mounted || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Đang tải bộ câu hỏi...</p>
            </div>
        )
    }

    if (!currentQuestion) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500">Không tìm thấy câu hỏi cho mục này.</p>
                <Link href="/on-tap" className="text-blue-600 font-bold mt-4 inline-block underline">Quay lại</Link>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in zoom-in-95 duration-300">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Quay lại
                </button>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setMode('order')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${mode === 'order' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <BookOpen className="w-3 h-3" /> Thứ tự
                    </button>
                    <button
                        onClick={() => setMode('random')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${mode === 'random' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <Shuffle className="w-3 h-3" /> Ngẫu nhiên
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Câu hỏi {currentIndex + 1} / {displayQuestions.length}</span>
                    <span>Hoàn thành {Math.round((learnedIds.length / (displayQuestions.length || 1)) * 100) || 0}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${((currentIndex + 1) / (displayQuestions.length || 1)) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="glass-card rounded-[2rem] p-8 md:p-10 shadow-2xl relative">
                <div className="mb-6 flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        {currentQuestion.phan_thi}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        Mã: {currentQuestion.id_cauhoi}
                    </span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug mb-10">
                    {currentQuestion.cau_hoi || 'Nội dung câu hỏi đang được cập nhật...'}
                </h2>

                <div className="space-y-4">
                    {['a', 'b', 'c', 'd'].map((key) => {
                        const answerText = currentQuestion[`dap_an_${key}`]
                        if (!answerText) return null

                        const isCorrect = showAnswer && currentQuestion.dap_an_dung.toLowerCase() === key

                        return (
                            <div
                                key={key}
                                className={`
                                    group p-5 rounded-2xl border-2 transition-all flex items-start gap-4
                                    ${isCorrect
                                        ? 'bg-emerald-50 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                                        : 'bg-white border-slate-100 hover:border-slate-300'
                                    }
                                `}
                            >
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 uppercase
                                    ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}
                                `}>
                                    {key}
                                </div>
                                <p className={`text-sm md:text-base leading-relaxed ${isCorrect ? 'text-emerald-900 font-bold' : 'text-slate-600 font-medium'}`}>
                                    {answerText}
                                </p>
                            </div>
                        )
                    })}
                </div>

                {/* Answer Toggle */}
                <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-center">
                    <button
                        onClick={() => {
                            setShowAnswer(!showAnswer)
                            if (!showAnswer) markAsLearned(currentQuestion.id_cauhoi)
                        }}
                        className={`
                            px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all
                            ${showAnswer
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                : 'bg-slate-900 text-white hover:scale-105 active:scale-95 shadow-xl'}
                        `}
                    >
                        <Eye className="w-4 h-4" />
                        {showAnswer ? 'Đáp án đúng: ' + currentQuestion.dap_an_dung.toUpperCase() : 'Xem đáp án'}
                    </button>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="flex-1 bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm group"
                >
                    <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold ml-2">Câu trước</span>
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentIndex === displayQuestions.length - 1}
                    className="flex-1 bg-blue-600 p-5 rounded-2xl flex items-center justify-center text-white hover:bg-blue-700 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xl shadow-blue-500/20 group"
                >
                    <span className="font-bold mr-2">Câu tiếp theo</span>
                    <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    )
}
