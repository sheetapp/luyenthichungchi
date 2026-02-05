import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    // Security Headers - Enhanced
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    },
                    // NEW: HSTS - Force HTTPS
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    // NEW: CSP - Content Security Policy
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' challenges.cloudflare.com",
                            "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
                            "font-src 'self' fonts.gstatic.com",
                            "img-src 'self' data: https:",
                            "connect-src 'self' *.supabase.co challenges.cloudflare.com",
                            "frame-src 'self' challenges.cloudflare.com"
                        ].join('; ')
                    }
                ],
            },
        ]
    },
}

export default nextConfig
