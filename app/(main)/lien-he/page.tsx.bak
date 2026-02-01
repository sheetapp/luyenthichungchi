import Link from 'next/link'
import { Phone, MapPin, User, ChevronRight } from 'lucide-react'

export default function ContactPage() {
    return (
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-6 overflow-hidden min-h-[80vh] flex flex-col items-center">

            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl w-full mx-auto relative z-10 text-center space-y-12">

                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#1d1d1f] animate-in fade-in slide-in-from-bottom-8 duration-700">
                        Liên hệ với chúng tôi
                    </h1>
                    <p className="text-xl text-[#86868b] max-w-2xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.
                    </p>
                </div>

                {/* Contact Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-[32px] p-8 md:p-12 text-left animate-in zoom-in-95 duration-700 delay-200">
                    <div className="grid md:grid-cols-2 gap-12 items-center">

                        {/* Info Column */}
                        <div className="space-y-8">
                            {/* Person */}
                            <div className="flex items-start gap-5">
                                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                    <User className="w-7 h-7" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Người liên hệ</div>
                                    <div className="text-2xl font-bold text-[#1d1d1f]">Võ Tấn Nhượng</div>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-start gap-5">
                                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
                                    <Phone className="w-7 h-7" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hotline</div>
                                    <a href="tel:0989256894" className="text-2xl font-bold text-[#1d1d1f] hover:text-green-600 transition-colors">
                                        0989.256.894
                                    </a>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-start gap-5">
                                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Địa chỉ</div>
                                    <div className="text-xl font-medium text-[#1d1d1f] leading-relaxed">
                                        Chung cư Moscow Tower,<br />
                                        Phường Đông Hưng Thuận,<br />
                                        Tp Hồ Chí Minh, Việt Nam.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Map (Placeholder/Visual) or Action */}
                        <div className="relative h-full min-h-[300px] bg-[#F5F5F7] rounded-[24px] flex items-center justify-center overflow-hidden group hover:shadow-lg transition-shadow">

                            {/* Simple Map Visual Representation */}
                            <div className="absolute inset-0 opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Ho_Chi_Minh_City_Map.png')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500" />

                            <a
                                href="https://maps.app.goo.gl/example" // Recommend updating with real link later
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative z-10 px-6 py-3 bg-white/90 backdrop-blur-md text-[#1d1d1f] font-bold rounded-full shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                            >
                                <MapPin className="w-5 h-5 text-red-500" />
                                Xem trên Google Maps
                            </a>

                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <Link href="/" className="inline-flex items-center gap-2 text-[#007AFF] hover:underline font-medium">
                        Quay lại trang chủ <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

            </div>
        </section>
    )
}
