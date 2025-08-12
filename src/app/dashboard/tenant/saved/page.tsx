"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Home, MapPin, Star, Eye, Share2, Trash2 } from "lucide-react"

// Mock data for saved properties
const mockSavedProperties = [
  {
    id: "prop-1",
    name: "Nhà trọ ABC",
    address: "123 Đường XYZ, Quận 1, TP.HCM",
    monthlyRent: 3500000,
    area: 25,
    rating: 4.5,
    reviewCount: 12,
    images: ["/images/roommate1.png"],
    amenities: ["Wifi", "Điều hòa", "Máy giặt"],
    savedDate: "2024-01-15",
    available: true
  },
  {
    id: "prop-2",
    name: "Chung cư mini DEF", 
    address: "456 Đường ABC, Quận 3, TP.HCM",
    monthlyRent: 4200000,
    area: 30,
    rating: 4.8,
    reviewCount: 25,
    images: ["/images/roommate1.png"],
    amenities: ["Wifi", "Điều hòa", "Thang máy", "Bảo vệ 24/7"],
    savedDate: "2024-01-10",
    available: true
  },
  {
    id: "prop-3",
    name: "Nhà trọ GHI",
    address: "789 Đường DEF, Quận 7, TP.HCM", 
    monthlyRent: 2800000,
    area: 20,
    rating: 4.2,
    reviewCount: 8,
    images: ["/images/roommate1.png"],
    amenities: ["Wifi", "Máy giặt chung"],
    savedDate: "2024-01-05",
    available: false
  }
]

export default function TenantSaved() {
  const handleUnsave = (propertyId: string) => {
    // Handle unsave property logic
    console.log("Unsaving property:", propertyId)
  }

  const handleShare = (propertyId: string) => {
    // Handle share property logic
    console.log("Sharing property:", propertyId)
  }

  const handleViewDetails = (propertyId: string) => {
    // Handle view property details
    console.log("Viewing property:", propertyId)
  }

  return (
    <DashboardLayout userType="tenant">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trọ đã lưu</h1>
          <p className="text-gray-600">Danh sách các bài viết trọ bạn đã lưu ({mockSavedProperties.length})</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockSavedProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <Home className="h-12 w-12 text-gray-400" />
                </div>
                <div className="absolute top-3 right-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                    onClick={() => handleUnsave(property.id)}
                  >
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </Button>
                </div>
                {!property.available && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Hết phòng
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-1">{property.name}</CardTitle>
                <CardDescription className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">{property.address}</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-green-600">
                      {(property.monthlyRent / 1000000).toFixed(1)} triệu/tháng
                    </p>
                    <p className="text-sm text-gray-600">{property.area}m²</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{property.rating}</span>
                    <span className="text-sm text-gray-600">({property.reviewCount})</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {property.amenities.slice(0, 3).map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {property.amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{property.amenities.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Đã lưu: {new Date(property.savedDate).toLocaleDateString('vi-VN')}
                </div>

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewDetails(property.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Xem
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleShare(property.id)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleUnsave(property.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {mockSavedProperties.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có trọ nào được lưu</h3>
              <p className="text-gray-600 mb-6">
                Bạn chưa lưu bài viết trọ nào. Hãy khám phá và lưu những phòng trọ bạn quan tâm.
              </p>
              <Button>
                <Heart className="h-4 w-4 mr-2" />
                Khám phá trọ mới
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
