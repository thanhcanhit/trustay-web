"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, MapPin, DollarSign, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FeaturedProperties } from "@/components/featured-properties"
import { FeaturedRoommates } from "@/components/featured-roommates"

export default function Home() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-600 min-h-[350px] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-0">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="text-white space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                TÌM NHANH, KIẾM DỄ<br />
                TRỌ MỚI TOÀN QUỐC
              </h1>

              <p className="text-lg text-green-100 max-w-lg">
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

      {/* Search Section */}
      <div className="container mx-auto px-9 relative -top-17 z-0">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 rounded-t-lg font-medium transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-primary text-white"
                  : "bg-white text-green-900 hover:bg-green-100"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("room")}
              className={`px-6 py-3 rounded-t-lg font-medium transition-all cursor-pointer ${
                activeTab === "room"
                  ? "bg-primary text-white"
                  : "bg-white text-green-900 hover:bg-green-100"
              }`}
            >
              Phòng trọ
            </button>
            <button
              onClick={() => setActiveTab("roommate")}
              className={`px-6 py-3 rounded-t-lg font-medium transition-all cursor-pointer ${
                activeTab === "roommate"
                  ? "bg-primary text-white"
                  : "bg-white text-green-900 hover:bg-green-100"
              }`}
            >
              Bạn cùng phòng
            </button>
          </div>

          {/* Search Form */}
          <div className="bg-primary rounded-b-lg rounded-r-lg p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Bạn muốn tìm trọ ở đâu"
                  className="pl-10 h-12 bg-white border-gray-200 focus:border-green-500"
                />
              </div>

              {/* Location Select */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select className="w-full h-12 pl-10 pr-8 border border-gray-200 rounded-md focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none appearance-none bg-white">
                  <option>Địa điểm</option>
                  <option>Hà Nội</option>
                  <option>TP. Hồ Chí Minh</option>
                  <option>Đà Nẵng</option>
                  <option>Cần Thơ</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>

              {/* Price Select */}
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select className="w-full h-12 pl-10 pr-8 border border-gray-200 rounded-md focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none appearance-none bg-white">
                  <option>Mức giá</option>
                  <option>Dưới 2 triệu</option>
                  <option>2 - 3 triệu</option>
                  <option>3 - 5 triệu</option>
                  <option>Trên 5 triệu</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>

              {/* Search Button */}
              <Button className="h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium text-lg">
                <Search className="h-5 w-5 mr-2" />
                Tìm kiếm
              </Button>
            </div>
          </div>
      </div>

      {/* Advertisement Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ad 1 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-6 text-white">
                <h3 className="font-bold text-lg">Ưu đãi đặc biệt</h3>
                <p className="text-sm opacity-90">Giảm giá lên đến 50%</p>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm">Dành cho khách hàng mới đăng ký</p>
              </div>
            </div>

            {/* Ad 2 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-6 text-white">
                <h3 className="font-bold text-lg">GÓI QUẢNG CÁO</h3>
                <p className="text-sm opacity-90">Đăng tin hiệu quả</p>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm">Tăng khả năng tiếp cận khách hàng</p>
              </div>
            </div>

            {/* Ad 3 */}
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
      </div>

      {/* Featured Properties Section */}
      <FeaturedProperties />

      {/* Featured Roommates Section */}
      <FeaturedRoommates />
    </div>
  );
}
