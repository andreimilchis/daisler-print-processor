import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-card border-b border-border px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 shadow-sm">
      <Link href="/">
        <Image src="/logo.svg" alt="Daisler" width={120} height={30} priority className="md:w-[140px]" />
      </Link>
      <div className="h-5 md:h-6 w-px bg-border" />
      <h1 className="text-sm md:text-lg font-semibold text-foreground truncate">
        Print File Processor
      </h1>
      <div className="ml-auto">
        <Link
          href="/history"
          className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden md:inline">Istoric</span>
        </Link>
      </div>
    </header>
  );
}
