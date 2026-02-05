import { Metadata } from 'next'
import HomeClient from './HomeClient'
import Script from 'next/script'

export const metadata: Metadata = {
    title: 'Trang chủ | Hệ thống Luyện thi Chứng chỉ hành nghề Xây dựng',
    description: 'Ôn luyện và thi thử chứng chỉ hành nghề xây dựng theo Quyết định 163/QĐ-BXD. Đầy đủ các chuyên ngành, thi thử như thật, hoàn toàn miễn phí.',
}

export default function HomePage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        'name': 'Luyện thi Chứng chỉ hành nghề Xây dựng',
        'description': 'Nền tảng ôn luyện và thi thử chứng chỉ hành nghề xây dựng trực tuyến.',
        'url': 'https://luyenthichungchixd.com',
        'logo': 'https://luyenthichungchixd.com/logo.png', // Đảm bảo bạn có logo
        'sameAs': [
            'https://www.facebook.com/luyenthichungchixd', // Ví dụ
        ],
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'VND',
            'availability': 'https://schema.org/InStock'
        }
    }

    return (
        <>
            <Script
                id="structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HomeClient />
        </>
    )
}
