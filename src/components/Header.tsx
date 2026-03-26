import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center gap-4 shadow-sm">
      <Image src="/logo.svg" alt="Daisler" width={140} height={35} priority />
      <div className="h-6 w-px bg-border" />
      <h1 className="text-lg font-semibold text-foreground">
        Print File Processor
      </h1>
    </header>
  );
}
