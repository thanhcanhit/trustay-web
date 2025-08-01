"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useUserStore } from "@/stores/user-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Home,
  Search,
  Plus,
  BarChart3,
  User,
  LogOut,
  ChevronDown
} from "lucide-react"
import Image from "next/image"

export function Navigation() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useUserStore()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Check if current page is login or register
  const isAuthPage = pathname === '/login' || pathname === '/register'

  const handleLogout = () => {
    logout()
    setShowUserDropdown(false)
  }

  // Close dropdown when clicking outside
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

  return (
    <nav className="border-b bg-white shadow-sm relative z-50">
      {/* First Row: Logo, Search, Login/Signup */}
      <div className={isAuthPage ? "" : "border-b border-gray-200"}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="Trustay" width={140} height={140} />
            </Link>

            {/* Search Bar - Hidden on auth pages */}
            {!isAuthPage && (
              <div className="flex-1 max-w-2xl mx-8">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="What are you looking for?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="">
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Tìm kiếm
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Right Section - Login/Signup or User Menu */}
            <div className="flex items-center space-x-3">
              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{user.name}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                          Quản lý phòng trọ
                        </div>
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          Yêu cầu thuê của tôi
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4 inline mr-2" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login" className="text-gray-600 hover:text-gray-700">
                      Đăng nhập
                    </Link>
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-green-700 text-white" asChild>
                    <Link href="/register">Đăng ký</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Navigation Menu - Hidden on auth pages */}
      {!isAuthPage && (
        <div className="container mx-auto px-4">
          <div className="flex h-12 items-center justify-center">
            <NavigationMenu viewport={false}>
              <NavigationMenuList className="flex space-x-8">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/" className="text-green-600 hover:text-green-700 font-medium px-3 py-2 rounded-md hover:bg-green-50 bg-green-50 flex flex-row items-center">
                      <Home className="h-4 w-4 mr-2" />
                      <div>Trang chủ</div>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 font-medium">
                    <Plus className="h-4 w-4 mr-2" />
                    Đăng tin
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-3 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Đăng tin tìm trọ</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Đăng tin tìm người ở ghép</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 font-medium">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Quản lý
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-3 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Quản lý phòng trọ</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Yêu cầu thuê của tôi</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      )}
    </nav>
  )
}
