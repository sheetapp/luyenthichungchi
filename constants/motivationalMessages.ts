// Motivational messages for Buy Me Coffee page

export const COFFEE_TITLES = [
    'Cảm ơn vì bạn đã ở đây',
    'Hạnh phúc giản đơn',
    'Biết đủ là hạnh phúc',
    'Cùng nhau xây dựng điều tốt đẹp',
    'Bạn là nguồn cảm hứng của tôi',
    'Hành trình này có bạn đồng hành',
    'Khởi đầu ngày mới cùng một tách cà phê',
    'Bạn làm nên sự khác biệt',
    'Trải nghiệm của bạn là duy nhất',
    'Đặt một viên gạch để xây cộng đồng vững mạnh'
] as const

export const COFFEE_DESCRIPTIONS = [
    'Sự đồng hành của bạn giúp ứng dụng duy trì và phát triển tính năng mới mỗi ngày.',
    'Mỗi khoản đóng góp giúp chúng tôi cải thiện trải nghiệm học tập cho hàng nghìn người dùng.',
    'Nhờ sự hỗ trợ của bạn, chúng tôi có thể tiếp tục cung cấp nội dung chất lượng miễn phí.',
    'Đóng góp của bạn giúp duy trì máy chủ và phát triển các tính năng học tập hiện đại.',
    'Với sự ủng hộ của bạn, chúng tôi có thể tập trung vào việc tạo ra giá trị tốt nhất.',
    'Mỗi khoản đóng góp của bạn là động lực để chúng tôi không ngừng cải tiến và đổi mới.',
    'Sự tin tưởng của bạn thúc đẩy chúng tôi xây dựng một nền tảng học tập tốt hơn mỗi ngày.',
    'Nhờ bạn, chúng tôi có nguồn lực để duy trì và nâng cấp hệ thống liên tục.',
    'Đóng góp của bạn giúp chúng tôi mang đến trải nghiệm học tập tốt nhất cho cộng đồng.',
    'Với sự hỗ trợ của bạn, ứng dụng sẽ ngày càng hoàn thiện và hữu ích hơn.'
] as const

// Motivational messages for Account page based on star rating
export const MOTIVATIONAL_MESSAGES = {
    1: [
        'Mỗi bước đi đều là một tiến bộ! Hãy tiếp tục cố gắng.',
        'Khởi đầu tốt đẹp! Hành trình chinh phục chứng chỉ đã bắt đầu.',
        'Đừng nản chí! Mọi chuyên gia đều từng là người mới bắt đầu.',
        'Bạn đang trên con đường đúng đắn. Hãy kiên trì!',
        'Học tập là hành trình, không phải đích đến. Cố lên!'
    ],
    2: [
        'Bạn đang tiến bộ rõ rệt! Tiếp tục như vậy nhé.',
        'Nền tảng đã vững! Hãy xây dựng thêm kiến thức.',
        'Sự cố gắng của bạn đang được đền đáp. Tuyệt vời!',
        'Bạn đang trên đà phát triển tốt. Đừng dừng lại!',
        'Kiến thức đang dần tích lũy. Hãy duy trì nhịp độ này!'
    ],
    3: [
        'Xuất sắc! Bạn đã nắm vững nhiều kiến thức quan trọng.',
        'Trình độ của bạn đang ở mức khá tốt. Tiếp tục phát huy!',
        'Bạn đã vượt qua nhiều thử thách. Rất đáng tự hào!',
        'Kiến thức vững vàng! Hãy luyện tập thêm để hoàn thiện.',
        'Bạn đang tiến gần đến mục tiêu. Cố gắng thêm chút nữa!'
    ],
    4: [
        'Tuyệt vời! Bạn đã thành thạo phần lớn kiến thức.',
        'Trình độ cao! Chỉ còn một chút nữa là hoàn hảo.',
        'Bạn là tấm gương cho nhiều người. Rất ấn tượng!',
        'Kiến thức sâu rộng! Bạn đã sẵn sàng cho kỳ thi.',
        'Xuất sắc! Bạn đang ở top những người học giỏi nhất.'
    ],
    5: [
        'Hoàn hảo! Bạn là chuyên gia thực thụ trong lĩnh vực này.',
        'Đỉnh cao! Trình độ của bạn thật đáng ngưỡng mộ.',
        'Bạn đã chinh phục mọi thử thách. Thật phi thường!',
        'Chuyên gia! Bạn có thể tự tin bước vào kỳ thi chính thức.',
        'Tuyệt đỉnh! Bạn là niềm tự hào của cộng đồng học viên.'
    ]
} as const

// Helper function to get random message
export function getRandomCoffeeMessage() {
    const randomTitle = COFFEE_TITLES[Math.floor(Math.random() * COFFEE_TITLES.length)]
    const randomDescription = COFFEE_DESCRIPTIONS[Math.floor(Math.random() * COFFEE_DESCRIPTIONS.length)]

    return {
        title: randomTitle,
        description: randomDescription
    }
}

// Helper function to get random motivational message based on star rating
export function getRandomMotivationalMessage(stars: 1 | 2 | 3 | 4 | 5): string {
    const messages = MOTIVATIONAL_MESSAGES[stars]
    return messages[Math.floor(Math.random() * messages.length)]
}

// Helper function to calculate star rating based on average score
export function calculateStarRating(avgScore: number): 1 | 2 | 3 | 4 | 5 {
    if (avgScore >= 80) return 5
    if (avgScore >= 60) return 4
    if (avgScore >= 40) return 3
    if (avgScore >= 20) return 2
    return 1
}
