'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface AppleSelectProps {
    value: string
    onChange: (value: string) => void
    options: string[]
    className?: string
}

export function AppleSelect({ value, onChange, options, className = '' }: AppleSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-5 py-3.5 bg-apple-bg border border-apple-border rounded-2xl text-[14px] font-bold text-apple-text cursor-pointer transition-all duration-300 ${isOpen ? 'ring-4 ring-apple-blue/5 border-apple-blue/30 shadow-apple-shadow' : 'hover:border-apple-border/80 shadow-apple-shadow-sm'
                    }`}
            >
                <span className="truncate">{value}</span>
                <ChevronDown className={`w-4 h-4 text-apple-text-secondary transition-transform duration-500 ${isOpen ? 'rotate-180 text-apple-blue' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-[100] bg-apple-glass-bg backdrop-blur-3xl border border-apple-glass-border rounded-2xl shadow-apple-card-shadow py-2 animate-in fade-in zoom-in-95 duration-200 origin-top">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar-select">
                        {options.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => {
                                    onChange(option)
                                    setIsOpen(false)
                                }}
                                className={`w-full text-left px-5 py-3 text-[14px] font-bold transition-all duration-200 ${value === option
                                        ? 'bg-apple-blue text-white mx-2 w-[calc(100%-16px)] rounded-xl'
                                        : 'text-apple-text hover:bg-apple-blue/5'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar-select::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar-select::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar-select::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
                .dark .custom-scrollbar-select::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    )
}
