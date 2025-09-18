import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { FooterGate } from "@/components/footer-gate";
import { AuthProvider } from "@/components/auth-provider";
import { AppInitializer } from "@/components/app-initializer";
import { NotificationProvider } from "@/components/notification-provider";
import { Toaster } from "@/components/ui/sonner";
import { ChatProvider } from "@/components/chat/chat-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Trustay - Tìm Nhà & Bạn Ở Ghép Hoàn Hảo",
    template: "%s | Trustay"
  },
  description: "Trustay là nền tảng đáng tin cậy để tìm nhà thuê, bạn ở ghép và bất động sản cho thuê. Kết nối với chủ nhà và người thuê đã được xác minh để có giải pháp nhà ở an toàn, bảo mật.",
  keywords: [
    "nhà thuê",
    "bạn ở ghép",
    "nhà ở",
    "căn hộ",
    "thuê nhà",
    "chủ nhà",
    "người thuê",
    "tìm phòng",
    "quản lý bất động sản",
    "bất động sản",
    "phòng trọ",
    "kí túc xá",
    "homestay"
  ],
  authors: [{ name: "Đội ngũ Trustay" }],
  creator: "Trustay",
  publisher: "Trustay",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://trustay.life"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    title: "Trustay - Tìm Nhà & Bạn Ở Ghép Hoàn Hảo",
    description: "Trustay là nền tảng đáng tin cậy để tìm nhà thuê, bạn ở ghép và bất động sản cho thuê. Kết nối với chủ nhà và người thuê đã được xác minh để có giải pháp nhà ở an toàn, bảo mật.",
    siteName: "Trustay",
    images: [
      {
        url: "/banner2.png",
        width: 1200,
        height: 630,
        alt: "Trustay - Tìm Nhà & Bạn Ở Ghép Hoàn Hảo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trustay - Tìm Nhà & Bạn Ở Ghép Hoàn Hảo",
    description: "Trustay là nền tảng đáng tin cậy để tìm nhà thuê, bạn ở ghép và bất động sản cho thuê.",
    images: ["/banner2.png"],
    creator: "@trustay",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <AppInitializer>
            <NotificationProvider>
              <Suspense fallback={
                <div className="bg-white shadow-sm">
                  <div className="container mx-auto px-4 py-4">
                    <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              }>
                <Navigation />
              </Suspense>
              <main className="flex-1 page-content">{children}</main>
              <FooterGate />
              <Toaster
                position="top-center"
                expand={true}
                richColors
                closeButton
              />
              <ChatProvider />
            </NotificationProvider>
          </AppInitializer>
        </AuthProvider>
      </body>
    </html>
  );
}
