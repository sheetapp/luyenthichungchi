export interface Question {
    id_cauhoi: number
    chi_muc: string | null
    stt: number | null
    phan_thi: string | null
    chuyen_nganh: string | null
    hang: string | null
    cau_hoi: string
    dap_an_a: string | null
    dap_an_b: string | null
    dap_an_c: string | null
    dap_an_d: string | null
    dap_an_dung: 'a' | 'b' | 'c' | 'd'
    Loai_number: string | null
}

export interface Profile {
    id: string
    email: string
    user_name: string | null
    display_name: string | null
    phone: string | null
    status: string | null
    avata: string | null // typo maintained as per requirement
    job_title: string | null
    gender: string | null
}

export interface ExamResult {
    id: string
    user_id: string
    hang: string | null
    chuyen_nganh: string | null
    score: number | null
    total_questions: number | null
    law_correct: number | null
    specialist_correct: number | null
    time_taken: number | null
    passed: boolean | null
    answers: any[] // JSONB array
    created_at: string
}

export interface Config {
    id: string
    data_name: string | null
    data_type: string | null
    data_value: string | null
}

export interface Category {
    id: string
    type: string
    code: string
    name: string
    description: string | null
    created_at: string
}

export interface ExamConfig {
    hang: string[]
    phan_thi: string[]
    chuyen_nganh: string[]
    chi_muc: string[]
}
