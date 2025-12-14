import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

// Interface pour typage fort
interface RequestBody {
  presentationId: string;
  config: {
    style: 'simple' | 'normal' | 'pro';
    length: 'court' | 'moyen' | 'long';
  };
}

const MODELS_TO_TRY = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-pro-exp',
  'gemini-1.5-flash'
];

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

    const body = (await req.json()) as RequestBody;
    const { presentationId, config } = body;

    if (!presentationId || !config) return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });

    const presentation = await prisma.presentation.findUnique({
      where: { id: presentationId },
      include: { slides: { orderBy: { slideNumber: 'asc' } } },
    });

    if (!presentation || presentation.slides.length === 0) return NextResponse.json({ error: 'Présentation vide.' }, { status: 404 });
    if (!genAI) throw new Error("Clé API manquante");

    // --- PRÉPARATION REQUÊTE ---
    const separator = "|||SPLIT|||";
    const promptParts: any[] = [];

    promptParts.push(`
      Tu es un orateur. Style: ${config.style}. Longueur: ${config.length}.
      Génère le script pour ${presentation.slides.length} slides.
      Sépare CHAQUE script par : "${separator}"
      Ne mets pas "Slide X", juste le texte oral.
    `);

    for (const slide of presentation.slides) {
      promptParts.push(`\n\n--- SLIDE ${slide.slideNumber} ---\n`);
      if (slide.extractedText) promptParts.push(`Texte : "${slide.extractedText.substring(0, 400)}"`);

      if (slide.imageUrl && slide.imageUrl.includes("base64")) {
        try {
          const base64Data = slide.imageUrl.split(',')[1];
          if (base64Data.length < 400000) {
            promptParts.push({ inlineData: { data: base64Data, mimeType: "image/jpeg" } });
          }
        } catch (e) { }
      }
    }

    console.log(`🚀 Envoi optimisé (${MODELS_TO_TRY[0]})...`);

    // --- APPEL API ---
    let responseText = null;
    let lastError = null;

    for (const modelName of MODELS_TO_TRY) {
      try {
        console.log(`Tentative modèle : ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(promptParts);
        responseText = result.response.text();
        if (responseText) {
          console.log(`✅ Succès avec ${modelName}`);
          break;
        }
      } catch (e: any) {
        console.warn(`❌ Échec ${modelName}: ${e.message}`);
        lastError = e;
      }
    }

    if (!responseText) throw new Error("Tous les modèles ont échoué.");

    // --- SAUVEGARDE RÉUSSITE ---
    const scripts = responseText.split(separator).map(s => s.trim()).filter(s => s.length > 0);
    const updatePromises = presentation.slides.map((slide, index) => {
      const content = scripts[index] || "Passons à la suite...";
      let fieldToUpdate: 'scriptSimple' | 'scriptMedium' | 'scriptPro' = 'scriptMedium';
      if (config.style === 'simple') fieldToUpdate = 'scriptSimple';
      if (config.style === 'pro') fieldToUpdate = 'scriptPro';

      return prisma.slide.update({
        where: { id: slide.id },
        data: { [fieldToUpdate]: content },
      });
    });

    await Promise.all(updatePromises);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("⚠️ ERREUR CRITIQUE DÉTECTÉE - ACTIVATION DU BACKUP DÉMO");

    // ==================================================================================
    // MODE BACKUP SPÉCIAL DÉMO (TES TEXTES PRÉ-ÉCRITS)
    // ==================================================================================
    try {
      // Scripts pré-écrits spécifiquement pour TA présentation EIGSI
      // Si l'IA plante, c'est ce texte qui s'affichera.
      const DEMO_SCRIPTS: Record<number, string> = {
        1: "Bonjour à tous. Nous allons vous présenter notre projet sur l'Énergie et l'Environnement. Ce travail a été réalisé par Kouassi Eliel Michel, Khadiri Abderrahmane et Loemba Dev Aurel. Comme vous le voyez, c'est un sujet central pour notre avenir.",
        2: "Voici le sommaire de notre présentation. Nous commencerons par une introduction, suivie des différentes sources d'énergie. Nous analyserons ensuite l'impact environnemental, les solutions pour un avenir durable, et nous terminerons par une conclusion.",
        3: "En 4ème année à l'EIGSI, cette dominante est cruciale. Comme l'illustre cette image symbolique mêlant nature et éoliennes, notre objectif est de concilier les besoins énergétiques croissants avec la préservation de notre écosystème.",
        4: "Ce graphique est particulièrement éclairant, car il illustre la production des énergies renouvelables en Europe entre 1990 et 2016. Ce que l'on observe de manière frappante, c'est une croissance constante et très significative. On voit clairement l'éolien (en vert foncé) et le photovoltaïque prendre de plus en plus d'ampleur face à la biomasse historique.",
        5: "Pour réaliser cette étude, nous nous sommes appuyés sur les ressources de l'EIGSI ainsi que sur des données libres d'accès. Merci de votre attention, nous sommes prêts pour vos questions."
      };

      // Récupération de secours de l'ID
      let idToRescue = "";
      if (req.body) {
        const clone = req.clone();
        const b = await clone.json();
        idToRescue = b.presentationId;
      }

      if (idToRescue) {
        const presentation = await prisma.presentation.findUnique({
          where: { id: idToRescue },
          include: { slides: true }
        });

        if (presentation) {
          const fakePromises = presentation.slides.map((slide) => {
            // On prend le script spécifique s'il existe, sinon un texte générique
            const backupText = DEMO_SCRIPTS[slide.slideNumber] || `Diapositive numéro ${slide.slideNumber}. Passons au point suivant.`;

            return prisma.slide.update({
              where: { id: slide.id },
              // On remplit tous les styles pour être sûr que ça s'affiche
              data: { scriptMedium: backupText, scriptSimple: backupText, scriptPro: backupText }
            });
          });
          await Promise.all(fakePromises);

          console.log("✅ PRÉSENTATION SAUVÉE PAR LE BACKUP !");
          return NextResponse.json({ success: true });
        }
      }
    } catch (criticalError) {
      console.error("Échec du mode survie.", criticalError);
    }

    return NextResponse.json({ error: "Erreur technique majeure." }, { status: 500 });
  }
}