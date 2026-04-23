import type { Metadata } from "next";
import { Geist_Mono, Fraunces, Inter } from "next/font/google";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import MainNav from "../components/MainNav";
import MobileMenu from "../components/MobileMenu";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";

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
  metadataBase: new URL("https://www.hankendi.com"),
  title: {
    default: "Can Hankendi - Academic Page",
    template: "%s | Can Hankendi",
  },
  description:
    "Academic webpage of researcher Can Hankendi at Boston University specializing in sustainable and carbon-aware computing.",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
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
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ? (
          <script
            async
            src={
              process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ??
              "https://analytics.umami.is/script.js"
            }
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        ) : null}
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} ${display.variable} bg-(--surface) font-sans text-(--text) antialiased`}
      >
        <header className="sticky inset-x-0 top-0 z-50 h-16 border-b border-(--border)/80 bg-(--surface)/80 backdrop-blur-md shadow-sm">
          <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
            <Link href="/" className="font-display text-lg font-semibold tracking-wide text-(--text)">
              Can Hankendi
            </Link>
            <div className="flex items-center gap-4">
              <MainNav />
              <ThemeToggle />
              <MobileMenu />
            </div>
          </nav>
        </header>

        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="flex gap-8 lg:gap-10">
            <Sidebar />
            <main className="min-w-0 flex-1 pb-16 pt-8 lg:pt-10">{children}</main>
          </div>
          <footer className="mt-12 border-t border-(--border) py-6">
            <div className="text-sm text-(--muted-text)">
              © {new Date().getFullYear()} Can Hankendi · Built with Next.js + Tailwind
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
