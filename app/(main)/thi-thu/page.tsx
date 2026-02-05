import { Metadata } from 'next'
import ExamClient from './ExamClient'

export const metadata: Metadata = {
    title: 'Thi thử sát hạch',
    description: 'Trải nghiệm kỳ thi sát hạch chứng chỉ hành nghề xây dựng như thật. Thời gian 30 phút, 30 câu hỏi, chấm điểm tự động và có đáp án chi tiết.',
}

export default function ExamPage() {
    return <ExamClient />
}
