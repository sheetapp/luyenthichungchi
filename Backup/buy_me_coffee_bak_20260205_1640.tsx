'use client'

import { useState, useEffect } from 'react'
import { Heart, ArrowLeft, Copy, Check, ShieldCheck, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { getRandomCoffeeMessage } from '@/constants/motivationalMessages'

export default function BuyMeCoffeePage() {
    const [copiedAccount, setCopiedAccount] = useState(false)
    const [copiedMessage, setCopiedMessage] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [message, setMessage] = useState({ title: '', description: '' })

    useEffect(() => {
        setMounted(true)
        setMessage(getRandomCoffeeMessage())
    }, [])

    const bankInfo = {
        bank: 'KIÊN LONG',
        bankCode: '970452',
        accountNumber: '33904543',
        accountName: 'VO TAN NHUONG',
        message: 'LTCCXD Buy A Coffee'
    }

    const copyAccount = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopiedAccount(true)
        setTimeout(() => setCopiedAccount(false), 2000)
    }

    const copyMessage = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopiedMessage(true)
        setTimeout(() => setCopiedMessage(false), 2000)
    }

    const qrCodeUrl = `https://img.vietqr.io/image/${bankInfo.bankCode}-${bankInfo.accountNumber}-compact2.jpg?amount=0&addInfo=${encodeURIComponent(bankInfo.message)}&accountName=${encodeURIComponent(bankInfo.accountName)}`

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-slate-950 pb-24 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
            {/* Header / Back Button */}
            <div className="max-w-md md:max-w-6xl mx-auto px-6 pt-6">
                <Link
                    href="/"
                    className="inline-flex items-center text-slate-400 hover:text-blue-600 transition-colors text-[13px] font-medium"
                >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    Quay lại trang chủ
                </Link>
            </div>

            {/* Mobile Layout - Original Design */}
            <main className="md:hidden max-w-md mx-auto px-6 pt-8 space-y-8">
                {/* Intro Section */}
                <div className="text-center space-y-3">
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
                            <Sparkles className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
                            {message.title}
                        </h1>
                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                            {message.description}
                        </p>
                    </div>
                </div>

                {/* Account Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[28px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
                    {/* QR Section */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <img
                                src={qrCodeUrl}
                                alt="QR Code"
                                className="w-48 h-48 rounded-lg mix-blend-multiply dark:mix-blend-normal"
                            />
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">
                            BUY ME A COFFE
                        </p>
                    </div>

                    {/* Simple Divider */}
                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                    {/* Details Section */}
                    <div className="space-y-5">
                        <div className="flex justify-between items-center group">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ngân hàng</span>
                            <span className="text-[14px] font-bold text-slate-900 dark:text-white">{bankInfo.bank}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Số tài khoản</span>
                            <button
                                onClick={() => copyAccount(bankInfo.accountNumber)}
                                className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                            >
                                <span className="text-[15px] font-bold text-blue-600 font-mono tracking-tight">{bankInfo.accountNumber}</span>
                                {copiedAccount ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                            </button>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Chủ tài khoản</span>
                            <span className="text-[14px] font-bold text-slate-900 dark:text-white">{bankInfo.accountName}</span>
                        </div>

                        <div className="flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/10 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/20">
                            <span className="text-[11px] font-bold text-blue-600/60 uppercase tracking-widest pl-1">Nội dung</span>
                            <button
                                onClick={() => copyMessage(bankInfo.message)}
                                className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                            >
                                <span className="text-[13px] font-bold text-blue-600">{bankInfo.message}</span>
                                {copiedMessage ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Terms Section */}
                <div className="bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/40">
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Điều khoản & Bảo mật</h2>
                    </div>
                    <ul className="space-y-3">
                        {[
                            'Mọi khoản ủng hộ đều mang tính tự nguyện và phi thương mại.',
                            'Khoản tiền được dùng để chi trả máy chủ và nâng cấp dữ liệu.',
                            'Dữ liệu thanh toán được xử lý trực tiếp qua ứng dụng ngân hàng.',
                            'Mỗi sự đóng góp đều được trân trọng và ghi nhận chân thành.'
                        ].map((term, i) => (
                            <li key={i} className="flex gap-2.5 text-[12px] text-slate-500 leading-relaxed font-medium">
                                <span className="shrink-0 w-1 h-1 rounded-full bg-slate-300 mt-1.5" />
                                {term}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footer Message */}
                <div className="text-center pt-2">
                    <p className="text-[13px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Trân trọng cảm ơn sự đồng hành của bạn.
                    </p>
                </div>
            </main>

            {/* PC Layout - Two Column Design */}
            <main className="hidden md:block max-w-6xl mx-auto px-6 pt-8">
                <div className="grid grid-cols-2 gap-6 items-start">
                    {/* Left Column - Payment Information */}
                    <div className="space-y-6">
                        {/* Intro Section */}
                        <div className="min-h-[100px] flex flex-col justify-end">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                    <Sparkles className="w-8 h-8 text-amber-500" strokeWidth={1.5} />
                                    {message.title}
                                </h1>
                                <p className="text-[15px] text-slate-500 font-medium leading-relaxed max-w-lg">
                                    {message.description}
                                </p>
                            </div>
                        </div>

                        {/* Account Card */}
                        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[28px] p-10 shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col gap-8">
                            {/* QR Section */}
                            <div className="flex flex-col items-center gap-5">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <img
                                        src={qrCodeUrl}
                                        alt="QR Code"
                                        className="w-64 h-64 rounded-lg mix-blend-multiply dark:mix-blend-normal"
                                    />
                                </div>
                                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.12em]">
                                    BUY ME A COFFEE
                                </p>
                            </div>

                            {/* Simple Divider */}
                            <div className="h-px bg-slate-100 dark:bg-slate-800" />

                            {/* Details Section */}
                            <div className="flex flex-col gap-6">
                                <div className="flex justify-between items-center group">
                                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Ngân hàng</span>
                                    <span className="text-[16px] font-bold text-slate-900 dark:text-white">{bankInfo.bank}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Số tài khoản</span>
                                    <button
                                        onClick={() => copyAccount(bankInfo.accountNumber)}
                                        className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                                    >
                                        <span className="text-[17px] font-bold text-blue-600 font-mono tracking-tight">{bankInfo.accountNumber}</span>
                                        {copiedAccount ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-blue-400" />}
                                    </button>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Chủ tài khoản</span>
                                    <span className="text-[16px] font-bold text-slate-900 dark:text-white">{bankInfo.accountName}</span>
                                </div>

                                <div className="flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                    <span className="text-[12px] font-bold text-blue-600/60 uppercase tracking-widest pl-1">Nội dung</span>
                                    <button
                                        onClick={() => copyMessage(bankInfo.message)}
                                        className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                                    >
                                        <span className="text-[15px] font-bold text-blue-600">{bankInfo.message}</span>
                                        {copiedMessage ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-blue-400" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Terms & Privacy */}
                    <div className="sticky top-6 space-y-6">
                        {/* Header Section */}
                        <div className="min-h-[100px] flex flex-col justify-end space-y-3">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                                Trân trọng cảm ơn sự ủng hộ của bạn
                            </h2>
                            <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                                Vui lòng đọc kỹ điều khoản, bảo mật bên dưới.
                            </p>
                        </div>

                        {/* Terms Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[28px] p-10 shadow-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Điều khoản & Bảo mật</h2>
                            </div>

                            <div className="space-y-6">
                                {[
                                    {
                                        title: 'Tự nguyện & Phi thương mại',
                                        desc: 'Mọi khoản ủng hộ đều mang tính tự nguyện và phi thương mại. Bạn hoàn toàn chủ động trong quyết định đóng góp.'
                                    },
                                    {
                                        title: 'Nâng cao chất lượng dịch vụ',
                                        desc: 'Khoản ủng hộ của bạn sẽ được mình dùng để chi trả máy chủ, nâng cấp dữ liệu và phát triển tính năng mới cho ứng dụng, tối ưu trải nghiệm người dùng.'
                                    },
                                    {
                                        title: 'Bảo mật thanh toán',
                                        desc: 'Dữ liệu thanh toán được xử lý trực tiếp qua ứng dụng ngân hàng của bạn, Chúng mình chỉ ghi nhận lịch sử ủng hộ của bạn trên hệ thống và bạn hoàn toàn có thể xem lại trong Tài khoản/Lịch sử ủng hộ.'
                                    },
                                    {
                                        title: 'Ghi nhận đóng góp',
                                        desc: 'Mỗi sự đóng góp đều được trân trọng và ghi nhận chân thành. Cảm ơn bạn đã tin tưởng và ủng hộ.'
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-start gap-3">
                                            <div className="shrink-0 w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mt-0.5">
                                                <span className="text-[11px] font-bold text-blue-600">{i + 1}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">
                                                    {item.title}
                                                </h3>
                                                <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Info Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/20">
                            <div className="space-y-3">
                                <h3 className="text-[13px] font-bold text-blue-900 dark:text-blue-100 uppercase tracking-widest">
                                    Lưu ý quan trọng
                                </h3>
                                <ul className="space-y-2">
                                    {[
                                        'Vui lòng ghi đúng nội dung chuyển khoản',
                                        'Kiểm tra kỹ thông tin trước khi chuyển',
                                        'Liên hệ hỗ trợ nếu có thắc mắc'
                                    ].map((note, i) => (
                                        <li key={i} className="flex gap-2.5 text-[12px] text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                                            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                                            {note}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
