import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTurnstileToken } from '@/lib/security/turnstile'

export async function POST(request: NextRequest) {
    try {
        const { turnstileToken, rating, content } = await request.json()

        // 1. Verify Turnstile token (Bot protection)
        const verification = await verifyTurnstileToken(turnstileToken)
        if (!verification.success) {
            return NextResponse.json(
                { error: 'Bot detected. Please complete CAPTCHA verification.' },
                { status: 403 }
            )
        }

        // 2. Verify user authentication
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please login first.' },
                { status: 401 }
            )
        }

        // 3. Validate feedback data
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Invalid rating. Must be between 1-5.' },
                { status: 400 }
            )
        }

        // 4. Insert feedback to database
        const { error } = await supabase
            .from('app_evaluations')
            .insert({
                user_id: user.id,
                rating,
                content: content || ''
            })

        if (error) {
            // Check for rate limit error
            if (error.message.includes('Rate limit exceeded')) {
                return NextResponse.json(
                    { error: 'Bạn gửi góp ý quá nhanh. Vui lòng đợi 5 phút.' },
                    { status: 429 }
                )
            }

            console.error('Database error:', error)
            return NextResponse.json(
                { error: 'Failed to submit feedback. Please try again.' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Feedback submission error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
