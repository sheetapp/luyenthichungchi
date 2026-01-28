'use client'

import { useState, useEffect } from 'react'
import {
    User, Mail, Phone, Briefcase, UserCircle, Edit2, Save, X,
    History, TrendingUp, Award, AlertTriangle, MessageSquare,
    LogOut, ChevronRight, Calendar, CheckCircle, XCircle,
    FileText, Send, Target, LayoutDashboard, ShieldCheck
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WelcomePopup } from '@/components/WelcomePopup'

type TabType = 'profile' | 'history' | 'wrong' | 'feedback'

export default function AccountPage() {
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [stats, setStats] = useState({
        totalExams: 0,
        avgScore: 0,
        highestScore: 0,
        totalWrong: 0,
        passRate: 0
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
    const [feedbackForm, setFeedbackForm] = useState({ category: 'suggestion', message: '' })
    const [submitting, setSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [profileSaveSuccess, setProfileSaveSuccess] = useState(false)
    const [profileError, setProfileError] = useState<string | null>(null)
    const [greeting, setGreeting] = useState('')

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
                        passRate: Math.round((passed / total) * 100)
                    })

                    const wrongAnswers: any[] = []
                    results.forEach(result => {
                        if (result.answers) {
                            Object.entries(result.answers).forEach(([qId, answer]: [string, any]) => {
                                if (answer && answer.correct === false) {
                                    wrongAnswers.push({
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
                    setWrongQuestions(wrongAnswers)
                }
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

                <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">
                    {/* Left Sidebar - Adjusted for height alignment */}
                    <div className="space-y-6">
                        {/* Profile Summary Card - Consistent Rounded */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-left relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
                            <div className="relative mb-6">
                                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-slate-50 group-hover:border-blue-100 transition-all duration-500">
                                    {profile?.avata ? (
                                        <img src={profile.avata} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                            <UserCircle className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-slate-900 truncate">{profile?.display_name || 'Người dùng'}</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-tight truncate">{profile?.email}</p>
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-2xl font-bold text-sm transition-all shadow-sm"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Đăng xuất
                                </button>
                            </div>
                        </div>

                        {/* Navigation Menu (Vertical) */}
                        <div className="bg-white rounded-3xl p-3 border border-slate-100 shadow-sm">
                            <div className="space-y-1">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold transition-all group ${activeTab === item.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                            : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`} />
                                            <span className="text-sm">{item.label}</span>
                                        </div>
                                        <ChevronRight className={`w-3 h-3 opacity-50 transition-transform ${activeTab === item.id ? 'rotate-90 opacity-100' : 'group-hover:translate-x-1'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Help Buttons */}
                        <div className="flex justify-center gap-3">
                            <button className="flex-1 flex items-center justify-center p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                                <ShieldCheck className="w-5 h-5" />
                            </button>
                            <button className="flex-1 flex items-center justify-center p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                                <MessageSquare className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="space-y-6">
                        {/* Quick Stats Grid - More symmetric */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Tổng bài thi', value: stats.totalExams, icon: History, color: 'text-blue-600', badge: 'TỔNG CỘNG', bg: 'bg-blue-50' },
                                { label: 'Điểm trung bình', value: `${stats.avgScore}%`, icon: TrendingUp, color: 'text-emerald-600', badge: 'TRUNG BÌNH', bg: 'bg-emerald-50' },
                                { label: 'Điểm cao nhất', value: `${stats.highestScore}%`, icon: Award, color: 'text-orange-600', badge: 'KỶ LỤC', bg: 'bg-orange-50' },
                                { label: 'Tỉ lệ đạt', value: `${stats.passRate}%`, icon: Target, color: 'text-purple-600', badge: 'HIỆU SUẤT', bg: 'bg-purple-50' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:border-blue-100 transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-9 h-9 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shadow-sm`}>
                                            <stat.icon className="w-4 h-4" />
                                        </div>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${stat.bg} ${stat.color} tracking-wider`}>
                                            {stat.badge}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-xl font-black text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors">{stat.value}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Main Tab Content Card */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm min-h-[500px] overflow-hidden">
                            <div className="p-8">
                                {/* Profile Tab Content */}
                                {activeTab === 'profile' && (
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

                                        {profileError && (
                                            <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span className="text-xs font-bold">{profileError}</span>
                                            </div>
                                        )}

                                        <div className="grid md:grid-cols-2 gap-y-7 gap-x-8">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Họ và tên đầy đủ</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.display_name}
                                                        onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-700 text-sm"
                                                        placeholder="Nhập tên của bạn"
                                                    />
                                                ) : (
                                                    <div className="px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-slate-900 font-bold min-h-[46px] flex items-center text-sm">
                                                        {profile?.display_name || 'Chưa cập nhật'}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Số điện thoại liên hệ</label>
                                                {isEditing ? (
                                                    <input
                                                        type="tel"
                                                        value={editForm.phone}
                                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-700 text-sm"
                                                        placeholder="09xx xxx xxx"
                                                    />
                                                ) : (
                                                    <div className="px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-slate-900 font-bold min-h-[46px] flex items-center text-sm">
                                                        {profile?.phone || 'Chưa cập nhật'}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Giới tính</label>
                                                {isEditing ? (
                                                    <div className="flex gap-2">
                                                        {['Nam', 'Nữ', 'Khác'].map((g) => (
                                                            <button
                                                                key={g}
                                                                onClick={() => setEditForm({ ...editForm, gender: g })}
                                                                className={`flex-1 py-3 rounded-xl font-bold transition-all border text-xs ${editForm.gender === g
                                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                {g}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-slate-900 font-bold min-h-[46px] flex items-center text-sm">
                                                        {profile?.gender || 'Chưa cập nhật'}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nghề nghiệp / Chức danh</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.job_title}
                                                        onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-700 text-sm"
                                                        placeholder="Kỹ sư, kiến trúc sư..."
                                                    />
                                                ) : (
                                                    <div className="px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-slate-900 font-bold min-h-[46px] flex items-center text-sm">
                                                        {profile?.job_title || 'Chưa có thông tin'}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Tên công ty / Cơ quan</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.company}
                                                        onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-700 text-sm"
                                                        placeholder="Tên đơn vị công tác"
                                                    />
                                                ) : (
                                                    <div className="px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-slate-900 font-bold min-h-[46px] flex items-center text-sm">
                                                        {profile?.company || 'Chưa có thông tin'}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Địa chỉ liên hệ</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.address}
                                                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-700 text-sm"
                                                        placeholder="Nhập địa chỉ đầy đủ (Số nhà, đường, tỉnh/thành...)"
                                                    />
                                                ) : (
                                                    <div className="px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-slate-900 font-bold min-h-[46px] flex items-center text-sm">
                                                        {profile?.address || 'Chưa có thông tin'}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Địa chỉ Email (Cố định)</label>
                                                <div className="px-4 py-3 bg-slate-100/50 border border-transparent rounded-xl text-slate-500 font-medium min-h-[46px] flex items-center cursor-not-allowed text-sm">
                                                    {profile?.email || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

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
                                                {examHistory.slice(0, 10).map((exam, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-lg hover:shadow-slate-100/30 transition-all group">
                                                        <div className="flex items-center gap-5">
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${exam.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                                {exam.passed ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                                                    Kết quả bài thi #{examHistory.length - idx}
                                                                    {idx === 0 && <span className="px-1.5 py-0.5 bg-green-500 text-[8px] text-white rounded font-black uppercase tracking-widest">Mới nhất</span>}
                                                                </div>
                                                                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-3">
                                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-400" /> {new Date(exam.created_at).toLocaleDateString('vi-VN')}</span>
                                                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                                    <span className="uppercase tracking-tighter">Hạng {exam.category_id || 'III'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-right hidden sm:block">
                                                                <div className={`text-xl font-black ${exam.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {exam.score}/30
                                                                </div>
                                                                <div className={`text-[8px] font-black uppercase tracking-widest ${exam.passed ? 'text-green-500/50' : 'text-red-400/50'}`}>
                                                                    {exam.passed ? 'Đã vượt qua' : 'Chưa đạt yêu cầu'}
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-blue-600 transition-colors" />
                                                        </div>
                                                    </div>
                                                ))}
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

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiến độ củng cố</span>
                                                        <span className="font-black text-slate-700">Cần cải thiện</span>
                                                    </div>
                                                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1 text-red-600">
                                                        <span className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest">Đánh giá chung</span>
                                                        <span className="font-black">Trung bình</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'feedback' && (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 mb-1">Góp ý & Nhận xét</h2>
                                            <p className="text-slate-400 font-medium text-xs">Mọi ý kiến của bạn đều giúp hệ thống hoàn thiện hơn mỗi ngày.</p>
                                        </div>

                                        {submitSuccess && (
                                            <div className="bg-emerald-500 text-white rounded-2xl p-6 flex items-center gap-5 animate-in zoom-in duration-500 shadow-xl shadow-emerald-100">
                                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                                                    <CheckCircle className="w-6 h-6" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-black uppercase tracking-widest">Gửi phản hồi thành công!</p>
                                                    <p className="text-xs font-medium opacity-80">Chúng tôi sẽ sớm phản hồi qua Email của bạn.</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid md:grid-cols-[240px_1fr] gap-8">
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Chủ đề phản hồi</label>
                                                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                                                        {[
                                                            { id: 'suggestion', label: 'Góp ý thiết kế', icon: MessageSquare },
                                                            { id: 'bug', label: 'Báo lỗi hệ thống', icon: AlertTriangle },
                                                            { id: 'content', label: 'Nội dung câu hỏi', icon: FileText },
                                                            { id: 'other', label: 'Vấn đề khác', icon: Send }
                                                        ].map((cat) => (
                                                            <button
                                                                key={cat.id}
                                                                onClick={() => setFeedbackForm({ ...feedbackForm, category: cat.id })}
                                                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${feedbackForm.category === cat.id
                                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                                                                    : 'bg-white border-slate-50 text-slate-400 hover:border-slate-100 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                <cat.icon className={`w-5 h-5 ${feedbackForm.category === cat.id ? 'text-white' : 'text-slate-300'}`} />
                                                                <span className="text-[9px] font-black uppercase tracking-wider text-center leading-tight">{cat.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-4">
                                                <div className="space-y-2 flex-1">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nội dung chi tiết</label>
                                                    <textarea
                                                        value={feedbackForm.message}
                                                        onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                                                        rows={8}
                                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none font-medium resize-none text-slate-700 text-sm"
                                                        placeholder="Vui lòng mô tả chi tiết ý kiến hoặc lỗi bạn gặp phải..."
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleSubmitFeedback}
                                                    disabled={submitting || !feedbackForm.message.trim()}
                                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-600 active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-300 transition-all flex items-center justify-center gap-3"
                                                >
                                                    {submitting ? (
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Send className="w-4 h-4" />
                                                            Gửi phản hồi ngay
                                                        </>
                                                    )}
                                                </button>
                                            </div>
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
