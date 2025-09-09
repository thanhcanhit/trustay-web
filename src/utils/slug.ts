/**
 * Tạo slug từ title
 * @param title - Tiêu đề cần tạo slug
 * @returns Slug được tạo từ title
 */
export function createSlugFromTitle(title: string): string {
	if (!title) return '';

	// Map các chữ có dấu thành chữ không dấu
	const vietnameseMap: { [key: string]: string } = {
		à: 'a',
		á: 'a',
		ả: 'a',
		ã: 'a',
		ạ: 'a',
		ă: 'a',
		ằ: 'a',
		ắ: 'a',
		ẳ: 'a',
		ẵ: 'a',
		ặ: 'a',
		â: 'a',
		ầ: 'a',
		ấ: 'a',
		ẩ: 'a',
		ẫ: 'a',
		ậ: 'a',
		đ: 'd',
		è: 'e',
		é: 'e',
		ẻ: 'e',
		ẽ: 'e',
		ẹ: 'e',
		ê: 'e',
		ề: 'e',
		ế: 'e',
		ể: 'e',
		ễ: 'e',
		ệ: 'e',
		ì: 'i',
		í: 'i',
		ỉ: 'i',
		ĩ: 'i',
		ị: 'i',
		ò: 'o',
		ó: 'o',
		ỏ: 'o',
		õ: 'o',
		ọ: 'o',
		ô: 'o',
		ồ: 'o',
		ố: 'o',
		ổ: 'o',
		ỗ: 'o',
		ộ: 'o',
		ơ: 'o',
		ờ: 'o',
		ớ: 'o',
		ở: 'o',
		ỡ: 'o',
		ợ: 'o',
		ù: 'u',
		ú: 'u',
		ủ: 'u',
		ũ: 'u',
		ụ: 'u',
		ư: 'u',
		ừ: 'u',
		ứ: 'u',
		ử: 'u',
		ữ: 'u',
		ự: 'u',
		ỳ: 'y',
		ý: 'y',
		ỷ: 'y',
		ỹ: 'y',
		ỵ: 'y',
	};

	return (
		title
			.toLowerCase()
			// Chuyển đổi chữ có dấu thành chữ không dấu
			.split('')
			.map((char) => vietnameseMap[char] || char)
			.join('')
			// Loại bỏ các ký tự đặc biệt, chỉ giữ lại chữ cái, số, khoảng trắng và dấu gạch ngang
			.replace(/[^a-z0-9\s-]/g, '')
			// Thay thế khoảng trắng bằng dấu gạch ngang
			.replace(/\s+/g, '-')
			// Loại bỏ các dấu gạch ngang liên tiếp
			.replace(/-+/g, '-')
			// Loại bỏ dấu gạch ngang ở đầu và cuối
			.trim() +
		// Thêm timestamp để tránh trùng lặp
		'-' +
		Date.now()
	);
}

/**
 * Tạo slug đơn giản từ title (không có timestamp)
 * @param title - Tiêu đề cần tạo slug
 * @returns Slug đơn giản từ title
 */
export function createSimpleSlugFromTitle(title: string): string {
	if (!title) return '';

	// Map các chữ có dấu thành chữ không dấu
	const vietnameseMap: { [key: string]: string } = {
		à: 'a',
		á: 'a',
		ả: 'a',
		ã: 'a',
		ạ: 'a',
		ă: 'a',
		ằ: 'a',
		ắ: 'a',
		ẳ: 'a',
		ẵ: 'a',
		ặ: 'a',
		â: 'a',
		ầ: 'a',
		ấ: 'a',
		ẩ: 'a',
		ẫ: 'a',
		ậ: 'a',
		đ: 'd',
		è: 'e',
		é: 'e',
		ẻ: 'e',
		ẽ: 'e',
		ẹ: 'e',
		ê: 'e',
		ề: 'e',
		ế: 'e',
		ể: 'e',
		ễ: 'e',
		ệ: 'e',
		ì: 'i',
		í: 'i',
		ỉ: 'i',
		ĩ: 'i',
		ị: 'i',
		ò: 'o',
		ó: 'o',
		ỏ: 'o',
		õ: 'o',
		ọ: 'o',
		ô: 'o',
		ồ: 'o',
		ố: 'o',
		ổ: 'o',
		ỗ: 'o',
		ộ: 'o',
		ơ: 'o',
		ờ: 'o',
		ớ: 'o',
		ở: 'o',
		ỡ: 'o',
		ợ: 'o',
		ù: 'u',
		ú: 'u',
		ủ: 'u',
		ũ: 'u',
		ụ: 'u',
		ư: 'u',
		ừ: 'u',
		ứ: 'u',
		ử: 'u',
		ữ: 'u',
		ự: 'u',
		ỳ: 'y',
		ý: 'y',
		ỷ: 'y',
		ỹ: 'y',
		ỵ: 'y',
	};

	return (
		title
			.toLowerCase()
			// Chuyển đổi chữ có dấu thành chữ không dấu
			.split('')
			.map((char) => vietnameseMap[char] || char)
			.join('')
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim()
	);
}

/**
 * Tạo slug với prefix tùy chỉnh
 * @param title - Tiêu đề cần tạo slug
 * @param prefix - Prefix muốn thêm vào slug
 * @returns Slug với prefix
 */
export function createSlugWithPrefix(title: string, prefix: string): string {
	const baseSlug = createSimpleSlugFromTitle(title);
	return `${prefix}-${baseSlug}-${Date.now()}`;
}

/**
 * Kiểm tra slug có hợp lệ không
 * @param slug - Slug cần kiểm tra
 * @returns true nếu slug hợp lệ
 */
export function isValidSlug(slug: string): boolean {
	if (!slug) return false;

	// Slug chỉ chứa chữ cái thường, số, dấu gạch ngang
	const slugRegex = /^[a-z0-9-]+$/;
	return slugRegex.test(slug);
}

/**
 * Làm sạch slug (loại bỏ các ký tự không hợp lệ)
 * @param slug - Slug cần làm sạch
 * @returns Slug đã được làm sạch
 */
export function cleanSlug(slug: string): string {
	if (!slug) return '';

	return slug
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-')
		.trim();
}
