/**
 * Server-side Turnstile verification utility
 * Used to verify CAPTCHA tokens from Cloudflare Turnstile
 */

interface TurnstileResponse {
    success: boolean
    'error-codes'?: string[]
    challenge_ts?: string
    hostname?: string
}

export async function verifyTurnstileToken(token: string): Promise<{
    success: boolean
    error?: string
}> {
    if (!token) {
        return { success: false, error: 'Missing token' }
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY
    if (!secretKey) {
        console.error('TURNSTILE_SECRET_KEY not configured')
        return { success: false, error: 'Server configuration error' }
    }

    try {
        const response = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    secret: secretKey,
                    response: token,
                }),
            }
        )

        const data: TurnstileResponse = await response.json()

        if (!data.success) {
            console.warn('Turnstile verification failed:', data['error-codes'])
            return {
                success: false,
                error: 'CAPTCHA verification failed'
            }
        }

        return { success: true }
    } catch (error) {
        console.error('Turnstile verification error:', error)
        return {
            success: false,
            error: 'Verification service error'
        }
    }
}
