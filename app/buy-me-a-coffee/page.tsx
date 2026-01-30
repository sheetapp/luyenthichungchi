'use client'

import { useState } from 'react'
import { Coffee, X, Copy, Check } from 'lucide-react'

export default function BuyMeACoffeePage() {
    const [copied, setCopied] = useState(false)

    const bankInfo = {
        bank: 'KienLongBank',
        bankCode: '970452',
        accountNumber: '33904543',
        accountName: 'VO TAN NHUONG',
        branch: 'Chi nhánh Hóc Môn',
        amount: '',
        message: 'LTCCXD Buy A Coffee'
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Generate QR code URL using VietQR API with compact2 format
    const qrCodeUrl = `https://img.vietqr.io/image/${bankInfo.bankCode}-${bankInfo.accountNumber}-compact2.jpg?amount=0&addInfo=${encodeURIComponent(bankInfo.message)}&accountName=${encodeURIComponent(bankInfo.accountName)}`

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4 text-slate-900">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4 shadow-lg">
                        <Coffee className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black mb-2">
                        Buy LTCCXD a Coffee ☕
                    </h1>
                    <p className="text-slate-600 text-lg font-medium">
                        Cảm ơn bạn đã đồng hành cùng LTCCXD! Mỗi ly cà phê giúp app phát triển bền vững 💪
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                    {/* QR Code */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-amber-400">
                                <img
                                    src={qrCodeUrl}
                                    alt="QR Code thanh toán"
                                    width={280}
                                    height={280}
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="absolute -top-3 -right-3 bg-gradient-to-br from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                Quét để thanh toán
                            </div>
                        </div>
                    </div>

                    {/* Bank Info */}
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-slate-600">Ngân hàng</span>
                                <span className="text-base font-black text-slate-900">{bankInfo.bank}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-slate-600">Số tài khoản</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-black text-slate-900 font-mono">{bankInfo.accountNumber}</span>
                                    <button
                                        onClick={() => copyToClipboard(bankInfo.accountNumber)}
                                        className="p-1.5 hover:bg-amber-200 rounded-lg transition-colors"
                                        aria-label="Copy số tài khoản"
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-slate-600" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-slate-600">Chủ tài khoản</span>
                                <span className="text-base font-black text-slate-900">{bankInfo.accountName}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-slate-600">Chi nhánh</span>
                                <span className="text-sm font-medium text-slate-700">{bankInfo.branch}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-600">Nội dung chuyển khoản</span>
                                <span className="text-base font-black text-amber-600">{bankInfo.message}</span>
                            </div>
                        </div>

                        {/* Suggested Amounts */}
                        <div>
                            <p className="text-sm font-semibold text-slate-600 mb-3">Gợi ý số tiền:</p>
                            <div className="grid grid-cols-3 gap-3">
                                {['20.000đ', '50.000đ', '100.000đ'].map((amount) => (
                                    <button
                                        key={amount}
                                        className="py-3 px-4 bg-gradient-to-br from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 rounded-xl font-bold text-slate-900 transition-all hover:scale-105 border-2 border-amber-300"
                                    >
                                        {amount}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                            <span className="text-lg">📱</span>
                            Hướng dẫn chuyển khoản
                        </h3>
                        <ol className="text-sm text-blue-800 space-y-1 ml-6 list-decimal">
                            <li>Mở ứng dụng ngân hàng của bạn</li>
                            <li>Quét mã QR hoặc nhập thông tin tài khoản</li>
                            <li>Nhập số tiền bạn muốn ủng hộ</li>
                            <li>Kiểm tra nội dung: <strong>&quot;{bankInfo.message}&quot;</strong></li>
                            <li>Xác nhận chuyển khoản</li>
                        </ol>
                    </div>
                </div>

                {/* Terms */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                        <span>📋</span>
                        Điều khoản
                    </h2>
                    <div className="text-sm text-slate-600 space-y-3">
                        <p>
                            <strong className="text-slate-900">1. Tự nguyện:</strong> Mọi khoản ủng hộ đều hoàn toàn tự nguyện và không bắt buộc. Bạn vẫn có thể sử dụng đầy đủ các tính năng của website mà không cần ủng hộ.
                        </p>
                        <p>
                            <strong className="text-slate-900">2. Không hoàn trả:</strong> Các khoản ủng hộ được coi là quà tặng và không thể hoàn trả. Vui lòng cân nhắc kỹ trước khi chuyển khoản.
                        </p>
                        <p>
                            <strong className="text-slate-900">3. Sử dụng:</strong> Số tiền ủng hộ sẽ được sử dụng để duy trì và phát triển website, cải thiện trải nghiệm người dùng.
                        </p>
                        <p>
                            <strong className="text-slate-900">4. Bảo mật:</strong> Chúng tôi không lưu trữ thông tin thanh toán của bạn. Mọi giao dịch được thực hiện trực tiếp qua ngân hàng của bạn.
                        </p>
                        <p>
                            <strong className="text-slate-900">5. Cảm ơn:</strong> Mỗi khoản ủng hộ, dù lớn hay nhỏ, đều rất có ý nghĩa và được trân trọng. Cảm ơn bạn đã tin tưởng và đồng hành! 🙏
                        </p>
                    </div>
                </div>

                {/* Thank You Message */}
                <div className="text-center">
                    <div className="inline-block bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 text-white px-8 py-4 rounded-2xl shadow-lg">
                        <p className="text-lg font-black">
                            ❤️ Cảm ơn bạn rất nhiều! ❤️
                        </p>
                        <p className="text-sm opacity-90 mt-1">
                            Mỗi ly cà phê là một nguồn động viên lớn lao
                        </p>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
                    >
                        ← Quay lại trang chủ
                    </a>
                </div>
            </div>
        </div>
    )
}
