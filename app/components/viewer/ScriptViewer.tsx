"use client";

import { useState, useEffect, useRef } from 'react';
import type { Presentation, Slide } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, ArrowRight, Play, Pause, Pencil,
  Type, Copy, Bold, Underline, Italic,
  ChevronUp, ChevronDown, LayoutDashboard, Clock,
  MousePointer2, Eye, Mic, X, Maximize2, Minimize2, Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation'; // IMPORT AJOUTÉ

type FullPresentation = Presentation & {
  slides: Slide[];
};

type Props = {
  presentation: FullPresentation;
};

export function ScriptViewer({ presentation }: Props) {
  const router = useRouter(); // HOOK ROUTER

  // --- ETATS GENERAUX ---
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  // On utilise l'état local pour l'affichage immédiat, mais on sauvegarde aussi en DB
  const [editableScripts, setEditableScripts] = useState<Record<string, string>>({});

  // Modales
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // NOUVEL ÉTAT DE CHARGEMENT
  const [currentEditingText, setCurrentEditingText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Timer & Prompteur
  const [isTimerSettingsOpen, setIsTimerSettingsOpen] = useState(false);
  const [tempDuration, setTempDuration] = useState(5);
  const [editorFontSize, setEditorFontSize] = useState<'text-base' | 'text-lg' | 'text-xl' | 'text-2xl'>('text-lg');
  const scriptContainerRef = useRef<HTMLDivElement>(null);
  const [isPrompterActive, setIsPrompterActive] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(0.5);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer State
  const [duration, setDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Presentation Mode
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const slideImageRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- STYLE UNIFIÉ STRICT ---
  const commonEditorStyles = cn(
    "absolute inset-0 w-full h-full p-8 m-0",
    "font-mono text-lg leading-relaxed",
    "whitespace-pre-wrap break-words",
    "outline-none resize-none border-none",
    "overflow-y-scroll"
  );

  // --- LOGIQUE METIER ---

  const currentSlide = presentation.slides[currentSlideIndex];
  // On priorise le script édité localement, sinon celui de la DB
  const originalScript = currentSlide.scriptPro || currentSlide.scriptMedium || currentSlide.scriptSimple || "Aucun script généré.";
  const displayScript = editableScripts[currentSlide.id] ?? originalScript;

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const insertTag = (prefix: string, suffix: string = "") => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = currentEditingText;
      const before = text.substring(0, start);
      const selection = text.substring(start, end);
      const after = text.substring(end);

      const newText = before + prefix + selection + suffix + after;
      setCurrentEditingText(newText);

      setTimeout(() => {
        textareaRef.current?.focus();
        const newCursorPos = start + prefix.length + selection.length + (selection ? suffix.length : 0);
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  // --- NOUVELLE FONCTION DE SAUVEGARDE EN BASE DE DONNÉES ---
  const handleEditSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      // 1. Mise à jour de l'état local pour fluidité immédiate
      setEditableScripts(prev => ({ ...prev, [currentSlide.id]: currentEditingText }));

      // 2. Appel API pour sauvegarder en base de données
      const response = await fetch('/api/update-slide', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideId: currentSlide.id,
          newScript: currentEditingText
        })
      });

      if (!response.ok) throw new Error("Erreur serveur");

      toast.success("Script sauvegardé");
      setIsEditDialogOpen(false);

      // 3. Rafraîchir les données serveur (Next.js server components)
      router.refresh();

    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  // Logique Prompteur
  useEffect(() => {
    if (isPrompterActive) {
      scrollIntervalRef.current = setInterval(() => {
        const activeRef = scriptContainerRef.current;
        if (activeRef) {
          if (activeRef.scrollTop + activeRef.clientHeight >= activeRef.scrollHeight - 1) {
            setIsPrompterActive(false);
            setIsRunning(false); // Stop timer when prompter finishes
          } else {
            activeRef.scrollTop += scrollSpeed;
          }
        }
      }, 20);
    } else {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    }
    return () => { if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current); };
  }, [isPrompterActive, scrollSpeed]);

  const togglePrompter = () => {
    const newState = !isPrompterActive;
    setIsPrompterActive(newState);
    if (newState) {
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };
  const increaseSpeed = () => setScrollSpeed(prev => Math.min(prev + 0.5, 5));
  const decreaseSpeed = () => setScrollSpeed(prev => Math.max(prev - 0.5, 0.5));

  // Logique Timer
  useEffect(() => { setTimeLeft(duration * 60); setIsRunning(false); }, [duration]);
  useEffect(() => {
    if (isRunning && timeLeft > 0 && countdown === null) {
      timerRef.current = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft <= 0 && isRunning) {
      setIsRunning(false); setTimeLeft(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, timeLeft, countdown]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c ? c - 1 : null), 1000);
      return () => clearTimeout(t);
    }
    if (countdown === 0) {
      setCountdown(null);
      setIsRunning(true);
      setIsPresentationMode(true);
      setIsPrompterActive(true);
    }
  }, [countdown]);

  // Fullscreen Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const goToPrevious = () => {
    setIsPrompterActive(false);
    if (scriptContainerRef.current) scriptContainerRef.current.scrollTop = 0;
    setCurrentSlideIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setIsPrompterActive(false);
    if (scriptContainerRef.current) scriptContainerRef.current.scrollTop = 0;
    setCurrentSlideIndex(prev => Math.min(presentation.slides.length - 1, prev + 1));
  };

  // Navigation Clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditDialogOpen || isTimerSettingsOpen) return;
      if (e.key === 'ArrowLeft') goToPrevious();
      else if (e.key === 'ArrowRight') goToNext();
      else if (e.key === ' ') { e.preventDefault(); togglePrompter(); }
      else if (e.key === 'Escape' && isPresentationMode) {
        setIsPresentationMode(false);
        setIsPrompterActive(false);
        setIsRunning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, isEditDialogOpen, isTimerSettingsOpen, presentation.slides.length, isPrompterActive, isPresentationMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startPresentation = () => {
    if (isRunning) {
      setIsRunning(false);
      setIsPrompterActive(false);
    } else {
      if (timeLeft <= 0) setTimeLeft(duration * 60);
      setCountdown(3);
    }
  };

  const handleSaveTimer = () => {
    if (tempDuration > 0) {
      setDuration(tempDuration);
      setTimeLeft(tempDuration * 60);
      setIsTimerSettingsOpen(false);
      setIsRunning(false);
    }
  };

  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      slideImageRef.current?.requestFullscreen().catch(err => {
        console.error(`Erreur plein écran: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleEditOpen = () => {
    setCurrentEditingText(displayScript);
    setIsEditDialogOpen(true);
    setIsPrompterActive(false);
  };

  const cycleFontSize = () => {
    setEditorFontSize(prev =>
      prev === 'text-base' ? 'text-lg' : prev === 'text-lg' ? 'text-xl' : prev === 'text-xl' ? 'text-2xl' : 'text-base'
    );
  };

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentEditingText);
      toast.success("Copié dans le presse-papier");
    }
  };

  // --- RENDU LECTEUR ---
  const renderReaderScript = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => (
      <div key={i} className="min-h-[1.5em] whitespace-pre-wrap mb-2">
        {line.split(/(\*\*.*?\*\*|<u>.*?<\/u>|_.*?_|\[.*?\])/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**'))
            return <span key={j} className="font-bold text-emerald-400">{part.slice(2, -2)}</span>;
          if (part.startsWith('<u>') && part.endsWith('</u>'))
            return <span key={j} className="underline decoration-emerald-500 underline-offset-4 decoration-2">{part.slice(3, -4)}</span>;
          if (part.startsWith('_') && part.endsWith('_'))
            return <span key={j} className="italic text-emerald-100/60">{part.slice(1, -1)}</span>;
          if (part.startsWith('[') && part.endsWith(']'))
            return <span key={j} className="inline-block text-xs font-bold text-emerald-600/50 uppercase border border-emerald-600/20 px-1.5 py-0.5 rounded mx-1 align-middle">{part.slice(1, -1)}</span>;
          return part;
        })}
      </div>
    ));
  };

  // --- RENDU ÉDITEUR ---
  const renderEditorScript = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => (
      <div key={i} className="min-h-[1.5em] whitespace-pre-wrap">
        {line === "" ? (
          <br />
        ) : (
          line.split(/(\*\*.*?\*\*|<u>.*?<\/u>|_.*?_|\[.*?\])/g).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <span key={j}>
                  <span className="text-emerald-600/50">**</span>
                  <span className="font-bold text-emerald-400">{part.slice(2, -2)}</span>
                  <span className="text-emerald-600/50">**</span>
                </span>
              );
            }
            if (part.startsWith('<u>') && part.endsWith('</u>')) {
              return (
                <span key={j}>
                  <span className="text-emerald-600/50">&lt;u&gt;</span>
                  <span className="underline decoration-emerald-500 underline-offset-4 decoration-2 text-white">{part.slice(3, -4)}</span>
                  <span className="text-emerald-600/50">&lt;/u&gt;</span>
                </span>
              );
            }
            if (part.startsWith('_') && part.endsWith('_')) {
              return (
                <span key={j}>
                  <span className="text-emerald-600/50">_</span>
                  <span className="italic text-emerald-200/70">{part.slice(1, -1)}</span>
                  <span className="text-emerald-600/50">_</span>
                </span>
              );
            }
            if (part.startsWith('[') && part.endsWith(']')) {
              return <span key={j} className="text-emerald-300 font-bold">{part}</span>;
            }
            return <span key={j}>{part}</span>;
          })
        )}
      </div>
    ));
  };

  const wordCount = currentEditingText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = currentEditingText.length;
  const readingTime = Math.ceil(wordCount / 130);

  return (
    <div className="h-full w-full">
      <style jsx global>{`
          .custom-scrollbar-dark::-webkit-scrollbar { width: 8px; height: 8px; }
          .custom-scrollbar-dark::-webkit-scrollbar-track { background: #022c22; }
          .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: #065f46; border-radius: 4px; }
          .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: #10b981; }
          
          .scrollbar-stable {
            scrollbar-gutter: stable;
          }
        `}</style>

      {/* --- OVERLAY COMPTE À REBOURS --- */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(16,185,129,0.8)]"
            >
              {countdown > 0 ? countdown : "GO!"}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isPresentationMode ? (
        <div className="fixed inset-0 z-50 bg-black flex flex-row h-screen w-screen overflow-hidden">
          {/* PARTIE GAUCHE : SLIDE */}
          <div className="flex-1 relative bg-black flex items-center justify-center p-4">

            {/* Header Slide AVEC TIMER */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 bg-gradient-to-b from-black/90 to-transparent">

              <div className="flex items-center gap-4">
                {/* Compteur de Slides */}
                <div className="bg-emerald-950/60 backdrop-blur-md border border-emerald-500/20 px-4 py-2.5 rounded-xl flex items-center">
                  <span className="text-emerald-400 font-bold mr-2 text-sm tracking-wide">SLIDE {currentSlide.slideNumber}</span>
                  <span className="text-white/40 text-sm">/ {presentation.slides.length}</span>
                </div>

                {/* Chronomètre Synchronisé */}
                <div className={cn(
                  "flex items-center gap-3 bg-emerald-950/60 backdrop-blur-md border px-4 py-2.5 rounded-xl transition-all duration-300",
                  isRunning
                    ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-emerald-950/80"
                    : "border-red-500/30 bg-red-950/20"
                )}>
                  <Clock className={cn(
                    "w-4 h-4 transition-colors",
                    isRunning ? "text-emerald-400 animate-pulse" : "text-red-400"
                  )} />
                  <span className={cn(
                    "font-mono font-bold text-lg min-w-[70px] text-center tracking-widest",
                    isRunning ? "text-white" : "text-red-200/80"
                  )}>
                    {formatTime(timeLeft)}
                  </span>
                  {!isRunning && (
                    <span className="text-[10px] uppercase font-bold text-red-400 ml-1 tracking-wider">Pause</span>
                  )}
                </div>
              </div>

              {/* Bouton Fermer */}
              <div className="flex gap-2 items-center">
                <Button variant="ghost" size="icon" onClick={() => { setIsPresentationMode(false); setIsRunning(false); setIsPrompterActive(false); }} className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 transition-colors mr-2">
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {currentSlide.imageUrl ? (
              <div className="relative w-full h-full max-h-[90vh]">
                <Image src={currentSlide.imageUrl} alt={`Slide ${currentSlide.slideNumber}`} fill className="object-contain" priority />
              </div>
            ) : (
              <div className="max-w-3xl text-center">
                <h2 className="text-4xl font-bold mb-8 text-white">{currentSlide.extractedText?.slice(0, 50)}...</h2>
                <p className="text-xl text-neutral-400 leading-relaxed">{currentSlide.extractedText}</p>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-t from-black/90 to-transparent">
              <Button variant="outline" onClick={goToPrevious} disabled={currentSlideIndex === 0} className="bg-emerald-950/30 border-emerald-500/20 text-white hover:bg-emerald-900/50 h-12 px-6 rounded-xl backdrop-blur-sm">
                <ArrowLeft className="w-5 h-5 mr-2" /> Précédent
              </Button>

              <Button variant="outline" onClick={goToNext} disabled={currentSlideIndex === presentation.slides.length - 1} className="bg-emerald-500 text-white border-none hover:bg-emerald-400 h-12 px-6 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                Suivant <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* PARTIE DROITE : SCRIPT / PROMPTEUR */}
          <div className="w-[450px] xl:w-[550px] bg-[#022c22] border-l border-emerald-500/10 flex flex-col relative shadow-2xl z-20">
            {/* Prompter Header */}
            <div className="p-6 border-b border-emerald-500/10 bg-[#022c22] z-10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-emerald-100 tracking-wider">PROMPTEUR</h3>
              </div>
              <div className="flex items-center gap-2 bg-black/20 rounded-lg p-1">
                <Button size="icon" variant="ghost" onClick={decreaseSpeed} className="h-8 w-8 text-emerald-400 hover:text-white"><ChevronDown className="w-4 h-4" /></Button>
                <span className="text-xs font-mono font-bold text-emerald-500 w-12 text-center">{scrollSpeed.toFixed(1)}x</span>
                <Button size="icon" variant="ghost" onClick={increaseSpeed} className="h-8 w-8 text-emerald-400 hover:text-white"><ChevronUp className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* Script Content */}
            <div className="flex-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#022c22] to-transparent z-10 pointer-events-none" />

              <div ref={scriptContainerRef} className={cn("absolute inset-0 p-8 overflow-y-auto custom-scrollbar scroll-smooth", editorFontSize)}>
                <div className="prose prose-invert max-w-none pb-[50vh] pt-[10vh]">
                  {renderReaderScript(displayScript)}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#022c22] to-transparent z-10 pointer-events-none" />
            </div>

            {/* Prompter Controls */}
            <div className="p-6 border-t border-emerald-500/10 bg-[#022c22] z-10">
              <Button onClick={togglePrompter} className={cn("w-full h-14 text-lg font-bold tracking-wide rounded-xl transition-all shadow-lg", isPrompterActive ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20" : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]")}>
                {isPrompterActive ? <><Pause className="w-5 h-5 mr-3 fill-current" /> PAUSE</> : <><Play className="w-5 h-5 mr-3 fill-current" /> LECTURE</>}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // --- RENDU STANDARD ---
        <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 w-full gap-6 relative max-w-[1600px] mx-auto">
          {/* HEADER */}
          <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Link href="/dashboard" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-950/50 px-4 py-2 rounded-xl border border-emerald-500/20">
                <LayoutDashboard className="w-4 h-4" /><span className="font-medium">Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-emerald-500/20 hidden md:block" />
              <h1 className="text-white font-bold truncate max-w-[200px] md:max-w-md">{presentation.fileName}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-emerald-950/30 p-1.5 rounded-xl border border-emerald-500/10 shadow-lg">
                <button onClick={() => { setTempDuration(duration); setIsTimerSettingsOpen(true); }} className="flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-black/60 rounded-lg text-emerald-100 font-mono text-sm border border-white/5 hover:border-emerald-500/50 transition-all duration-200">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold tracking-wider">{formatTime(timeLeft)}</span>
                </button>
              </div>

              <Button
                onClick={startPresentation}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Présenter
              </Button>
            </div>
          </header>

          {/* CONTENU PRINCIPAL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

            {/* SLIDE VISUALISATION */}
            <div className="lg:col-span-7 flex flex-col gap-4 min-h-0">
              <div className="flex items-center justify-between px-2">
                <div className="text-sm font-medium text-emerald-100/60">Slide <span className="text-white font-bold text-lg">{currentSlide.slideNumber}</span> <span className="opacity-50">/ {presentation.slides.length}</span></div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={goToPrevious} disabled={currentSlideIndex === 0} className="bg-emerald-950/50 border-emerald-500/20 text-emerald-100 hover:bg-emerald-900 disabled:opacity-30"><ArrowLeft className="w-4 h-4 mr-2" /> Précédent</Button>
                  <Button variant="outline" size="sm" onClick={goToNext} disabled={currentSlideIndex === presentation.slides.length - 1} className="bg-emerald-950/50 border-emerald-500/20 text-emerald-100 hover:bg-emerald-900 disabled:opacity-30">Suivant <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
              </div>

              <div ref={slideImageRef} className="relative group flex-1 min-h-[300px] lg:min-h-0 bg-black/40 rounded-2xl border border-emerald-500/20 overflow-hidden shadow-2xl">
                {currentSlide.imageUrl ? (
                  <>
                    <Image src={currentSlide.imageUrl} alt={`Slide ${currentSlide.slideNumber}`} fill className="object-contain" priority />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button variant="secondary" size="icon" onClick={toggleNativeFullscreen} className="bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm border border-white/10" title="Plein écran">
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-10 text-center"><h3 className="font-bold text-2xl mb-4 text-white">Slide {currentSlide.slideNumber}</h3><p className="text-base opacity-70 line-clamp-6 text-neutral-300">{currentSlide.extractedText}</p></div>
                )}
              </div>
            </div>

            {/* TELEPROMPTEUR / LECTEUR */}
            <div className="lg:col-span-5 flex flex-col min-h-0">
              <Card className="bg-emerald-950/40 border-emerald-500/20 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden flex flex-col h-full ring-1 ring-white/5 group">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-xl z-20 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
                    <h2 className="font-bold text-lg text-white tracking-wide">Script</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={cycleFontSize} className="text-emerald-300/70 hover:text-emerald-300 hover:bg-emerald-500/10"><Type className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={handleEditOpen} className="text-emerald-300 hover:text-emerald-100 hover:bg-emerald-500/20 h-8 px-3 text-xs uppercase font-bold tracking-wider border border-emerald-500/30 rounded-lg bg-emerald-500/10"><Pencil className="h-3 w-3 mr-2" /> Éditer</Button>
                  </div>
                </div>

                <div className="relative flex-grow overflow-hidden min-h-0">
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-emerald-950/80 to-transparent z-10 pointer-events-none" />
                  <div className={cn("absolute inset-0 p-6 md:p-8 overflow-y-auto custom-scrollbar scroll-smooth", editorFontSize)}>
                    <div className="prose prose-invert max-w-none pb-32">
                      {renderReaderScript(displayScript)}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-emerald-950 to-transparent z-10 pointer-events-none" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALE ÉDITEUR --- */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent showCloseButton={false} className="w-[90vw] sm:max-w-[90vw] max-w-7xl h-[85vh] p-0 gap-0 overflow-hidden bg-[#022c22] border border-[#064e3b] text-white shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#064e3b] bg-[#022c22]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#064e3b] text-emerald-400"><Pencil className="h-5 w-5" /></div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">Édition du script</DialogTitle>
                <div className="flex items-center gap-3 text-xs text-emerald-400/60 mt-0.5">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Slide {currentSlide.slideNumber}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{readingTime} min</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={copyToClipboard} variant="ghost" size="sm" className="text-emerald-400 hover:text-white hover:bg-[#064e3b]"><Copy className="w-4 h-4 mr-2" /> Copier</Button>
              <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(false)} className="text-emerald-400/50 hover:text-white hover:bg-[#064e3b]"><X className="w-5 h-5" /></Button>
            </div>
          </div>

          <div className="flex flex-1 min-h-0 flex-row">
            <div className="flex-grow relative bg-[#042f2e] group border-r border-[#064e3b] overflow-hidden">

              {/* COUCHE VISUELLE (Texte riche + Syntaxe visible) */}
              <div
                ref={backdropRef}
                className={cn(commonEditorStyles, "text-white pointer-events-none z-0 scrollbar-stable font-inherit")}
                aria-hidden="true"
              >
                {renderEditorScript(currentEditingText) || <span className="text-white/20 italic">Commencez à écrire ici...</span>}
              </div>

              {/* COUCHE INTERACTIVE (Textarea natif transparent) */}
              <textarea
                ref={textareaRef}
                value={currentEditingText}
                onChange={(e) => setCurrentEditingText(e.target.value)}
                onScroll={handleEditorScroll}
                className={cn(commonEditorStyles, "bg-transparent text-transparent caret-emerald-400 z-10 scrollbar-stable font-inherit")}
                spellCheck={false}
              />

              <div className="absolute bottom-4 right-6 text-[10px] font-mono text-[#34d399] bg-[#022c22]/90 border border-[#065f46] px-3 py-1.5 rounded-full flex items-center gap-3 shadow-lg pointer-events-none z-20 opacity-75 group-hover:opacity-100 transition-opacity">
                <span className="font-bold text-white">{wordCount}</span> MOTS
                <span className="w-px h-3 bg-[#065f46]"></span>
                <span className="font-bold text-white">{charCount}</span> CAR.
              </div>
            </div>
            <div className="w-[300px] bg-[#022c22] flex flex-col shrink-0">
              <div className="p-5 space-y-8 overflow-y-auto custom-scrollbar-dark">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-emerald-400/50 uppercase tracking-widest">Mise en forme</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button onClick={() => insertTag('**', '**')} variant="outline" className="bg-[#064e3b]/30 border-[#065f46] text-emerald-100 hover:bg-[#065f46] hover:text-white hover:border-emerald-500/50 transition-all h-9" title="Gras"><Bold className="w-4 h-4" /></Button>
                    <Button onClick={() => insertTag('_', '_')} variant="outline" className="bg-[#064e3b]/30 border-[#065f46] text-emerald-100 hover:bg-[#065f46] hover:text-white hover:border-emerald-500/50 transition-all h-9" title="Italique"><Italic className="w-4 h-4" /></Button>
                    <Button onClick={() => insertTag('<u>', '</u>')} variant="outline" className="bg-[#064e3b]/30 border-[#065f46] text-emerald-100 hover:bg-[#065f46] hover:text-white hover:border-emerald-500/50 transition-all h-9" title="Souligné"><Underline className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-emerald-400/50 uppercase tracking-widest">Didascalies</label>
                  <div className="space-y-2">
                    <Button onClick={() => insertTag('[PAUSE]')} variant="outline" className="w-full justify-start text-left bg-[#064e3b]/30 border-[#065f46] text-emerald-100 hover:bg-[#065f46] hover:text-white hover:border-emerald-500/50 transition-all h-10 px-3"><Pause className="w-4 h-4 mr-3 text-emerald-400" /><span className="text-sm">Pause</span></Button>
                    <Button onClick={() => insertTag('[CLIC]')} variant="outline" className="w-full justify-start text-left bg-[#064e3b]/30 border-[#065f46] text-emerald-100 hover:bg-[#065f46] hover:text-white hover:border-emerald-500/50 transition-all h-10 px-3"><MousePointer2 className="w-4 h-4 mr-3 text-emerald-400" /><span className="text-sm">Clic Slide</span></Button>
                    <Button onClick={() => insertTag('[REGARD]')} variant="outline" className="w-full justify-start text-left bg-[#064e3b]/30 border-[#065f46] text-emerald-100 hover:bg-[#065f46] hover:text-white hover:border-emerald-500/50 transition-all h-10 px-3"><Eye className="w-4 h-4 mr-3 text-emerald-400" /><span className="text-sm">Regarder Public</span></Button>
                    <Button onClick={() => insertTag('[TON]')} variant="outline" className="w-full justify-start text-left bg-[#064e3b]/30 border-[#065f46] text-emerald-100 hover:bg-[#065f46] hover:text-white hover:border-emerald-500/50 transition-all h-10 px-3"><Mic className="w-4 h-4 mr-3 text-emerald-400" /><span className="text-sm">Changer Ton</span></Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-[#064e3b] bg-[#022c22] flex justify-end gap-3 z-20">
            {/* BOUTON SAUVEGARDER AVEC ETAT DE CHARGEMENT */}
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="text-emerald-200 hover:text-white hover:bg-white/5">Annuler</Button>
            <Button onClick={handleEditSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 shadow-lg shadow-emerald-900/20 transition-all">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                "Sauvegarder"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MODALE TIMER --- */}
      <Dialog open={isTimerSettingsOpen} onOpenChange={setIsTimerSettingsOpen}>
        <DialogContent className="max-w-md bg-[#022c22] border-[#064e3b] text-white">
          <div className="p-6 text-center space-y-6">
            <div className="inline-flex p-4 rounded-full bg-[#064e3b] text-emerald-400 mb-2"><Clock className="w-8 h-8" /></div>
            <h3 className="text-2xl font-bold">Régler le minuteur</h3>
            <div className="relative w-32 mx-auto">
              <Input type="number" value={tempDuration} onChange={(e) => setTempDuration(Math.max(1, parseInt(e.target.value) || 0))} className="text-center text-4xl h-16 bg-transparent border-b-2 border-emerald-500 border-t-0 border-l-0 border-r-0 rounded-none focus-visible:ring-0 px-0 font-mono font-bold text-white no-spinners" />
              <span className="absolute right-0 bottom-4 text-emerald-500/50 text-sm font-bold">MIN</span>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[5, 10, 15, 20].map((t) => (
                <button key={t} onClick={() => setTempDuration(t)} className={cn("py-2 rounded border border-[#065f46] hover:bg-[#065f46] text-sm font-medium transition-colors", tempDuration === t ? "bg-emerald-600 border-emerald-500 text-white" : "text-emerald-200")}>{t}m</button>
              ))}
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsTimerSettingsOpen(false)} className="flex-1 text-emerald-200">Annuler</Button>
              <Button onClick={handleSaveTimer} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold">Lancer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}