import { Star, MessageSquare, AlertTriangle } from 'lucide-react'

export interface Feedback {
    id: string
    user_id: string
    rating: number | null
    content: string | null
    feedback_type: string
    status: string
    created_at: string
    question_id: string | null
    hang: string | null
    phan_thi: string | null
    stt: number | null
    chuyen_nganh: string | null
    admin_response: string | null
    admin_responded_at: string | null
    admin_user_id: string | null
    email: string | null
    answer: any | null
}

export interface Question {
    id: number
    cau_hoi: string
    dap_an_a: string
    dap_an_b: string
    dap_an_c: string
    dap_an_d: string
    dap_an_dung: string
    hang: string
    phan_thi: string
    chuyen_nganh: string
}

export const HANG_OPTIONS = ['Tất cả', 'Hạng I', 'Hạng II', 'Hạng III']

export const CHUYEN_NGANH_OPTIONS = [
    'Tất cả',
    'Thiết kế cơ - điện công trình - Hệ thống điện',
    'Giám sát công tác lắp đặt thiết bị công trình',
    'Giám sát công tác xây dựng công trình',
    'Khảo sát địa chất công trình',
    'Khảo sát địa hình',
    'Quản lý dự án đầu tư xây dựng',
    'Thiết kế cơ - điện công trình - Hệ thống cấp - thoát nước công trình',
    'Thiết kế cơ - điện công trình - Hệ thống thông gió - cấp thoát nhiệt',
    'Thiết kế quy hoạch xây dựng',
    'Thiết kế xây dựng công trình - Công trình Cầu - Hầm',
    'Thiết kế xây dựng công trình - Công trình Khai thác mỏ',
    'Thiết kế xây dựng công trình - Công trình đường sắt',
    'Thiết kế xây dựng công trình - Kết cấu công trình',
    'TK XD công trình - Công trình Thủy lợi, đê điều',
    'TK XD công trình - Công trình Xử lý chất thải rắn',
    'TK XD công trình - Công trình đường bộ',
    'TK XD công trình - Công trình đường thủy nội địa - Hàng hải',
    'TKXD công trình - Công trình Cấp nước-thoát nước-hạng I',
    'Định giá Xây dựng',
]

export const PHAN_THI_OPTIONS = [
    'Tất cả',
    'Câu hỏi Pháp luật chung',
    'Câu hỏi Pháp luật riêng',
    'Câu hỏi Chuyên môn'
]

export const FEEDBACK_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
    app_rating: { label: 'Đánh giá ứng dụng', icon: Star, color: 'text-yellow-600' },
    app_feedback: { label: 'Góp ý chung', icon: MessageSquare, color: 'text-blue-600' },
    app_bug: { label: 'Báo lỗi ứng dụng', icon: AlertTriangle, color: 'text-red-600' },
    question_error: { label: 'Báo sai câu hỏi', icon: AlertTriangle, color: 'text-orange-600' },
}

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    reviewed: { label: 'Đã xem', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    resolved: { label: 'Đã xử lý', color: 'bg-green-100 text-green-800 border-green-200' },
}
