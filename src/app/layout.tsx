import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/app/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BDAMS - Business Development Agency Management System",
  description: "A comprehensive platform to manage leads, clients, sales pipelines, team activities, and performance for business development agencies.",
  keywords: ["BDAMS", "CRM", "Lead Management", "Sales Pipeline", "Business Development", "Agency Management", "React", "Next.js"],
  authors: [{ name: "BDAMS Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "BDAMS - Business Development Agency Management System",
    description: "Manage leads, clients, sales pipelines, and team performance",
    siteName: "BDAMS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BDAMS - Business Development Agency Management System",
    description: "Manage leads, clients, sales pipelines, and team performance",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
