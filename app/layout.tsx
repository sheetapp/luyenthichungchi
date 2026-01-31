import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
    subsets: ['latin', 'vietnamese'],
    weight: ['400', '500', '600', '700', '800', '900'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Luyện thi Chứng chỉ hành nghề Xây dựng',
    description: 'Ôn luyện và thi thử theo QĐ 163/QĐ-BXD ngày 18/2/2025 của Bộ Xây dựng',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="vi">
            <body className={`${inter.className} antialiased`}>
                {children}
            </body>
        </html>
    )
}
