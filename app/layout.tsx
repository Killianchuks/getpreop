import type { Metadata } from "next";
import Link from "next/link";
import { AuthNavigation } from "@/components/auth-navigation";
import { MobileNavigation } from "@/components/mobile-navigation";
import { PartnerNavigation } from "@/components/partner-navigation";
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
        <header className="site-header">
          <div className="site-header-content">
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
            
            <nav className="site-header-nav">
              <Link href="/" className="hover:text-teal-800 transition">Home</Link>
              <Link href="/why-getpreop" className="hover:text-teal-800 transition">Why GetPreOp</Link>
              <Link href="/who-we-serve" className="hover:text-teal-800 transition">Who We Serve</Link>
              <PartnerNavigation />
              <Link href="/what-we-offer" className="hover:text-teal-800 transition">What We Offer</Link>
              <Link href="/about" className="hover:text-teal-800 transition">About Us</Link>
            </nav>

            <div className="site-header-actions">
              <AuthNavigation />
            </div>
            <MobileNavigation />
          </div>
        </header>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
