'use client'

import { Info } from 'lucide-react'

export function AnnouncementBanner() {
    return (
        <div className="hidden md:block w-full bg-apple-bg/80 backdrop-blur-md border-b border-apple-border sticky top-0 z-50 overflow-hidden">
            <div className="px-4 md:px-6 h-10 flex items-center">
                <div className="flex items-center gap-2 px-3 py-1 bg-apple-blue/10 text-apple-blue rounded-full text-[10px] font-bold shrink-0 uppercase tracking-wider">
                    <Info className="w-3 h-3" />
                    <span>Cập nhật</span>
                </div>

                <div className="relative flex-1 overflow-hidden ml-4">
                    <div className="animate-marquee whitespace-nowrap text-sm font-semibold text-apple-text">
                        Nội dung bài thi đã cập nhật Quyết định 163/QĐ-BXD ngày 18/12/2025 • Hệ thống hỗ trợ ôn tập chính xác và mới nhất 🚀
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    display: inline-block;
                    animation: marquee 25s linear infinite;
                    padding-left: 20px;
                }
            `}</style>
        </div>
    )
}
