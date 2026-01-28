'use client'

import { MessageCircle, Heart, Phone } from 'lucide-react'

export function FloatingActionButtons() {
    return (
        <>
            {/* Mobile Floating Buttons - Keep existing simple circular buttons */}
            <div className="fixed right-4 bottom-24 z-40 flex flex-col gap-3 md:hidden">
                {/* Facebook */}
                <a
                    href="https://www.facebook.com/profile.php?id=61587000098094"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-[#0084FF] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all"
                    aria-label="Facebook"
                >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.912 1.446 5.51 3.706 7.206V22l3.382-1.855c.902.25 1.855.383 2.841.383 5.523 0 10-4.145 10-9.243C22 6.145 17.523 2 12 2zm.993 12.535l-2.558-2.724-4.993 2.724 5.493-5.827 2.62 2.724 4.931-2.724-5.493 5.827z" />
                    </svg>
                </a>

                {/* Zalo Group */}
                <a
                    href="https://zalo.me/g/oxvqca810"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg shadow-blue-400/40 hover:scale-110 active:scale-95 transition-all border-2 border-[#0180C7]"
                    aria-label="Nhóm Zalo"
                >
                    <img
                        src="https://img.icons8.com/color/48/zalo.png"
                        alt="Zalo"
                        className="w-8 h-8"
                    />
                </a>

                {/* Buy a Coffee */}
                <a
                    href="/buy-me-a-coffee"
                    className="w-14 h-14 bg-gradient-to-br from-pink-500 to-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-pink-500/40 hover:scale-110 active:scale-95 transition-all"
                    aria-label="Buy me a coffee"
                >
                    <Heart className="w-6 h-6 fill-current" />
                </a>
            </div>

            {/* PC Floating Buttons - Compact Icon Design */}
            <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-3">
                {/* Call Button */}
                <a
                    href="tel:0989256894"
                    className="group relative w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
                    aria-label="Gọi điện"
                >
                    <Phone className="w-6 h-6" />
                    <span className="absolute right-16 bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        0989.256.894
                    </span>
                </a>

                {/* Chat Facebook */}
                <a
                    href="https://www.facebook.com/profile.php?id=61587000098094"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-14 h-14 bg-[#0084FF] hover:bg-[#0073E6] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
                    aria-label="Chat Facebook"
                >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.912 1.446 5.51 3.706 7.206V22l3.382-1.855c.902.25 1.855.383 2.841.383 5.523 0 10-4.145 10-9.243C22 6.145 17.523 2 12 2zm.993 12.535l-2.558-2.724-4.993 2.724 5.493-5.827 2.62 2.724 4.931-2.724-5.493 5.827z" />
                    </svg>
                    <span className="absolute right-16 bg-[#0084FF] text-white text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Chat Facebook
                    </span>
                </a>

                {/* Trao đổi, góp ý - Zalo */}
                <a
                    href="https://zalo.me/g/oxvqca810"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-14 h-14 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
                    aria-label="Trao đổi, góp ý"
                >
                    <img
                        src="https://img.icons8.com/color/48/zalo.png"
                        alt="Zalo"
                        className="w-8 h-8"
                    />
                    <div className="absolute right-16 bg-white border-2 border-slate-200 text-slate-900 text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                        <div className="text-slate-900 font-bold">Trao đổi, góp ý</div>
                        <div className="text-blue-600 text-[10px]">Chat Zalo ngay</div>
                    </div>
                </a>

                {/* Buy a Coffee */}
                <a
                    href="/buy-me-a-coffee"
                    className="group relative w-14 h-14 bg-gradient-to-br from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
                    aria-label="Buy a coffee"
                >
                    <Heart className="w-6 h-6 fill-current" />
                    <span className="absolute right-16 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Buy a coffee
                    </span>
                </a>
            </div>
        </>
    )
}
