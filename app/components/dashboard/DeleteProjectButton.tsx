"use client";

import { useState } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type Props = {
    presentationId: string;
    presentationName: string;
};

export function DeleteProjectButton({ presentationId, presentationName }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const router = useRouter();

    const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        setIsConfirmOpen(true);
    };

    const confirmDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (isDeleting) return;

        const toastId = toast.loading("Suppression en cours...");
        setIsDeleting(true);
        setIsConfirmOpen(false); // Close dialog immediately

        try {
            const response = await fetch(`/api/presentation/${presentationId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Erreur lors de la suppression");
            }

            toast.success("Projet supprimé", {
                id: toastId,
                description: `Le projet "${presentationName}" a été effacé.`,
                duration: 4000,
                icon: <Trash2 className="w-4 h-4" />
            });

            setTimeout(() => {
                router.refresh();
            }, 100);

        } catch (error) {
            console.error("Erreur delete:", error);
            toast.error("Erreur", {
                id: toastId,
                description: "Impossible de supprimer le projet.",
            });
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className={cn(
                    "h-8 w-8 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-colors z-20 rounded-lg bg-emerald-950/50 backdrop-blur-sm border border-transparent hover:border-red-500/20",
                    isDeleting && "cursor-not-allowed opacity-50"
                )}
                title="Supprimer le projet"
            >
                {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                ) : (
                    <Trash2 className="h-4 w-4" />
                )}
                <span className="sr-only">Supprimer</span>
            </Button>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="bg-emerald-950 border-emerald-500/20 text-white sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                            Supprimer le projet ?
                        </DialogTitle>
                        <DialogDescription className="text-emerald-100/70 pt-2">
                            Êtes-vous sûr de vouloir supprimer définitivement <span className="font-bold text-white">"{presentationName}"</span> ?
                            <br /><br />
                            Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 pt-4">
                        <Button
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsConfirmOpen(false);
                            }}
                            className="text-emerald-200 hover:text-white hover:bg-emerald-500/10"
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            className="bg-red-500 hover:bg-red-600 text-white border-none"
                        >
                            Supprimer définitivement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}