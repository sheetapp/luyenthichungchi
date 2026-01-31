'use client'

import React from 'react'
import { FileText, Download, ExternalLink } from 'lucide-react'

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-[#1d1d1f]">
            <article className="max-w-4xl mx-auto px-6 py-20 md:py-32">
                <header className="mb-20">
                    <div className="w-16 h-16 bg-[#FF9500] rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-orange-500/30">
                        <FileText className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Tài liệu ôn thi.</h1>
                    <p className="text-2xl font-medium text-[#86868b]">
                        Tổng hợp văn bản pháp luật và bộ câu hỏi chính thức.
                    </p>
                </header>

                <div className="grid gap-6">
                    <div className="p-8 rounded-[32px] bg-[#F5F5F7] hover:bg-[#F0F0F2] transition-colors border border-black/5 group cursor-pointer">
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <span className="inline-block px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] text-xs font-bold uppercase rounded-full tracking-widest">Mới nhất</span>
                                <h3 className="text-2xl font-bold group-hover:text-[#007AFF] transition-colors">Bộ câu hỏi trắc nghiệm gốc</h3>
                                <p className="text-[#86868b] max-w-xl">
                                    File PDF gốc được công bố kèm theo Quyết định của Bộ Xây dựng. Bao gồm đầy đủ các lĩnh vực hoạt động xây dựng.
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Download className="w-6 h-6 text-[#1d1d1f]" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[32px] bg-white border border-black/5 hover:shadow-lg transition-all group cursor-pointer">
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <span className="inline-block px-3 py-1 bg-[#34C759]/10 text-[#34C759] text-xs font-bold uppercase rounded-full tracking-widest">Pháp lý</span>
                                <h3 className="text-2xl font-bold group-hover:text-[#007AFF] transition-colors">Nghị định 15/2021/NĐ-CP</h3>
                                <p className="text-[#86868b] max-w-xl">
                                    Quy định chi tiết một số nội dung về quản lý dự án đầu tư xây dựng.
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-[#F5F5F7] rounded-full flex items-center justify-center">
                                <ExternalLink className="w-5 h-5 text-[#86868b]" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[32px] bg-white border border-black/5 hover:shadow-lg transition-all group cursor-pointer">
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <span className="inline-block px-3 py-1 bg-[#34C759]/10 text-[#34C759] text-xs font-bold uppercase rounded-full tracking-widest">Pháp lý</span>
                                <h3 className="text-2xl font-bold group-hover:text-[#007AFF] transition-colors">QĐ 163/QĐ-BXD ngày 18/2/2025 của Bộ Xây dựng</h3>
                                <p className="text-[#86868b] max-w-xl">
                                    (Cập nhật mới) Sửa đổi, bổ sung một số điều của Nghị định số 15/2021/NĐ-CP.
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-[#F5F5F7] rounded-full flex items-center justify-center">
                                <ExternalLink className="w-5 h-5 text-[#86868b]" />
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    )
}
