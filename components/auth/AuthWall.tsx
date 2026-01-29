import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, ShieldCheck, Zap, Star, Shield, ArrowRight, Award } from 'lucide-react'

interface AuthWallProps {
    title: string
    description: string
    features: Array<{
        icon: any
        text: string
    }>
    redirectPath: string
    gradientFrom?: string
    gradientTo?: string
}

export function AuthWall({
    title,
    description,
    features,
    redirectPath,
    gradientFrom = "from-blue-600",
    gradientTo = "to-indigo-700"
}: AuthWallProps) {
    const router = useRouter()

    return (
        <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
            <div className="w-full max-w-4xl bg-apple-bg rounded-2xl border border-apple-border shadow-2xl overflow-hidden relative group">
                {/* Background Decor */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-[0.03] rounded-full -mr-32 -mt-32 blur-3xl`} />
                <div className={`absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr ${gradientFrom} ${gradientTo} opacity-[0.03] rounded-full -ml-32 -mb-32 blur-3xl`} />

                <div className="grid md:grid-cols-[1fr_400px] relative z-10">
                    {/* Left: Info Section */}
                    <div className="p-10 md:p-12 space-y-8 flex flex-col justify-center">
                        <div>
                            <div className={`w-14 h-14 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl flex items-center justify-center shadow-lg shadow-apple-blue/20 mb-6`}>
                                <Lock className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-apple-text tracking-tight">Hệ Thống Luyện Thi</h1>
                            <p className="text-apple-text-secondary font-medium flex items-center gap-2 mt-1">
                                <Award className="w-4 h-4 text-apple-blue" />
                                Nền tảng ôn tập chứng chỉ hành nghề xây dựng chuyên nghiệp
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-apple-bg/50 border border-apple-border rounded-xl">
                                    <div className="w-8 h-8 bg-apple-card border border-apple-border rounded-lg flex items-center justify-center shrink-0">
                                        <feature.icon className="w-4 h-4 text-apple-blue" />
                                    </div>
                                    <span className="text-xs font-bold text-apple-text-secondary">{feature.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 py-4 px-6 bg-apple-blue/5 border border-apple-blue/20 rounded-2xl">
                            <ShieldCheck className="w-5 h-5 text-apple-blue" />
                            <p className="text-[11px] font-bold text-apple-blue uppercase tracking-widest">
                                Hệ thống bảo mật & Miễn phí hoàn toàn 100%
                            </p>
                        </div>
                    </div>

                    {/* Right: Action Section */}
                    <div className="bg-apple-card border-l border-apple-border p-10 md:p-12 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden">
                        {/* Decorative Icons */}
                        <div className="absolute top-10 right-10 opacity-[0.05] -rotate-12">
                            <Shield className="w-20 h-20 text-apple-text" />
                        </div>
                        <div className="absolute bottom-10 left-10 opacity-[0.05] rotate-12">
                            <Star className="w-16 h-16 text-apple-text" />
                        </div>

                        <div className="space-y-4 relative z-10 w-full">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-apple-text">Bắt đầu ngay</h3>
                                <p className="text-apple-text-secondary text-xs font-medium">Đăng nhập bằng Google để truy cập</p>
                            </div>

                            <button
                                onClick={() => router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`)}
                                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-apple-bg border border-apple-border text-apple-text rounded-2xl font-bold text-sm hover:border-apple-blue hover:text-apple-blue hover:shadow-xl hover:shadow-apple-blue/10 transition-all active:scale-[0.98] group"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Đăng nhập với Google
                            </button>

                            <div className="pt-4">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 text-apple-text-secondary hover:text-apple-blue font-bold text-[10px] uppercase tracking-widest transition-colors"
                                >
                                    Quay lại trang chủ
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-apple-border w-full">
                            <div className="flex justify-center gap-6">
                                <div className="text-center">
                                    <div className="text-apple-text font-black text-sm">1.000+</div>
                                    <div className="text-[8px] font-bold text-apple-text-secondary uppercase tracking-tighter">Câu hỏi</div>
                                </div>
                                <div className="text-center border-l border-apple-border pl-6">
                                    <div className="text-apple-text font-black text-sm">Miễn phí</div>
                                    <div className="text-[8px] font-bold text-apple-text-secondary uppercase tracking-tighter">Vĩnh viễn</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
