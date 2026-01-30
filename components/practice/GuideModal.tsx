'use client'

import { X, Keyboard, MousePointer2, Zap, AlertTriangle, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, FileText } from 'lucide-react'

interface GuideModalProps {
    isOpen: boolean
    onClose: () => void
    type?: 'practice' | 'exam'
}

export function GuideModal({ isOpen, onClose, type = 'practice' }: GuideModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-2xl w-full max-w-2xl rounded-[32px] shadow-2xl border border-white/40 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col transform">
                {/* Header */}
                <div className="p-8 border-b border-black/5 flex items-center justify-between bg-white/50 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#007AFF] rounded-[16px] flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
                                {type === 'practice' ? 'Hướng dẫn học "Rảnh tay"' : 'Hướng dẫn thi "Rảnh tay"'}
                            </h3>
                            <p className="text-[#86868b] text-[15px] font-medium">Làm chủ hệ thống chỉ bằng bàn phím</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-[#86868b]"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    {/* Section: Exam Rules (Only for Exam mode) */}
                    {type === 'exam' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
                            <h4 className="text-lg font-bold text-[#1d1d1f] px-1 tracking-tight flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-[#FF9500]" />
                                Quy tắc thi sát hạch
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-5 bg-[#FF9500]/5 border border-[#FF9500]/10 rounded-2xl flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                        <FileText className="w-6 h-6 text-[#FF9500]" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-[#FF9500] uppercase tracking-wider mb-0.5">Cấu trúc đề thi</div>
                                        <div className="text-sm font-bold text-[#1d1d1f]">30 câu hỏi (10 Pháp luật + 20 Chuyên môn)</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-[#007AFF]/5 border border-[#007AFF]/10 rounded-2xl flex flex-col gap-2">
                                        <div className="text-[10px] font-bold text-[#007AFF] uppercase tracking-wider">Thời gian</div>
                                        <div className="text-base font-bold text-[#1d1d1f]">30 Phút</div>
                                        <div className="text-[11px] font-medium text-[#86868b]">Làm bài liên tục</div>
                                    </div>
                                    <div className="p-5 bg-[#34C759]/5 border border-[#34C759]/10 rounded-2xl flex flex-col gap-2">
                                        <div className="text-[10px] font-bold text-[#34C759] uppercase tracking-wider">Điều kiện đạt</div>
                                        <div className="text-base font-bold text-[#1d1d1f]">Tổng ≥ 21</div>
                                        <div className="text-[11px] font-medium text-[#86868b]">Và PL ≥ 7 câu</div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-px bg-black/5 mx-2" />
                        </div>
                    )}

                    {/* Section 1: Intro */}
                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 bg-[#F5F5F7] rounded-full flex items-center justify-center shrink-0">
                            <Keyboard className="w-6 h-6 text-[#1d1d1f]" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-semibold text-[#1d1d1f] tracking-tight">Hệ thống điều hướng thông minh</h4>
                            <p className="text-[#86868b] text-[15px] leading-relaxed font-medium">
                                Bạn có thể hoàn thành toàn bộ bài {type === 'practice' ? 'ôn tập' : 'thi thử'} mà không cần dùng đến chuột. Hệ thống tự động đồng bộ tiêu điểm giữa chuột và bàn phím.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Short-cuts Card 1 */}
                        <div className="p-6 bg-white border border-black/5 rounded-[24px] shadow-sm space-y-4">
                            <h5 className="flex items-center gap-2 text-[10px] font-bold text-[#007AFF] uppercase tracking-widest">
                                <Zap className="w-3.5 h-3.5" /> Thao tác cơ bản
                            </h5>
                            <div className="space-y-3">
                                <ShortcutItem keys={['Tab']} label="Chuyển vùng (Câu hỏi ↔ Trả lời)" />
                                <ShortcutItem keys={['↑', '↓', '←', '→']} label="Di chuyển trong khu vực" />
                                <ShortcutItem keys={['Space']} label="Chọn câu hỏi / Đáp án" />
                            </div>
                        </div>

                        {/* Short-cuts Card 2 */}
                        <div className="p-6 bg-white border border-black/5 rounded-[24px] shadow-sm space-y-4">
                            <h5 className="flex items-center gap-2 text-[10px] font-bold text-[#FF9500] uppercase tracking-widest">
                                <Zap className="w-3.5 h-3.5" /> Nâng cao
                            </h5>
                            <div className="space-y-3">
                                <ShortcutItem keys={['←', '→']} label="Chuyển câu Trước / Sau" color="orange" />
                                <ShortcutItem keys={['R']} label="Mở bảng Báo sai" color="orange" />
                            </div>
                        </div>
                    </div>

                    {/* Step by Step Guide */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-[#1d1d1f] px-1 tracking-tight">Quy trình học tiêu chuẩn</h4>
                        <div className="space-y-6 relative ml-1">
                            <div className="absolute left-6 top-6 bottom-6 w-[2px] bg-[#F5F5F7]" />

                            <Step
                                number={1}
                                title="Chọn câu hỏi"
                                desc="Dùng mũi tên để di chuyển trong danh sách. Bấm Space để chọn."
                            />
                            <Step
                                number={2}
                                title="Trả lời"
                                desc="Tiêu điểm tự động nhảy sang mục đáp án. Dùng Lên/Xuống để chọn lỗi."
                                isLast
                            />
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-white/50 border-t border-black/5 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-[#1d1d1f] text-white font-semibold rounded-[16px] hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-black/10"
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
