'use client'

import { usePathname } from 'next/navigation'
import { Footer } from '@/components/footer'

export function FooterGate() {
  const pathname = usePathname()

  const shouldHide =
    pathname === '/post' ||
    pathname.startsWith('/dashboard/landlord') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/admin')

  if (shouldHide) return null

  return <Footer />
}


