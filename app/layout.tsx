import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "GetPreOp | Virtual Preoperative Optimization",
  description:
    "Virtual anesthesiology-led preoperative assessment and optimization platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appMode = process.env.NEXT_PUBLIC_APP_MODE?.toUpperCase();

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <header className="site-header sticky top-0 z-50 border-b border-slate-200 bg-white">
          <div className="site-header-content flex w-full items-center justify-between px-5 py-3.5 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 transition hover:text-teal-700">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-800 text-sm font-bold text-white">G</span>
                <span>GetPreOp</span>
              </Link>
              {appMode ? (
                <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-700">
                  {appMode}
                </span>
              ) : null}
            </div>
            
            <nav className="site-header-nav hidden items-center gap-7 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 md:flex">
              <Link href="/" className="hover:text-teal-800 transition">Home</Link>
              <Link href="/why-getpreop" className="hover:text-teal-800 transition">Why GetPreOp</Link>
              <Link href="/who-we-serve" className="hover:text-teal-800 transition">Who We Serve</Link>
              <Link href="/how-we-partner" className="hover:text-teal-800 transition">How We Partner</Link>
              <Link href="/what-we-offer" className="hover:text-teal-800 transition">What We Offer</Link>
              <Link href="/about" className="hover:text-teal-800 transition">About Us</Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-800">Login</Link>
              <Link href="/signup" className="rounded-lg bg-teal-800 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-900">Sign Up</Link>
            </div>
          </div>
        </header>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
