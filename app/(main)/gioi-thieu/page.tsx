import { Metadata } from 'next'
import AboutClient from './AboutClient'
import Script from 'next/script'

export const metadata: Metadata = {
    title: 'Giới thiệu',
    description: 'Tìm hiểu về nền tảng luyện thi chứng chỉ hành nghề xây dựng. Hệ thống thông minh, cập nhật và hoàn toàn miễn phí cho cộng đồng kỹ sư.',
}

export default function AboutPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {
                '@type': 'Question',
                'name': 'Hệ thống có mất phí không?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'Hệ thống hoàn toàn miễn phí trọn đời cho cộng đồng kỹ sư xây dựng.'
                }
            },
            {
                '@type': 'Question',
                'name': 'Câu hỏi có cập nhật theo QĐ 163/QĐ-BXD không?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'Có, toàn bộ câu hỏi được cập nhật mới nhất theo Quyết định 163/QĐ-BXD ngày 18/2/2025 của Bộ Xây dựng.'
                }
            },
            {
                '@type': 'Question',
                'name': 'Có thể thi thử trên điện thoại không?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'Website được tối ưu hoàn hảo cho cả PC và điện thoại di động, mang lại trải nghiệm mượt mà nhất.'
                }
            }
        ]
    }

    return (
        <>
            <Script
                id="faq-structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <AboutClient />
        </>
    )
}
