import { Metadata, ResolvingMetadata } from 'next'
import PracticeClient from './PracticeClient'
import { Suspense } from 'react'

type Props = {
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    { searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const hang = searchParams.hang as string
    const chuyenNganh = searchParams.chuyen_nganh as string

    if (hang && chuyenNganh) {
        return {
            title: `Ôn tập ${chuyenNganh} - ${hang}`,
            description: `Hệ thống ôn tập câu hỏi sát hạch chứng chỉ hành nghề xây dựng cho chuyên ngành ${chuyenNganh}, ${hang}. Cập nhật theo QĐ 163/QĐ-BXD.`,
        }
    }

    return {
        title: 'Hệ thống Ôn tập',
        description: 'Luyện tập với bộ câu hỏi sát hạch chứng chỉ hành nghề xây dựng được cập nhật mới nhất. Theo dõi tiến độ và củng cố kiến thức hiệu quả.',
    }
}

export default function PracticePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
            <PracticeClient />
        </Suspense>
    )
}
