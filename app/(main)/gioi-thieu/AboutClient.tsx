'use client'

import React from 'react'
import Link from 'next/link'
import { Rocket, Shield, Zap, BookOpen, Star, CheckCircle, Users, Award, TrendingUp, MonitorPlay, MousePointer2, Gift, Layout, Medal } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-[#1d1d1f] selection:bg-[#007AFF]/20">
            {/* 1. Hero Section */}
            <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-6 overflow-hidden">
                <div className="max-w-5xl mx-auto text-center space-y-6 md:space-y-8 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-[11px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Nền tảng ôn luyện chứng chỉ xây dựng tin cậy và hoàn toàn miễn phí</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#1d1d1f] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Luyện thi chứng chỉ<br />
                        <span className="text-[#86868b]">thật dễ dàng.</span>
                    </h1>

                    <p className="text-xl md:text-2xl font-medium text-[#86868b] max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        Hệ thống ôn luyện thông minh, cập nhật theo QĐ 163/QĐ-BXD ngày 18/2/2025 của Bộ Xây dựng. Thiết kế tối ưu cho trải nghiệm người dùng.
                    </p>

                    <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <Link href="/on-tap" className="px-8 py-4 bg-[#007AFF] text-white rounded-full font-semibold text-lg hover:bg-[#0077ED] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/30 flex items-center gap-2">
                            <Rocket className="w-5 h-5" /> Trải nghiệm ngay
                        </Link>
                        <Link href="/thi-thu" className="px-8 py-4 bg-[#F5F5F7] text-[#1d1d1f] rounded-full font-semibold text-lg hover:bg-[#E8E8ED] transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                            <MonitorPlay className="w-5 h-5" /> Xem Demo
                        </Link>
                    </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#007AFF]/5 to-purple-500/5 rounded-full blur-3xl -z-10" />
            </section>

            {/* 2. Stats Section (Trust Indicators) */}
            <section className="py-12 bg-[#fafafa] border-y border-black/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        <StatItem value="3000+" label="Câu hỏi cập nhật" icon={BookOpen} color="text-orange-500" />
                        <StatItem value="30+" label="Đề thi mô phỏng" icon={FileTextIcon} color="text-blue-500" />
                        <StatItem value="95%" label="Tỷ lệ đỗ cao" icon={TrendingUp} color="text-green-500" />
                        <StatItem value="24/7" label="Hỗ trợ trực tuyến" icon={HeadphonesIcon} color="text-purple-500" />
                    </div>
                </div>
            </section>

            {/* 3. Features (Bento Grid) */}
            <section className="py-24 px-6 md:px-12 bg-white">
                <div className="max-w-6xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Tại sao chọn chúng tôi?</h2>
                        <p className="text-xl text-[#86868b] font-medium">Những tính năng độc quyền giúp bạn học nhanh hơn, nhớ lâu hơn.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {/* Large Card */}
                        <div className="md:col-span-2 p-8 md:p-12 rounded-[32px] bg-[#F5F5F7] hover:bg-[#F0F0F2] transition-colors relative overflow-hidden group">
                            <div className="space-y-4 relative z-10 max-w-lg">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                    <MousePointer2 className="w-8 h-8 text-[#1d1d1f]" />
                                </div>
                                <h3 className="text-3xl font-bold">Hands-free Navigation.</h3>
                                <p className="text-[#86868b] text-lg font-medium leading-relaxed">
                                    Công nghệ điều hướng "Rảnh tay" tiên tiến. Cho phép bạn duyệt câu hỏi, chọn đáp án và nộp bài hoàn toàn bằng bàn phím. Tối ưu tốc độ làm bài gấp 2 lần.
                                </p>
                            </div>
                            <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-5 group-hover:opacity-10 transition-opacity">
                                <KeyboardPattern />
                            </div>
                        </div>

                        {/* Tall Card */}
                        <div className="md:row-span-2 p-8 md:p-12 rounded-[32px] bg-[#1d1d1f] text-white relative overflow-hidden flex flex-col justify-between group">
                            <div className="space-y-4 relative z-10">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md mb-4">
                                    <Layout className="w-8 h-8 text-cyan-400" />
                                </div>
                                <h3 className="text-3xl font-bold text-white leading-tight">Tối ưu trải nghiệm.</h3>
                                <p className="text-gray-400 text-lg font-medium leading-relaxed">
                                    Sử dụng công nghệ mới nhất, giao diện được thiết kế tỉ mỉ cho cả PC và Mobile. Mang lại cảm giác thoải mái, tiện dụng và mượt mà tối đa cho người dùng.
                                </p>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity" />
                        </div>

                        {/* Small Card 1 */}
                        <div className="p-8 rounded-[32px] bg-[#F5F5F7] hover:bg-[#F0F0F2] transition-colors space-y-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Gift className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold">Hoàn toàn miễn phí.</h3>
                            <p className="text-[#86868b] text-sm font-medium">
                                Cam kết không thu phí trọn đời. Mọi tính năng đều được mở khóa sẵn cho cộng đồng.
                            </p>
                        </div>

                        {/* Small Card 2 */}
                        <div className="p-8 rounded-[32px] bg-[#F5F5F7] hover:bg-[#F0F0F2] transition-colors space-y-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <Award className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold">Mô phỏng thi thật.</h3>
                            <p className="text-[#86868b] text-sm font-medium">
                                Giao diện và áp lực thời gian giống 100% kỳ thi sát hạch thực tế.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Expert Reviews (Infinite Marquee) */}
            <section className="py-10 md:py-16 bg-[#F5F5F7] border-t border-black/5 overflow-hidden">
                <style jsx>{`
                    @keyframes scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(calc(-50% - 16px)); } /* -50% width - gap */
                    }
                    .animate-scroll {
                        animation: scroll 60s linear infinite;
                    }
                    .animate-scroll:hover {
                         animation-play-state: paused;
                    }
                `}</style>

                <div className="space-y-12">
                    <div className="max-w-6xl mx-auto px-6 text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#1d1d1f] shadow-sm border border-black/5 text-[11px] font-bold uppercase tracking-widest">
                            <Users className="w-3 h-3" />
                            <span>Cộng đồng chuyên gia</span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Được tin dùng bởi các kỹ sư.</h2>
                    </div>

                    <div className="w-full">
                        <div className="flex gap-4 md:gap-8 w-max animate-scroll pl-4 md:pl-8">
                            {/* Double the list for seamless looping */}
                            {[...REVIEWS, ...REVIEWS].map((review, idx) => (
                                <ReviewCard
                                    key={`${review.name}-${idx}`}
                                    {...review}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

// ---- Data & Helpers ----

const NAMES = [
    "Nguyễn Đức Mạnh", "Bùi Công Tâm", "Lê Viết Duy", "Nguyễn Văn Nhật",
    "Lê Thi Hồng Ánh", "Lê Minh Quân", "Đào Văn Anh", "Nguyễn Ngọc Tuấn Anh",
    "Lê Văn Công Bách", "Lê Hoàng Chương", "Nguyễn Thiên Vũ",
    "Lê Nguyễn Ngọc Ánh", "Võ Khắc Triệu"
]

const COMMENTS = [
    "Hệ thống giúp tôi tiết kiệm 50% thời gian ôn tập. Rất đáng tiền.",
    "Giao diện đẹp, hiện đại. Tôi thích nhất tính năng điều hướng bằng bàn phím.",
    "Kho đề thi phong phú và cập nhật nhanh. Tôi đã đỗ chứng chỉ hạng I nhờ web này.",
    "Trải nghiệm mượt mà, không bị lag như các web khác. Rất tuyệt.",
    "Phần mềm rất hữu ích cho anh em kỹ sư. Cảm ơn đội ngũ phát triển.",
    "Ôn thi sát hạch trở nên nhẹ nhàng hơn hẳn nhờ công cụ này.",
    "Thích nhất là tính năng Hands-free, nằm trên giường vẫn ôn bài được.",
    "Giao diện chuẩn Apple nhìn rất sang. Nội dung thì quá ok.",
    "Đã giới thiệu cho cả phòng cùng dùng. Ai cũng khen.",
    "Tuyệt vời. Mong web phát triển thêm nhiều tính năng mới."
]

// Generate Reviews
const REVIEWS = NAMES.map((name, i) => {
    const stars = i % 5 === 0 ? 4 : 5 // Mostly 5 stars
    const badgeLabel = stars === 5 ? "Chuyên gia" : "Thành thạo"
    const badgeColor = stars === 5 ? "text-purple-600 bg-purple-100" : "text-blue-600 bg-blue-100"

    return {
        name,
        content: COMMENTS[i % COMMENTS.length],
        avatar: name.split(' ').pop()?.substring(0, 1) || 'U',
        stars: stars,
        badgeLabel,
        badgeColor
    }
})


function StatItem({ value, label, icon: Icon, color }: any) {
    return (
        <div className="flex flex-col items-center gap-2 group cursor-default">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-black/5 mb-2 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1d1d1f] group-hover:text-[#007AFF] transition-colors">{value}</div>
            <div className="text-xs font-bold text-[#86868b] uppercase tracking-widest">{label}</div>
        </div>
    )
}

function ReviewCard({ name, content, avatar, stars, badgeLabel, badgeColor }: any) {
    return (
        <div className="p-4 md:p-6 rounded-[20px] md:rounded-[24px] bg-white border border-black/5 shadow-sm space-y-3 md:space-y-4 flex flex-col justify-between w-[260px] md:w-[300px] shrink-0 hover:scale-105 transition-transform duration-300">
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <div className="flex gap-0.5 md:gap-1">
                        {[...Array(stars)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 md:w-3.5 md:h-3.5 fill-[#FF9500] text-[#FF9500]" />
                        ))}
                    </div>
                </div>
                <p className="text-[#1d1d1f] text-xs md:text-sm font-medium leading-relaxed italic line-clamp-3">"{content}"</p>
            </div>

            <div className="flex items-center gap-3 md:gap-4 pt-3 md:pt-4 border-t border-black/5">
                <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-md bg-gradient-to-br from-gray-700 to-black`}>
                    {avatar}
                </div>
                <div>
                    <div className="font-bold text-[12px] md:text-sm text-[#1d1d1f]">{name}</div>
                    <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-wider mt-0.5 ${badgeColor}`}>
                        <Medal className="w-2.5 h-2.5" />
                        {badgeLabel}
                    </div>
                </div>
            </div>
        </div>
    )
}

function KeyboardPattern() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" opacity="0.5">
            <path d="M10 10h80v80h-80z" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M30 30h40v40h-40z" stroke="currentColor" strokeWidth="2" />
        </svg>
    )
}

// Icons
function FileTextIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="m9 15 3 3 3-3" /></svg>
}
function HeadphonesIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14v-3a9 9 0 0 1 18 0v3" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>
}
