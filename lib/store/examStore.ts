import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question } from '@/lib/supabase/database.types'

interface Answer {
    questionId: string
    selectedAnswer: 'a' | 'b' | 'c' | 'd' | null
}

interface ExamStore {
    // Exam state
    questions: Question[]
    currentQuestionIndex: number
    answers: Map<string, 'a' | 'b' | 'c' | 'd'>
    bookmarkedQuestions: Set<string>

    // Timer
    timeRemaining: number // seconds
    isTimerRunning: boolean

    // Exam settings
    examMode: 'practice' | 'test' // practice = see answers, test = real exam
    hang: string | null
    chuyenNganh: string | null

    // Actions
    setQuestions: (questions: Question[]) => void
    setCurrentQuestionIndex: (index: number) => void
    setAnswer: (questionId: string, answer: 'a' | 'b' | 'c' | 'd') => void
    toggleBookmark: (questionId: string) => void
    nextQuestion: () => void
    previousQuestion: () => void
    goToQuestion: (index: number) => void

    // Timer actions
    startTimer: () => void
    pauseTimer: () => void
    resetTimer: () => void
    decrementTimer: () => void

    // Exam control
    startExam: (mode: 'practice' | 'test', questions: Question[], hang: string, chuyenNganh?: string) => void
    submitExam: () => { answers: Map<string, 'a' | 'b' | 'c' | 'd'>; timeSpent: number }
    resetExam: () => void
}

export const useExamStore = create<ExamStore>()(
    persist(
        (set, get) => ({
            // Initial state
            questions: [],
            currentQuestionIndex: 0,
            answers: new Map(),
            bookmarkedQuestions: new Set(),
            timeRemaining: 30 * 60, // 30 minutes
            isTimerRunning: false,
            examMode: 'practice',
            hang: null,
            chuyenNganh: null,

            // Actions
            setQuestions: (questions) => set({ questions }),

            setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),

            setAnswer: (questionId, answer) => set((state) => {
                const newAnswers = new Map(state.answers)
                newAnswers.set(questionId, answer)
                return { answers: newAnswers }
            }),

            toggleBookmark: (questionId) => set((state) => {
                const newBookmarks = new Set(state.bookmarkedQuestions)
                if (newBookmarks.has(questionId)) {
                    newBookmarks.delete(questionId)
                } else {
                    newBookmarks.add(questionId)
                }
                return { bookmarkedQuestions: newBookmarks }
            }),

            nextQuestion: () => set((state) => ({
                currentQuestionIndex: Math.min(
                    state.currentQuestionIndex + 1,
                    state.questions.length - 1
                ),
            })),

            previousQuestion: () => set((state) => ({
                currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
            })),

            goToQuestion: (index) => set({ currentQuestionIndex: index }),

            // Timer actions
            startTimer: () => set({ isTimerRunning: true }),
            pauseTimer: () => set({ isTimerRunning: false }),
            resetTimer: () => set({ timeRemaining: 30 * 60, isTimerRunning: false }),
            decrementTimer: () => set((state) => ({
                timeRemaining: Math.max(state.timeRemaining - 1, 0),
            })),

            // Exam control
            startExam: (mode, questions, hang, chuyenNganh) => set({
                examMode: mode,
                questions,
                hang,
                chuyenNganh: chuyenNganh || null,
                currentQuestionIndex: 0,
                answers: new Map(),
                bookmarkedQuestions: new Set(),
                timeRemaining: 30 * 60,
                isTimerRunning: mode === 'test', // Auto-start timer for test mode
            }),

            submitExam: () => {
                const state = get()
                const timeSpent = 30 * 60 - state.timeRemaining
                set({ isTimerRunning: false })
                return {
                    answers: state.answers,
                    timeSpent,
                }
            },

            resetExam: () => set({
                questions: [],
                currentQuestionIndex: 0,
                answers: new Map(),
                bookmarkedQuestions: new Set(),
                timeRemaining: 30 * 60,
                isTimerRunning: false,
                examMode: 'practice',
                hang: null,
                chuyenNganh: null,
            }),
        }),
        {
            name: 'exam-store',
            // Only persist certain fields to localStorage
            partialize: (state) => ({
                bookmarkedQuestions: Array.from(state.bookmarkedQuestions),
                examMode: state.examMode,
            }),
        }
    )
)
