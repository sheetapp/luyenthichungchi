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
        <div className="flex-1 flex items-center justify-center p-3 md:p-6 min-h-[80vh] md:min-h-[60vh]">
            <div className="w-full max-w-4xl bg-apple-bg rounded-3xl md:rounded-2xl border border-apple-border shadow-2xl overflow-hidden relative group">
                {/* Background Decor */}
                <div className={`absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-[0.05] md:opacity-[0.03] rounded-full -mr-24 md:-mr-32 -mt-24 md:-mt-32 blur-3xl`} />
                <div className={`absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-gradient-to-tr ${gradientFrom} ${gradientTo} opacity-[0.05] md:opacity-[0.03] rounded-full -ml-24 md:-ml-32 -mb-24 md:-mb-32 blur-3xl`} />

                <div className="flex flex-col md:grid md:grid-cols-[1fr_400px] relative z-10">
                    {/* Left: Info Section */}
                    <div className="p-6 md:p-12 space-y-5 md:space-y-8 flex flex-col justify-center">
                        <div className="flex items-center gap-4 md:block">
                            <div className={`w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-apple-blue/10 mb-0 md:mb-6 shrink-0`}>
                                <Lock className="w-5 h-5 md:w-7 md:h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-3xl font-black text-apple-text tracking-tight uppercase md:normal-case">Hệ Thống Luyện Thi</h1>
                                <p className="hidden md:flex text-apple-text-secondary font-medium items-center gap-2 mt-1">
                                    <Award className="w-4 h-4 text-apple-blue" />
                                    Nền tảng ôn tập chứng chỉ hành nghề xây dựng chuyên nghiệp
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-apple-bg/50 border border-apple-border rounded-xl">
                                    <div className="w-6 h-6 md:w-8 md:h-8 bg-apple-card border border-apple-border rounded-lg flex items-center justify-center shrink-0">
                                        <feature.icon className="w-3 h-3 md:w-4 md:h-4 text-apple-blue" />
                                    </div>
                                    <span className="text-[10px] md:text-xs font-bold text-apple-text-secondary truncate">{feature.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 py-2.5 md:py-4 px-4 md:px-6 bg-apple-blue/5 border border-apple-blue/20 rounded-xl md:rounded-2xl">
                            <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-apple-blue shrink-0" />
                            <p className="text-[9px] md:text-[11px] font-bold text-apple-blue uppercase tracking-widest leading-tight">
                                Bảo mật & Miễn phí 100%
                            </p>
                        </div>
                    </div>

                    {/* Right: Action Section */}
                    <div className="bg-apple-card border-t md:border-t-0 md:border-l border-apple-border p-6 md:p-12 flex flex-col items-center justify-center text-center space-y-6 md:space-y-8 relative overflow-hidden">
                        {/* Decorative Icons - Small on mobile */}
                        <div className="absolute top-4 right-4 md:top-10 md:right-10 opacity-[0.03] md:opacity-[0.05] -rotate-12">
                            <Shield className="w-12 h-12 md:w-20 md:h-20 text-apple-text" />
                        </div>
                        <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 opacity-[0.03] md:opacity-[0.05] rotate-12">
                            <Star className="w-10 h-10 md:w-16 md:h-16 text-apple-text" />
                        </div>

                        <div className="space-y-4 relative z-10 w-full">
                            <div className="space-y-1">
                                <h3 className="text-lg md:text-xl font-black text-apple-text uppercase md:normal-case">Bắt đầu ngay</h3>
                                <p className="text-apple-text-secondary text-[10px] md:text-xs font-medium">Đăng nhập Google để truy cập đầy đủ</p>
                            </div>

                            <button
                                onClick={() => router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`)}
                                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 md:px-8 md:py-4 bg-apple-bg border border-apple-border text-apple-text rounded-xl md:rounded-2xl font-bold text-sm hover:border-apple-blue hover:text-apple-blue hover:shadow-xl hover:shadow-apple-blue/10 transition-all active:scale-[0.98] group"
                            >
                                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Đăng nhập với Google
                            </button>

                            <div className="pt-2">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 text-apple-text-secondary hover:text-apple-blue font-bold text-[9px] md:text-[10px] uppercase tracking-widest transition-colors"
                                >
                                    Quay lại trang chủ
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>

                        <div className="pt-5 md:pt-6 border-t border-apple-border w-full">
                            <div className="flex justify-center gap-4 md:gap-6">
                                <div className="text-center">
                                    <div className="text-apple-text font-black text-xs md:text-sm">1.000+</div>
                                    <div className="text-[7px] md:text-[8px] font-bold text-apple-text-secondary uppercase tracking-tighter">Câu hỏi</div>
                                </div>
                                <div className="text-center border-l border-apple-border pl-4 md:pl-6">
                                    <div className="text-apple-text font-black text-xs md:text-sm">Miễn phí</div>
                                    <div className="text-[7px] md:text-[8px] font-bold text-apple-text-secondary uppercase tracking-tighter">Vĩnh viễn</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
