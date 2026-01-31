'use client'

import React from 'react'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-[#1d1d1f]">
            <article className="max-w-3xl mx-auto px-6 py-20 md:py-32">
                <header className="mb-16">
                    <div className="w-16 h-16 bg-[#1d1d1f] rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-black/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Điều khoản sử dụng.</h1>
                    <p className="text-xl font-medium text-[#86868b]">
                        Các quy định khi sử dụng nền tảng của chúng tôi.
                    </p>
                </header>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Chấp thuận điều khoản</h2>
                        <p className="text-lg leading-relaxed text-[#424245]">
                            Bằng việc truy cập và sử dụng trang web này, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngưng sử dụng dịch vụ.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. Tài khoản người dùng</h2>
                        <p className="text-lg leading-relaxed text-[#424245]">
                            Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình. Mọi hoạt động diễn ra dưới tài khoản của bạn là trách nhiệm của bạn. Chúng tôi có quyền khóa tài khoản nếu phát hiện hành vi gian lận hoặc phá hoại.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. Quyền sở hữu trí tuệ</h2>
                        <p className="text-lg leading-relaxed text-[#424245]">
                            Toàn bộ nội dung, bao gồm bộ câu hỏi, giao diện, logo, và mã nguồn đều thuộc quyền sở hữu trí tuệ của chúng tôi hoặc các bên cấp phép. Nghiêm cấm sao chép trái phép dưới mọi hình thức nhằm mục đích thương mại.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. Miễn trừ trách nhiệm</h2>
                        <p className="text-lg leading-relaxed text-[#424245]">
                            Mặc dù chúng tôi nỗ lực đảm bảo độ chính xác của bộ câu hỏi (theo QĐ 163/QĐ-BXD ngày 18/2/2025 của Bộ Xây dựng), chúng tôi không chịu trách nhiệm cho bất kỳ sai sót nào hoặc kết quả thi thực tế của bạn. Đây là công cụ hỗ trợ ôn tập, không phải là đơn vị tổ chức thi chính thức.
                        </p>
                    </section>
                </div>
            </article>
        </div>
    )
}
