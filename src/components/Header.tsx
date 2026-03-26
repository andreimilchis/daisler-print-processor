import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-card border-b border-border px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 shadow-sm">
      <Image src="/logo.svg" alt="Daisler" width={120} height={30} priority className="md:w-[140px]" />
      <div className="h-5 md:h-6 w-px bg-border" />
      <h1 className="text-sm md:text-lg font-semibold text-foreground truncate">
        Print File Processor
      </h1>
    </header>
  );
}
