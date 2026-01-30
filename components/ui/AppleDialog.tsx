'use client'

import { AlertTriangle, Info, CheckCircle2, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface AppleDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm?: () => void
    title: string
    description: string
    variant?: 'danger' | 'info' | 'success' | 'warning'
    confirmText?: string
    cancelText?: string
    isLoading?: boolean
}

export function AppleDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    variant = 'info',
    confirmText = 'Xác nhận',
    cancelText = 'Để sau',
    isLoading = false
}: AppleDialogProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setMounted(true)
            document.body.style.overflow = 'hidden'
        } else {
            const timer = setTimeout(() => setMounted(false), 300)
            document.body.style.overflow = 'unset'
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!isOpen && !mounted) return null

    const variants = {
        danger: {
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            btn: 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
        },
        info: {
            icon: Info,
            color: 'text-apple-blue',
            bg: 'bg-apple-blue/10',
            btn: 'bg-apple-blue hover:bg-apple-blue/90 shadow-apple-blue/20'
        },
        success: {
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            btn: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
        },
        warning: {
            icon: AlertTriangle,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            btn: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
        }
    }

    const Icon = variants[variant].icon

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop with Glassmorphism */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-md"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Dialog Container */}
            <div className={`
                relative bg-apple-card/90 backdrop-blur-2xl border border-apple-border/50
                w-full max-w-[340px] rounded-[32px] overflow-hidden shadow-2xl
                transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-4 opacity-0'}
            `}>
                <div className="p-8 pb-6 flex flex-col items-center text-center">
                    {/* Icon Section */}
                    <div className={`w-16 h-16 ${variants[variant].bg} ${variants[variant].color} rounded-[22px] flex items-center justify-center mb-6 shadow-inner animate-in zoom-in-50 duration-500`}>
                        <Icon className="w-8 h-8" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-bold text-apple-text tracking-tight mb-2">
                        {title}
                    </h3>
                    <p className="text-[13px] font-medium text-apple-text-secondary leading-relaxed px-2">
                        {description}
                    </p>
                </div>

                {/* Actions Section */}
                <div className="px-6 pb-8 flex flex-col gap-3">
                    {onConfirm && (
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`
                                w-full py-4 rounded-2xl text-white font-bold text-[13px] uppercase tracking-widest
                                transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg
                                ${variants[variant].btn}
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                confirmText
                            )}
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full py-4 rounded-2xl bg-white/50 border border-apple-border text-apple-text-secondary hover:text-apple-text font-bold text-[13px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30"
                    >
                        {cancelText}
                    </button>
                </div>

                {/* Optional Close Button at Top Right */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 text-apple-text-secondary transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
