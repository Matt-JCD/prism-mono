import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/lib/DataContext";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prism",
  description: "Prism - Competitive Intelligence & Org Mapping Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <DataProvider>
          <div className="flex w-full h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-hidden" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.015) 0%, transparent 60%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)" }}>
              {children}
            </main>
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
