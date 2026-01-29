'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { FloatingActionButtons } from '@/components/layout/FloatingActionButtons'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'

import { ThemeProvider } from '@/components/theme/ThemeContext'

function MainLayoutContent({
    children,
}: {
    children: React.ReactNode
}) {
    const { collapsed } = useSidebar()
    return (
        <div className="min-h-screen bg-apple-bg transition-colors duration-300">
            {/* PC Sidebar */}
            <Sidebar />

            {/* Mobile Header (Sticky) */}
            <div className="md:hidden">
                <MobileHeader />
            </div>

            {/* Main Content */}
            <main className={`pb-20 md:pb-4 transition-all duration-300 ${collapsed ? 'md:ml-20' : 'md:ml-72'}`}>
                {children}
            </main>

            {/* Floating Action Buttons */}
            <FloatingActionButtons />

            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </div>
    )
}

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ThemeProvider>
            <SidebarProvider>
                <MainLayoutContent>{children}</MainLayoutContent>
            </SidebarProvider>
        </ThemeProvider>
    )
}
