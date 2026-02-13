import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import SidebarLayout from "@/components/SidebarLayout";
import { NotificationProvider } from '@/context/NotificationContext';
import { AuthProvider } from '@/context/AuthContext';

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ABBE Dashboard",
  description: "HR Dashboard",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        {/* Wrap everything inside the providers */}
        <AuthProvider>
          <NotificationProvider>
            <SidebarLayout>
              {children}
            </SidebarLayout>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}