import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Presenter AI - Scripts de présentation",
  description: "Générez des scripts parfaits pour vos présentations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr" className="dark">
        <body className={`${inter.className} bg-background text-foreground antialiased min-h-screen flex flex-col`}>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}