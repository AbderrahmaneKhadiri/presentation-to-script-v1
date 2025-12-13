import { ScriptViewer } from '@/app/components/viewer/ScriptViewer';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/app/components/Sidebar';

// Correction Next.js 15 : params est une Promise
type PageProps = {
  params: Promise<{
    presentationId: string;
  }>;
};

export default async function ScriptPage(props: PageProps) {
  // ÉTAPE CRUCIALE : On attend que les paramètres soient chargés
  const params = await props.params;
  const { presentationId } = params;

  const presentation = await prisma.presentation.findUnique({
    where: {
      id: presentationId,
    },
    include: {
      slides: {
        orderBy: {
          slideNumber: 'asc',
        },
      },
    },
  });

  if (!presentation) {
    notFound();
  }

  return (
    <div className="flex h-screen w-full bg-emerald-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 relative flex flex-col overflow-y-auto custom-scrollbar">
        <ScriptViewer presentation={presentation} />
      </main>
    </div>
  );
}