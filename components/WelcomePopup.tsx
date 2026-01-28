'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, BookOpen, Trophy, Target, ChevronRight } from 'lucide-react'

interface WelcomePopupProps {
    userName: string
    onClose: () => void
}

export function WelcomePopup({ userName, onClose }: WelcomePopupProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const steps = [
        {
            icon: Sparkles,
            title: 'Chào mừng đến với CCHN!',
            description: `Xin chào ${userName}! Chúng tôi rất vui khi bạn tham gia cùng chúng tôi.`,
            color: 'from-blue-500 to-indigo-500',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            icon: BookOpen,
            title: 'Ôn tập theo chủ đề',
            description: 'Luyện tập với hơn 1000+ câu hỏi được phân loại theo chuyên ngành và hạng chứng chỉ.',
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600'
        },
        {
            icon: Trophy,
            title: 'Thi thử thực tế',
            description: 'Làm bài thi thử với điều kiện giống thi thật: 30 câu hỏi, 60 phút, điểm đạt 18/30.',
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600'
        },
        {
            icon: Target,
            title: 'Theo dõi tiến độ',
            description: 'Xem thống kê chi tiết, lịch sử thi, và phân tích điểm yếu để cải thiện.',
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600'
        }
    ]

    const currentStepData = steps[currentStep]
    const Icon = currentStepData.icon

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            onClose()
        }
    }

    const handleSkip = () => {
        onClose()
    }

    if (!mounted) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                    <X className="w-5 h-5 text-slate-600" />
                </button>

                {/* Content */}
                <div className="p-8 md:p-12">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${currentStepData.color} mb-6 shadow-lg`}>
                        <Icon className="w-10 h-10 text-white" />
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-black text-slate-900 mb-4">
                        {currentStepData.title}
                    </h2>

                    {/* Description */}
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                        {currentStepData.description}
                    </p>

                    {/* Progress Dots */}
                    <div className="flex items-center gap-2 mb-8">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 rounded-full transition-all duration-300 ${index === currentStep
                                        ? 'w-8 bg-blue-600'
                                        : index < currentStep
                                            ? 'w-2 bg-blue-400'
                                            : 'w-2 bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {currentStep < steps.length - 1 ? (
                            <>
                                <button
                                    onClick={handleSkip}
                                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Bỏ qua
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                                >
                                    Tiếp tục
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="w-full px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
                            >
                                Bắt đầu ngay!
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
