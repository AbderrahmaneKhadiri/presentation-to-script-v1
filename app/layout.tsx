import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
// 1. IMPORT DE SONNER
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Presenter's CoPilot - Scripts de présentation",
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

          {/* 2. PLACER LE COMPOSANT ICI (Juste avant la fermeture du body) */}
          <Toaster
            position="bottom-right"
            theme="dark"
            richColors
            closeButton
          />

        </body>
      </html>
    </ClerkProvider>
  );
}