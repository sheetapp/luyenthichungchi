'use client'

import { useRouter } from 'next/navigation'
import { BookOpen, CheckCircle, Target, TrendingUp, Zap, Lock } from 'lucide-react'

export function PracticeLanding() {
    const router = useRouter()

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl mb-6 shadow-2xl shadow-green-500/30">
                    <BookOpen className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-black text-slate-900 mb-4">
                    Ôn Tập Theo Chủ Đề
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Luyện tập với hơn 1000+ câu hỏi được phân loại chi tiết theo chuyên ngành và hạng chứng chỉ
                </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                        <Target className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">Phân loại chi tiết</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Câu hỏi được sắp xếp theo chuyên ngành (Hạng I, II, III) và chủ đề cụ thể
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                        <CheckCircle className="w-7 h-7 text-green-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">Giải thích đáp án</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Mỗi câu hỏi đều có đáp án chi tiết và giải thích rõ ràng
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                        <TrendingUp className="w-7 h-7 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">Theo dõi tiến độ</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Lưu lại kết quả và xem thống kê chi tiết về quá trình học tập
                    </p>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 mb-16">
                <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">
                    Tại sao nên ôn tập theo chủ đề?
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        'Tập trung vào điểm yếu của bạn',
                        'Học từng phần một cách có hệ thống',
                        'Tiết kiệm thời gian ôn tập hiệu quả',
                        'Nắm vững kiến thức từng chuyên đề',
                        'Tự tin hơn khi làm bài thi thật',
                        'Theo dõi tiến độ học tập rõ ràng'
                    ].map((benefit, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <Zap className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-slate-700 font-medium">{benefit}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl shadow-blue-500/30">
                <Lock className="w-16 h-16 mx-auto mb-6 opacity-90" />
                <h2 className="text-3xl font-black mb-4">
                    Đăng nhập để bắt đầu ôn tập
                </h2>
                <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                    Tạo tài khoản miễn phí để truy cập hơn 1000+ câu hỏi ôn tập và theo dõi tiến độ học tập của bạn
                </p>
                <button
                    onClick={() => router.push('/login?redirect=/on-tap')}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                >
                    Đăng nhập ngay
                    <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                </button>
                <p className="text-blue-200 text-sm mt-4">
                    Miễn phí 100% • Không cần thẻ tín dụng
                </p>
            </div>
        </div>
    )
}
