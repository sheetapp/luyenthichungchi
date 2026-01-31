'use client'

import { useState, useEffect } from 'react'
import {
    Settings,
    History,
    AlertTriangle,
    MessageSquare,
    LogOut,
    ChevronRight,
    ChevronLeft,
    Trophy,
    Award,
    TrendingUp,
    Star,
    Sparkles,
    Calendar,
    Target,
    Briefcase,
    Sun,
    Moon,
    User,
    CheckCircle,
    XCircle,
    Edit2,
    Save,
    Share2,
    LayoutGrid,
    Loader2,
    Mail,
    Phone,
    UserCircle,
    FileText,
    Send,
    RotateCcw,
    ChevronDown,
    Clock,
    Medal,
    PlusCircle,
    BookOpen,
    HelpCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WelcomePopup } from '@/components/WelcomePopup'
import { ShareModal } from '@/components/ShareModal'
import { ShortcutModal } from '@/components/ShortcutModal'
import { AppFeedbackModal } from '@/components/feedback/AppFeedbackModal'
import { useAppStore } from '@/lib/store/useAppStore'

type TabType = 'overview' | 'profile' | 'history' | 'wrong' | 'feedback' | 'settings'

export default function AccountPage() {
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [stats, setStats] = useState({
        totalExams: 0,
        avgScore: 0,
        highestScore: 0,
        totalWrong: 0,
        passRate: 0,
        totalAnswered: 0
    })
    const [practiceSummary, setPracticeSummary] = useState<any[]>([])
    const [preferences, setPreferences] = useState({
        rank: 'Hạng III',
        specialty: 'Khảo sát xây dựng',
        theme: 'light'
    })
    const [badges, setBadges] = useState({
        stars: 0,
        level: 'Người mới',
        title: 'Học viên'
    })
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const [showWelcome, setShowWelcome] = useState(false)
    const [activeTab, setActiveTab] = useState<TabType>('overview')
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({
        display_name: '',
        phone: '',
        job_title: '',
        gender: '',
        company: '',
        address: ''
    })
    const [examHistory, setExamHistory] = useState<any[]>([])
    const [wrongQuestions, setWrongQuestions] = useState<any[]>([])
    const [groupedWrongQuestions, setGroupedWrongQuestions] = useState<any[]>([])
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [profileSaveSuccess, setProfileSaveSuccess] = useState(false)
    const [profileError, setProfileError] = useState<string | null>(null)
    const [greeting, setGreeting] = useState('')
    const [sharingId, setSharingId] = useState<string | null>(null)
    const [expandedExam, setExpandedExam] = useState<string | null>(null)
    const [showSticky, setShowSticky] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [showShortcutModal, setShowShortcutModal] = useState(false)
    const [showFeedbackModal, setShowFeedbackModal] = useState(false)
    const [agreed, setAgreed] = useState(false)
    const [isLoginLoading, setIsLoginLoading] = useState(false)

    useEffect(() => {
        setMounted(true)
        const hour = new Date().getHours()
        if (hour < 12) setGreeting('buổi sáng')
        else if (hour < 18) setGreeting('buổi chiều')
        else setGreeting('buổi tối')
    }, [])

    const handleGoogleLogin = async () => {
        try {
            setIsLoginLoading(true)
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            })

            if (error) {
                console.error('Login error:', error)
                alert('Đăng nhập thất bại. Vui lòng thử lại.')
                setIsLoginLoading(false)
            }
        } catch (error) {
            console.error('Login error:', error)
            setIsLoginLoading(false)
        }
    }

    // Sticky header on scroll
    useEffect(() => {
        const handleScroll = () => {
            setShowSticky(window.scrollY > 150)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        async function loadProfileAndStats() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Fetch profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                const userProfile = profileData || {
                    id: user.id,
                    email: user.email,
                    display_name: user.email?.split('@')[0]
                }
                setProfile(userProfile)
                setEditForm({
                    display_name: userProfile.display_name || '',
                    phone: userProfile.phone || '',
                    job_title: userProfile.job_title || '',
                    gender: userProfile.gender || '',
                    company: userProfile.company || '',
                    address: userProfile.address || ''
                })

                if (userProfile.preferences) {
                    setPreferences(userProfile.preferences)
                    // Sync to store
                    const store = useAppStore.getState()
                    if (userProfile.preferences.rank) store.setSelectedHang(userProfile.preferences.rank)
                    if (userProfile.preferences.specialty) store.setSelectedCategory(userProfile.preferences.specialty)
                }

                // Check if first time login
                const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
                if (!hasSeenWelcome) {
                    setShowWelcome(true)
                }

                // Fetch exam results for stats
                const { data: results } = await supabase
                    .from('exam_results')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (results && results.length > 0) {
                    setExamHistory(results)
                    const total = results.length
                    const passed = results.filter(r => r.passed).length
                    const highest = Math.max(...results.map(r => r.score || 0))
                    const avg = results.reduce((acc, r) => acc + (r.score || 0), 0) / total

                    // Count wrong answers
                    let totalWrongCount = 0
                    results.forEach(result => {
                        if (result.answers) {
                            Object.values(result.answers).forEach((answer: any) => {
                                if (answer && answer.correct === false) {
                                    totalWrongCount++
                                }
                            })
                        }
                    })

                    setStats({
                        totalExams: total,
                        avgScore: Math.round(avg * 10) / 10,
                        highestScore: highest,
                        totalWrong: totalWrongCount,
                        passRate: Math.round((passed / total) * 100),
                        totalAnswered: 0 // Will be updated below
                    })

                    const allMistakes: any[] = []
                    results.forEach(result => {
                        if (result.answers) {
                            Object.entries(result.answers).forEach(([qId, answer]: [string, any]) => {
                                if (answer && answer.correct === false) {
                                    allMistakes.push({
                                        questionId: qId,
                                        userAnswer: answer.selected,
                                        correctAnswer: answer.correctAnswer,
                                        examDate: result.created_at,
                                        category: result.category_id
                                    })
                                }
                            })
                        }
                    })
                    setWrongQuestions(allMistakes)

                    // Group wrong answers by exam session
                    const groups: any[] = results.map(result => {
                        const mistakes = result.answers ? Object.values(result.answers).filter((a: any) => a.correct === false) : []
                        if (mistakes.length === 0) return null
                        return {
                            resultId: result.id,
                            examName: result.chuyen_nganh || 'Bài thi sát hạch',
                            date: result.created_at,
                            count: mistakes.length,
                            hang: result.hang
                        }
                    }).filter(Boolean)
                    setGroupedWrongQuestions(groups)
                }

                // Fetch practice stats for detailed history
                const { data: practiceData } = await supabase
                    .from('user_practice_stats')
                    .select('history')
                    .eq('user_id', user.id)
                    .single()

                let answeredCount = 0
                if (practiceData?.history) {
                    const history = practiceData.history as any
                    const questionIds = Object.keys(history)
                    answeredCount = questionIds.length

                    if (questionIds.length > 0) {
                        try {
                            // Fetch question details (category) for these IDs to group
                            const { data: answeredQs } = await supabase
                                .from('questions')
                                .select('id, chuyen_nganh')
                                .in('id', questionIds)

                            if (answeredQs) {
                                // Group by chuyen_nganh
                                const summaryMap: Record<string, { learned: number; correct: number; wrong: number }> = {}
                                answeredQs.forEach(q => {
                                    const cat = q.chuyen_nganh || 'Khác'
                                    if (!summaryMap[cat]) {
                                        summaryMap[cat] = { learned: 0, correct: 0, wrong: 0 }
                                    }
                                    summaryMap[cat].learned++
                                    if (history[q.id]?.isCorrect) {
                                        summaryMap[cat].correct++
                                    } else {
                                        summaryMap[cat].wrong++
                                    }
                                })

                                // Fetch total counts per category for these categories to calculate "not learned"
                                const categories = Object.keys(summaryMap)
                                const { data: catCounts } = await supabase
                                    .from('questions')
                                    .select('chuyen_nganh')
                                    .in('chuyen_nganh', categories)

                                if (catCounts) {
                                    const totalMap: Record<string, number> = {}
                                    catCounts.forEach(c => {
                                        totalMap[c.chuyen_nganh] = (totalMap[c.chuyen_nganh] || 0) + 1
                                    })

                                    const finalSummary = Object.entries(summaryMap).map(([cat, s]: [string, any]) => ({
                                        category: cat,
                                        learned: s.learned,
                                        correct: s.correct,
                                        wrong: s.wrong,
                                        total: totalMap[cat] || s.learned,
                                        notLearned: (totalMap[cat] || s.learned) - s.learned
                                    }))
                                    setPracticeSummary(finalSummary)
                                }
                            }
                        } catch (err) {
                            console.error('Error processing practice stats:', err)
                        }
                    }
                }

                // Calculate Badges & Stars based on precision (avgScore)
                const currentAvg = results && results.length > 0
                    ? results.reduce((acc, r) => acc + (r.score || 0), 0) / results.length
                    : 0;

                let stars = 1
                if (currentAvg >= 80) stars = 5
                else if (currentAvg >= 60) stars = 4
                else if (currentAvg >= 40) stars = 3
                else if (currentAvg >= 20) stars = 2

                let level = 'Tập Sự'
                let title = 'Học viên tiềm năng'

                if (stars === 5) {
                    level = 'Chuyên Gia'
                    title = 'Cao thủ sát hạch'
                } else if (stars >= 3) {
                    level = 'Thành Thạo'
                    title = 'Sĩ tử dày dạn'
                }

                setBadges({ stars, level, title })
                setStats(prev => ({ ...prev, totalAnswered: answeredCount, avgScore: Math.round(currentAvg * 10) / 10 }))
            }
            setLoading(false)
        }
        loadProfileAndStats()
    }, [router])

    const handleCloseWelcome = () => {
        setShowWelcome(false)
        localStorage.setItem('hasSeenWelcome', 'true')
    }

    const handleEditToggle = () => {
        if (isEditing) {
            setEditForm({
                display_name: profile.display_name || '',
                phone: profile.phone || '',
                job_title: profile.job_title || '',
                gender: profile.gender || '',
                company: profile.company || '',
                address: profile.address || ''
            })
        }
        setIsEditing(!isEditing)
    }

    const handleSaveProfile = async () => {
        setIsSavingProfile(true)
        setProfileError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setProfileError('Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.')
                return
            }

            // Prepare update data
            const updateData: any = {
                display_name: editForm.display_name,
                phone: editForm.phone,
                job_title: editForm.job_title,
                gender: editForm.gender,
                company: editForm.company,
                address: editForm.address,
                updated_at: new Date().toISOString()
            }

            const { error } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', user.id)

            if (error) throw error

            setProfile({ ...profile, ...editForm })
            setIsEditing(false)
            setProfileSaveSuccess(true)
            setTimeout(() => setProfileSaveSuccess(false), 3000)
        } catch (error: any) {
            console.error('Error saving profile:', error)
            setProfileError(error.message || 'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.')
        } finally {
            setIsSavingProfile(false)
        }
    }

    const handleSaveSettings = async () => {
        setIsSavingProfile(true)
        setProfileError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setProfileError('Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.')
                return
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    preferences: preferences
                })
                .eq('id', user.id)

            if (error) throw error

            setProfileSaveSuccess(true)
            setTimeout(() => setProfileSaveSuccess(false), 3000)

            // Sync with Store
            const store = useAppStore.getState()
            if (preferences.rank) store.setSelectedHang(preferences.rank)
            if (preferences.specialty) store.setSelectedCategory(preferences.specialty)
        } catch (error: any) {
            console.error('Error saving settings:', error)
            setProfileError(error.message || 'Có lỗi xảy ra khi lưu cài đặt.')
        } finally {
            setIsSavingProfile(false)
        }
    }

    const handleShareResult = async (resultId: any) => {
        setSharingId(resultId)
        try {
            const { error } = await supabase
                .from('exam_results')
                .update({ is_public: true })
                .eq('id', resultId)

            if (error) throw error

            // Update local state
            setExamHistory(prev => prev.map(exam =>
                exam.id === resultId ? { ...exam, is_public: true } : exam
            ))

        } catch (error: any) {
            console.error('Error sharing result:', error)
        } finally {
            setSharingId(null)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (!mounted || loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    const menuGroups = [
        {
            title: 'Tài khoản & Học tập',
            items: [
                { id: 'profile' as TabType, label: 'Thông tin cá nhân', icon: User, color: 'text-apple-blue' },
                { id: 'history' as TabType, label: 'Lịch sử thi thử', icon: History, color: 'text-emerald-500' },
                { id: 'wrong' as TabType, label: 'Câu hỏi đã làm sai', icon: AlertTriangle, color: 'text-red-500' }
            ]
        },
        {
            title: 'Ứng dụng & Tiện ích',
            items: [
                { id: 'favorite' as any, label: 'Yêu thích App', icon: Star, color: 'text-orange-500', isAction: true, actionType: 'favorite' },
                { id: 'share' as any, label: 'Chia sẻ App', icon: Share2, color: 'text-emerald-500', isAction: true, actionType: 'share' },
                { id: 'shortcut' as any, label: 'Tạo lối tắt', icon: LayoutGrid, color: 'text-orange-600', isAction: true, actionType: 'shortcut' },
                { id: 'feedback' as any, label: 'Góp ý ứng dụng', icon: MessageSquare, color: 'text-blue-500', isAction: true, actionType: 'feedback' },
            ]
        },
        {
            title: 'Hỗ trợ & Khác',
            items: [
                { id: 'settings' as TabType, label: 'Cài đặt', icon: Settings, color: 'text-slate-500' }
            ]
        }
    ]

    // Unauthenticated View - Standard Login Format (Same as /login)
    if (!profile && mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50">
                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100">
                        {/* Logo & Title */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
                                <Award className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">
                                Luyện thi <span className="text-blue-600">CCHN</span>
                            </h1>
                            <p className="text-slate-600">
                                Chào mừng bạn quay trở lại!
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-500 font-medium">Đăng nhập với</span>
                            </div>
                        </div>

                        {/* Google Login Button */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoginLoading || !agreed}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed group shadow-sm hover:shadow-md"
                        >
                            {isLoginLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                    <span>Đang đăng nhập...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span>Tiếp tục với Google</span>
                                </>
                            )}
                        </button>

                        {/* Agreement Checkbox */}
                        <div className="mt-8 flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 select-none group cursor-pointer" onClick={() => setAgreed(!agreed)}>
                            <div className="flex items-center h-5 mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                                />
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                Tôi đã đọc và đồng ý với{' '}
                                <Link href="/dieu-khoan-su-dung" className="text-blue-600 hover:underline font-bold" onClick={(e) => e.stopPropagation()}>
                                    Điều khoản sử dụng
                                </Link>
                                {' '}và{' '}
                                <Link href="/chinh-sach-bao-mat" className="text-blue-600 hover:underline font-bold" onClick={(e) => e.stopPropagation()}>
                                    Chính sách bảo mật
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Extra Info */}
                    <div className="mt-8 text-center text-slate-400">
                        <p className="text-sm">
                            QĐ 163/QĐ-BXD ngày 18/2/2025 của Bộ Xây dựng
                        </p>
                        <p className="text-xs mt-1">
                            © 2026 Luyện thi Chứng chỉ hành nghề Xây dựng
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Sticky Header - Handled by Drill-down Navigation on Mobile */}

            {showWelcome && profile && (
                <WelcomePopup
                    userName={profile.display_name || profile.email?.split('@')[0] || 'bạn'}
                    onClose={handleCloseWelcome}
                />
            )}

            <div className="px-4 md:px-6 py-4 md:py-6 space-y-6 md:space-y-8 min-h-screen bg-apple-bg pb-20 md:pb-6">
                {/* Content Header - Mobile Back Button if in sub-tab */}
                {activeTab !== 'overview' && (
                    <div className="md:hidden animate-in fade-in slide-in-from-left duration-300">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className="flex items-center gap-2 px-3 py-2 -ml-1 text-apple-blue font-semibold text-sm active:scale-95 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Quay lại
                        </button>
                    </div>
                )}

                {/* Header Greeting & Profile Section - Unified Branding */}
                <div className={`${activeTab === 'overview' ? 'flex' : 'hidden md:flex'} flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8`}>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                <h1 className="text-2xl md:text-3xl font-semibold text-apple-text tracking-tight animate-in fade-in slide-in-from-left duration-500">
                                    Chào {greeting}, {profile?.display_name || 'bạn'}
                                </h1>
                                <p className="text-xs md:text-sm text-apple-text-secondary font-medium flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-apple-blue animate-pulse" />
                                    Bạn đã làm tốt, hãy tiếp tục phấn đấu hơn nữa.
                                </p>
                            </div>

                            {/* Modern Mobile Logout Button - Apple Style */}
                            <button
                                onClick={handleLogout}
                                className="md:hidden flex items-center justify-center w-10 h-10 rounded-2xl bg-apple-card border border-apple-border shadow-apple-shadow text-red-500 active:scale-90 transition-all duration-300 group"
                                aria-label="Đăng xuất"
                            >
                                <LogOut className="w-4.5 h-4.5 group-active:-translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Unified Profile Elements (Avatar, Stars, Badge) */}
                        <div className="flex items-center gap-4 mt-3 animate-in fade-in slide-in-from-top duration-700 delay-200">
                            <div className="relative group">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-apple-card shadow-apple-shadow overflow-hidden bg-apple-bg flex items-center justify-center transition-transform hover:scale-105 duration-300">
                                    {profile?.avata ? (
                                        <img src={profile.avata} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-apple-blue to-[#0051FF] text-white text-xl md:text-2xl font-bold">
                                            {profile?.display_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="inline-flex items-center px-2.5 py-0.5 bg-apple-blue text-white rounded-lg text-[10px] md:text-[11px] font-semibold shadow-md shadow-apple-blue/10">
                                        {badges.level}
                                    </div>
                                    <span className="text-[10px] md:text-[11px] text-apple-text-secondary font-bold uppercase tracking-wider">{badges.title}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-1 px-3 py-1.5 bg-apple-card/50 backdrop-blur-md rounded-xl border border-apple-border shadow-sm w-fit">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 md:w-3.5 md:h-3.5 transition-all duration-700 ${i < badges.stars
                                                    ? 'fill-yellow-400 text-yellow-400 filter drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]'
                                                    : 'text-apple-text-secondary/20 fill-apple-text-secondary/10 stroke-[1.5px]'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Integrated Apple-Style Progress Bar (Mobile Only) */}
                                    <div className="md:hidden flex-1 flex flex-col gap-1.5">
                                        <div className="flex justify-between items-center px-0.5">
                                            <span className="text-[9px] font-bold text-apple-text-secondary uppercase tracking-tight">Tiến trình Chuyên gia</span>
                                            <span className="text-[10px] font-black text-apple-blue">{Math.round((stats.avgScore / 80) * 100)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-apple-card/50 backdrop-blur-sm rounded-full overflow-hidden border border-apple-border p-[1px]">
                                            <div
                                                className="h-full bg-apple-blue rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,122,255,0.4)]"
                                                style={{ width: `${Math.min((stats.avgScore / 80) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 md:gap-8 items-stretch">
                    {/* Mobile Menu List View */}
                    <div className={`${activeTab === 'overview' ? 'flex' : 'hidden'} md:hidden flex-col gap-6`}>
                        {menuGroups.map((group, groupIdx) => (
                            <div key={groupIdx} className="space-y-2">
                                <h4 className="px-4 text-[10px] font-semibold text-apple-text-secondary uppercase tracking-wider">{group.title}</h4>
                                <div className="bg-apple-card rounded-2xl border border-apple-border overflow-hidden shadow-sm">
                                    {group.items.map((item, itemIdx) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                const itemAny = item as any;
                                                if (itemAny.isAction) {
                                                    const action = itemAny.actionType;
                                                    if (action === 'share') setShowShareModal(true);
                                                    else if (action === 'shortcut') setShowShortcutModal(true);
                                                    else if (action === 'feedback') setShowFeedbackModal(true);
                                                    else alert(`Chức năng ${itemAny.label} sẽ sớm được cập nhật!`);
                                                } else {
                                                    setActiveTab(itemAny.id as TabType);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }
                                            }}
                                            className={`w-full flex items-center justify-between p-4 active:bg-apple-bg transition-colors ${itemIdx !== group.items.length - 1 ? 'border-b border-apple-border/50' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg ${item.color.replace('text-', 'bg-')}/10 flex items-center justify-center ${item.color}`}>
                                                    <item.icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium text-apple-text">{item.label}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-apple-text-secondary/50" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Logout moved to top right */}
                    </div>

                    {/* Sidebar Cleanup - Identity section moved to header */}
                    <div className={`${activeTab === 'overview' ? 'flex' : 'hidden'} md:flex bg-apple-card rounded-2xl overflow-hidden shadow-sm md:shadow-apple-shadow flex-col border border-apple-border font-sans`}>
                        <div className="flex-1 p-5 md:p-6 space-y-6 md:space-y-8 bg-apple-card">
                            {/* PROGRESS section */}
                            <div className="space-y-4 md:space-y-5">
                                <div className="flex items-center gap-2 border-b border-apple-border pb-2">
                                    <TrendingUp className="w-4 h-4 text-apple-blue" />
                                    <h4 className="text-[10px] md:text-[11px] font-semibold text-apple-text-secondary uppercase tracking-wider">Tiến độ</h4>
                                </div>
                                <div className="space-y-4 md:space-y-6 md:px-1">
                                    {[
                                        { label: 'Kiến thức chung', value: Math.min(stats.avgScore + 10, 100) },
                                        { label: 'Chuyên môn', value: stats.avgScore },
                                        { label: 'Pháp luật', value: Math.max(stats.avgScore - 5, 0) }
                                    ].map((skill, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between items-center text-[9px] md:text-[10px] font-bold text-apple-text-secondary tracking-wider">
                                                <span>{skill.label}</span>
                                                <span className="text-apple-text">{Math.round(skill.value * 10) / 10}%</span>
                                            </div>
                                            <div className="h-2 md:h-2.5 bg-apple-bg rounded-full overflow-hidden border border-apple-border">
                                                <div
                                                    className="h-full bg-apple-blue transition-all duration-1000"
                                                    style={{ width: `${skill.value}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* NAVIGATION - Hidden on Mobile, replaced by horizontal tabs */}
                            <div className="hidden md:block space-y-4 md:space-y-5 pt-2 md:pt-4">
                                <div className="flex items-center gap-2 border-b border-apple-border pb-2">
                                    <LayoutGrid className="w-4 h-4 text-apple-blue" />
                                    <h4 className="text-[10px] md:text-[11px] font-semibold text-apple-text-secondary uppercase tracking-wider">Danh mục</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-1.5 md:gap-2">
                                    {menuGroups.flatMap(group => group.items).filter(item => !(item as any).isAction).map((item) => {
                                        const itemAny = item as any;
                                        return (
                                            <button
                                                key={itemAny.id}
                                                onClick={() => {
                                                    setActiveTab(itemAny.id as TabType);
                                                    if (window.innerWidth < 1024) {
                                                        const el = document.getElementById('tab-content');
                                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                                    }
                                                }}
                                                className={`w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl transition-all text-[11px] font-semibold border active:scale-95 ${activeTab === itemAny.id
                                                    ? 'bg-apple-blue border-apple-blue text-white shadow-md'
                                                    : 'bg-transparent border-transparent text-apple-text-secondary hover:bg-apple-bg'
                                                    }`}
                                            >
                                                <itemAny.icon className={`w-4 h-4 ${activeTab === itemAny.id ? 'text-white' : 'text-apple-text-secondary'}`} />
                                                <span>{itemAny.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Footer - Solid Action */}
                        <div className="hidden md:block p-5 md:p-6 bg-apple-bg/30 border-t border-apple-border mt-auto">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 py-3 md:py-4 px-4 bg-apple-card border border-apple-border hover:bg-red-500 hover:border-red-500 hover:text-white text-red-500 rounded-xl font-bold text-[11px] tracking-wide shadow-sm transition-all active:scale-95"
                            >
                                <LogOut className="w-4 h-4" />
                                Đăng xuất
                            </button>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="flex flex-col space-y-6">

                        {/* Main Tab Content Card */}
                        <div id="tab-content" className={`${activeTab !== 'overview' ? 'block' : 'hidden'} md:block flex-1 bg-apple-card rounded-2xl border border-apple-border shadow-sm md:shadow-apple-shadow overflow-hidden`}>
                            <div className="p-4 md:p-6">
                                {activeTab === 'overview' && (
                                    <div className="animate-in fade-in duration-500 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold text-apple-text tracking-tight mb-1">Tổng quan</h2>
                                                <p className="text-apple-text-secondary font-medium text-[11px] uppercase tracking-[0.15em]">Xem tóm tắt hoạt động của bạn</p>
                                            </div>
                                            <div className="w-10 h-10 bg-apple-card text-apple-text rounded-2xl flex items-center justify-center shadow-apple-shadow border border-apple-border">
                                                <Sparkles className="w-5 h-5 opacity-80" />
                                            </div>
                                        </div>

                                        {/* Progress Section (PC Overview - Synced with Mobile Style) */}
                                        <div className="hidden md:block bg-apple-card rounded-3xl p-6 border border-apple-border shadow-apple-shadow">
                                            <div className="flex items-center gap-3 mb-6 border-b border-apple-border pb-4">
                                                <div className="w-8 h-8 bg-apple-blue/10 text-apple-blue rounded-xl flex items-center justify-center">
                                                    <TrendingUp className="w-4 h-4" />
                                                </div>
                                                <h4 className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-[0.2em]">Tiến độ học tập</h4>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6">
                                                {[
                                                    { label: 'Kiến thức chung', value: Math.min(stats.avgScore + 10, 100), color: 'bg-apple-blue' },
                                                    { label: 'Chuyên môn', value: stats.avgScore, color: 'bg-emerald-500' },
                                                    { label: 'Pháp luật', value: Math.max(stats.avgScore - 5, 0), color: 'bg-orange-500' }
                                                ].map((skill, i) => (
                                                    <div key={i} className="space-y-3">
                                                        <div className="flex justify-between items-center px-1">
                                                            <span className="text-sm font-semibold text-apple-text">{skill.label}</span>
                                                            <span className="text-sm font-bold text-apple-text">{Math.round(skill.value * 10) / 10}%</span>
                                                        </div>
                                                        <div className="h-2.5 bg-apple-bg rounded-full overflow-hidden border border-apple-border p-[1px]">
                                                            <div
                                                                className={`h-full ${skill.color} rounded-full transition-all duration-1000 shadow-sm`}
                                                                style={{ width: `${skill.value}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quick Stats Grid - Now inside Overview Tab */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                                            {[
                                                { label: 'Tổng bài thi', value: stats.totalExams, icon: History, color: 'text-apple-blue', bg: 'bg-apple-blue/10' },
                                                { label: 'Điểm trung bình', value: `${stats.avgScore}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                                { label: 'Điểm cao nhất', value: `${stats.highestScore}%`, icon: Award, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                                { label: 'Tỉ lệ đạt', value: `${stats.passRate}%`, icon: Target, color: 'text-purple-600', bg: 'bg-purple-600/10' }
                                            ].map((stat, i) => (
                                                <div key={i} className="bg-apple-card rounded-2xl p-4 border border-apple-border shadow-sm hover:shadow-apple-shadow transition-all group">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                                                            <stat.icon className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg bg-apple-bg border border-apple-border text-apple-text-secondary">
                                                            THỐNG KÊ
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="text-xl font-bold text-apple-text leading-none mb-1">{stat.value}</div>
                                                        <div className="text-[10px] font-medium text-apple-text-secondary">{stat.label}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Summary Info Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-6 bg-apple-bg/50 rounded-2xl border border-apple-border flex items-center justify-between group hover:bg-white transition-all">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-apple-text-secondary uppercase tracking-widest">Tiến độ tổng hợp</p>
                                                    <p className="text-2xl font-black text-apple-text tracking-tight">{Math.round((stats.avgScore + stats.passRate) / 2)}%</p>
                                                </div>
                                                <div className="w-12 h-12 bg-apple-blue/5 rounded-2xl flex items-center justify-center text-apple-blue group-hover:scale-110 transition-transform">
                                                    <Target className="w-6 h-6" />
                                                </div>
                                            </div>
                                            <div className="p-6 bg-apple-bg/50 rounded-2xl border border-apple-border flex items-center justify-between group hover:bg-white transition-all">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-apple-text-secondary uppercase tracking-widest">Thứ hạng cộng đồng</p>
                                                    <p className="text-2xl font-black text-apple-text tracking-tight">#{Math.floor(Math.random() * 100) + 1}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-orange-500/5 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                                    <Medal className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detailed Practice History (PC Only) */}
                                        <div className="hidden md:block space-y-4 pt-4 border-t border-apple-border/50">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-apple-blue/10 text-apple-blue rounded-xl flex items-center justify-center">
                                                    <BookOpen className="w-4 h-4" />
                                                </div>
                                                <h4 className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-[0.2em]">Lịch sử Ôn tập chi tiết</h4>
                                            </div>

                                            {practiceSummary.length === 0 ? (
                                                <div className="bg-apple-card rounded-2xl p-10 border border-apple-border text-center text-apple-text-secondary border-dashed">
                                                    <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                                    <p className="text-sm font-medium">Bắt đầu ôn tập để theo dõi lịch sử chi tiết tại đây.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-4">
                                                    {practiceSummary.map((item, idx) => (
                                                        <div key={idx} className="bg-apple-card rounded-2xl p-5 border border-apple-border shadow-sm hover:shadow-apple-shadow transition-all group">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className="space-y-1.5 flex-1 pr-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <h5 className="font-bold text-apple-text text-[15px]">{item.category}</h5>
                                                                        <span className="px-2 py-0.5 bg-apple-bg border border-apple-border text-[9px] font-bold text-apple-text-secondary rounded-lg uppercase">
                                                                            Chuyên ngành
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-[10px] font-bold text-apple-text-secondary uppercase tracking-wider">
                                                                        <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Đúng: {item.correct}</span>
                                                                        <span className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5 text-red-500" /> Sai: {item.wrong}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right shrink-0">
                                                                    <div className="text-[15px] font-black text-apple-blue leading-none">{Math.round((item.learned / item.total) * 100)}%</div>
                                                                    <div className="text-[9px] font-black text-apple-text-secondary opacity-30 uppercase tracking-tighter">Tiến độ</div>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-4 gap-3 mb-5">
                                                                <div className="p-3 bg-apple-bg/30 rounded-xl border border-apple-border text-center group-hover:bg-white transition-colors">
                                                                    <p className="text-[9px] font-black text-apple-text-secondary uppercase mb-1 opacity-50">Đã học</p>
                                                                    <p className="text-[15px] font-black text-apple-text">{item.learned}</p>
                                                                </div>
                                                                <div className="p-3 bg-apple-bg/30 rounded-xl border border-apple-border text-center group-hover:bg-white transition-colors">
                                                                    <p className="text-[9px] font-black text-apple-text-secondary uppercase mb-1 opacity-50">Chưa học</p>
                                                                    <p className="text-[15px] font-black text-apple-text">{item.notLearned}</p>
                                                                </div>
                                                                <div className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100 text-center group-hover:bg-emerald-50 transition-colors">
                                                                    <p className="text-[9px] font-black text-emerald-600 uppercase mb-1 opacity-60">Số câu đúng</p>
                                                                    <p className="text-[15px] font-black text-emerald-600">{item.correct}</p>
                                                                </div>
                                                                <div className="p-3 bg-red-50/30 rounded-xl border border-red-100 text-center group-hover:bg-red-50 transition-colors">
                                                                    <p className="text-[9px] font-black text-red-600 uppercase mb-1 opacity-60">Số câu sai</p>
                                                                    <p className="text-[15px] font-black text-red-600">{item.wrong}</p>
                                                                </div>
                                                            </div>

                                                            <div className="h-2 bg-apple-bg rounded-full overflow-hidden border border-apple-border p-[1px] shadow-inner">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-apple-blue to-blue-400 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,102,255,0.3)]"
                                                                    style={{ width: `${Math.round((item.learned / item.total) * 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* Other Tabs Content (History, Wrong, Feedback) - Same styling refinements applied */}
                                {activeTab === 'history' && (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div>
                                            <h2 className="text-lg md:text-xl font-bold text-apple-text mb-1">Lịch sử bài thi</h2>
                                            <p className="text-apple-text-secondary font-medium text-[10px] md:text-xs">Theo dõi chi tiết điểm số của bạn qua từng giai đoạn.</p>
                                        </div>

                                        {examHistory.length === 0 ? (
                                            <div className="text-center py-12 md:py-20 bg-apple-bg/30 rounded-2xl border-2 border-dashed border-apple-border">
                                                <div className="w-16 h-16 md:w-20 md:h-20 bg-apple-card rounded-2xl flex items-center justify-center mx-auto text-apple-border shadow-sm border border-apple-border mb-4 md:mb-6">
                                                    <FileText className="w-8 h-8 md:w-10 md:h-10" />
                                                </div>
                                                <div className="space-y-1 md:space-y-2">
                                                    <p className="text-apple-text font-bold text-base md:text-lg">Trống</p>
                                                    <p className="text-apple-text-secondary font-medium text-xs md:text-sm max-w-[200px] md:max-w-[240px] mx-auto">Bạn chưa thực hiện bài thi thử nào.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {examHistory.slice(0, 10).map((exam, idx) => {
                                                    const isExpanded = expandedExam === exam.id
                                                    return (
                                                        <div key={idx} className="flex flex-col p-3 md:p-4 bg-apple-bg/50 rounded-2xl border border-apple-border hover:border-apple-blue transition-all">
                                                            <div
                                                                className="flex items-center justify-between cursor-pointer group"
                                                                onClick={() => setExpandedExam(isExpanded ? null : exam.id)}
                                                            >
                                                                <div className="flex items-center gap-3 md:gap-5 min-w-0">
                                                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${exam.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                                        {exam.passed ? <CheckCircle className="w-5 h-5 md:w-6 md:h-6" /> : <XCircle className="w-5 h-5 md:w-6 md:h-6" />}
                                                                    </div>
                                                                    <div className="space-y-0.5 min-w-0">
                                                                        <div className="font-bold text-apple-text text-[13px] md:text-sm flex items-center gap-2">
                                                                            <span className="truncate">{exam.chuyen_nganh || 'Bài thi sát hạch'}</span>
                                                                            {idx === 0 && <span className="shrink-0 px-1.5 py-0.5 bg-emerald-500 text-[7px] md:text-[8px] text-white rounded font-bold tracking-widest uppercase">Mới</span>}
                                                                        </div>
                                                                        <div className="text-[9px] md:text-[10px] text-apple-text-secondary font-bold flex items-center gap-2 md:gap-3">
                                                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-apple-blue" /> {new Date(exam.created_at).toLocaleDateString('vi-VN')}</span>
                                                                            <span className="w-1 h-1 bg-apple-border rounded-full" />
                                                                            <span className="tracking-tighter">{exam.hang || 'Hạng III'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3 md:gap-6 shrink-0">
                                                                    <div className="text-right">
                                                                        <div className={`text-base md:text-xl font-bold ${exam.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                            {exam.score}/30
                                                                        </div>
                                                                        <div className={`hidden sm:block text-[8px] font-bold tracking-widest ${exam.passed ? 'text-emerald-500/50' : 'text-red-400/50'}`}>
                                                                            {exam.passed ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                                                                        </div>
                                                                    </div>
                                                                    <ChevronDown className={`w-4 h-4 md:w-5 h-5 text-apple-text-secondary transition-transform ${isExpanded ? 'rotate-180 text-apple-blue' : ''}`} />
                                                                </div>
                                                            </div>

                                                            {/* Detailed Breakdown */}
                                                            {isExpanded && (
                                                                <div className="mt-4 pt-4 border-t border-apple-border grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300">
                                                                    <div className="bg-apple-card p-4 rounded-xl border border-apple-border shadow-sm">
                                                                        <p className="text-[9px] md:text-[10px] font-bold text-apple-text-secondary tracking-widest mb-2 uppercase">Cấu trúc điểm</p>
                                                                        <div className="flex flex-col gap-2">
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span className="text-apple-text-secondary font-medium">Pháp luật:</span>
                                                                                <span className={`font-bold ${exam.law_correct >= 7 ? 'text-emerald-500' : 'text-red-500'}`}>{exam.law_correct}/10</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span className="text-apple-text-secondary font-medium">Chuyên môn:</span>
                                                                                <span className="font-bold text-apple-blue">{exam.specialist_correct}/20</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-apple-card p-4 rounded-xl border border-apple-border shadow-sm flex flex-col justify-center">
                                                                        <p className="text-[9px] md:text-[10px] font-bold text-apple-text-secondary tracking-widest mb-1 uppercase">Thời gian</p>
                                                                        <div className="flex items-center gap-2">
                                                                            <Clock className="w-4 h-4 text-orange-500" />
                                                                            <span className="text-base md:text-lg font-bold text-apple-text">
                                                                                {Math.floor(exam.time_taken / 60)}:{String(exam.time_taken % 60).padStart(2, '0')}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex flex-col gap-2">
                                                                        <Link
                                                                            href={`/thi-thu/${encodeURIComponent(exam.chuyen_nganh)}?retake=${exam.id}&hang=${encodeURIComponent(exam.hang)}`}
                                                                            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2.5 font-bold text-[10px] md:text-xs uppercase transition-all shadow-sm active:scale-95"
                                                                        >
                                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                                            Thi lại
                                                                        </Link>
                                                                        {exam.passed && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    if (!exam.is_public) handleShareResult(exam.id)
                                                                                }}
                                                                                disabled={sharingId === exam.id || exam.is_public}
                                                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[10px] md:text-xs transition-all active:scale-95 ${exam.is_public
                                                                                    ? 'bg-apple-blue/10 text-apple-blue border border-apple-blue/20'
                                                                                    : 'bg-apple-blue text-white hover:bg-blue-600 disabled:opacity-50 shadow-sm'
                                                                                    }`}
                                                                            >
                                                                                {sharingId === exam.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                                                                                {exam.is_public ? 'ĐÃ CHIA SẺ' : 'CHIA SẺ'}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'wrong' && (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-lg md:text-xl font-bold text-apple-text mb-1">Cần củng cố</h2>
                                                <p className="text-apple-text-secondary font-medium text-[10px] md:text-xs">Phân tích {wrongQuestions.length} câu hỏi bạn đã làm sai.</p>
                                            </div>
                                            <div className="px-2.5 py-1 bg-red-500/10 text-red-500 rounded-lg font-bold text-[10px] tracking-tight border border-red-500/10">
                                                {wrongQuestions.length} Câu
                                            </div>
                                        </div>

                                        {wrongQuestions.length === 0 ? (
                                            <div className="text-center py-12 md:py-20 bg-emerald-500/5 rounded-2xl border-2 border-dashed border-emerald-500/20">
                                                <div className="w-16 h-16 md:w-20 md:h-20 bg-apple-card rounded-2xl flex items-center justify-center mx-auto text-emerald-500 shadow-sm border border-apple-border mb-4 md:mb-6">
                                                    <CheckCircle className="w-8 h-8 md:w-10 md:h-10" />
                                                </div>
                                                <p className="text-apple-text font-bold text-base md:text-lg">Tuyệt vời!</p>
                                                <p className="text-apple-text-secondary font-medium text-xs md:text-sm">Bạn không có câu hỏi sai nào cần xử lý.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="p-5 md:p-8 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-lg shadow-red-500/20">
                                                    <div className="absolute top-0 right-0 p-2 opacity-10" style={{ transform: 'rotate(15deg)' }}>
                                                        <AlertTriangle className="w-32 h-32 text-white" />
                                                    </div>
                                                    <div className="relative z-10 flex items-center gap-4 md:gap-5">
                                                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shrink-0 border border-white/20">
                                                            <Target className="w-7 h-7" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-white font-bold text-lg md:text-xl leading-tight">Ôn tập cấp tốc</p>
                                                            <p className="text-white/70 font-medium text-[10px] md:text-xs">Tập trung sửa các lỗi sai thường gặp.</p>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href="/on-tap?mode=wrong"
                                                        className="relative z-10 px-6 md:px-8 py-3 bg-white text-red-600 rounded-xl font-bold text-xs tracking-tight hover:bg-apple-bg transition-all active:scale-95"
                                                    >
                                                        Học ngay
                                                    </Link>
                                                </div>

                                                <div className="space-y-3">
                                                    {groupedWrongQuestions.map((group, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 md:p-4 bg-apple-bg/50 rounded-2xl border border-apple-border shadow-sm hover:border-red-500/30 transition-all">
                                                            <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                                                <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 font-bold text-xs shrink-0">
                                                                    {group.count}
                                                                </div>
                                                                <div className="space-y-0.5 min-w-0">
                                                                    <div className="font-bold text-apple-text text-[13px] md:text-sm truncate max-w-[150px] sm:max-w-md">
                                                                        {group.examName}
                                                                    </div>
                                                                    <div className="text-[9px] md:text-[10px] text-apple-text-secondary font-bold flex items-center gap-2">
                                                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(group.date).toLocaleDateString('vi-VN')}</span>
                                                                        <span className="w-1 h-1 bg-apple-border rounded-full" />
                                                                        <span className="truncate">{group.hang}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Link
                                                                href={`/on-tap?mode=exam_review&resultId=${group.resultId}`}
                                                                className="px-3 md:px-4 py-2 bg-apple-text text-apple-bg rounded-xl font-bold text-[9px] md:text-[10px] tracking-tight hover:bg-red-500 hover:text-white transition-all whitespace-nowrap active:scale-95"
                                                            >
                                                                Xem lại
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'profile' && profile && (
                                    <div className="space-y-8 animate-in fade-in duration-500">
                                        <div className="flex items-center justify-between border-b border-apple-border pb-6">
                                            <div>
                                                <h2 className="text-xl font-bold text-apple-text mb-1">Hồ sơ cá nhân</h2>
                                                <p className="text-apple-text-secondary font-medium text-xs">Quản lý và cập nhật thông tin liên hệ của bạn.</p>
                                            </div>
                                            {!isEditing ? (
                                                <button
                                                    onClick={handleEditToggle}
                                                    className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-all flex items-center gap-2 border border-blue-100/50 shadow-sm"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                    Chỉnh sửa hồ sơ
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={handleSaveProfile}
                                                        disabled={isSavingProfile}
                                                        className="px-5 py-2.5 bg-apple-blue text-white rounded-xl font-bold text-xs hover:bg-apple-blue/90 transition-all flex items-center gap-2 shadow-lg shadow-apple-blue/20 disabled:bg-apple-border disabled:shadow-none"
                                                    >
                                                        {isSavingProfile ? (
                                                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        ) : (
                                                            <Save className="w-3.5 h-3.5" />
                                                        )}
                                                        {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                                                    </button>
                                                    <button
                                                        onClick={handleEditToggle}
                                                        disabled={isSavingProfile}
                                                        className="px-5 py-2.5 bg-apple-bg text-apple-text-secondary rounded-xl font-bold text-xs hover:bg-apple-border transition-all border border-apple-border disabled:opacity-50"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Professional Contact Info Grid - Now inside Profile */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { icon: Phone, label: 'Điện thoại', value: profile?.phone || 'Chưa cập nhật' },
                                                { icon: Mail, label: 'Email', value: profile?.email || 'Chưa cập nhật' },
                                                { icon: Briefcase, label: 'Công việc', value: profile?.job_title || 'Chưa cập nhật' }
                                            ].map((item, i) => (
                                                <div key={i} className="p-4 bg-apple-bg/50 rounded-2xl border border-apple-border flex items-center gap-4 transition-all hover:border-apple-blue/30">
                                                    <div className="w-10 h-10 bg-apple-card rounded-xl flex items-center justify-center text-apple-blue border border-apple-border shadow-sm">
                                                        <item.icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-[10px] font-bold text-apple-text-secondary uppercase tracking-widest mb-0.5">{item.label}</div>
                                                        <div className="text-xs font-bold text-apple-text truncate">{item.value}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {profileSaveSuccess && (
                                            <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="text-xs font-bold">Cập nhật hồ sơ thành công!</span>
                                            </div>
                                        )}

                                        <div className="grid lg:grid-cols-[1fr_280px] gap-10">
                                            {/* Details Grid - Sharp & Organized */}
                                            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                                                {[
                                                    { id: 'display_name', label: 'Họ và tên đầy đủ', value: profile.display_name, icon: User, placeholder: 'Họ và tên...' },
                                                    { id: 'email', label: 'Email định danh', value: profile.email, icon: Mail, readOnly: true },
                                                    { id: 'phone', label: 'Số điện thoại', value: profile.phone, icon: Phone, placeholder: '09xx xxx xxx' },
                                                    { id: 'job_title', label: 'Nghề nghiệp / Chức danh', value: profile.job_title, icon: Briefcase, placeholder: 'Vị trí công tác...' },
                                                    { id: 'company', label: 'Tên công ty / Cơ quan', value: profile.company, icon: LayoutGrid, placeholder: 'Nơi làm việc...' },
                                                    { id: 'address', label: 'Địa chỉ liên hệ', value: profile.address, icon: FileText, placeholder: 'Địa chỉ...' }
                                                ].map((field) => (
                                                    <div key={field.id} className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-apple-text-secondary tracking-widest px-1">
                                                            {field.label}
                                                        </label>
                                                        {isEditing && !field.readOnly ? (
                                                            <div className="relative group">
                                                                <input
                                                                    type="text"
                                                                    value={(editForm as any)[field.id]}
                                                                    onChange={(e) => setEditForm({ ...editForm, [field.id]: e.target.value })}
                                                                    className="w-full px-4 py-2.5 bg-apple-bg border border-apple-border rounded-xl focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue transition-all outline-none font-bold text-apple-text text-sm"
                                                                    placeholder={field.placeholder}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="px-4 py-2.5 bg-apple-bg border border-apple-border rounded-xl text-apple-text font-bold min-h-[42px] flex items-center text-sm shadow-sm">
                                                                {field.value || 'Chưa cập nhật'}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Achievements Sidebar - High-end Document Style */}
                                            <div className="space-y-6">
                                                <div className="bg-apple-bg/30 p-6 rounded-2xl border border-apple-border shadow-sm">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="w-8 h-8 bg-apple-blue text-white rounded-lg flex items-center justify-center shadow-lg shadow-apple-blue/20">
                                                            <Award className="w-4 h-4" />
                                                        </div>
                                                        <h3 className="text-[10px] font-bold text-apple-text tracking-widest">Thành tựu</h3>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {[
                                                            { label: 'Bronze', color: 'text-orange-400', achieved: stats.totalExams >= 5 },
                                                            { label: 'Silver', color: 'text-slate-400', achieved: stats.avgScore >= 60 },
                                                            { label: 'Gold', color: 'text-yellow-400', achieved: stats.avgScore >= 80 },
                                                            { label: 'Master', color: 'text-purple-400', achieved: badges.stars === 5 }
                                                        ].map((medal, i) => (
                                                            <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${medal.achieved ? 'bg-apple-card border-apple-blue/30' : 'bg-transparent border-apple-border opacity-40'}`}>
                                                                <div className="flex items-center gap-3">
                                                                    <Medal className={`w-4 h-4 ${medal.color}`} />
                                                                    <span className="text-[10px] font-black uppercase text-apple-text-secondary tracking-tight">{medal.label}</span>
                                                                </div>
                                                                {medal.achieved && <div className="w-1.5 h-1.5 bg-apple-blue rounded-full shadow-[0_0_8px_rgba(0,102,255,0.5)]" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div className="space-y-8 animate-in fade-in duration-500">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold text-apple-text tracking-tight mb-1">Cài đặt</h2>
                                                <p className="text-apple-text-secondary font-medium text-[11px] uppercase tracking-[0.15em]">Cá nhân hóa ứng dụng của bạn</p>
                                            </div>
                                            <div className="w-10 h-10 bg-apple-card text-apple-text rounded-2xl flex items-center justify-center shadow-apple-shadow border border-apple-border">
                                                <Settings className="w-5 h-5 opacity-80" />
                                            </div>
                                        </div>

                                        <div className="grid gap-8">
                                            {/* Group: Study Configuration (macOS style grouped rows) */}
                                            <div className="space-y-3">
                                                <h3 className="text-[11px] font-semibold text-apple-text-secondary uppercase tracking-[0.15em] px-1">Thiết lập Ôn tập</h3>
                                                <div className="bg-apple-card rounded-2xl border border-apple-border overflow-hidden divide-y divide-apple-border shadow-apple-shadow">
                                                    {/* Rank Preference Row */}
                                                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-orange-muted text-orange-text rounded-2xl flex items-center justify-center border border-orange-soft">
                                                                <Target className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[15px] font-semibold text-apple-text">Hạng mục thi</p>
                                                                <p className="text-[12px] text-apple-text-secondary font-medium">Hạng mục ưu tiên khi vào bài thi</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                                                            {['Hạng I', 'Hạng II', 'Hạng III'].map(rank => (
                                                                <button
                                                                    key={rank}
                                                                    onClick={() => setPreferences({ ...preferences, rank })}
                                                                    className={`px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all border ${preferences.rank === rank
                                                                        ? 'bg-apple-text border-apple-text text-apple-bg shadow-md'
                                                                        : 'bg-apple-bg border-apple-border text-apple-text-secondary hover:border-apple-text-secondary active:scale-[0.98]'
                                                                        }`}
                                                                >
                                                                    {rank}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Specialty Row */}
                                                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-apple-blue/10 text-apple-blue rounded-2xl flex items-center justify-center border border-apple-blue/10">
                                                                <Briefcase className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[15px] font-semibold text-apple-text">Chuyên ngành mặc định</p>
                                                                <p className="text-[12px] text-apple-text-secondary font-medium">Lĩnh vực ưu tiên ôn luyện</p>
                                                            </div>
                                                        </div>
                                                        <div className="relative group w-full sm:w-auto">
                                                            <select
                                                                value={preferences.specialty}
                                                                onChange={(e) => setPreferences({ ...preferences, specialty: e.target.value })}
                                                                className="w-full sm:w-[240px] px-4 py-3 bg-apple-bg border border-apple-border rounded-xl focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue transition-all outline-none font-semibold text-apple-text text-[13px] appearance-none cursor-pointer"
                                                            >
                                                                {[
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
                                                                    'Thiết kế cơ - điện công trình - Hệ hệ thống thông gió - cấp thoát nhiệt',
                                                                    'Giám sát công tác xây dựng công trình',
                                                                    'Giám sát công tác lắp đặt thiết bị công trình',
                                                                    'Định giá xây dựng',
                                                                    'Quản lý dự án đầu tư xây dựng'
                                                                ].map(opt => (
                                                                    <option key={opt} value={opt} className="bg-apple-card">{opt}</option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-apple-text-secondary">
                                                                <ChevronRight className="w-4 h-4 rotate-90" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Group: Personalization */}
                                            <div className="space-y-3">
                                                <h3 className="text-[11px] font-semibold text-apple-text-secondary uppercase tracking-[0.15em] px-1">Cá nhân hóa</h3>
                                                <div className="bg-apple-card rounded-2xl border border-apple-border overflow-hidden divide-y divide-apple-border shadow-apple-shadow">
                                                    <div className="p-5 flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-500/10">
                                                                {preferences.theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-[15px] font-semibold text-apple-text leading-tight">Giao diện (Dark Mode)</p>
                                                                <p className="text-[12px] text-apple-text-secondary font-medium">Chuyển đổi giữa chế độ sáng và tối</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setPreferences({ ...preferences, theme: preferences.theme === 'light' ? 'dark' : 'light' })}
                                                            className={`w-12 h-7 rounded-full relative transition-all duration-300 ${preferences.theme === 'light' ? 'bg-apple-border' : 'bg-apple-blue'}`}
                                                        >
                                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${preferences.theme === 'light' ? 'left-1' : 'left-6'}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        <div className="flex items-center justify-end pt-6 border-t border-apple-border mt-2">
                                            <button
                                                onClick={handleSaveSettings}
                                                disabled={isSavingProfile}
                                                className="px-8 py-3.5 bg-apple-text text-apple-bg rounded-2xl font-bold text-[12px] uppercase tracking-wider shadow-xl hover:bg-apple-blue hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2.5"
                                            >
                                                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Lưu thiết lập
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                url="https://ltccxd.com"
                title="Luyện thi Chứng chỉ hành nghề Xây dựng"
            />

            {/* Shortcut Modal */}
            <ShortcutModal
                isOpen={showShortcutModal}
                onClose={() => setShowShortcutModal(false)}
            />

            {/* App Feedback Modal */}
            <AppFeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                user={profile}
            />
        </>
    )
}
