"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";
import { Step1Upload } from '../components/generate/Step1Upload';
import { Step2Config } from '../components/generate/Step2Config';
import { Step3Loading } from '../components/generate/Step3Loading';
import { Sidebar } from '../components/Sidebar';

export type ScriptConfig = {
  style: 'simple' | 'normal' | 'pro';
  length: 'court' | 'moyen' | 'long';
};

export default function GeneratePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [step, setStep] = useState(1);
  const [presentationId, setPresentationId] = useState<string | null>(null);
  const [config, setConfig] = useState<ScriptConfig>({ style: 'normal', length: 'moyen' });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  const isLandscape = (width: number, height: number) => {
    return width > height;
  };

  const processPdfBuffer = async (pdfBuffer: ArrayBuffer) => {
    // Import dynamique de pdfjs-dist pour éviter l'erreur DOMMatrix côté serveur
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const extractedSlides: { slideNumber: number; extractedText: string; imageUrl?: string }[] = [];
    const pdfDoc = await pdfjsLib.getDocument(new Uint8Array(pdfBuffer)).promise;
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewportCheck = page.getViewport({ scale: 1 });
      if (!isLandscape(viewportCheck.width, viewportCheck.height)) {
        continue;
      }
      const textContent = await page.getTextContent();
      const extractedText = textContent.items.map((item: any) => item.str).join(' ');
      const viewportRender = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      canvas.height = viewportRender.height;
      canvas.width = viewportRender.width;
      await page.render({ canvas: canvas, viewport: viewportRender }).promise;
      const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
      extractedSlides.push({ slideNumber: i, extractedText: extractedText.trim(), imageUrl: imageUrl });
    }
    return extractedSlides;
  };

  const handleFileAccepted = async (acceptedFile: File) => {
    if (!acceptedFile) return;
    setIsLoading(true);
    setError(null);
    let finalPdfBuffer: ArrayBuffer;
    try {
      if (acceptedFile.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        const convertFormData = new FormData();
        convertFormData.append('file', acceptedFile);
        const convertResponse = await fetch('/api/convert', { method: 'POST', body: convertFormData });
        if (!convertResponse.ok) {
          const errorData = await convertResponse.json();
          throw new Error(errorData.error || "La conversion a échoué.");
        }
        finalPdfBuffer = await convertResponse.arrayBuffer();
      } else if (acceptedFile.type === 'application/pdf') {
        finalPdfBuffer = await acceptedFile.arrayBuffer();
      } else {
        throw new Error("Format de fichier non supporté.");
      }
      const extractedSlides = await processPdfBuffer(finalPdfBuffer);
      if (extractedSlides.length === 0) {
        throw new Error("Aucune slide au format paysage n'a été trouvée dans ce document.");
      }

      // --- LIMITATION DU NOMBRE DE SLIDES ---
      // @ts-ignore - Clerk types might not be fully updated locally
      const isPremium = user?.publicMetadata?.plan === 'premium';
      const slideLimit = isPremium ? 50 : 15;

      if (extractedSlides.length > slideLimit) {
        throw new Error(`Votre plan actuel est limité à ${slideLimit} slides. ${!isPremium ? "Passez à la version Premium pour aller jusqu'à 50." : "Veuillez réduire votre présentation."}`);
      }
      // --------------------------------------

      const response = await fetch('/api/create-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: acceptedFile.name.replace(/\.pptx?$/, '.pdf'), slides: extractedSlides }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de la sauvegarde.');
      setPresentationId(data.presentationId);
      setStep(2);
    } catch (e: any) {
      setError(e.message || "Une erreur est survenue.");
      // On s'assure de revenir à l'étape 1 en cas d'erreur
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigSubmit = async () => {
    if (!presentationId) return;
    setStep(3);
    setError(null); // On réinitialise les erreurs avant de commencer
    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presentationId, config }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la génération du script');
      }
      router.push(`/script-of-the-presentation/${presentationId}`);
    } catch (error: any) {
      console.error(error);
      setError(error.message);
      setStep(2);
    }
  };

  const acceptedFileTypes = {
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'application/pdf': ['.pdf'],
  };

  if (!isLoaded || !isSignedIn) {
    return null; // Ou un loader
  }

  return (
    <div className="flex h-screen w-full bg-emerald-950 overflow-hidden">
      <Sidebar />

      <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto p-4 relative z-10 flex flex-col items-center justify-center h-full">

          {/* Header - Affiché uniquement à l'étape 1 */}
          {step === 1 && (
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Générez votre <span className="text-emerald-400">Script</span>
              </h1>
              <p className="text-emerald-100/60 text-lg max-w-2xl mx-auto">
                Transformez vos slides en un discours percutant en quelques secondes.
              </p>
            </div>
          )}

          {/* Affichage global de l'erreur */}
          {error && (
            <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8 text-center backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
              <p className="font-semibold flex items-center justify-center gap-2">
                ⚠️ Une erreur est survenue
              </p>
              <p className="text-sm opacity-90 mt-1">{error}</p>
            </div>
          )}

          {step === 1 && (
            <Step1Upload
              onFileAccepted={handleFileAccepted}
              accept={acceptedFileTypes}
            />
          )}
          {step === 2 && (
            <Step2Config
              config={config}
              setConfig={setConfig}
              onSubmit={handleConfigSubmit}
            />
          )}
          {step === 3 && <Step3Loading />}
        </div>
      </main>
    </div>
  );
}