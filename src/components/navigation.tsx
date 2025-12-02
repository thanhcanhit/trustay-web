"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
// import { motion, AnimatePresence } from "motion/react"
import { useUserStore } from "@/stores/userStore"
import { useAIAssistantStore } from "@/stores/aiAssistant.store"
import { useSearchFilters } from "@/hooks/use-search-filters"
import { encodeSearchQuery } from "@/utils/search-params"
import { Button } from "@/components/ui/button"
// Removed second-row granular filters in favor of a single Filter dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { AddressSelector } from "@/components/ui/address-selector"
import { AmenityFilter } from "@/components/ui/amenity-filter"
import { RuleSelector } from "@/components/ui/rule-selector"
import { getRoomTypeOptions } from "@/utils/room-types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SizingImage } from "@/components/sizing-image"
import { NotificationBell } from "@/components/ui/notification-bell"
import Image from "next/image"
// navigation-menu components are not used here

import {
  LogOut,
  ChevronDown,
  Plus,
  Funnel,
  Search,
  Home,
  ArrowLeft,
  Sparkles,
  MessageCircle
} from "lucide-react"
import { Input } from "./ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuPortal, DropdownMenuTrigger } from "./ui/dropdown-menu"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useUserStore()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  // Second row removed; scroll-based toggle no longer needed
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null)
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null)
  const [selectedWardId, setSelectedWardId] = useState<number | null>(null)
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("")
  const [selectedAreaRange, setSelectedAreaRange] = useState<string>("")
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedRules, setSelectedRules] = useState<string[]>([])
  const [searchType, setSearchType] = useState<string>('rooms')
  const [isMounted, setIsMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [searchSuggestions] = useState<string[]>([
    "Phòng trọ giá rẻ",
    "Phòng trọ có gác",
    "Nhà trọ quận 1",
    "Phòng trọ có ban công",
    "Phòng có điều hòa",
    "Phòng gần trường"
  ])
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const toggleAISidebar = useAIAssistantStore(s => s.toggleSidebar)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Use search filters hook
  const {
    searchQuery,
    setSearchQuery
  } = useSearchFilters()

  // Get active filters for display
  // const activeFiltersList = getActiveFilters()

  // Handle search input enter key - always goes to /rooms
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Handle search button click
  const handleSearch = () => {
    const params = new URLSearchParams()
    const encodedQuery = encodeSearchQuery(searchQuery)
    if (encodedQuery !== '.') params.set('search', encodedQuery)
    params.set('page', '1')

    let route = '/rooms'
    if (searchType === 'room-seeking') {
      route = '/room-seekings'
    } else if (searchType === 'roommate') {
      route = '/roommate'
    }

    router.push(`${route}${params.toString() ? `?${params.toString()}` : ''}`)
  }

  // Handle apply for new filter dialog
  const handleApplyFilters = () => {
    // If user selected "người tìm trọ" -> navigate to public room-seeking list
    if (selectedCategory === 'room-seeking') {
      setIsFilterOpen(false)
      const params = new URLSearchParams()
      const encodedQuery = encodeSearchQuery(searchQuery)
      if (encodedQuery !== '.') params.set('search', encodedQuery)
      if (selectedProvinceId) params.set('provinceId', String(selectedProvinceId))
      if (selectedDistrictId) params.set('districtId', String(selectedDistrictId))
      if (selectedWardId) params.set('wardId', String(selectedWardId))
      router.push(`/room-seekings${params.toString() ? `?${params.toString()}` : ''}`)
      return
    }

    // If user selected "tìm người ở ghép" (roommate) -> navigate to roommate posts
    if (selectedCategory === 'roommate') {
      setIsFilterOpen(false)
      const params = new URLSearchParams()
      const encodedQuery = encodeSearchQuery(searchQuery)
      if (encodedQuery !== '.') params.set('search', encodedQuery)
      if (selectedProvinceId) params.set('provinceId', String(selectedProvinceId))
      if (selectedDistrictId) params.set('districtId', String(selectedDistrictId))
      if (selectedWardId) params.set('wardId', String(selectedWardId))
      router.push(`/roommate${params.toString() ? `?${params.toString()}` : ''}`)
      return
    }

    // If user selected a room type -> go to search listings with roomType
    if (selectedCategory.startsWith('roomType:')) {
      const roomType = selectedCategory.replace('roomType:', '')
      const params = new URLSearchParams()
      params.set('search', encodeSearchQuery(searchQuery))
      params.set('page', '1')
      if (roomType) params.set('roomType', roomType)
      if (selectedProvinceId) params.set('provinceId', String(selectedProvinceId))
      if (selectedDistrictId) params.set('districtId', String(selectedDistrictId))
      if (selectedWardId) params.set('wardId', String(selectedWardId))
      if (selectedPriceRange) {
        const [minP, maxP] = selectedPriceRange.split('-')
        if (minP) params.set('minPrice', minP)
        if (maxP) params.set('maxPrice', maxP)
      }
      if (selectedAreaRange) {
        const [minA, maxA] = selectedAreaRange.split('-')
        if (minA) params.set('minArea', minA)
        if (maxA) params.set('maxArea', maxA)
      }
      if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','))
      setIsFilterOpen(false)
      router.push(`/rooms?${params.toString()}`)
      return
    }

    // Default fallback - route to /rooms for room search
    const params = new URLSearchParams()
    params.set('search', encodeSearchQuery(searchQuery))
    params.set('page', '1')
    if (selectedProvinceId) params.set('provinceId', String(selectedProvinceId))
    if (selectedDistrictId) params.set('districtId', String(selectedDistrictId))
    if (selectedWardId) params.set('wardId', String(selectedWardId))
    if (selectedPriceRange) {
      const [minP, maxP] = selectedPriceRange.split('-')
      if (minP) params.set('minPrice', minP)
      if (maxP) params.set('maxPrice', maxP)
    }
    if (selectedAreaRange) {
      const [minA, maxA] = selectedAreaRange.split('-')
      if (minA) params.set('minArea', minA)
      if (maxA) params.set('maxArea', maxA)
    }
    if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','))
    setIsFilterOpen(false)
    router.push(`/rooms?${params.toString()}`)
  }



  // Check if current page is login or register
  const isAuthPage = pathname === '/login' || pathname === '/register'

  const handleLogout = async () => {
    try {
      await logout()
      setShowUserDropdown(false)
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
      // Still redirect even if logout API fails
      setShowUserDropdown(false)
      window.location.href = '/'
    }
  }


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const isAIOpen = useAIAssistantStore(s => s.isSidebarOpen)

  return (
    <nav className="border-b bg-white shadow-sm fixed top-0 left-0 right-0 z-[9998] no-print" suppressHydrationWarning={true}>
      {/* First Row: Logo, Search, Login/Signup */}
      <div className={isAuthPage ? "" : "border-b border-gray-200 bg-gradient-to-r from-white to-gray-50"}>
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex h-14 lg:h-16 items-center justify-between lg:justify-start lg:gap-4 relative">
            {/* Logo - Always visible on desktop, hidden on mobile */}
            <div className="hidden lg:flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <Image src="/logo.png" alt="Trustay" width={100} height={40} className="w-[100px] h-[40px] object-contain"  />
              </Link>
            </div>

            {/* Search on Mobile - Left aligned */}
            {!isAuthPage && isMounted && (
              <div className="flex lg:hidden flex-1 items-center gap-1 sm:gap-1.5 ml-0 max-w-[calc(100vw-180px)] relative">
                {/* Back button - show on search and detail pages */}
                {(pathname === '/rooms' || pathname === '/room-seekings' || pathname === '/roommate' || pathname.startsWith('/rooms/')) && (
                  <Button
                    onClick={() => router.back()}
                    size="sm"
                    variant="ghost"
                    className="h-9 w-9 p-0 flex-shrink-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}

                <div className="relative flex-1" ref={mobileSearchRef}>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => setShowSearchSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                    placeholder="Tìm kiếm..."
                    className="h-9 w-full min-w-0 px-3 rounded-lg text-sm"
                  />

                  {/* Search Suggestions Dropdown */}
                  {showSearchSuggestions && searchQuery.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-[9999] max-h-60 overflow-y-auto">
                      <div className="py-2">
                        <div className="px-3 py-1 text-xs text-gray-500 font-medium">Tìm kiếm phổ biến</div>
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSearchQuery(suggestion)
                              setShowSearchSuggestions(false)
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Search className="h-4 w-4 text-gray-400" />
                            <span>{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSearch}
                  size="sm"
                  className="h-9 w-9 p-0 bg-green-600 hover:bg-green-700 text-white rounded-lg flex-shrink-0"
                >
                  <Search className="h-4 w-4" />
                </Button>

                {/* Filter button on mobile */}
                {(pathname === '/rooms' || pathname === '/room-seekings' || pathname === '/roommate') && (
                  <Button
                    onClick={() => setIsFilterOpen(true)}
                    size="sm"
                    variant="outline"
                    className="h-9 w-9 p-0 flex-shrink-0"
                  >
                    <Funnel className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Centered Search + Filter (visible on desktop only) */}
            {!isAuthPage && isMounted && (
              <div className="hidden lg:flex flex-1 items-center justify-center">
                <div className="flex items-center gap-2 xl:gap-3">
                  {/* Search bar container */}
                  <div className="flex items-center">
                    {/* Search type dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-10 w-40 xl:w-44 px-2 rounded-l-lg rounded-r-none border-r-0 bg-white hover:bg-gray-50 cursor-pointer">
                          <Home className="h-4 w-4 mr-1" />
                          {searchType === 'rooms' ? 'Tìm phòng trọ' :
                            searchType === 'room-seeking' ? 'Người tìm trọ' :
                              'Tìm người ở ghép'}
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuContent className="w-44 z-[10000]" align="start">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => setSearchType('rooms')}>
                              <Home className="h-4 w-4 mr-2" />
                              Tìm phòng trọ
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSearchType('room-seeking')}>
                              <Search className="h-4 w-4 mr-2" />
                              Người tìm trọ
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSearchType('roommate')}>
                              <Plus className="h-4 w-4 mr-2" />
                              Tìm người ở ghép
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenuPortal>
                    </DropdownMenu>

                    {/* Search input */}
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Nhập để tìm kiếm"
                      className="h-10 w-48 xl:w-64 px-4 rounded-none border-l-0 border-r-0 focus:outline-none focus:ring-2 focus:ring-green-600 focus:z-10"
                    />

                    {/* Search button */}
                    <Button
                      onClick={handleSearch}
                      className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-l-none rounded-r-lg cursor-pointer"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Tìm kiếm
                    </Button>
                  </div>

                  {/* Filter button - separated */}
                  <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-10 px-3 bg-white hover:bg-gray-50 rounded-lg cursor-pointer">
                        <Funnel className="h-4 w-4 mr-2" />
                        Bộ lọc
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
                      <DialogHeader className="flex-shrink-0">
                        <DialogTitle>Bộ lọc</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto space-y-6 py-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full">
                        <div>
                          <div className="text-sm font-medium mb-2">Danh mục cho thuê</div>
                          <div className="flex flex-wrap gap-2">
                            {getRoomTypeOptions().map(option => (
                              <Button
                                key={option.value}
                                onClick={() => setSelectedCategory(`roomType:${option.value}`)}
                                variant={selectedCategory === `roomType:${option.value}` ? 'default' : 'outline'}
                                className={`h-9 ${selectedCategory === `roomType:${option.value}` ? 'bg-green-600 hover:bg-green-700' : ''}`}
                              >
                                {option.label}
                              </Button>
                            ))}
                            <Button
                              onClick={() => setSelectedCategory('roommate')}
                              variant={selectedCategory === 'roommate' ? 'default' : 'outline'}
                              className={`h-9 ${selectedCategory === 'roommate' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            >
                              Tìm người ở ghép
                            </Button>
                            <Button
                              onClick={() => setSelectedCategory('room-seeking')}
                              variant={selectedCategory === 'room-seeking' ? 'default' : 'outline'}
                              className={`h-9 ${selectedCategory === 'room-seeking' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            >
                              Người tìm trọ
                            </Button>
                          </div>
                        </div>

                        {/* Lọc theo khu vực */}
                        <div className="space-y-3">
                          <div className="text-sm font-medium">Lọc theo khu vực</div>
                          <AddressSelector
                            showStreetInput={false}
                            onChange={(addr) => {
                              setSelectedProvinceId(addr.province?.id || null)
                              setSelectedDistrictId(addr.district?.id || null)
                              setSelectedWardId(addr.ward?.id || null)
                            }}
                          />
                        </div>

                        {/* Khoảng giá */}
                        <div className="space-y-3">
                          <div className="text-sm font-medium">Khoảng giá</div>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { v: '', l: 'Tất cả' },
                              { v: '0-1000000', l: 'Dưới 1 triệu' },
                              { v: '1000000-2000000', l: '1 - 2 triệu' },
                              { v: '2000000-3000000', l: '2 - 3 triệu' },
                              { v: '3000000-5000000', l: '3 - 5 triệu' },
                              { v: '5000000-7000000', l: '5 - 7 triệu' },
                              { v: '7000000-10000000', l: '7 - 10 triệu' },
                              { v: '10000000-15000000', l: '10 - 15 triệu' },
                              { v: '15000000-999999999', l: 'Trên 15 triệu' },
                            ].map(opt => (
                              <Button
                                key={opt.v || 'all'}
                                onClick={() => setSelectedPriceRange(opt.v)}
                                variant={selectedPriceRange === opt.v ? 'default' : 'outline'}
                                className={`h-9 ${selectedPriceRange === opt.v ? 'bg-green-600 hover:bg-green-700' : ''}`}
                              >
                                {opt.l}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Khoảng diện tích */}
                        <div className="space-y-3">
                          <div className="text-sm font-medium">Khoảng diện tích</div>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { v: '', l: 'Tất cả' },
                              { v: '0-20', l: 'Dưới 20m²' },
                              { v: '20-30', l: '20 - 30m²' },
                              { v: '30-50', l: '30 - 50m²' },
                              { v: '50-70', l: '50 - 70m²' },
                              { v: '70-90', l: '70 - 90m²' },
                              { v: '90-999', l: 'Trên 90m²' },
                            ].map(opt => (
                              <Button
                                key={opt.v || 'all'}
                                onClick={() => setSelectedAreaRange(opt.v)}
                                variant={selectedAreaRange === opt.v ? 'default' : 'outline'}
                                className={`h-9 ${selectedAreaRange === opt.v ? 'bg-green-600 hover:bg-green-700' : ''}`}
                              >
                                {opt.l}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Đặc điểm nổi bật */}
                        <div className="space-y-3">
                          <div className="text-sm font-medium">Đặc điểm nổi bật</div>
                          <AmenityFilter
                            selectedAmenities={selectedAmenities}
                            onSelectionChange={setSelectedAmenities}
                            mode="inline"
                          />
                          <RuleSelector
                            selectedRules={selectedRules}
                            onSelectionChange={(rules) => setSelectedRules(rules as string[])}
                            mode="inline"
                          />
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-2">Từ khóa</div>
                          <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Nhập từ khóa..."
                            className="w-full h-10 px-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-600"
                          />
                        </div>
                      </div>
                      <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t">
                        <div className="flex gap-2 w-full">
                          <Button
                            onClick={() => setIsFilterOpen(false)}
                            variant="outline"
                            className="flex-1 sm:flex-initial cursor-pointer"
                          >
                            Hủy
                          </Button>
                          <Button
                            onClick={handleApplyFilters}
                            className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 cursor-pointer"
                          >
                            Áp dụng
                          </Button>
                        </div>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}

            {/* Right Section - AI Button + Messages + Login/Signup or User Menu */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 flex-shrink-0 lg:ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 cursor-pointer rounded-full"
                onClick={() => toggleAISidebar(!isAIOpen)}
                aria-label="Mở Trustay AI"
              >
                <Sparkles className="h-4 w-4 text-green-600" />
              </Button>
              {isAuthenticated && user ? (
                <>
                {/* Messages Button - Mobile Only */}
                <Link href="/messages" className="lg:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 cursor-pointer rounded-full relative"
                    aria-label="Tin nhắn"
                  >
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </Button>
                </Link>
                <NotificationBell />
                <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-1 sm:space-x-2 h-9 lg:h-10 text-gray-700 hover:text-gray-900 cursor-pointer px-1 sm:px-3"
                >
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                    {user.avatarUrl && user.avatarUrl.trim() !== '' ? (
                      <div className="w-full h-full relative">
                        <SizingImage
                          src={user.avatarUrl}
                          srcSize="256x256"
                          alt={`${user.firstName} ${user.lastName}`}
                          className="object-cover rounded-full"
                          fill
                        />
                      </div>
                    ) : (
                      <AvatarFallback className="text-xs sm:text-sm font-medium bg-green-100 text-green-700">
                        {user.firstName?.charAt(0)?.toUpperCase()}{user.lastName?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {isMounted && <span className="hidden md:inline-block text-sm">{user.firstName} {user.lastName}</span>}
                  <ChevronDown className="h-3 w-3 hidden sm:block" />
                </Button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border z-50">
                    <div className="py-1">
                      <Link
                        href={"/profile"}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        Quản lý cá nhân
                      </Link>
                      {user?.role === 'landlord' ? (
                        <Link
                        href={"/dashboard/landlord"}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        Quản lý trọ
                      </Link>
                      ): (
                        <Link
                        href={"/dashboard/tenant"}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        Quản lý thuê
                      </Link>
                      )}

                      <hr className="border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 inline mr-2" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
                </div>
                {user?.role === 'tenant' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 lg:h-10 text-white bg-green-600 hover:bg-green-700 font-medium cursor-pointer px-2 sm:px-4">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Đăng bài</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuContent className="w-56 z-[10000]" align="end" side="top">
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <Link href="/post?type=room-seeking" className="select-none space-y-1 rounded-md px-3 py-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">Đăng tin tìm chỗ thuê</div>
                              <p className="text-xs leading-tight text-muted-foreground">
                                Đăng tin tìm kiếm phòng trọ, nhà trọ
                              </p>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href="/post?type=roommate" className="block select-none space-y-1 rounded-md px-3 py-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">Đăng tin tìm người ở ghép</div>
                              <p className="text-xs leading-tight text-muted-foreground">
                                Tìm bạn cùng phòng, người ở ghép
                              </p>
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenuPortal>
                  </DropdownMenu>
                )}
                </>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Button variant="ghost" size="sm" className="h-9 lg:h-10 px-2 sm:px-4" asChild>
                    <Link href="/login" className="text-gray-600 hover:text-gray-700 cursor-pointer text-xs sm:text-sm">
                      Đăng nhập
                    </Link>
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-green-700 text-white cursor-pointer h-9 lg:h-10 px-2 sm:px-4 text-xs sm:text-sm" asChild>
                    <Link href="/register">Đăng ký</Link>
                  </Button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
