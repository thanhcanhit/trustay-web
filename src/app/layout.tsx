import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { FooterGate } from "@/components/footer-gate";
import { AuthProvider } from "@/components/auth-provider";
import { AppInitializer } from "@/components/app-initializer";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trustay",
  description: "...",
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
          </AppInitializer>
        </AuthProvider>
      </body>
    </html>
  );
}
