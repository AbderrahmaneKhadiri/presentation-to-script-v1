import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex h-screen w-full bg-emerald-950 overflow-hidden">

            {/* --- 1. SKELETON SIDEBAR (Gauche) --- */}
            <aside className="w-64 h-screen border-r border-emerald-500/10 flex flex-col p-4 bg-emerald-950/50 hidden md:flex">

                {/* Logo */}
                <div className="flex items-center gap-2 mb-10 px-2 mt-2">
                    <Skeleton className="h-6 w-6 rounded-md bg-emerald-500/20" />
                    <Skeleton className="h-6 w-32 bg-emerald-500/20" />
                </div>

                {/* Menu Items */}
                <div className="space-y-3 flex-1">
                    {/* Item actif simulé */}
                    <Skeleton className="h-10 w-full rounded-lg bg-emerald-500/10" />
                    <Skeleton className="h-10 w-full rounded-lg bg-emerald-500/5" />
                </div>

                {/* Bas de page (Crédits & Profil) */}
                <div className="mt-auto space-y-4">
                    {/* Boites Crédits/Upgrade */}
                    <Skeleton className="h-12 w-full rounded-xl bg-emerald-500/10" />
                    <Skeleton className="h-12 w-full rounded-xl bg-emerald-500/10" />

                    {/* Profil Utilisateur */}
                    <div className="flex items-center gap-3 pt-4 border-t border-emerald-500/10">
                        <Skeleton className="h-10 w-10 rounded-full bg-emerald-500/20" />
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-24 bg-emerald-500/20" />
                            <Skeleton className="h-3 w-32 bg-emerald-500/10" />
                        </div>
                    </div>
                </div>
            </aside>

            {/* --- 2. SKELETON CONTENU PRINCIPAL (Droite) --- */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 relative">

                {/* Fond décoratif */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="w-full max-w-3xl flex flex-col items-center gap-8 relative z-10">

                    {/* Titre et sous-titre */}
                    <div className="flex flex-col items-center gap-4 w-full text-center">
                        <Skeleton className="h-12 w-80 md:w-96 rounded-lg bg-emerald-500/20" /> {/* Titre "Générez..." */}
                        <Skeleton className="h-5 w-2/3 max-w-md bg-emerald-500/10" /> {/* Sous-titre */}
                    </div>

                    {/* La grande carte d'upload */}
                    <div className="w-full aspect-[16/9] md:aspect-[2/1] rounded-3xl border border-emerald-500/10 bg-emerald-900/10 backdrop-blur-sm p-8 flex flex-col items-center justify-center gap-6">

                        {/* Indicateur d'étape (cercle) */}
                        <Skeleton className="h-12 w-12 rounded-full bg-emerald-500/20" />

                        <div className="space-y-3 text-center flex flex-col items-center w-full">
                            {/* Titre de la carte */}
                            <Skeleton className="h-8 w-64 bg-emerald-500/20" />
                            {/* Description formats */}
                            <Skeleton className="h-4 w-80 bg-emerald-500/10" />
                        </div>

                        {/* Icône Upload (Nuage) */}
                        <div className="mt-4 p-4 rounded-full bg-emerald-500/5">
                            <Skeleton className="h-10 w-10 bg-emerald-500/20 rounded-lg" />
                        </div>

                        {/* Texte "Glissez-déposez" */}
                        <Skeleton className="h-4 w-48 bg-emerald-500/10" />
                    </div>
                </div>
            </main>

        </div>
    );
}