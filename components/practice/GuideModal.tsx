'use client'

import { X, Keyboard, MousePointer2, Zap, AlertTriangle, ArrowRight, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react'

interface GuideModalProps {
    isOpen: boolean
    onClose: () => void
    type?: 'practice' | 'exam'
}

export function GuideModal({ isOpen, onClose, type = 'practice' }: GuideModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900">
                                {type === 'practice' ? 'Hướng dẫn học "Rảnh tay"' : 'Hướng dẫn thi "Rảnh tay"'}
                            </h3>
                            <p className="text-slate-500 font-medium">Làm chủ hệ thống chỉ bằng bàn phím</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                    {/* Section 1: Intro */}
                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <Keyboard className="w-6 h-6 text-slate-600" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-black text-slate-900">Hệ thống điều hướng thông minh</h4>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Bạn có thể hoàn thành toàn bộ bài {type === 'practice' ? 'ôn tập' : 'thi thử'} mà không cần dùng đến chuột. Hệ thống tự động đồng bộ tiêu điểm giữa chuột và bàn phím.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Short-cuts Card 1 */}
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                            <h5 className="flex items-center gap-2 text-sm font-black text-blue-600 uppercase tracking-widest">
                                <Zap className="w-4 h-4" /> Thao tác cơ bản
                            </h5>
                            <div className="space-y-3">
                                <ShortcutItem keys={['Tab']} label="Chuyển vùng (Câu hỏi ↔ Trả lời)" />
                                <ShortcutItem keys={['↑', '↓', '←', '→']} label="Di chuyển trong khu vực" />
                                <ShortcutItem keys={['Space']} label="Chọn câu hỏi / Đáp án" />
                            </div>
                        </div>

                        {/* Short-cuts Card 2 */}
                        <div className="p-6 bg-orange-50 rounded-[2rem] border border-orange-100 space-y-4">
                            <h5 className="flex items-center gap-2 text-sm font-black text-orange-600 uppercase tracking-widest">
                                <Zap className="w-4 h-4" /> Nâng cao
                            </h5>
                            <div className="space-y-3">
                                <ShortcutItem keys={['←', '→']} label="Chuyển câu Trước / Sau (trong mục Trả lời)" color="orange" />
                                <ShortcutItem keys={['R']} label="Mở bảng Báo sai" color="orange" />
                            </div>
                        </div>
                    </div>

                    {/* Step by Step Guide */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-black text-slate-900 px-1">Quy trình học tiêu chuẩn</h4>
                        <div className="space-y-6 relative">
                            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-100" />

                            <Step
                                number={1}
                                title="Chọn câu hỏi"
                                desc="Dùng mũi tên di chuyển. Bấm Space để chọn. Tiêu điểm sẽ tự nhảy sang đáp án."
                            />
                            <Step
                                number={2}
                                title="Trả lời"
                                desc="Dùng Lên/Xuống để chọn lỗi. Bấm Space để xác nhận đáp án."
                                isLast
                            />
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/10"
                    >
                        {type === 'practice' ? 'Tôi đã hiểu, bắt đầu học ngay!' : 'Tôi đã hiểu, bắt đầu thi ngay!'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function ShortcutItem({ keys, label, color = 'blue' }: { keys: string[], label: string, color?: 'blue' | 'orange' }) {
    const colorClasses = color === 'blue' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200'
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-600">{label}</span>
            <div className="flex gap-1.5">
                {keys.map(k => (
                    <kbd key={k} className={`min-w-[28px] px-1.5 py-1 text-[10px] font-black rounded-lg border-b-2 shadow-sm ${colorClasses}`}>
                        {k}
                    </kbd>
                ))}
            </div>
        </div>
    )
}

function Step({ number, title, desc, isLast = false }: { number: number, title: string, desc: string, isLast?: boolean }) {
    return (
        <div className="flex gap-6 relative z-10">
            <div className="w-12 h-12 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center shrink-0 shadow-sm font-black text-slate-400">
                {number}
            </div>
            <div className="pt-2">
                <h5 className="font-black text-slate-900 mb-1">{title}</h5>
                <p className="text-slate-500 text-sm font-medium">{desc}</p>
            </div>
        </div>
    )
}
