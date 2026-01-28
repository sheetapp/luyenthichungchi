import { supabase } from './client'
import type { Config, Category, ExamConfig } from './database.types'

/**
 * Lấy cấu hình từ bảng config
 */
export async function getConfigByType(dataType: string): Promise<Config[]> {
    const { data, error } = await supabase
        .from('config')
        .select('*')
        .eq('data_type', dataType)
        .order('data_value')

    if (error) {
        console.error('Error fetching config:', error)
        return []
    }

    return data || []
}

/**
 * Lấy tất cả config và group theo type
 */
export async function getAllExamConfig(): Promise<ExamConfig> {
    const { data, error } = await supabase
        .from('config')
        .select('*')
        .order('data_type, data_value')

    if (error) {
        console.error('Error fetching all config:', error)
        return {
            hang: [],
            phan_thi: [],
            chuyen_nganh: [],
            chi_muc: [],
        }
    }

    // Group by data_type
    const config: ExamConfig = {
        hang: [],
        phan_thi: [],
        chuyen_nganh: [],
        chi_muc: [],
    }

    data?.forEach((item) => {
        if (item.data_type && item.data_value) {
            const type = item.data_type as keyof ExamConfig
            if (config[type]) {
                config[type].push(item.data_value)
            }
        }
    })

    return config
}

/**
 * Lấy categories từ bảng categories (nếu có)
 */
export async function getCategoriesByType(type: string): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', type)
        .order('code')

    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }

    return data || []
}

/**
 * Lấy danh sách hạng (I, II, III)
 */
export async function getHangList(): Promise<string[]> {
    // Try categories first
    const categories = await getCategoriesByType('hang')
    if (categories.length > 0) {
        return categories.map((c) => c.code)
    }

    // Fallback to config
    const configs = await getConfigByType('hang')
    return configs.map((c) => c.data_value || '').filter(Boolean)
}

/**
 * Lấy danh sách phần thi
 */
export async function getPhanThiList(): Promise<string[]> {
    const categories = await getCategoriesByType('phan_thi')
    if (categories.length > 0) {
        return categories.map((c) => c.name)
    }

    const configs = await getConfigByType('phan_thi')
    return configs.map((c) => c.data_value || '').filter(Boolean)
}

/**
 * Lấy danh sách chuyên ngành
 */
export async function getChuyenNganhList(): Promise<string[]> {
    const categories = await getCategoriesByType('chuyen_nganh')
    if (categories.length > 0) {
        return categories.map((c) => c.name)
    }

    const configs = await getConfigByType('chuyen_nganh')
    return configs.map((c) => c.data_value || '').filter(Boolean)
}

/**
 * Lấy danh sách chỉ mục
 */
export async function getChiMucList(): Promise<string[]> {
    const categories = await getCategoriesByType('chi_muc')
    if (categories.length > 0) {
        return categories.map((c) => c.code)
    }

    const configs = await getConfigByType('chi_muc')
    return configs.map((c) => c.data_value || '').filter(Boolean)
}
