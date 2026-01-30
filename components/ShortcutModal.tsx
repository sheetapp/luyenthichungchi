'use client'

import { X, PlusCircle, Share, MoreVertical, Smartphone, Info } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ShortcutModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ShortcutModal({ isOpen, onClose }: ShortcutModalProps) {
    const [os, setOs] = useState<'ios' | 'android' | 'other'>('other')

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase()
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setOs('ios')
        } else if (/android/.test(userAgent)) {
            setOs('android')
        }
    }, [])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="absolute inset-0"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md bg-apple-card md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500 md:zoom-in-95">
                {/* Drag Handle for Mobile */}
                <div className="md:hidden w-12 h-1.5 bg-apple-border rounded-full mx-auto mt-3 mb-1" />

                <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <PlusCircle className="w-6 h-6 text-apple-blue" />
                            <h3 className="text-xl font-bold text-apple-text">Thêm vào MH chính</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-apple-bg hover:bg-apple-border transition-colors active:scale-90"
                        >
                            <X className="w-5 h-5 text-apple-text-secondary" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 bg-apple-blue/5 rounded-2xl border border-apple-blue/10">
                            <Smartphone className="w-10 h-10 text-apple-blue shrink-0 mt-1" />
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-apple-text uppercase tracking-tight">Trải nghiệm như ứng dụng</p>
                                <p className="text-xs text-apple-text-secondary leading-relaxed">
                                    Thêm biểu tượng <b>ltccxd.com</b> vào màn hình chính để truy cập nhanh chóng như một App thực thụ.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-apple-text-secondary uppercase tracking-widest border-l-2 border-apple-blue pl-2">Hướng dẫn {os === 'ios' ? 'iOS' : os === 'android' ? 'Android' : 'Điện thoại'}</h4>

                            <div className="space-y-4">
                                {os === 'ios' ? (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-apple-bg border border-apple-border flex items-center justify-center text-[10px] font-bold">1</div>
                                            <p className="text-sm text-apple-text">Chạm vào biểu tượng <b>Chia sẻ</b> <Share className="w-4 h-4 inline mx-1 text-apple-blue" /> ở dưới cùng thanh công cụ Safari.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-apple-bg border border-apple-border flex items-center justify-center text-[10px] font-bold">2</div>
                                            <p className="text-sm text-apple-text">Cuộn xuống và chọn mục <b>"Thêm vào MH chính"</b> <PlusCircle className="w-4 h-4 inline mx-1 text-apple-blue" />.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-apple-bg border border-apple-border flex items-center justify-center text-[10px] font-bold">3</div>
                                            <p className="text-sm text-apple-text">Nhấn <b>"Thêm"</b> ở góc phải màn hình.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-apple-bg border border-apple-border flex items-center justify-center text-[10px] font-bold">1</div>
                                            <p className="text-sm text-apple-text">Chạm vào biểu tượng <b>3 chấm</b> <MoreVertical className="w-4 h-4 inline mx-1 text-apple-blue" /> ở góc phải trình duyệt Chrome.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-apple-bg border border-apple-border flex items-center justify-center text-[10px] font-bold">2</div>
                                            <p className="text-sm text-apple-text">Chọn mục <b>"Cài đặt ứng dụng"</b> hoặc <b>"Thêm vào màn hình chính"</b>.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-apple-bg border border-apple-border flex items-center justify-center text-[10px] font-bold">3</div>
                                            <p className="text-sm text-apple-text">Xác nhận <b>"Cài đặt"</b> hoặc <b>"Thêm"</b> để hoàn tất.</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3">
                            <Info className="w-5 h-5 text-orange-500 shrink-0" />
                            <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                                Sau khi thêm, biểu tượng sẽ xuất hiện cạnh các ứng dụng khác như Facebook, Zalo để bạn ôn tập bất cứ lúc nào.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-apple-text text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all"
                        >
                            Tôi đã hiểu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
