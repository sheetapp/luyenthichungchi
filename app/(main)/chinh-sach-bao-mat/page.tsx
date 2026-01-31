'use client'

import React from 'react'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-[#1d1d1f]">
            <article className="max-w-3xl mx-auto px-6 py-20 md:py-32">
                <header className="mb-16">
                    <div className="w-16 h-16 bg-[#007AFF] rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Chính sách bảo mật.</h1>
                    <p className="text-xl font-medium text-[#86868b]">
                        Quyền riêng tư của bạn là quan trọng nhất đối với chúng tôi.
                    </p>
                </header>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Thu thập dữ liệu</h2>
                        <p className="text-lg leading-relaxed text-[#424245]">
                            Chúng tôi chỉ thu thập những thông tin cần thiết tối thiểu để cung cấp dịch vụ cho bạn, bao gồm địa chỉ email để đăng nhập và lịch sử bài thi để theo dõi tiến độ. Chúng tôi không thu thập dữ liệu vị trí hay danh bạ của bạn.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. Sử dụng thông tin</h2>
                        <p className="text-lg leading-relaxed text-[#424245]">
                            Thông tin cá nhân của bạn chỉ được sử dụng để:
                        </p>
                        <ul className="list-disc list-inside mt-4 space-y-2 text-[#424245] ml-4">
                            <li>Xác thực tài khoản người dùng.</li>
                            <li>Lưu trữ kết quả thi và lịch sử ôn tập.</li>
                            <li>Cải thiện chất lượng bộ câu hỏi dựa trên phân tích lỗi sai chung.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. Bảo mật</h2>
                        <p className="text-lg leading-relaxed text-[#424245]">
                            Dữ liệu của bạn được mã hóa và lưu trữ an toàn trên hạ tầng của Supabase (nền tảng cơ sở dữ liệu hàng đầu). Mật khẩu của bạn không bao giờ được lưu trữ dưới dạng văn bản thuần túy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. Chia sẻ dữ liệu</h2>
                        <p className="text-lg leading-relaxed text-[#424245]">
                            Chúng tôi cam kết **không bao giờ** bán dữ liệu cá nhân của bạn cho bên thứ ba. Dữ liệu của bạn thuộc về bạn.
                        </p>
                    </section>
                </div>
            </article>
        </div>
    )
}
