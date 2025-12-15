"use client"

import Image from "next/image"
import Link from "next/link"
import { Search, Home as HomeIcon, Users, FileText, Heart, User, Bell, MapPin, Star, TrendingUp } from "lucide-react"
import { FeaturedProperties } from "@/components/featured-properties"
import { FeaturedRoomSeekings } from "@/components/featured-room-seekings"
import { FeaturedRoommates } from "@/components/featured-roommates"

export default function Home() {

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-600 min-h-[300px] md:min-h-[350px] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12 relative z-0">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-center">
            {/* Left Content */}
            <div className="text-white space-y-4 md:space-y-6 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                TÌM NHANH, KIẾM DỄ<br />
                TRỌ MỚI TOÀN QUỐC
              </h1>

              <p className="text-base md:text-lg text-green-100 max-w-lg mx-auto lg:mx-0">
                Trang thông tin và cho thuê phòng trọ nhanh chóng, hiệu quả
                với hơn 500 tin đăng mới và 30.000 lượt xem mỗi ngày
              </p>
            </div>

            {/* Right Image */}
            <div className="hidden lg:flex justify-center items-right">
              <div className="relative">
                <div className=" -z-2 w-80 h-80 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-20 absolute -top-20 -right-10"></div>
                 {/*<Image
                  src="/banner.png"
                  alt="House illustration"
                  width={300}
                  height={200}
                  className="relative z-0 drop-shadow-2xl -right-7"
                /> */}
                <Image
                  src="/banner1.png"
                  alt="House illustration"
                  width={300}
                  height={200}
                  className="relative z-0 drop-shadow-2xl rounded-full -left-20"
                />
                <Image
                  src="/banner2.png"
                  alt="House illustration"
                  width={300}
                  height={200}
                  className="-z-1 drop-shadow-2xl rounded-full absolute -bottom-5 left-30"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Feature Categories Section */}
      <div className="bg-white py-4 md:py-6">
        <div className="container mx-auto px-0 sm:px-4">
          {/* Feature Grid - Horizontal scroll on mobile, Grid on larger screens */}
          <div className="w-full">
            {/* Mobile: Horizontal scrollable 2 rows */}
            <div className="lg:hidden overflow-x-auto scrollbar-hide px-4">
              <div className="grid grid-flow-col auto-cols-[minmax(90px,1fr)] grid-rows-2 gap-x-3 gap-y-4 pb-2" style={{width: 'max-content'}}>
                {/* Row 1 - Mobile Scrollable */}
                <Link href="/rooms" className="group">
                  <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer w-[90px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <HomeIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">Tìm phòng trọ</span>
                  </div>
                </Link>

                <Link href="/room-seekings" className="group">
                  <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer w-[90px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <Search className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">Người tìm trọ</span>
                  </div>
                </Link>

                <Link href="/roommate" className="group">
                  <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer w-[90px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">Tìm người ở ghép</span>
                  </div>
                </Link>

                <Link href="dashboard/landlord/rentals" className="group">
                  <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer w-[90px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">Quản lý hợp đồng</span>
                  </div>
                </Link>

                <Link href="/rooms" className="group">
                  <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer w-[90px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5 text-teal-600" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">Khu vực</span>
                  </div>
                </Link>

                {/* Row 2 - Mobile Scrollable */}
                <Link href="/profile/saved" className="group">
                  <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer w-[90px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <Heart className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">Yêu thích</span>
                  </div>
                </Link>

                <Link href="/profile" className="group">
                  <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer w-[90px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">Hồ sơ</span>
                  </div>
                </Link>

                <Link href="/profile/notifications" className="group">
                  <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer w-[90px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <Bell className="w-5 h-5 text-yellow-600" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">Thông báo</span>
                  </div>
                </Link>

                <Link href="/rooms" className="group">
                  <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer w-[90px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <Star className="w-5 h-5 text-pink-600" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">Đánh giá</span>
                  </div>
                </Link>

                <Link href="/rooms" className="group">
                  <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer w-[90px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5 text-rose-600" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">Hot</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Desktop: Standard Grid */}
            <div className="hidden lg:grid grid-cols-5 gap-4">
              <Link href="/rooms" className="group">
                <div className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <HomeIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">Tìm phòng trọ</span>
                </div>
              </Link>

              <Link href="/room-seekings" className="group">
                <div className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">Người tìm trọ</span>
                </div>
              </Link>

              <Link href="/roommate" className="group">
                <div className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">Tìm người ở ghép</span>
                </div>
              </Link>

              <Link href="dashboard/landlord/contracts" className="group">
                <div className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">Quản lý hợp đồng</span>
                </div>
              </Link>

              <Link href="/profile/saved" className="group">
                <div className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">Yêu thích</span>
                </div>
              </Link>

              <Link href="/profile" className="group">
                <div className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">Hồ sơ</span>
                </div>
              </Link>

              <Link href="/profile/notifications" className="group">
                <div className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Bell className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">Thông báo</span>
                </div>
              </Link>

              <Link href="/rooms" className="group">
                <div className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6 text-teal-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">Khu vực</span>
                </div>
              </Link>

              <Link href="/rooms" className="group">
                <div className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Star className="w-6 h-6 text-pink-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">Đánh giá</span>
                </div>
              </Link>

              <Link href="/rooms" className="group">
                <div className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-all cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-rose-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">Hot</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Advertisement Banner */}
      {/* <div className="bg-gradient-to-r from-green-50 to-emerald-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-6 text-white">
                <h3 className="font-bold text-lg">Ưu đãi đặc biệt</h3>
                <p className="text-sm opacity-90">Giảm giá lên đến 50%</p>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm">Dành cho khách hàng mới đăng ký</p>
              </div>
            </div>

            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-6 text-white">
                <h3 className="font-bold text-lg">GÓI QUẢNG CÁO</h3>
                <p className="text-sm opacity-90">Đăng tin hiệu quả</p>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm">Tăng khả năng tiếp cận khách hàng</p>
              </div>
            </div>

            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-green-400 to-teal-500 p-6 text-white">
                <h3 className="font-bold text-lg">NẠP TIỀN HÔM NAY</h3>
                <p className="text-sm opacity-90">Nhận ngay ưu đãi</p>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm">Tặng thêm 20% giá trị nạp</p>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Featured Properties Section */}
      <FeaturedProperties />

      {/* Featured Room Seekings Section */}
      <FeaturedRoomSeekings />

      {/* Featured Roommates Section */}
      <FeaturedRoommates />
    </div>
  );
}
