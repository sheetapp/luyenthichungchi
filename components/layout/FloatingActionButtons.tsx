'use client'

import React, { useState, useEffect } from 'react'
import { MessageCircle, Heart, Phone, Headphones, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export function FloatingActionButtons() {
    const [isOpen, setIsOpen] = useState(false)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <>
            {/* Mobile Floating Buttons */}
            <div className="fixed right-4 bottom-24 z-40 flex flex-col items-end gap-3 md:hidden">

                {/* Expanded State (Mobile) */}
                {isOpen && (
                    <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-5 duration-300">
                        {/* Facebook */}
                        <a
                            href="https://www.facebook.com/profile.php?id=61587000098094"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-[#0084FF] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
                            aria-label="Facebook"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.912 1.446 5.51 3.706 7.206V22l3.382-1.855c.902.25 1.855.383 2.841.383 5.523 0 10-4.145 10-9.243C22 6.145 17.523 2 12 2zm.993 12.535l-2.558-2.724-4.993 2.724 5.493-5.827 2.62 2.724 4.931-2.724-5.493 5.827z" />
                            </svg>
                        </a>

                        {/* Zalo */}
                        <a
                            href="https://zalo.me/g/oxvqca810"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-white text-[#0068FF] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all border border-blue-100"
                            aria-label="Zalo"
                        >
                            <img src="https://img.icons8.com/color/48/zalo.png" alt="Zalo" className="w-7 h-7" />
                        </a>

                        {/* Phone */}
                        <a
                            href="tel:0989256894"
                            className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
                            aria-label="Call"
                        >
                            <Phone className="w-5 h-5" />
                        </a>

                        {/* Close Button (Mobile) */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-12 h-12 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Minimized State (Mobile Toggle) */}
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-14 h-14 rounded-full bg-[#007AFF] text-white flex items-center justify-center shadow-lg shadow-blue-500/40 active:scale-95 transition-all animate-bounce-slow"
                    >
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                        <Headphones className="w-7 h-7" />
                    </button>
                )}
            </div>

            {/* PC Floating Widget */}
            <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-50 items-end flex-col gap-4">

                {/* Donate Button - Always visible when user is logged in */}
                {user && (
                    <a
                        href="/buy-me-coffee"
                        className="group relative w-14 h-14 bg-gradient-to-br from-pink-500 to-red-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300"
                        title="Donate"
                    >
                        <Heart className="w-6 h-6 fill-current" />
                        <span className="absolute right-16 bg-gradient-to-br from-pink-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Donate
                        </span>
                    </a>
                )}

                {/* Expanded State */}
                {isOpen && (
                    <div className="flex flex-col gap-3 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/20 animate-in slide-in-from-right-5 fade-in duration-300 origin-right">
                        {/* Header with Title & Close */}
                        <div className="flex flex-col items-center gap-1 pb-2 border-b border-black/5 mx-2 mt-2">
                            <div className="w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-1">
                                <Headphones className="w-4 h-4 text-[#86868b]" />
                            </div>
                            <span className="text-[10px] font-bold text-[#1d1d1f] uppercase tracking-wider">Hỗ trợ</span>
                        </div>

                        {/* Call Button */}
                        <a
                            href="tel:0989256894"
                            className="group relative w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                            title="Gọi ngay: 0989.256.894"
                        >
                            <Phone className="w-5 h-5" />
                        </a>

                        {/* Chat Facebook */}
                        <a
                            href="https://www.facebook.com/profile.php?id=61587000098094"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative w-12 h-12 bg-[#0084FF] hover:bg-[#0073E6] text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                            title="Chat Facebook"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.912 1.446 5.51 3.706 7.206V22l3.382-1.855c.902.25 1.855.383 2.841.383 5.523 0 10-4.145 10-9.243C22 6.145 17.523 2 12 2zm.993 12.535l-2.558-2.724-4.993 2.724 5.493-5.827 2.62 2.724 4.931-2.724-5.493 5.827z" />
                            </svg>
                        </a>

                        {/* Zalo */}
                        <a
                            href="https://zalo.me/g/oxvqca810"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative w-12 h-12 bg-white border border-blue-100 hover:border-blue-300 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 overflow-hidden"
                            title="Chat Zalo"
                        >
                            <img
                                src="https://img.icons8.com/color/48/zalo.png"
                                alt="Zalo"
                                className="w-8 h-8"
                            />
                        </a>

                        {/* Close Toggle */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-12 h-12 mt-1 rounded-full bg-[#1d1d1f] hover:bg-black text-white flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Minimized State (Toggle) */}
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="group relative w-14 h-14 rounded-full bg-[#1d1d1f] hover:bg-[#000] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce-slow"
                    >
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                        <Headphones className="w-7 h-7" />
                        <span className="absolute right-16 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Hỗ trợ 24/7
                        </span>
                    </button>
                )}
            </div>
        </>
    )
}
