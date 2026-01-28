'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Loader2, AlertCircle } from 'lucide-react'

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Check for error in URL params
                const errorParam = searchParams.get('error')
                const errorDescription = searchParams.get('error_description')

                if (errorParam) {
                    console.error('OAuth error:', errorParam, errorDescription)
                    setError(errorDescription || 'Authentication failed')
                    setTimeout(() => router.push('/login'), 3000)
                    return
                }

                // Exchange code for session
                const code = searchParams.get('code')
                if (code) {
                    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

                    if (exchangeError) {
                        console.error('Session exchange error:', exchangeError)
                        setError('Failed to establish session')
                        setTimeout(() => router.push('/login'), 3000)
                        return
                    }

                    if (data.session) {
                        console.log('Session established:', data.session.user.email)
                        // Wait a bit for profile to be created by trigger
                        await new Promise(resolve => setTimeout(resolve, 1000))
                        router.push('/tai-khoan')
                        return
                    }
                }

                // Fallback: check existing session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) {
                    console.error('Session error:', sessionError)
                    setError('Session error')
                    setTimeout(() => router.push('/login'), 3000)
                    return
                }

                if (session) {
                    console.log('Existing session found:', session.user.email)
                    router.push('/tai-khoan')
                } else {
                    console.log('No session found, redirecting to login')
                    router.push('/login')
                }
            } catch (error) {
                console.error('Callback error:', error)
                setError('An unexpected error occurred')
                setTimeout(() => router.push('/login'), 3000)
            }
        }

        handleCallback()
    }, [router, searchParams])

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600 font-semibold mb-2">Lỗi xác thực</p>
                <p className="text-sm text-slate-600 mb-4">{error}</p>
                <p className="text-xs text-slate-500">Đang chuyển về trang đăng nhập...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Đang xác thực...</p>
            <p className="text-sm text-slate-500 mt-2">Vui lòng chờ trong giây lát</p>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-600 font-medium">Đang xác thực...</p>
                <p className="text-sm text-slate-500 mt-2">Vui lòng chờ trong giây lát</p>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    )
}
