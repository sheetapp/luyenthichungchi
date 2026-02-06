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
    description: 'Nền tảng luyện thi chứng chỉ hành nghề xây dựng Online miễn phí mới nhất 2026. Thi thử sát hạch chứng chỉ giám sát, thiết kế, định giá hạng 1, 2, 3 có đáp án chi tiết theo QĐ 163/QĐ-BXD.',
    keywords: [
        // Từ khóa chung
        'chứng chỉ hành nghề xây dựng',
        'ôn thi xây dựng',
        'thi thử chứng chỉ xây dựng',
        'xây dựng 2026',
        'chứng chỉ xây dựng 2026',
        'QĐ 163/QĐ-BXD',
        'bộ xây dựng',
        'chứng chỉ năng lực xây dựng',
        'thi chứng chỉ xây dựng hạng 1',
        'thi chứng chỉ xây dựng hạng 2',
        'thi chứng chỉ xây dựng hạng 3',
        'thi thử chứng chỉ xây dựng online',
        'trắc nghiệm xây dựng có đáp án',

        // Từ khóa theo chuyên ngành
        'khảo sát địa hình',
        'khảo sát địa chất công trình',
        'thiết kế quy hoạch xây dựng',
        'thiết kế kết cấu công trình',
        'thiết kế công trình khai thác mỏ',
        'thiết kế công trình đường bộ',
        'thiết kế công trình đường sắt',
        'thiết kế công trình cầu hầm',
        'thiết kế công trình đường thủy',
        'thiết kế công trình thủy lợi đê điều',
        'thiết kế cấp thoát nước',
        'thiết kế xử lý chất thải rắn',
        'thiết kế cơ điện công trình',
        'thiết kế hệ thống điện',
        'thiết kế thông gió cấp thoát nhiệt',
        'giám sát xây dựng công trình',
        'giám sát lắp đặt thiết bị',
        'định giá xây dựng',
        'quản lý dự án đầu tư xây dựng'
    ],
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
        title: 'Luyện thi Chứng chỉ hành nghề Xây dựng Online 2026',
        description: 'Hệ thống ôn luyện, thi thử sát hạch chứng chỉ hành nghề xây dựng miễn phí. Cập nhật bộ đề mới nhất theo QĐ 163/QĐ-BXD.',
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
