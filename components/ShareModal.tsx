'use client'

import { X, Facebook, Link as LinkIcon, Check, Share2 } from 'lucide-react'
import { useState } from 'react'

interface ShareModalProps {
    isOpen: boolean
    onClose: () => void
    url: string
    title: string
}

export function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
    const [copied, setCopied] = useState(false)

    if (!isOpen) return null

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy: ', err)
        }
    }

    const shareToFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    }

    const shareToZalo = () => {
        window.open(`https://zalo.me/s/share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank')
    }

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: 'Luyện thi Chứng chỉ hành nghề Xây dựng hiệu quả cùng ltccxd.com!',
                    url: url,
                })
            } catch (err) {
                console.log('Share cancelled or failed:', err)
            }
        }
    }

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
                        <h3 className="text-xl font-bold text-apple-text">Chia sẻ ứng dụng</h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-apple-bg hover:bg-apple-border transition-colors active:scale-90"
                        >
                            <X className="w-5 h-5 text-apple-text-secondary" />
                        </button>
                    </div>

                    <p className="text-sm text-apple-text-secondary mb-8 leading-relaxed">
                        Lan tỏa kiến thức và giúp bạn bè cùng ôn luyện chứng chỉ hành nghề xây dựng dễ dàng hơn.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {/* Native Share - Only on Mobile */}
                        {typeof navigator !== 'undefined' && (navigator as any).share && (
                            <button
                                onClick={handleNativeShare}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue group-active:scale-90 transition-all border border-apple-blue/10">
                                    <Share2 className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold text-apple-text-secondary">Hệ thống</span>
                            </button>
                        )}

                        {/* Facebook */}
                        <button
                            onClick={shareToFacebook}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] group-active:scale-90 transition-all border border-[#1877F2]/10">
                                <Facebook className="w-6 h-6 fill-current" />
                            </div>
                            <span className="text-[10px] font-bold text-apple-text-secondary">Facebook</span>
                        </button>

                        {/* Zalo */}
                        <button
                            onClick={shareToZalo}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center group-active:scale-90 transition-all border border-apple-border overflow-hidden p-3">
                                <img src="https://img.icons8.com/color/48/zalo.png" alt="Zalo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[10px] font-bold text-apple-text-secondary">Zalo</span>
                        </button>

                        {/* Copy Link */}
                        <button
                            onClick={handleCopyLink}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-active:scale-90 transition-all border ${copied ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-apple-bg text-apple-text-secondary border-apple-border'}`}>
                                {copied ? <Check className="w-6 h-6" /> : <LinkIcon className="w-6 h-6" />}
                            </div>
                            <span className="text-[10px] font-bold text-apple-text-secondary">{copied ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                    </div>

                    {/* URL Display */}
                    <div className="p-3 bg-apple-bg rounded-xl border border-apple-border flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-apple-text-secondary truncate">{url}</span>
                        <button
                            onClick={handleCopyLink}
                            className="text-[10px] font-bold text-apple-blue px-3 py-1.5 bg-apple-blue/10 rounded-lg whitespace-nowrap active:scale-95"
                        >
                            {copied ? 'Đã sao chép' : 'SAO CHÉP'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
