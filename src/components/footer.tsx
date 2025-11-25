import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo và slogan */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="rounded-lg flex items-center justify-center">
                <Image src="/logo.png" alt="Trustay" width={120} height={100} className="w-24 sm:w-[120px] h-20 sm:h-[70px]" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Nền tảng chia sẻ mã xem tin tức, kết nối với cộng đồng người thuê nhà cận kề đáng tin cậy.
            </p>
          </div>

          {/* Dịch vụ */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4">Dịch vụ</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="/post"
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Tin tức
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Đăng tin
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Tìm bạn cùng phòng
                </Link>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="/help/guide"
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Hướng dẫn sử dụng
                </Link>
              </li>
              <li>
                <Link
                  href="/help/contact"
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  href="/help/faq"
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Kết nối */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4">Kết nối</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://zalo.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Zalo
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@trustay.com"
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
          <p className="text-center text-xs sm:text-sm text-gray-500">
            © 2024 Trustay. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
