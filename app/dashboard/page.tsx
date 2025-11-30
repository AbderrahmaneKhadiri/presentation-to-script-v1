import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Calendar, ArrowRight, Layout, Clock } from "lucide-react";
import Image from "next/image";

export default async function DashboardPage() {
    const { userId } = await auth();

    if (!userId) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Non autorisé.
            </div>
        );
    }

    // 1. Récupérer l'utilisateur interne via son ID Clerk (externalId)
    const user = await prisma.user.findUnique({
        where: {
            externalId: userId,
        },
    });

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Utilisateur introuvable. Veuillez vous reconnecter.
            </div>
        );
    }

    // 2. Utiliser l'ID interne de l'utilisateur pour récupérer ses présentations
    const presentations = await prisma.presentation.findMany({
        where: {
            userId: user.id, // Correction : Utilisation de l'ID interne
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            slides: {
                orderBy: { slideNumber: 'asc' },
                take: 1,
                select: {
                    imageUrl: true,
                    scriptPro: true,
                    scriptMedium: true,
                    scriptSimple: true,
                    extractedText: true
                }
            },
            _count: {
                select: { slides: true },
            },
        },
    });

    return (
        <div className="min-h-screen pt-24 px-4 container mx-auto max-w-6xl pb-20">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Mes Projets</h1>
                    <p className="text-emerald-200/60">Retrouvez toutes vos présentations et scripts générés.</p>
                </div>
                <Link
                    href="/generate"
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-lg shadow-emerald-900/20 font-medium hover:scale-105 active:scale-95"
                >
                    <Layout className="w-4 h-4" />
                    Nouvelle présentation
                </Link>
            </div>

            {presentations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                    <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                        <FileText className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                        Aucune présentation
                    </h3>
                    <p className="text-gray-400 mb-8 text-center max-w-md">
                        Vous n'avez pas encore créé de présentation. Commencez dès maintenant pour générer votre premier script IA.
                    </p>
                    <Link
                        href="/generate"
                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
                    >
                        Créer maintenant
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {presentations.map((presentation) => {
                        const firstSlide = presentation.slides[0];
                        const scriptPreview = firstSlide?.scriptPro || firstSlide?.scriptMedium || firstSlide?.scriptSimple || firstSlide?.extractedText || "Aucun aperçu disponible.";

                        return (
                            <Link
                                key={presentation.id}
                                href={`/script-of-the-presentation/${presentation.id}`}
                                className="group flex flex-col bg-emerald-950/30 hover:bg-emerald-900/40 border border-white/10 hover:border-emerald-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/20"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-black/40 overflow-hidden border-b border-white/5">
                                    {firstSlide?.imageUrl ? (
                                        <Image
                                            src={firstSlide.imageUrl}
                                            alt={presentation.fileName}
                                            layout="fill"
                                            objectFit="cover"
                                            className="transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/20">
                                            <FileText className="w-12 h-12 text-emerald-500/30" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent opacity-60" />

                                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                        <span className="text-xs font-bold text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                                            {presentation._count.slides} slides
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                                        {presentation.fileName}
                                    </h3>

                                    <div className="flex items-center text-xs text-emerald-200/50 mb-4 font-mono">
                                        <Calendar className="w-3 h-3 mr-1.5" />
                                        {format(new Date(presentation.createdAt), "d MMMM yyyy", { locale: fr })}
                                    </div>

                                    <div className="relative bg-black/20 rounded-lg p-3 mb-4 flex-grow border border-white/5">
                                        <p className="text-sm text-gray-400 line-clamp-3 italic">
                                            "{scriptPreview.slice(0, 150)}..."
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-end text-sm font-bold text-emerald-500 group-hover:text-emerald-400 transition-colors mt-auto">
                                        Ouvrir le projet <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
