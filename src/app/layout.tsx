
"use client";

import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { usePathname } from 'next/navigation';
import { AppHeader } from '@/components/shared/app-header';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Paradise ScoopSmart</title>
        <meta name="description" content="Manage your ice cream parlor with ease." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", "min-h-screen bg-background")}>
        <FirebaseClientProvider>
          {isLoginPage ? (
            <>
              {children}
            </>
          ) : (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <AppHeader />
                  <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                  </main>
                </SidebarInset>
            </SidebarProvider>
          )}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
