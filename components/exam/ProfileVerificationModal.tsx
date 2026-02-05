'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { X, User, Phone, Briefcase, Users, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

interface ProfileVerificationModalProps {
    isOpen: boolean
    userId: string
    examCategory: string
    onComplete: () => void
}

export function ProfileVerificationModal({
    isOpen,
    userId,
    examCategory,
    onComplete
}: ProfileVerificationModalProps) {
    const router = useRouter()
    const [formData, setFormData] = useState({
        display_name: '',
        phone: '',
        job_title: '',
        gender: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
    const turnstileRef = useRef<TurnstileInstance>(null)

    // Validation logic
    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.display_name.trim()) {
            newErrors.display_name = 'Vui lòng nhập họ và tên'
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại'
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ (10 chữ số)'
        }

        if (!formData.job_title) {
            newErrors.job_title = 'Vui lòng chọn nghề nghiệp'
        }

        if (!formData.gender) {
            newErrors.gender = 'Vui lòng chọn giới tính'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate CAPTCHA
        if (!turnstileToken) {
            alert('Vui lòng hoàn thành xác minh bảo mật!')
            return
        }

        if (!validate()) return

        setIsSubmitting(true)

        try {
            console.log('Updating profile for user:', userId)
            console.log('Form data:', formData)

            const { data, error } = await supabase
                .from('profiles')
                .update(formData)
                .eq('id', userId)
                .select()

            console.log('Update response:', { data, error })

            if (error) {
                console.error('Supabase error details:', error)
                throw error
            }

            // Navigate to exam page
            router.push(`/thi-thu/${encodeURIComponent(examCategory)}`)
            onComplete()

            // Reset CAPTCHA
            turnstileRef.current?.reset()
            setTurnstileToken(null)
        } catch (error: any) {
            console.error('Error updating profile:', error)
            const errorMessage = error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
            alert(`Lỗi: ${errorMessage}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-apple-card border border-apple-border rounded-[28px] p-6 md:p-8 max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-apple-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-apple-blue" />
                    </div>
                    <h2 className="text-2xl font-bold text-apple-text mb-2">
                        Hoàn thiện thông tin
                    </h2>
                    <p className="text-sm text-apple-text-secondary">
                        Vui lòng cập nhật thông tin cá nhân để bắt đầu thi thử
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Display Name */}
                    <div>
                        <label className="block text-sm font-bold text-apple-text mb-2">
                            Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.display_name}
                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                            className="w-full px-4 py-3 bg-apple-bg border border-apple-border rounded-xl outline-none focus:ring-2 focus:ring-apple-blue/20 text-apple-text"
                            placeholder="Nguyễn Văn A"
                        />
                        {errors.display_name && (
                            <p className="text-xs text-red-500 mt-1">{errors.display_name}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-bold text-apple-text mb-2">
                            Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 bg-apple-bg border border-apple-border rounded-xl outline-none focus:ring-2 focus:ring-apple-blue/20 text-apple-text"
                            placeholder="0912345678"
                        />
                        {errors.phone && (
                            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                        )}
                    </div>

                    {/* Job Title */}
                    <div>
                        <label className="block text-sm font-bold text-apple-text mb-2">
                            Nghề nghiệp <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.job_title}
                            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                            className="w-full px-4 py-3 bg-apple-bg border border-apple-border rounded-xl outline-none focus:ring-2 focus:ring-apple-blue/20 text-apple-text"
                        >
                            <option value="">Chọn nghề nghiệp</option>
                            <option value="Kỹ sư xây dựng">Kỹ sư xây dựng</option>
                            <option value="Kiến trúc sư">Kiến trúc sư</option>
                            <option value="Giám sát thi công">Giám sát thi công</option>
                            <option value="Quản lý dự án">Quản lý dự án</option>
                            <option value="Sinh viên">Sinh viên</option>
                            <option value="Khác">Khác</option>
                        </select>
                        {errors.job_title && (
                            <p className="text-xs text-red-500 mt-1">{errors.job_title}</p>
                        )}
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-bold text-apple-text mb-2">
                            Giới tính <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full px-4 py-3 bg-apple-bg border border-apple-border rounded-xl outline-none focus:ring-2 focus:ring-apple-blue/20 text-apple-text"
                        >
                            <option value="">Chọn giới tính</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                        {errors.gender && (
                            <p className="text-xs text-red-500 mt-1">{errors.gender}</p>
                        )}
                    </div>

                    {/* Security Verification */}
                    <div>
                        <label className="block text-sm font-bold text-apple-text mb-2">
                            Xác minh bảo mật <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-col items-center gap-2">
                            <div className="scale-90 origin-center min-h-[65px] w-full flex justify-center">
                                <Turnstile
                                    ref={turnstileRef}
                                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                                    onSuccess={setTurnstileToken}
                                    onExpire={() => setTurnstileToken(null)}
                                    onError={() => setTurnstileToken(null)}
                                    options={{
                                        theme: 'light',
                                        size: 'normal',
                                    }}
                                />
                            </div>
                            {!turnstileToken && (
                                <p className="text-[10px] text-orange-500 font-semibold flex items-center gap-1 animate-pulse">
                                    <ShieldCheck className="w-3 h-3" />
                                    Vui lòng xác minh để bảo mật hệ thống
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !turnstileToken}
                        className="w-full py-3.5 bg-apple-blue text-white font-bold rounded-xl hover:bg-apple-blue/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {isSubmitting ? 'Đang lưu...' : 'Hoàn tất và bắt đầu thi'}
                    </button>
                </form>
            </div>
        </div>
    )
}
