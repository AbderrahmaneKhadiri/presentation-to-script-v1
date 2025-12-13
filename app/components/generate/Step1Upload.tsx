"use client";

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  onFileAccepted: (file: File) => void;
  accept: Record<string, string[]>;
};

export function Step1Upload({ onFileAccepted, accept }: Props) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-emerald-950/30 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl shadow-emerald-900/50">

        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
            <span className="font-mono font-bold">1</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Déposez votre présentation</h2>
          <p className="text-emerald-100/60 mt-2">Nous supportons les fichiers PowerPoint (.pptx) et PDF.</p>
        </div>

        <div
          {...getRootProps()}
          className={cn(
            "relative group rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden",
            isDragActive
              ? "bg-emerald-500/10 scale-[1.02]"
              : "bg-transparent hover:bg-emerald-500/5 hover:scale-[1.01]"
          )}
        >
          <input {...getInputProps()} />

          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl" />

          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className={cn(
              "p-4 rounded-full bg-emerald-500/10 transition-transform duration-300 group-hover:scale-110 group-hover:bg-emerald-500/20",
              isDragActive && "bg-emerald-500/20 scale-110"
            )}>
              <UploadCloud className={cn(
                "h-10 w-10 transition-colors duration-300",
                isDragActive ? "text-emerald-300" : "text-emerald-400 group-hover:text-emerald-300"
              )} />
            </div>

            {isDragActive ? (
              <p className="text-lg font-medium text-emerald-200">Relâchez pour déposer !</p>
            ) : (
              <div className="space-y-1">
                <p className="text-lg font-medium text-white group-hover:text-emerald-100 transition-colors">
                  Glissez-déposez votre fichier ici
                </p>
                <p className="text-sm text-emerald-100/40">
                  ou cliquez pour parcourir
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}