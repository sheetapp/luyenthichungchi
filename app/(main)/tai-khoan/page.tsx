'use client'

import { useState, useEffect } from 'react'
import {
    User, Mail, Phone, Briefcase, UserCircle, Edit2, Save, X,
    History, TrendingUp, Award, AlertTriangle, MessageSquare,
    LogOut, ChevronRight, Calendar, CheckCircle, XCircle,
    FileText, Send, Target, LayoutDashboard, ShieldCheck,
    Share2, Loader2, RotateCcw, ChevronDown, Clock, Settings, Star, Sparkles,
    Moon, Sun, Medal, Trophy
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WelcomePopup } from '@/components/WelcomePopup'
import { useAppStore } from '@/lib/store/useAppStore'

type TabType = 'profile' | 'history' | 'wrong' | 'feedback' | 'settings'

export default function AccountPage() {
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [stats, setStats] = useState({
        totalExams: 0,
        avgScore: 0,
        highestScore: 0,
        totalWrong: 0,
        passRate: 0,
        totalAnswered: 0 // New for gamification
    })
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
    const [activeTab, setActiveTab] = useState<TabType>('profile')
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
    const [feedbackForm, setFeedbackForm] = useState({ category: 'suggestion', message: '' })
    const [submitting, setSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [profileSaveSuccess, setProfileSaveSuccess] = useState(false)
    const [profileError, setProfileError] = useState<string | null>(null)
    const [greeting, setGreeting] = useState('')
    const [sharingId, setSharingId] = useState<string | null>(null)
    const [expandedExam, setExpandedExam] = useState<string | null>(null)

    useEffect(() => {
        setMounted(true)
        const hour = new Date().getHours()
        if (hour < 12) setGreeting('buổi sáng')
        else if (hour < 18) setGreeting('buổi chiều')
        else setGreeting('buổi tối')
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

                const userProfile = profileData || { email: user.email, display_name: user.email?.split('@')[0] }
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

                // Fetch practice stats for total answered count
                const { data: practiceData } = await supabase
                    .from('user_practice_stats')
                    .select('history')
                    .eq('user_id', user.id)
                    .single()

                let answeredCount = 0
                if (practiceData?.history) {
                    answeredCount = Object.keys(practiceData.history).length
                }

                // Calculate Badges & Stars based on precision (avgScore)
                // stats.avgScore is available here as 'avg' from line 125
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

    const handleSubmitFeedback = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !feedbackForm.message.trim()) return

        setSubmitting(true)
        const { error } = await supabase
            .from('user_feedback')
            .insert({
                user_id: user.id,
                category: feedbackForm.category,
                message: feedbackForm.message,
                created_at: new Date().toISOString()
            })

        setSubmitting(false)
        if (!error) {
            setSubmitSuccess(true)
            setFeedbackForm({ category: 'suggestion', message: '' })
            setTimeout(() => setSubmitSuccess(false), 3000)
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

            alert('✅ Kết quả đã được chia sẻ lên bảng xếp hạng!')
        } catch (error: any) {
            console.error('Error sharing result:', error)
            alert('❌ Có lỗi khi chia sẻ kết quả: ' + error.message)
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

    const menuItems = [
        { id: 'profile' as TabType, label: 'Thông tin cá nhân', icon: User },
        { id: 'history' as TabType, label: 'Lịch sử thi thử', icon: History },
        { id: 'wrong' as TabType, label: 'Câu hỏi đã làm sai', icon: AlertTriangle },
        { id: 'settings' as TabType, label: 'Cài đặt', icon: Settings },
        { id: 'feedback' as TabType, label: 'Góp ý & Phản hồi', icon: MessageSquare }
    ]

    return (
        <>
            {showWelcome && profile && (
                <WelcomePopup
                    userName={profile.display_name || profile.email?.split('@')[0] || 'bạn'}
                    onClose={handleCloseWelcome}
                />
            )}

            <div className="px-4 md:px-6 py-4 md:py-6 space-y-6 md:space-y-8 min-h-screen bg-apple-bg pb-20 md:pb-6">
                {/* Header Greeting - Standardized style */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-apple-text tracking-tight">
                        Tài khoản
                    </h1>
                    <p className="text-xs md:text-sm text-apple-text-secondary font-medium">
                        Quản lý hồ sơ và theo dõi lịch sử thi thử của bạn.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 md:gap-8 items-stretch">
                    {/* CV-Style Left Sidebar - High Contrast & Professional */}
                    <div className="bg-apple-card rounded-2xl overflow-hidden shadow-sm md:shadow-apple-shadow flex flex-col border border-apple-border font-sans">
                        {/* Header Section - Theme Aware with glass effect */}
                        <div className="pt-8 md:pt-12 pb-6 md:pb-8 px-6 md:px-8 text-center bg-gradient-to-br from-apple-blue/10 to-transparent border-b border-apple-border">
                            <div className="relative inline-block mb-4 md:mb-6">
                                <div className="w-24 h-24 md:w-36 md:h-36 rounded-2xl border-4 border-apple-card shadow-apple-shadow overflow-hidden mx-auto bg-apple-bg flex items-center justify-center">
                                    {profile?.avata ? (
                                        <img src={profile.avata} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-apple-blue to-[#0051FF] text-white text-3xl md:text-4xl font-bold">
                                            {profile?.display_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Professional Star Rating Shelf */}
                            <div className="flex flex-col items-center gap-4 md:gap-5">
                                <div className="flex items-center gap-1 px-4 md:px-6 py-1.5 md:py-2.5 bg-apple-bg/50 backdrop-blur-xl rounded-xl border border-apple-border shadow-sm">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-all duration-700 ${i < badges.stars
                                                ? 'fill-yellow-400 text-yellow-400 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                                                : 'text-apple-text-secondary/20 fill-apple-text-secondary/10 stroke-[1.5px]'
                                                }`}
                                        />
                                    ))}
                                </div>

                                <div className="space-y-1.5 md:space-y-2">
                                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-apple-text leading-none">
                                        {profile?.display_name || 'Học viên'}
                                    </h3>
                                    <div className="inline-flex items-center px-3 py-1 bg-apple-blue text-white rounded-lg text-[9px] md:text-[10px] font-bold shadow-lg shadow-apple-blue/20">
                                        {badges.level}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* White Info Section - MAXIMUM Contrast Typography */}
                        <div className="flex-1 p-5 md:p-6 space-y-6 md:space-y-8 bg-apple-card">
                            {/* CONTACT section */}
                            <div className="space-y-4 md:space-y-5">
                                <div className="flex items-center gap-2 border-b border-apple-border pb-2">
                                    <Mail className="w-4 h-4 text-apple-blue" />
                                    <h4 className="text-[10px] md:text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest">Liên hệ</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-3 md:gap-4 md:px-1">
                                    {[
                                        { icon: Phone, label: profile?.phone || 'Chưa cập nhật' },
                                        { icon: Mail, label: profile?.email || 'user@example.com' },
                                        { icon: Briefcase, label: profile?.job_title || 'Chưa cập nhật' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-apple-text group">
                                            <div className="w-8 h-8 md:w-9 md:h-9 bg-apple-bg rounded-xl flex items-center justify-center text-apple-text-secondary group-hover:bg-apple-blue/10 group-hover:text-apple-blue transition-all shadow-sm border border-apple-border">
                                                <item.icon className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-[11px] md:text-[12px] font-bold tracking-tight truncate">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PROGRESS section */}
                            <div className="space-y-4 md:space-y-5">
                                <div className="flex items-center gap-2 border-b border-apple-border pb-2">
                                    <TrendingUp className="w-4 h-4 text-apple-blue" />
                                    <h4 className="text-[10px] md:text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest">Tiến độ</h4>
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

                            {/* NAVIGATION */}
                            <div className="space-y-4 md:space-y-5 pt-2 md:pt-4">
                                <div className="flex items-center gap-2 border-b border-apple-border pb-2">
                                    <LayoutDashboard className="w-4 h-4 text-apple-blue" />
                                    <h4 className="text-[10px] md:text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest">Danh mục</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-1.5 md:gap-2">
                                    {menuItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setActiveTab(item.id);
                                                if (window.innerWidth < 1024) {
                                                    const el = document.getElementById('tab-content');
                                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl transition-all text-[11px] font-bold border active:scale-95 ${activeTab === item.id
                                                ? 'bg-apple-blue border-apple-blue text-white shadow-md'
                                                : 'bg-transparent border-transparent text-apple-text-secondary hover:bg-apple-bg'
                                                }`}
                                        >
                                            <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-white' : 'text-apple-text-secondary'}`} />
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer - Solid Action */}
                        <div className="p-5 md:p-6 bg-apple-bg/30 border-t border-apple-border mt-auto">
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
                        {/* Quick Stats Grid - Sharp & Minimalist */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                            {[
                                { label: 'Tổng bài thi', value: stats.totalExams, icon: History, color: 'text-apple-blue', badge: 'TOTAL', bg: 'bg-apple-blue/10' },
                                { label: 'Điểm trung bình', value: `${stats.avgScore}%`, icon: TrendingUp, color: 'text-emerald-500', badge: 'AVG', bg: 'bg-emerald-500/10' },
                                { label: 'Điểm cao nhất', value: `${stats.highestScore}%`, icon: Award, color: 'text-orange-500', badge: 'BEST', bg: 'bg-orange-500/10' },
                                { label: 'Tỉ lệ đạt', value: `${stats.passRate}%`, icon: Target, color: 'text-purple-600', badge: 'RATE', bg: 'bg-purple-600/10' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-apple-card rounded-2xl p-3 md:p-4 border border-apple-border shadow-sm md:shadow-apple-shadow flex flex-col justify-between active:scale-[0.98] transition-all group">
                                    <div className="flex items-center justify-between mb-3 md:mb-4">
                                        <div className={`w-7 h-7 md:w-8 md:h-8 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shadow-inner`}>
                                            <stat.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        </div>
                                        <span className={`text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded-lg bg-apple-bg border border-apple-border text-apple-text-secondary tracking-tight`}>
                                            {stat.label}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-lg md:text-xl font-bold text-apple-text leading-none mb-1">{stat.value}</div>
                                        <div className="text-[9px] md:text-[10px] font-bold text-apple-text-secondary tracking-widest uppercase opacity-60">Thống kê</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Main Tab Content Card */}
                        <div id="tab-content" className="flex-1 bg-apple-card rounded-2xl border border-apple-border shadow-sm md:shadow-apple-shadow overflow-hidden">
                            <div className="p-4 md:p-6">
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
                                        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900 mb-1">Thông tin chi tiết</h2>
                                                <p className="text-slate-400 font-medium text-xs">Cập nhật hồ sơ cá nhân để quản lý tiến độ tốt hơn.</p>
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
                                                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 disabled:bg-slate-200 disabled:shadow-none"
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
                                                        className="px-5 py-2.5 bg-slate-50 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all border border-slate-100 disabled:opacity-50"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            )}
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
                                                    { id: 'company', label: 'Tên công ty / Cơ quan', value: profile.company, icon: LayoutDashboard, placeholder: 'Nơi làm việc...' },
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
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-black text-slate-900 mb-0.5">Cài đặt</h2>
                                                <p className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Cá nhân hóa ứng dụng của bạn</p>
                                            </div>
                                            <div className="w-9 h-9 bg-slate-100 text-slate-900 rounded-lg flex items-center justify-center shadow-sm border border-slate-200">
                                                <Settings className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <div className="grid gap-6">
                                            {/* Group: Study Configuration (macOS style grouped rows) */}
                                            <div className="space-y-2">
                                                <h3 className="text-[10px] font-black text-apple-text-secondary uppercase tracking-[0.2em] px-1">Thiết lập Ôn tập</h3>
                                                <div className="bg-apple-bg rounded-2xl border border-apple-border overflow-hidden divide-y divide-apple-border shadow-sm">
                                                    {/* Rank Preference Row */}
                                                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-orange-muted text-orange-text rounded-xl flex items-center justify-center border border-orange-500/10">
                                                                <Target className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-apple-text">Hạng mục thi</p>
                                                                <p className="text-[10px] text-apple-text-secondary font-medium whitespace-nowrap">Hạng mục ưu tiên khi vào bài thi</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                                                            {['Hạng I', 'Hạng II', 'Hạng III'].map(rank => (
                                                                <button
                                                                    key={rank}
                                                                    onClick={() => setPreferences({ ...preferences, rank })}
                                                                    className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all border ${preferences.rank === rank
                                                                        ? 'bg-apple-text border-apple-text text-apple-bg'
                                                                        : 'bg-apple-card border-apple-border text-apple-text-secondary hover:border-apple-text-secondary'
                                                                        }`}
                                                                >
                                                                    {rank}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Specialty Row */}
                                                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-apple-blue/10 text-apple-blue rounded-xl flex items-center justify-center border border-apple-blue/10">
                                                                <Briefcase className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-apple-text">Chuyên ngành mặc định</p>
                                                                <p className="text-[10px] text-apple-text-secondary font-medium">Lĩnh vực ưu tiên ôn luyện</p>
                                                            </div>
                                                        </div>
                                                        <select
                                                            value={preferences.specialty}
                                                            onChange={(e) => setPreferences({ ...preferences, specialty: e.target.value })}
                                                            className="px-4 py-2 bg-apple-card border border-apple-border rounded-xl focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue transition-all outline-none font-bold text-apple-text text-[11px] max-w-[200px] appearance-none"
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
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Group: Personalization */}
                                            <div className="space-y-2">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Cá nhân hóa</h3>
                                                <div className="bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                                                    <div className="p-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                                                                {preferences.theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-slate-900 leading-tight">Giao diện (Dark Mode)</p>
                                                                <p className="text-[10px] text-slate-400 font-medium">Chuyển đổi giữa chế độ sáng và tối</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setPreferences({ ...preferences, theme: preferences.theme === 'light' ? 'dark' : 'light' })}
                                                            className={`w-11 h-6 rounded-full relative transition-all duration-300 border ${preferences.theme === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-blue-600 border-blue-700'}`}
                                                        >
                                                            <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all duration-300 ${preferences.theme === 'light' ? 'left-0.5' : 'left-5.5'}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Group: Account Progress (Only Star Progress) */}
                                            <div className="space-y-2">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Tiến trình tài khoản</h3>
                                                <div className="p-6 bg-slate-900 text-white rounded-xl relative overflow-hidden group border border-white/5">
                                                    <Star className="absolute -top-4 -right-4 w-32 h-32 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                                                    <div className="relative z-10 flex flex-col gap-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                                                                    <Trophy className="w-5 h-5 text-yellow-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-lg font-black leading-tight">Cấp độ {badges.stars + 1}</p>
                                                                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{badges.level}</p>
                                                                </div>
                                                            </div>
                                                            <span className="px-2 py-1 bg-white/10 rounded-md text-[8px] font-black uppercase tracking-widest">Graduation</span>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-end">
                                                                <p className="text-[10px] font-bold text-white/60">Độ chính xác hiện tại</p>
                                                                <p className="text-[10px] font-black text-blue-400">{stats.avgScore}%</p>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                                    style={{ width: `${Math.min(stats.avgScore, 100)}%` }}
                                                                />
                                                            </div>
                                                            <p className="text-[9px] font-medium text-white/40 italic">Đạt 80% độ chính xác để nâng hạng Chuyên gia</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-apple-border">
                                            <div className="flex items-center gap-2 text-emerald-text">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Trạng thái: An toàn</span>
                                            </div>
                                            <button
                                                onClick={handleSaveSettings}
                                                disabled={isSavingProfile}
                                                className="px-6 py-2.5 bg-apple-text text-apple-bg rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-apple-blue hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {isSavingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
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
        </>
    )
}
