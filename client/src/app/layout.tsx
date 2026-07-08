import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TMKOC Random Episode Player",
  description: "Generate and discover random unseen episodes of Taarak Mehta Ka Ooltah Chashmah",
  openGraph: {
    title: "TMKOC Random Episode Player",
    description: "Break free from YouTube's algorithm. Track your watch history and discover random unseen TMKOC episodes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TMKOC Random Episode Player",
    description: "Discover random unseen episodes of Taarak Mehta Ka Ooltah Chashmah",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
