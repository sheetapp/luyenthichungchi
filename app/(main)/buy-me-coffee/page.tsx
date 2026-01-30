import { Coffee, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function BuyMeCoffeePage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Back Button */}
            <div className="px-4 pt-4 pb-2">
                <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 font-semibold text-sm">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Quay lại
                </Link>
            </div>

            {/* Main Content */}
            <div className="px-4 py-6 space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
                        <Coffee className="w-10 h-10 text-orange-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Buy me a Coffee ☕
                    </h1>
                    <p className="text-slate-600 text-sm">
                        Ủng hộ để duy trì và phát triển ứng dụng
                    </p>
                </div>

                {/* Bank Info Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="text-center space-y-4">
                        <div>
                            <p className="text-xs text-slate-500 font-semibold mb-2">
                                Ngân hàng
                            </p>
                            <p className="text-lg font-bold text-slate-900">
                                MB BANK
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500 font-semibold mb-2">
                                Số tài khoản
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                                0987726236
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500 font-semibold mb-2">
                                Chủ tài khoản
                            </p>
                            <p className="text-base font-bold text-slate-900">
                                Luyện thi CCXD
                            </p>
                        </div>
                    </div>
                </div>

                {/* QR Code Placeholder */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-500 font-semibold mb-4 text-center">
                        Quét mã QR để chuyển khoản
                    </p>
                    <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                            <Coffee className="w-16 h-16 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-400 font-medium">
                                QR Code sẽ được cập nhật
                            </p>
                        </div>
                    </div>
                </div>

                {/* Thank You Message */}
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200">
                    <p className="text-center text-sm text-slate-700 leading-relaxed">
                        <span className="font-bold text-orange-600">Cảm ơn bạn rất nhiều!</span>
                        <br />
                        Sự ủng hộ của bạn là động lực to lớn để tôi tiếp tục cập nhật và cải thiện ứng dụng.
                    </p>
                </div>
            </div>
        </div>
    )
}
