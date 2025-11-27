import type { Metadata } from "next";
import { Geist_Mono, Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import Sidebar from "../components/Sidebar";
import MobileMenu from "../components/MobileMenu";
import MainNav from "../components/MainNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Academic Pages (Next.js)",
  description: "A fast, SPA-ish academic site inspired by academicpages.github.io",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
  <body className={`${inter.variable} ${geistMono.variable} ${display.variable} bg-(--surface) text-(--text) antialiased font-sans`}>
        {/* Sticky header at top */}
        <header className="sticky inset-x-0 top-0 z-50 h-16 border-b border-(--border)/80 bg-(--surface)/70 backdrop-blur-md shadow-sm">
          <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
            <Link href="/" className="text-lg font-semibold tracking-wide font-display">Academic Pages</Link>
            <div className="flex items-center gap-4">
              <MainNav />
              <ThemeToggle />
              <MobileMenu />
            </div>
          </nav>
        </header>

        {/* Below header: normal page flow; sidebar sticky, page scrollbar at window edge */}
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="flex gap-8">
            <Sidebar />
            <main className="min-w-0 flex-1 pb-16 pt-8">
              {children}
            </main>
          </div>
          <footer className="mt-12 border-t border-(--border) py-6">
            <div className="text-sm text-(--muted-text)">
              © {new Date().getFullYear()} Can Hankendi — Built with Next.js + Tailwind
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
