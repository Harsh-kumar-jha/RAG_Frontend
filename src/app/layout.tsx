"use client";

import { usePathname } from "next/navigation";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { QueryProvider } from "@/components/shared/QueryProvider";
import { useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const isChatRoute = pathname?.startsWith("/chat");

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="bg-white text-slate-900 antialiased" suppressHydrationWarning>
        <QueryProvider>
          <div className="flex h-screen overflow-hidden bg-white">
            {!isChatRoute && (
              <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            )}
            <main className="flex flex-col flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
