import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daily Log",
  description: "日々の記録アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geist.variable} antialiased bg-zinc-50`}>
        <Navigation />
        <main className="max-w-3xl mx-auto px-8 pt-20 pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}