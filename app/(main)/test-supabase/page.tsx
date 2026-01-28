import { createClient } from '@/lib/supabase/server'

export default async function TestSupabasePage() {
    let connectionStatus = 'Đang kiểm tra...'
    let tables: any[] = []
    let categories: any[] = []
    let questions: any[] = []
    let error: string | null = null

    try {
        const supabase = await createClient()

        // Test 1: Kiểm tra kết nối cơ bản
        const { data: tablesData, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')

        if (tablesError) throw tablesError

        // Test 2: Lấy categories
        const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .select('*')
            .limit(10)

        if (categoriesError) {
            console.warn('Categories error:', categoriesError)
        } else {
            categories = categoriesData || []
        }

        // Test 3: Lấy questions mẫu
        const { data: questionsData, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .limit(5)

        if (questionsError) {
            console.warn('Questions error:', questionsError)
        } else {
            questions = questionsData || []
        }

        connectionStatus = '✅ Kết nối thành công!'
    } catch (err: any) {
        error = err.message || 'Unknown error'
        connectionStatus = '❌ Kết nối thất bại'
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    🧪 Test Supabase Connection
                </h1>

                {/* Connection Status */}
                <div className={`p-4 rounded-lg mb-6 ${error
                        ? 'bg-red-50 border-2 border-red-200'
                        : 'bg-green-50 border-2 border-green-200'
                    }`}>
                    <h2 className="text-xl font-semibold mb-2">
                        {connectionStatus}
                    </h2>
                    {error && (
                        <div className="mt-3 p-3 bg-red-100 rounded text-sm">
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                </div>

                {/* Categories */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        📁 Categories ({categories.length})
                    </h3>
                    {categories.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Code</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {categories.map((cat: any) => (
                                        <tr key={cat.id}>
                                            <td className="px-4 py-2 text-sm">{cat.type}</td>
                                            <td className="px-4 py-2 text-sm font-semibold">{cat.code}</td>
                                            <td className="px-4 py-2 text-sm">{cat.name}</td>
                                            <td className="px-4 py-2 text-sm text-gray-600">{cat.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Chưa có dữ liệu categories</p>
                    )}
                </div>

                {/* Questions */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        ❓ Questions ({questions.length})
                    </h3>
                    {questions.length > 0 ? (
                        <div className="space-y-3">
                            {questions.map((q: any, index: number) => (
                                <div key={q.id_cauhoi} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-start gap-2">
                                        <span className="font-bold text-gray-700">{index + 1}.</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800 mb-2">{q.cau_hoi}</p>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className={q.dap_an_dung === 'a' ? 'text-green-700 font-semibold' : 'text-gray-600'}>
                                                    A. {q.dap_an_a}
                                                </div>
                                                <div className={q.dap_an_dung === 'b' ? 'text-green-700 font-semibold' : 'text-gray-600'}>
                                                    B. {q.dap_an_b}
                                                </div>
                                                <div className={q.dap_an_dung === 'c' ? 'text-green-700 font-semibold' : 'text-gray-600'}>
                                                    C. {q.dap_an_c}
                                                </div>
                                                <div className={q.dap_an_dung === 'd' ? 'text-green-700 font-semibold' : 'text-gray-600'}>
                                                    D. {q.dap_an_d}
                                                </div>
                                            </div>
                                            <div className="mt-2 flex gap-2 text-xs">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Hạng {q.hang}</span>
                                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">{q.phan_thi}</span>
                                                {q.chuyen_nganh && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">{q.chuyen_nganh}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Chưa có dữ liệu questions</p>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">📝 Hướng dẫn tiếp theo:</h4>
                    <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                        <li>Nếu thấy lỗi kết nối, kiểm tra file .env.local</li>
                        <li>Nếu chưa có dữ liệu, chạy migration.sql trên Supabase</li>
                        <li>Chạy export_schema.sql để xuất cấu trúc database</li>
                        <li>Sau khi có dữ liệu, tiếp tục phát triển các pages chính</li>
                    </ol>
                </div>
            </div>
        </div>
    )
}
