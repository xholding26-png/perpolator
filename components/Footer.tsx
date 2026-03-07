import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-6 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#666]">
        <span className="font-mono">PERPOLATOR © 2026</span>
        <div className="flex gap-6">
          <Link href="/markets" className="hover:text-white transition-colors">Markets</Link>
          <Link href="https://x.com/perpolator" target="_blank" rel="noopener" className="hover:text-white transition-colors">𝕏</Link>
        </div>
      </div>
    </footer>
  );
}
