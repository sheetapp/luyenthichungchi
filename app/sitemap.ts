import { MetadataRoute } from 'next'
import { CHUYEN_NGANH_OPTIONS, HANG_OPTIONS } from '@/constants/categories'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.luyenthiccxd.com' // Thay đổi bằng domain thật của bạn

    // Các trang tĩnh
    const staticPages = [
        '',
        '/gioi-thieu',
        '/on-tap',
        '/thi-thu',
        '/tai-lieu',
        '/lien-he',
        '/chinh-sach-bao-mat',
        '/dieu-khoan-su-dung',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Các trang chuyên ngành (Dynamic)
    const categoryPages = []
    for (const hang of HANG_OPTIONS) {
        for (const chuyenNganh of CHUYEN_NGANH_OPTIONS) {
            categoryPages.push({
                url: `${baseUrl}/on-tap?hang=${encodeURIComponent(hang)}&chuyen_nganh=${encodeURIComponent(chuyenNganh)}`,
                lastModified: new Date(),
                changeFrequency: 'monthly' as const,
                priority: 0.6,
            })
        }
    }

    return [...staticPages, ...categoryPages]
}
