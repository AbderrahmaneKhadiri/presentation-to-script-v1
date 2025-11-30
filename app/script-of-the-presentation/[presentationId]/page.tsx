import { ScriptViewer } from '@/app/components/viewer/ScriptViewer';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

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
    <div>
      <ScriptViewer presentation={presentation} />
    </div>
  );
}