import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function PATCH(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { slideId, newScript } = await req.json();

        if (!slideId || typeof newScript !== 'string') {
            return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
        }

        // 1. Récupérer la slide pour savoir quel champ mettre à jour
        // (On met à jour le champ qui contient déjà du texte, par priorité)
        const slide = await prisma.slide.findUnique({
            where: { id: slideId },
        });

        if (!slide) {
            return NextResponse.json({ error: 'Slide introuvable.' }, { status: 404 });
        }

        // On détermine quel champ mettre à jour pour que l'affichage reste cohérent
        // Si scriptPro existe, on met à jour scriptPro, sinon scriptMedium, sinon scriptSimple
        let fieldToUpdate = 'scriptMedium'; // Par défaut
        if (slide.scriptPro) fieldToUpdate = 'scriptPro';
        else if (slide.scriptSimple) fieldToUpdate = 'scriptSimple';

        // 2. Mise à jour dans la base de données
        await prisma.slide.update({
            where: { id: slideId },
            data: {
                [fieldToUpdate]: newScript
            }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Erreur lors de la sauvegarde du script:", error);
        return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
    }
}