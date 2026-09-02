import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <Link href="/" className="text-xl font-bold tracking-tight text-white">GetPreOp</Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">Anesthesia-led preoperative readiness for surgical teams, clinicians, and patients.</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">Explore</p>
          <div className="mt-4 flex flex-col gap-3 text-sm"><Link href="/why-getpreop" className="hover:text-white">Why GetPreOp</Link><Link href="/who-we-serve" className="hover:text-white">Who We Serve</Link><Link href="/about" className="hover:text-white">About Us</Link><Link href="/contact" className="hover:text-white">Contact Us</Link></div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">Legal</p>
          <div className="mt-4 flex flex-col gap-3 text-sm"><Link href="/privacy" className="hover:text-white">Privacy Policy</Link><Link href="/terms" className="hover:text-white">Terms of Service</Link><a href="mailto:contact@getpreop.com" className="hover:text-white">contact@getpreop.com</a><a href="tel:+17739314997" className="hover:text-white">+1 (773) 931-4997</a></div>
        </div>
      </div>
      <div className="border-t border-slate-800"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-5 py-5 text-xs text-slate-500 sm:px-8 lg:px-10"><span>Copyright {new Date().getFullYear()} GetPreOp. All rights reserved.</span><span>Preoperative readiness, thoughtfully delivered.</span></div></div>
    </footer>
  );
}
