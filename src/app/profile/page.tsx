"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"


function ProfileRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.push('/profile/personal')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  )
}



export default function ProfilePage() {
  return <ProfileRedirect />
}

