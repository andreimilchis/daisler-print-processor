import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { EditorProvider } from "@/lib/editor-context";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daisler Print File Processor",
  description: "Pregătire automată a fișierelor pentru print - Daisler.ro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <EditorProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
        </EditorProvider>
      </body>
    </html>
  );
}
