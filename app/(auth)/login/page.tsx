'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Award } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        // Check if already logged in
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                router.push('/tai-khoan')
            }
        }
        checkUser()
    }, [router])

    const handleGoogleLogin = async () => {
        try {
            setLoading(true)
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
                setLoading(false)
            }
        } catch (error) {
            console.error('Login error:', error)
            setLoading(false)
        }
    }

    if (!mounted) return null

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
                        <h1 className="text-2xl font-black text-slate-900 mb-2">
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
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-md"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                <span>Đang đăng nhập...</span>
                            </>
                        ) : (
                            <>
                                {/* Google Logo SVG */}
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

                    {/* Footer Note */}
                    <p className="text-center text-xs text-slate-500 mt-8">
                        Bằng việc đăng nhập, bạn đồng ý với{' '}
                        <a href="#" className="text-blue-600 hover:underline font-medium">
                            Điều khoản sử dụng
                        </a>
                        {' '}của chúng tôi
                    </p>
                </div>

                {/* Extra Info */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-600">
                        Nghị định 175/2024/NĐ-CP
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        © 2026 Luyện thi Chứng chỉ hành nghề Xây dựng
                    </p>
                </div>
            </div>
        </div>
    )
}
