import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/quan-tri/'],
        },
        sitemap: 'https://luyenthichungchixd.com/sitemap.xml', // Thay đổi bằng domain thật của bạn
    }
}
