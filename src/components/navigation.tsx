"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useUserStore } from "@/stores/userStore"
import { useSearchFilters } from "@/hooks/use-search-filters"
import { Button } from "@/components/ui/button"
import { AmenityFilter } from "@/components/ui/amenity-filter"
import { PriceFilter } from "@/components/ui/price-filter"
import { LocationFilter } from "@/components/ui/location-filter"
import { AreaFilter } from "@/components/ui/area-filter"
import { SearchInputWithFilters } from "@/components/ui/search-input-with-filters"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Plus,
  User,
  LogOut,
  ChevronDown
} from "lucide-react"
import Image from "next/image"

export function Navigation() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout, switchRole } = useUserStore()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Use search filters hook
  const {
    searchQuery,
    setSearchQuery,
    getActiveFilters,
    addFilterValue,
    removeFilterValue,
    removeFilter,
    applyFilters
  } = useSearchFilters()

  // Get active filters for display
  const activeFiltersList = getActiveFilters()

  // Handle search
  const handleSearch = () => {
    applyFilters()
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

  const handleRoleSwitch = () => {
    if (!user) return
    const newRole = user.role === 'tenant' ? 'landlord' : 'tenant'
    switchRole(newRole)
    setShowUserDropdown(false)
    // Redirect to appropriate dashboard
    window.location.href = newRole === 'tenant' ? '/dashboard/tenant' : '/dashboard/landlord'
  }

  const getDashboardLink = () => {
    if (!user) return "/login"
    return user.role === 'tenant' ? '/dashboard/tenant' : '/dashboard/landlord'
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
    <nav className="border-b bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
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
              <div className="flex-1 max-w-4xl mx-8">
                <div className="flex space-x-2">
                  {/* Search Input with Selected Filters */}
                  <div className="flex-1">
                    <SearchInputWithFilters
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      onSearch={handleSearch}
                      selectedAmenities={activeFiltersList.find(af => af.id === 'amenities')?.values || []}
                      selectedPrices={activeFiltersList.find(af => af.id === 'price')?.values || []}
                      selectedLocation={activeFiltersList.find(af => af.id === 'location')?.values?.[0] || ''}
                      selectedAreas={activeFiltersList.find(af => af.id === 'area')?.values || []}
                      onRemoveFilter={(type, value) => {
                        if (type === 'location') {
                          removeFilter('location');
                        } else {
                          removeFilterValue(type === 'amenity' ? 'amenities' : type, value);
                        }
                      }}
                    />
                  </div>

                  {/* Search Button */}
                  <Button
                    onClick={handleSearch}
                    className="bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors px-6 self-center"
                  >
                    Tìm kiếm
                  </Button>
                </div>
              </div>
            )}

            {/* Right Section - Login/Signup or User Menu */}
            <div className="flex items-center space-x-3">
              {isAuthenticated && user ? (
                <>
                  {/* Role Switch Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRoleSwitch}
                    className="text-sm border-green-500 text-green-600 hover:bg-green-50"
                  >
                    {user.role === 'tenant' ? 'Quản cáo trọ' : 'Chế độ thuê trọ'}
                  </Button>

                  <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline-block">{user.firstName} {user.lastName}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border z-50">
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          Quản lý cá nhân
                        </Link>
                        <Link
                          href={getDashboardLink()}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          {user?.role === 'tenant' ? 'Dashboard' : 'Dashboard trọ'}
                        </Link>
                        <hr className="border-gray-200" />
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
                </>
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

      {/* Second Row: Filter Bar - Hidden on auth pages */}
      {!isAuthPage && (
        <div className="container mx-auto px-4">
          <div className="flex h-12 items-center gap-15">
            {/* Post Button */}
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-white bg-green-600 hover:bg-green-700 font-medium px-4 py-2 rounded-md">
                    <Plus className="h-4 w-4 mr-2" />
                    Đăng bài
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link href="/dashboard/landlord/properties/add" className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                            <Plus className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Đăng tin cho thuê
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Đăng tin cho thuê phòng trọ, nhà trọ của bạn
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link href="/dashboard/landlord/roommate/add" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Đăng tin tìm người ở ghép</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-5 flex-wrap">
              <LocationFilter
                selectedLocation={activeFiltersList.find(af => af.id === 'location')?.values?.[0] || ''}
                onLocationChange={(location) => {
                  // Clear existing location filter
                  removeFilter('location');
                  // Add new location filter if not empty
                  if (location) {
                    addFilterValue('location', location);
                  }
                }}
              />

              <AreaFilter
                selectedAreas={activeFiltersList.find(af => af.id === 'area')?.values || []}
                onSelectionChange={(areas) => {
                  // Clear existing area filters
                  const currentAreaFilter = activeFiltersList.find(af => af.id === 'area');
                  if (currentAreaFilter) {
                    currentAreaFilter.values.forEach(value => {
                      removeFilterValue('area', value);
                    });
                  }
                  // Add new area filters
                  areas.forEach(area => {
                    addFilterValue('area', area);
                  });
                }}
              />

              <PriceFilter
                selectedPrices={activeFiltersList.find(af => af.id === 'price')?.values || []}
                onSelectionChange={(prices) => {
                  // Clear existing price filters
                  const currentPriceFilter = activeFiltersList.find(af => af.id === 'price');
                  if (currentPriceFilter) {
                    currentPriceFilter.values.forEach(value => {
                      removeFilterValue('price', value);
                    });
                  }
                  // Add new price filters
                  prices.forEach(price => {
                    addFilterValue('price', price);
                  });
                }}
              />

              <AmenityFilter
                selectedAmenities={activeFiltersList.find(af => af.id === 'amenities')?.values || []}
                onSelectionChange={(amenityIds) => {
                  // Clear existing amenity filters
                  const currentAmenityFilter = activeFiltersList.find(af => af.id === 'amenities');
                  if (currentAmenityFilter) {
                    currentAmenityFilter.values.forEach(value => {
                      removeFilterValue('amenities', value);
                    });
                  }
                  // Add new amenity filters
                  amenityIds.forEach(amenityId => {
                    addFilterValue('amenities', amenityId);
                  });
                }}
              />
            </div>

          </div>
        </div>
      )}
    </nav>
  )
}
