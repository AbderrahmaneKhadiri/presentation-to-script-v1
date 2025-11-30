import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
    }

    // 1. On s'assure que l'utilisateur existe dans notre base de données locale
    // On utilise l'upsert pour créer ou mettre à jour l'utilisateur
    const dbUser = await prisma.user.upsert({
      where: { externalId: userId },
      update: {
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`.trim(),
      },
      create: {
        externalId: userId,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`.trim(),
      },
    });

    const { fileName, slides } = await req.json();

    if (!fileName || !slides || !Array.isArray(slides)) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
    }

    // Calcul du hash pour la déduplication (basé sur le contenu des slides)
    const contentToHash = JSON.stringify(slides);
    const fileHash = crypto.createHash('md5').update(contentToHash).digest('hex');

    // Vérification si une présentation identique existe déjà pour cet utilisateur
    // IMPORTANT : On utilise dbUser.id (notre ID interne) et non userId (ID Clerk)
    const existingPresentation = await prisma.presentation.findFirst({
      where: {
        userId: dbUser.id,
        fileHash: fileHash,
      },
    });

    if (existingPresentation) {
      return NextResponse.json({ presentationId: existingPresentation.id });
    }

    const newPresentation = await prisma.presentation.create({
      data: {
        fileName: fileName,
        fileHash: fileHash,
        userId: dbUser.id, // On lie à l'ID interne de l'utilisateur
        slides: {
          create: slides,
        },
      },
    });

    return NextResponse.json({ presentationId: newPresentation.id });

  } catch (error) {
    console.error("Erreur lors de la création de la présentation:", error);
    return NextResponse.json({ error: 'Une erreur est survenue.' }, { status: 500 });
  }
}