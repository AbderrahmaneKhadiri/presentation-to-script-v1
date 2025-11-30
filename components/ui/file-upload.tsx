"use client";
import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
 
const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 20, y: -20, opacity: 0.9 },
};
 
const secondaryVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};
 
export const FileUpload = ({
  onChange,
  accept,
}: {
  onChange: (files: File[]) => void;
  accept?: Record<string, string[]>;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
 
  const handleFileChange = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFile(newFiles[0]);
      onChange(newFiles);
    }
  };
 
  const handleClick = () => fileInputRef.current?.click();
 
  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    accept: accept,
  });
 
  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept={accept ? Object.values(accept).flat().join(',') : undefined}
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-sans font-bold text-neutral-200 text-lg">
            Déposez votre présentation
          </p>
          
          {/* ✅ LA CORRECTION EST ICI */}
          <p className="relative z-20 font-sans font-normal text-neutral-400 text-base mt-2">
         Glissez-déposez ou <span className="text-black font-semibold">cliquez ici</span> pour choisir un fichier
               </p>
          
          <div className="relative w-full mt-10 max-w-xl mx-auto"> ou cliq
            {file && (
              <motion.div
                layoutId={"file-upload"}
                className={cn(
                  "relative overflow-hidden z-40 bg-emerald-950 flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md",
                  "shadow-sm"
                )}
              >
                <div className="flex justify-between w-full items-center gap-4">
                  <motion.p
                    layout
                    className="text-base text-neutral-200 truncate max-w-xs"
                  >
                    {file.name}
                  </motion.p>
                  <motion.p
                    layout
                    className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm bg-emerald-800 text-white shadow-input"
                  >
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </motion.p>
                </div>
              </motion.div>
            )}
            {!file && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-emerald-950 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                {isDragActive ? (
                  <motion.p className="text-neutral-300 flex flex-col items-center">
                    Déposer !
                  </motion.p>
                ) : (
                  <IconUpload className="h-8 w-8 text-neutral-400" />
                )}
              </motion.div>
            )}
            {!file && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-emerald-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
 
export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-emerald-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-emerald-950"
                  : "bg-emerald-900 shadow-[0px_0px_1px_3px_rgba(0,0,0,0.5)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}