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

            <div className="px-6 py-6 space-y-8">
                {/* Header Greeting - Standardized style */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Quản lý tài khoản
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Xem và cập nhật thông tin cá nhân, theo dõi kết quả thi của bạn.
                    </p>
                </div>

                <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-stretch">
                    {/* CV-Style Left Sidebar - High Contrast & Professional */}
                    <div className="bg-white rounded-xl overflow-hidden shadow-xl flex flex-col border border-slate-200 font-sans">
                        {/* Header Section - Deep Navy for Authority */}
                        <div className="pt-12 pb-8 px-8 text-center bg-[#1e293b] text-white">
                            <div className="relative inline-block mb-6">
                                <div className="w-36 h-36 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden mx-auto bg-slate-800 flex items-center justify-center">
                                    {profile?.avata ? (
                                        <img src={profile.avata} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-4xl font-black">
                                            {profile?.display_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Professional Star Rating Shelf */}
                            <div className="flex flex-col items-center gap-5">
                                <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-900/50 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 transition-all duration-700 ${i < badges.stars
                                                ? 'fill-yellow-400 text-yellow-400 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                                                : 'text-white/10 fill-white/5 stroke-[1.5px]'
                                                }`}
                                        />
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black tracking-tight drop-shadow-lg uppercase leading-none">
                                        {profile?.display_name || 'Học viên'}
                                    </h3>
                                    <div className="inline-flex items-center px-4 py-1 bg-blue-600 text-white rounded text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20">
                                        {badges.level}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* White Info Section - MAXIMUM Contrast Typography */}
                        <div className="flex-1 p-6 space-y-8 bg-white">
                            {/* CONTACT section - Deep Black Text */}
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2.5">
                                    <Mail className="w-4 h-4 text-slate-900" />
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">LIÊN HỆ</h4>
                                </div>
                                <div className="space-y-4 px-1">
                                    {[
                                        { icon: Phone, label: profile?.phone || 'Chưa cập nhật' },
                                        { icon: Mail, label: profile?.email || 'user@example.com' },
                                        { icon: Briefcase, label: profile?.job_title || 'Chưa cập nhật' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 text-slate-900 group">
                                            <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                                <item.icon className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-[12px] font-black tracking-tight truncate">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PROGRESS section - Sharp Dark Bars */}
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2.5">
                                    <TrendingUp className="w-4 h-4 text-slate-900" />
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">TIẾN ĐỘ</h4>
                                </div>
                                <div className="space-y-6 px-1">
                                    {[
                                        { label: 'Kiến thức chung', value: Math.min(stats.avgScore + 10, 100) },
                                        { label: 'Chuyên môn', value: stats.avgScore },
                                        { label: 'Pháp luật', value: Math.max(stats.avgScore - 5, 0) }
                                    ].map((skill, i) => (
                                        <div key={i} className="space-y-2.5">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-800 tracking-wider">
                                                <span>{skill.label}</span>
                                                <span className="text-slate-900 font-mono">{Math.round(skill.value * 10) / 10}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                                <div
                                                    className="h-full bg-slate-900 transition-all duration-1000 shadow-[2px_0_10px_rgba(0,0,0,0.1)]"
                                                    style={{ width: `${skill.value}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* NAVIGATION - Premium Sharp Tabs */}
                            <div className="space-y-5 pt-4">
                                <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2.5">
                                    <LayoutDashboard className="w-4 h-4 text-slate-900" />
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">DANH MỤC</h4>
                                </div>
                                <div className="space-y-1.5">
                                    {menuItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded transition-all text-[11px] font-black uppercase tracking-[0.15em] border ${activeTab === item.id
                                                ? 'bg-slate-900 border-slate-900 text-white shadow-2xl translate-x-1.5'
                                                : 'bg-transparent border-transparent text-slate-800 hover:bg-slate-100 hover:text-slate-900'
                                                }`}
                                        >
                                            <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`} />
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer - Solid Action */}
                        <div className="p-6 bg-slate-50 border-t-2 border-slate-100 mt-auto">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white border-2 border-slate-300 hover:bg-red-600 hover:border-red-600 hover:text-white text-slate-900 rounded-lg font-black text-[11px] uppercase tracking-[0.25em] shadow-sm transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                Đăng xuất
                            </button>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="flex flex-col space-y-6">
                        {/* Quick Stats Grid - Sharp & Minimalist */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Tổng bài thi', value: stats.totalExams, icon: History, color: 'text-blue-600', badge: 'TOTAL', bg: 'bg-blue-50' },
                                { label: 'Điểm trung bình', value: `${stats.avgScore}%`, icon: TrendingUp, color: 'text-emerald-600', badge: 'AVG', bg: 'bg-emerald-50' },
                                { label: 'Điểm cao nhất', value: `${stats.highestScore}%`, icon: Award, color: 'text-orange-600', badge: 'BEST', bg: 'bg-orange-50' },
                                { label: 'Tỉ lệ đạt', value: `${stats.passRate}%`, icon: Target, color: 'text-purple-600', badge: 'RATE', bg: 'bg-purple-50' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center shadow-inner`}>
                                            <stat.icon className="w-4 h-4" />
                                        </div>
                                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded bg-slate-900 text-white tracking-[0.2em]`}>
                                            {stat.badge}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-xl font-black text-[#0f172a] leading-none mb-1">{stat.value}</div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Main Tab Content Card - Matches sharp sidebar */}
                        <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6">

                                {/* Other Tabs Content (History, Wrong, Feedback) - Same styling refinements applied */}
                                {activeTab === 'history' && (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 mb-1">Lịch sử bài thi thử</h2>
                                            <p className="text-slate-400 font-medium text-xs">Theo dõi chi tiết điểm số của bạn qua từng giai đoạn.</p>
                                        </div>

                                        {examHistory.length === 0 ? (
                                            <div className="text-center py-20 bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-100">
                                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto text-slate-100 shadow-sm border border-slate-50 mb-6">
                                                    <FileText className="w-10 h-10" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-slate-900 font-black text-lg">Lịch sử đang trống</p>
                                                    <p className="text-slate-400 font-medium text-sm max-w-[240px] mx-auto">Thực hiện bài thi đầu tiên để bắt đầu ghi nhận thành tích.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {examHistory.slice(0, 10).map((exam, idx) => {
                                                    const isExpanded = expandedExam === exam.id
                                                    return (
                                                        <div key={idx} className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                                                            <div
                                                                className="flex items-center justify-between cursor-pointer group"
                                                                onClick={() => setExpandedExam(isExpanded ? null : exam.id)}
                                                            >
                                                                <div className="flex items-center gap-5">
                                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${exam.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                                        {exam.passed ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                                                    </div>
                                                                    <div className="space-y-0.5">
                                                                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                                                            {exam.chuyen_nganh || 'Bài thi sát hạch'}
                                                                            {idx === 0 && <span className="px-1.5 py-0.5 bg-green-500 text-[8px] text-white rounded font-black uppercase tracking-widest">Mới nhất</span>}
                                                                        </div>
                                                                        <div className="text-[10px] text-slate-400 font-bold flex items-center gap-3">
                                                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-400" /> {new Date(exam.created_at).toLocaleDateString('vi-VN')}</span>
                                                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                                            <span className="uppercase tracking-tighter">{exam.hang || 'Hạng III'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-6">
                                                                    <div className="text-right hidden sm:block">
                                                                        <div className={`text-xl font-black ${exam.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                                            {exam.score}/30
                                                                        </div>
                                                                        <div className={`text-[8px] font-black uppercase tracking-widest ${exam.passed ? 'text-green-500/50' : 'text-red-400/50'}`}>
                                                                            {exam.passed ? 'Đã vượt qua' : 'Chưa đạt'}
                                                                        </div>
                                                                    </div>
                                                                    <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                                                                </div>
                                                            </div>

                                                            {/* Detailed Breakdown */}
                                                            {isExpanded && (
                                                                <div className="mt-4 pt-4 border-t border-slate-100 grid md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300">
                                                                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cấu trúc điểm</p>
                                                                        <div className="flex flex-col gap-2">
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span className="text-slate-500 font-medium">Pháp luật:</span>
                                                                                <span className={`font-bold ${exam.law_correct >= 7 ? 'text-green-600' : 'text-red-600'}`}>{exam.law_correct}/10</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span className="text-slate-500 font-medium">Chuyên môn:</span>
                                                                                <span className="font-bold text-blue-600">{exam.specialist_correct}/20</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thời gian làm</p>
                                                                        <div className="flex items-center gap-2">
                                                                            <Clock className="w-4 h-4 text-orange-400" />
                                                                            <span className="text-lg font-black text-slate-700">
                                                                                {Math.floor(exam.time_taken / 60)}:{String(exam.time_taken % 60).padStart(2, '0')}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex flex-col gap-2">
                                                                        <Link
                                                                            href={`/thi-thu/${encodeURIComponent(exam.chuyen_nganh)}?retake=${exam.id}&hang=${encodeURIComponent(exam.hang)}`}
                                                                            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-sm"
                                                                        >
                                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                                            Thi lại đề này
                                                                        </Link>
                                                                        {exam.passed && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    if (!exam.is_public) handleShareResult(exam.id)
                                                                                }}
                                                                                disabled={sharingId === exam.id || exam.is_public}
                                                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${exam.is_public
                                                                                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                                                                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm'
                                                                                    }`}
                                                                            >
                                                                                {sharingId === exam.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                                                                                {exam.is_public ? 'Đã công khai' : 'Chia sẻ hạng'}
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
                                                <h2 className="text-xl font-black text-slate-900 mb-1">Kiến thức cần củng cố</h2>
                                                <p className="text-slate-400 font-medium text-xs">Phân tích {wrongQuestions.length} câu hỏi bạn đã làm sai.</p>
                                            </div>
                                            <div className="px-3 py-1 bg-red-50 text-red-600 rounded-lg font-black text-[10px] uppercase tracking-widest border border-red-100/50 shadow-sm">
                                                {wrongQuestions.length} Câu
                                            </div>
                                        </div>

                                        {wrongQuestions.length === 0 ? (
                                            <div className="text-center py-20 bg-green-50/10 rounded-3xl border-2 border-dashed border-green-50">
                                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto text-green-200 shadow-sm border border-green-50 mb-6">
                                                    <CheckCircle className="w-10 h-10" />
                                                </div>
                                                <p className="text-slate-900 font-black text-lg">Hoàn hảo!</p>
                                                <p className="text-slate-400 font-medium text-sm">Bạn chưa có câu hỏi sai nào cần xử lý.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="p-8 bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group shadow-sm">
                                                    <div className="relative z-10 flex items-center gap-5">
                                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-lg shadow-red-100/50 shrink-0">
                                                            <AlertTriangle className="w-7 h-7" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-red-900 font-black text-xl leading-tight">Chế độ ôn tập cấp tốc</p>
                                                            <p className="text-red-600/70 font-medium text-xs">Khắc phục ngay các lỗi sai để sẵn sàng cho kỳ thi thật.</p>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href="/on-tap?mode=wrong"
                                                        className="relative z-10 px-8 py-3.5 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200 whitespace-nowrap active:scale-95"
                                                    >
                                                        Bắt đầu học ngay
                                                    </Link>
                                                </div>

                                                <div className="space-y-3">
                                                    {groupedWrongQuestions.map((group, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-red-100 transition-all group">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 font-bold text-xs shadow-sm">
                                                                    {group.count}
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <div className="font-bold text-slate-900 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] sm:max-w-md">
                                                                        {group.examName}
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-400 font-bold flex items-center gap-2">
                                                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(group.date).toLocaleDateString('vi-VN')}</span>
                                                                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                                        <span>{group.hang}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Link
                                                                href={`/on-tap?mode=exam_review&resultId=${group.resultId}`}
                                                                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-red-600 transition-all whitespace-nowrap"
                                                            >
                                                                Ôn tập ngay
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
                                                <h2 className="text-xl font-black text-slate-900 mb-1">Thông tin chi tiết</h2>
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
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                                            {field.label}
                                                        </label>
                                                        {isEditing && !field.readOnly ? (
                                                            <div className="relative group">
                                                                <input
                                                                    type="text"
                                                                    value={(editForm as any)[field.id]}
                                                                    onChange={(e) => setEditForm({ ...editForm, [field.id]: e.target.value })}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none font-bold text-slate-700 text-sm"
                                                                    placeholder={field.placeholder}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[#0f172a] font-bold min-h-[42px] flex items-center text-sm shadow-sm">
                                                                {field.value || 'Chưa cập nhật'}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Achievements Sidebar - High-end Document Style */}
                                            <div className="space-y-6">
                                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                                                            <Award className="w-4 h-4" />
                                                        </div>
                                                        <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest">Thành tựu</h3>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {[
                                                            { label: 'Bronze', color: 'text-orange-400', achieved: stats.totalExams >= 5 },
                                                            { label: 'Silver', color: 'text-slate-400', achieved: stats.avgScore >= 60 },
                                                            { label: 'Gold', color: 'text-yellow-400', achieved: stats.avgScore >= 80 },
                                                            { label: 'Master', color: 'text-purple-400', achieved: badges.stars === 5 }
                                                        ].map((medal, i) => (
                                                            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${medal.achieved ? 'bg-white border-blue-100' : 'bg-transparent border-slate-100 opacity-40'}`}>
                                                                <div className="flex items-center gap-3">
                                                                    <Medal className={`w-4 h-4 ${medal.color}`} />
                                                                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-tight">{medal.label}</span>
                                                                </div>
                                                                {medal.achieved && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
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
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Thiết lập Ôn tập</h3>
                                                <div className="bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                                                    {/* Rank Preference Row */}
                                                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                                                                <Target className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-slate-900">Hạng mục thi</p>
                                                                <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Hạng mục ưu tiên khi vào bài thi</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                                                            {['Hạng I', 'Hạng II', 'Hạng III'].map(rank => (
                                                                <button
                                                                    key={rank}
                                                                    onClick={() => setPreferences({ ...preferences, rank })}
                                                                    className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all border ${preferences.rank === rank
                                                                        ? 'bg-slate-900 border-slate-900 text-white'
                                                                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
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
                                                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                                                <Briefcase className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-slate-900">Chuyên ngành mặc định</p>
                                                                <p className="text-[10px] text-slate-400 font-medium">Lĩnh vực ưu tiên ôn luyện</p>
                                                            </div>
                                                        </div>
                                                        <select
                                                            value={preferences.specialty}
                                                            onChange={(e) => setPreferences({ ...preferences, specialty: e.target.value })}
                                                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none font-bold text-slate-700 text-[11px] max-w-[200px] appearance-none"
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
                                                                'Thiết kế cơ - điện công trình - Hệ thống thông gió - cấp thoát nhiệt',
                                                                'Giám sát công tác xây dựng công trình',
                                                                'Giám sát công tác lắp đặt thiết bị công trình',
                                                                'Định giá xây dựng',
                                                                'Quản lý dự án đầu tư xây dựng'
                                                            ].map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
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

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-2 text-emerald-600">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Trạng thái: An toàn</span>
                                            </div>
                                            <button
                                                onClick={handleSaveSettings}
                                                disabled={isSavingProfile}
                                                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2 disabled:opacity-50"
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
