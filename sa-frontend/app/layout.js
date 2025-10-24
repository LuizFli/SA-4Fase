import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Shell from "./components/Shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SA - Concessionária",
  description: "Frontend for SA backend",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
