export interface Post {
    id: string
    title: string
    slug: string
    content: string
    excerpt: string
    category: 'huong-dan' | 'tai-lieu'
    type: 'guide' | 'document'
    thumbnail_url: string | null
    created_at: string
}

export const LIBRARY_POSTS: Post[] = [
    // --- HƯỚNG DẪN SỬ DỤNG (Guide) ---
    {
        id: 'guide-1',
        title: 'Hướng dẫn ôn tập hiệu quả',
        slug: 'huong-dan-on-tap',
        category: 'huong-dan',
        type: 'guide',
        thumbnail_url: null,
        excerpt: 'Quy trình ôn tập tối ưu để nắm vững kiến thức, sử dụng các tính năng lọc theo Hạng và Lĩnh vực chuyên ngành.',
        created_at: '2026-02-05T08:00:00Z',
        content: `
            <h3>1. Lựa chọn chuyên ngành</h3>
            <p>Trước khi bắt đầu ôn tập, bạn cần xác định Hạng sát hạch (I, II, III) và Lĩnh vực chuyên ngành phù hợp với hồ sơ của mình.</p>
            <p>Hệ thống hỗ trợ đầy đủ các lĩnh vực như: Khảo sát xây dựng, Thiết kế quy hoạch, Thiết kế xây dựng công trình, Giám sát thi công, và Quản lý dự án...</p>

            <h3>2. Sử dụng bộ lọc câu hỏi</h3>
            <p>Trong giao diện Ôn tập, bạn có thể lọc câu hỏi theo:</p>
            <ul>
                <li><strong>Hạng sát hạch:</strong> Hạng I, II, hoặc III.</li>
                <li><strong>Chuyên ngành:</strong> Chọn lĩnh vực cụ thể để tập trung ôn luyện.</li>
                <li><strong>Phần thi:</strong> Lọc riêng câu hỏi Pháp luật hoặc Chuyên môn.</li>
            </ul>

            <h3>3. Tính năng hỗ trợ</h3>
            <ul>
                <li><strong>Trộn câu hỏi:</strong> Giúp bạn không học vẹt theo thứ tự, tăng khả năng ghi nhớ.</li>
                <li><strong>Lịch sử ôn tập:</strong> Hệ thống tự động lưu lại các câu bạn đã làm (Đúng/Sai) để bạn biết tiến độ của mình.</li>
                <li><strong>Xóa lịch sử:</strong> Bạn có thể xóa lịch sử để làm lại từ đầu khi cần thiết.</li>
            </ul>
        `
    },
    {
        id: 'guide-keyboard',
        title: 'Hướng dẫn ôn tập bằng bàn phím (Rảnh tay)',
        slug: 'huong-dan-ban-phim',
        category: 'huong-dan',
        type: 'guide',
        thumbnail_url: null,
        excerpt: 'Tối ưu hóa tốc độ ôn tập với các phím tắt tiện lợi: chuyển câu, chọn đáp án, báo lỗi... mà không cần dùng chuột.',
        created_at: '2026-02-05T08:30:00Z',
        content: `
            <p>Chế độ ôn tập "Rảnh tay" giúp bạn thao tác nhanh hơn chỉ với bàn phím. Dưới đây là các phím tắt hỗ trợ:</p>

            <h3>1. Điều hướng chung</h3>
            <ul>
                <li><kbd>Tab</kbd>: Chuyển đổi vùng điều khiển giữa <strong>Danh sách câu hỏi</strong> (bên trái) và <strong>Khu vực trả lời</strong> (bên phải).</li>
                <li><kbd>R</kbd>: Mở nhanh hộp thoại <strong>Báo lỗi</strong> câu hỏi.</li>
            </ul>

            <h3>2. Khi ở Danh sách câu hỏi (Sidebar)</h3>
            <ul>
                <li><kbd>↑</kbd> <kbd>↓</kbd> (Mũi tên Lên/Xuống): Di chuyển vùng chọn câu hỏi.</li>
                <li><kbd>Enter</kbd> hoặc <kbd>Space</kbd>: Chọn và chuyển đến câu hỏi đang được đánh dấu.</li>
            </ul>

            <h3>3. Khi ở Khu vực trả lời (Main Area)</h3>
            <ul>
                <li><kbd>←</kbd> <kbd>→</kbd> (Trái/Phải): Chuyển về câu hỏi Trước / Sau.</li>
                <li><kbd>↑</kbd> <kbd>↓</kbd> (Lên/Xuống): Di chuyển vùng chọn giữa các đáp án A, B, C, D.</li>
                <li><kbd>Enter</kbd> hoặc <kbd>Space</kbd>: Chọn đáp án đang được đánh dấu.</li>
            </ul>

            <p><em>Mẹo: Sử dụng phím <kbd>Tab</kbd> để nhảy qua lại nhanh chóng giữa việc chọn câu hỏi và chọn đáp án.</em></p>
        `
    },
    {
        id: 'guide-2',
        title: 'Hướng dẫn thi thử sát hạch',
        slug: 'huong-dan-thi-thu',
        category: 'huong-dan',
        type: 'guide',
        thumbnail_url: null,
        excerpt: 'Cấu trúc đề thi, thời gian làm bài, quy tắc chấm điểm và điều kiện Đạt theo quy định mới nhất của Bộ Xây dựng.',
        created_at: '2026-02-05T09:00:00Z',
        content: `
            <h3>Quy định chung</h3>
            <p>Hệ thống thi thử được mô phỏng chính xác theo quy trình sát hạch thực tế (QĐ 163/QĐ-BXD ngày 18/2/2025).</p>

            <h3>Cấu trúc đề thi</h3>
            <ul>
                <li><strong>Tổng số câu hỏi:</strong> 30 câu trắc nghiệm.</li>
                <li><strong>Phân bố:</strong> Bao gồm các câu hỏi về Kiến thức pháp luật và Kiến thức chuyên môn.</li>
                <li><strong>Thời gian làm bài:</strong> 30 phút.</li>
            </ul>

            <h3>Điều kiện Đạt</h3>
            <p>Để được công nhận Đạt kết quả sát hạch, bạn cần thỏa mãn đồng thời 2 điều kiện sau:</p>
            <ol>
                <li><strong>Điểm phần Pháp luật:</strong> Đạt từ 16 điểm trở lên (Mỗi câu pháp luật thường có trọng số điểm riêng, ví dụ hệ thống cũ là 4 điểm chuyên môn + điểm pháp luật, nhưng theo quy chế mới bạn cần kiểm tra kỹ số điểm tối thiểu của phần này). <br><em>(Lưu ý: Hệ thống sẽ tự động tính điểm theo thang điểm chuẩn).</em></li>
                <li><strong>Tổng điểm:</strong> Đạt từ 80 điểm trở lên (trên thang điểm 100).</li>
            </ol>
            <p><em>*Lưu ý: Kết quả trên hệ thống này chỉ mang tính chất tham khảo để đánh giá năng lực trước kỳ thi thật.</em></p>
        `
    },
    {
        id: 'guide-3',
        title: 'Hướng dẫn báo cáo dữ liệu sai',
        slug: 'huong-dan-bao-loi',
        category: 'huong-dan',
        type: 'guide',
        thumbnail_url: null,
        excerpt: 'Cách gửi phản hồi khi phát hiện câu hỏi hoặc đáp án không chính xác để đội ngũ Admin cập nhật kịp thời.',
        created_at: '2026-02-05T10:00:00Z',
        content: `
            <p>Chúng tôi luôn nỗ lực để đảm bảo dữ liệu câu hỏi chính xác nhất. Tuy nhiên, nếu bạn phát hiện sai sót, hãy giúp chúng tôi cải thiện bằng cách:</p>
            
            <h3>Quy trình báo lỗi</h3>
            <ol>
                <li>Tại màn hình Ôn tập, khi gặp câu hỏi có vấn đề, hãy nhấn vào biểu tượng <strong>"Báo lỗi"</strong> (hình tam giác cảnh báo).</li>
                <li>Chọn loại lỗi: "Đáp án sai", "Câu hỏi sai", hoặc "Lỗi hiển thị".</li>
                <li>Nhập mô tả chi tiết (nếu có) để chúng tôi dễ dàng kiểm tra.</li>
                <li>Nhấn <strong>Gửi</strong>.</li>
            </ol>
            
            <p>Đội ngũ Quản trị viên sẽ xem xét phản hồi của bạn và cập nhật dữ liệu trong thời gian sớm nhất. Bạn có thể theo dõi trạng thái phản hồi của mình tại mục <strong>"Góp ý"</strong> trong trang Tài khoản.</p>
        `
    },

    // --- TÀI LIỆU (Documents) ---
    {
        id: 'doc-1',
        title: 'Quyết định 163/QĐ-BXD',
        slug: 'quyet-dinh-163-qd-bxd',
        category: 'tai-lieu',
        type: 'document',
        thumbnail_url: null,
        excerpt: 'Quyết định công bố thủ tục hành chính được sửa đổi, bổ sung về cấp chứng chỉ hành nghề hoạt động xây dựng.',
        created_at: '2025-02-18T00:00:00Z',
        content: `
            <p>Nội dung chi tiết về Quyết định 163/QĐ-BXD đang được cập nhật...</p>
            <p>Vui lòng tham khảo văn bản gốc tại cổng thông tin điện tử Bộ Xây dựng.</p>
        `
    },
    {
        id: 'doc-2',
        title: 'Nghị định 15/2021/NĐ-CP',
        slug: 'nghi-dinh-15-2021',
        category: 'tai-lieu',
        type: 'document',
        thumbnail_url: null,
        excerpt: 'Nghị định quy định chi tiết một số nội dung về quản lý dự án đầu tư xây dựng.',
        created_at: '2021-03-03T00:00:00Z',
        content: `
            <p>Nội dung chi tiết về Nghị định 15/2021/NĐ-CP...</p>
        `
    },
    {
        id: 'doc-3',
        title: 'Luật Xây dựng 2014 (sửa đổi 2020)',
        slug: 'luat-xay-dung-2014',
        category: 'tai-lieu',
        type: 'document',
        thumbnail_url: null,
        excerpt: 'Văn bản hợp nhất Luật Xây dựng quy định về hoạt động đầu tư xây dựng.',
        created_at: '2020-06-17T00:00:00Z',
        content: `
            <p>Nội dung chi tiết về Luật Xây dựng...</p>
        `
    }
]
