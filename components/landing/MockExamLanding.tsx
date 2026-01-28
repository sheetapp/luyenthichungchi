'use client'

import { useRouter } from 'next/navigation'
import { FileText, Clock, Award, BarChart3, CheckCircle2, Lock } from 'lucide-react'

export function MockExamLanding() {
    const router = useRouter()

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl mb-6 shadow-2xl shadow-orange-500/30">
                    <FileText className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-black text-slate-900 mb-4">
                    Thi Thử Thực Tế
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Làm bài thi thử với điều kiện giống thi thật: 30 câu hỏi, 30 phút, điểm đạt theo quy định
                </p>
            </div>

            {/* Exam Format */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-12 mb-16">
                <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">
                    Quy định thi thử
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900">Số câu hỏi</h3>
                                <p className="text-2xl font-black text-blue-600">30 câu</p>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm">
                            10 câu Pháp luật + 20 câu Chuyên môn
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900">Thời gian</h3>
                                <p className="text-2xl font-black text-orange-600">30 phút</p>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm">
                            Đếm ngược thời gian thực tế
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Award className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900">Điểm đạt</h3>
                                <p className="text-2xl font-black text-green-600">PL ≥ 7 & Tổng ≥ 21</p>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm">
                            Pháp luật tối thiểu 7 điểm
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900">Kết quả</h3>
                                <p className="text-2xl font-black text-purple-600">Chi tiết</p>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm">
                            Xem phân tích điểm và câu sai
                        </p>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />
                    <h3 className="text-xl font-black text-slate-900 mb-3">Giống thi thật 100%</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Cấu trúc đề thi, thời gian, và cách chấm điểm hoàn toàn giống kỳ thi thực tế
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                    <CheckCircle2 className="w-12 h-12 text-blue-600 mb-4" />
                    <h3 className="text-xl font-black text-slate-900 mb-3">Lưu lịch sử thi</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Tất cả bài thi được lưu lại để bạn xem lại và so sánh tiến độ
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                    <CheckCircle2 className="w-12 h-12 text-purple-600 mb-4" />
                    <h3 className="text-xl font-black text-slate-900 mb-3">Phân tích chi tiết</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Xem điểm từng phần, câu sai, và đề xuất cải thiện
                    </p>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl p-12 text-center text-white shadow-2xl shadow-orange-500/30">
                <Lock className="w-16 h-16 mx-auto mb-6 opacity-90" />
                <h2 className="text-3xl font-black mb-4">
                    Đăng nhập để bắt đầu thi thử
                </h2>
                <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
                    Tạo tài khoản miễn phí để làm bài thi thử không giới hạn và theo dõi kết quả của bạn
                </p>
                <button
                    onClick={() => router.push('/login?redirect=/thi-thu')}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-orange-600 rounded-2xl font-bold text-lg hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                >
                    Đăng nhập ngay
                    <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                </button>
                <p className="text-orange-200 text-sm mt-4">
                    Miễn phí 100% • Không giới hạn số lần thi
                </p>
            </div>
        </div>
    )
}
