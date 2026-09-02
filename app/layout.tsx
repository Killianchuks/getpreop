import type { Metadata } from "next";
import Link from "next/link";
import { AuthNavigation } from "@/components/auth-navigation";
import { DashboardHomeLink } from "@/components/dashboard-home-link";
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
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
          <div className="flex w-full items-center justify-between px-5 py-3.5 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3">
              <DashboardHomeLink brand />
              {appMode ? (
                <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-700">
                  {appMode}
                </span>
              ) : null}
            </div>
            
            <nav className="hidden items-center gap-7 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 md:flex">
              <DashboardHomeLink />
              <Link href="/why-getpreop" className="hover:text-teal-800 transition">Why GetPreOp</Link>
              <Link href="/who-we-serve" className="hover:text-teal-800 transition">Who We Serve</Link>
              <PartnerNavigation />
              <Link href="/what-we-offer" className="hover:text-teal-800 transition">What We Offer</Link>
              <Link href="/about" className="hover:text-teal-800 transition">About Us</Link>
            </nav>

            <div className="flex items-center gap-2"><div className="md:hidden"><DashboardHomeLink /></div><AuthNavigation /></div>
          </div>
        </header>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
