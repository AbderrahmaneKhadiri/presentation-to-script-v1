"use client";

import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { Presentation, LayoutDashboard, Coins, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const { user, isLoaded, isSignedIn } = useUser();

    // Mock data for now - in a real app this would come from the database
    const tokenCount = 10;
    const isPremium = false;

    if (!isLoaded) return null;

    return (
        <aside className="w-64 h-screen bg-emerald-950/50 backdrop-blur-xl border-r border-emerald-500/10 flex flex-col relative z-50">

            {/* --- LOGO CORRIGÉ --- */}
            <div className="p-6 border-b border-emerald-500/10">
                <Link href={isSignedIn ? "/generate" : "/"} className="flex items-center gap-3 group">
                    {/* flex-shrink-0 empêche l'icône de s'écraser */}
                    <Presentation className="h-6 w-6 text-emerald-400 group-hover:text-emerald-300 transition-colors flex-shrink-0" />

                    {/* whitespace-nowrap empêche le retour à la ligne + text-lg pour ajuster la taille */}
                    <span className="font-bold text-lg text-white tracking-tight whitespace-nowrap">
                        Presenter's CoPilot
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-emerald-100 hover:text-white hover:bg-emerald-500/10 rounded-xl transition-all duration-200 group"
                >
                    <LayoutDashboard className="h-5 w-5 text-emerald-400 group-hover:text-emerald-300" />
                    <span className="font-medium">Dashboard</span>
                </Link>

                {/* Add more links here if needed */}
            </nav>

            {/* Bottom User Section */}
            <div className="p-4 border-t border-emerald-500/10 bg-emerald-950/30">
                {/* Token & Premium Status */}
                <div className="mb-6 space-y-3">
                    {/* Token Count */}
                    <div className="flex items-center justify-between px-3 py-2 bg-emerald-900/30 rounded-lg border border-emerald-500/10">
                        <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm font-medium text-emerald-100">Crédits</span>
                        </div>
                        <span className="text-sm font-bold text-white">{tokenCount}</span>
                    </div>

                    {/* Premium Status */}
                    <div className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg border",
                        isPremium
                            ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30"
                            : "bg-emerald-900/30 border-emerald-500/10"
                    )}>
                        <div className="flex items-center gap-2">
                            {isPremium ? (
                                <Crown className="h-4 w-4 text-purple-400" />
                            ) : (
                                <Sparkles className="h-4 w-4 text-emerald-400" />
                            )}
                            <span className="text-sm font-medium text-emerald-100">
                                {isPremium ? "Premium" : "Gratuit"}
                            </span>
                        </div>
                        {!isPremium && (
                            <Link href="/pricing" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline decoration-emerald-500/30 underline-offset-2">
                                Upgrade
                            </Link>
                        )}
                    </div>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 px-2">
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                avatarBox: "h-9 w-9 ring-2 ring-emerald-500/20",
                                userButtonPopoverCard: "bg-emerald-950 border border-emerald-800 text-white",
                                userButtonPopoverFooter: "hidden"
                            }
                        }}
                    />
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium text-white truncate">
                            {user?.fullName || user?.firstName || "Utilisateur"}
                        </span>
                        <span className="text-xs text-emerald-400/70 truncate">
                            {user?.primaryEmailAddress?.emailAddress}
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
}