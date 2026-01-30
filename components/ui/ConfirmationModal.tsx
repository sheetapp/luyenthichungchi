'use client'

import { X, AlertCircle, Loader2 } from 'lucide-react'

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    isDanger?: boolean
    isLoading?: boolean
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy bỏ',
    isDanger = false,
    isLoading = false
}: ConfirmationModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-apple-card w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-apple-border overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                {/* Header */}
                <div className="p-6 text-center relative border-b border-apple-border/50">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-apple-bg rounded-full transition-colors text-apple-text-secondary"
                        disabled={isLoading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className={`w-16 h-16 ${isDanger ? 'bg-red-500/10 text-red-500' : 'bg-apple-blue/10 text-apple-blue'} rounded-[1.25rem] flex items-center justify-center mx-auto mb-4 shadow-inner`}>
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-apple-text tracking-tight">{title}</h3>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    <p className="text-apple-text-secondary font-medium text-sm leading-relaxed px-4">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-8 flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`w-full py-4 ${isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-apple-text hover:bg-apple-blue'} text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            confirmText
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full py-4 bg-transparent text-apple-text-secondary hover:text-apple-text rounded-2xl font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98]"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    )
}
