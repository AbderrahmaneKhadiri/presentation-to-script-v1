import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// ⚠️ ATTENTION : Pas de "export default" ici.
// Uniquement "export async function DELETE".

export async function DELETE(
    req: NextRequest,
    // Signature spécifique pour Next.js 15 (params est une Promise)
    props: { params: Promise<{ presentationId: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // On attend la résolution des paramètres (Next.js 15)
        const params = await props.params;
        const presentationId = params.presentationId;

        if (!presentationId) {
            return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
        }

        // 1. Vérifier l'utilisateur
        const user = await prisma.user.findUnique({
            where: { externalId: userId },
        });

        if (!user) {
            return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
        }

        // 2. Supprimer (Sécurité : on vérifie le userId)
        const result = await prisma.presentation.deleteMany({
            where: {
                id: presentationId,
                userId: user.id,
            },
        });

        if (result.count === 0) {
            return NextResponse.json({ error: 'Introuvable ou non autorisé' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Erreur DELETE:", error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}