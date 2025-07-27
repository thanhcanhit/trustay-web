import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo và slogan */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Trustay</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Nền tảng chia sẻ mã xem tin tức, kết nối với
              <br />
              cộng đồng người thuê nhà cận kề đáng tin cậy.
            </p>
          </div>

          {/* Dịch vụ */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Dịch vụ</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/post"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Tin tức
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Đăng tin
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Tìm bạn cùng phòng
                </Link>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Hỗ trợ</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/help/guide"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Hướng dẫn sử dụng
                </Link>
              </li>
              <li>
                <Link
                  href="/help/contact"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  href="/help/faq"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Kết nối */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Kết nối</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://zalo.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Zalo
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@trustay.com"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            © 2024 Trustay. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
