"use client";

import { Presentation } from "lucide-react";
import Link from "next/link";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  // Masquer la Navbar sur la page de génération, le dashboard, la page pricing et la page de script
  if (pathname?.startsWith("/generate") || pathname?.startsWith("/dashboard") || pathname?.startsWith("/pricing") || pathname?.startsWith("/script-of-the-presentation")) {
    return null;
  }

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-50">
      <div className="container mx-auto h-14 flex items-center justify-between px-6 bg-emerald-950/80 backdrop-blur-sm border border-emerald-800 rounded-full shadow-lg">
        <Link href="/" className="flex items-center gap-2 group">
          <Presentation className="h-6 w-6 text-emerald-400" />
          <span className="font-bold text-lg text-white">
            Presenter's CoPilot
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <HoverBorderGradient
                containerClassName="rounded-full"
                as="button"
                className="bg-emerald-900 text-white flex items-center cursor-pointer"
              >
                <span>Commencer</span>
              </HoverBorderGradient>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard" className="text-sm font-medium text-emerald-100 hover:text-white transition-colors">
              Dashboard
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}