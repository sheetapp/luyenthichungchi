import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTurnstileToken } from '@/lib/security/turnstile'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { turnstileToken, examData } = body

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

        // 3. Validate exam data
        if (!examData || !examData.hang || !examData.chuyen_nganh) {
            return NextResponse.json(
                { error: 'Invalid exam data' },
                { status: 400 }
            )
        }

        // 4. Insert exam result to database
        const { data, error } = await supabase
            .from('exam_results')
            .insert({
                user_id: user.id,
                hang: examData.hang,
                chuyen_nganh: examData.chuyen_nganh,
                score: examData.score,
                general_score: examData.general_score,
                specialty_score: examData.specialty_score,
                time_taken: examData.time_taken,
                passed: examData.passed,
                answers: examData.answers,
                is_public: false
            })
            .select()
            .single()

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json(
                { error: 'Failed to save exam result. Please try again.' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data
        })

    } catch (error) {
        console.error('Exam submission error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
