import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
    subsets: ['latin', 'vietnamese'],
    weight: ['400', '500', '600', '700', '800', '900'],
    display: 'swap',
    variable: '--font-inter',
})

export const metadata: Metadata = {
    title: {
        default: 'Luyện thi Chứng chỉ hành nghề Xây dựng',
        template: '%s | Luyện thi Chứng chỉ hành nghề Xây dựng'
    },
    description: 'Nền tảng ôn luyện và thi thử Chứng chỉ hành nghề Xây dựng theo QĐ 163/QĐ-BXD ngày 18/2/2025. Cập nhật mới nhất, hoàn toàn miễn phí.',
    keywords: ['chứng chỉ hành nghề xây dựng', 'ôn thi xây dựng', 'thi thử chứng chỉ xây dựng', 'QĐ 163/QĐ-BXD', 'bộ xây dựng'],
    authors: [{ name: 'Luyện thi Xây dựng' }],
    creator: 'Luyện thi Xây dựng',
    publisher: 'Luyện thi Xây dựng',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://www.luyenthiccxd.com/'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: 'Luyện thi Chứng chỉ hành nghề Xây dựng',
        description: 'Hệ thống ôn luyện thông minh, cập nhật theo QĐ 163/QĐ-BXD. Miễn phí 1000+ câu hỏi.',
        url: 'https://www.luyenthiccxd.com/',
        siteName: 'Luyện thi Chứng chỉ hành nghề Xây dựng',
        locale: 'vi_VN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Luyện thi Chứng chỉ hành nghề Xây dựng',
        description: 'Ôn luyện và thi thử Chứng chỉ hành nghề Xây dựng theo QĐ 163/QĐ-BXD.',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/icon.png',
        shortcut: '/icon.png',
        apple: '/icon.png',
    },
    verification: {
        google: 'OHHHh1YcJynegfdSMg8SURWLu4sCuD-yapxLz_gO1Ko',
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="vi" className={inter.variable}>
            <body className={`${inter.className} antialiased`}>
                {children}
            </body>
        </html>
    )
}
