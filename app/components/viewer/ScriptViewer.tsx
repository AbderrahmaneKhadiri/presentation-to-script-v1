"use client";

import { useState, useEffect, useRef } from 'react';
import type { Presentation, Slide } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, ArrowRight, Timer, Play, Pause, RotateCcw, Pencil, X, Check,
  Sparkles, MousePointerClick, Mic, Eye, Scissors, Type, Copy, Clock, Bold, Underline, Italic,
  ChevronUp, ChevronDown, Gauge, LayoutDashboard
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type FullPresentation = Presentation & {
  slides: Slide[];
};

type Props = {
  presentation: FullPresentation;
};

export function ScriptViewer({ presentation }: Props) {
  // --- ETATS GENERAUX ---
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [editableScripts, setEditableScripts] = useState<Record<string, string>>({});

  // --- ETATS MODALE EDITION ---
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEditingText, setCurrentEditingText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- ETATS AFFICHAGE SCRIPT ---
  const [editorFontSize, setEditorFontSize] = useState<'text-base' | 'text-xl' | 'text-3xl' | 'text-5xl'>('text-xl');

  // Refs pour le scrolling (un pour l'éditeur, un pour le plein écran)
  const scriptContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenScriptRef = useRef<HTMLDivElement>(null);

  // --- ETATS TELEPROMPTEUR ---
  const [isPrompterActive, setIsPrompterActive] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1); // 0.5 à 5
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- ETATS TIMER ---
  const [duration, setDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isTimerSetupOpen, setIsTimerSetupOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // --- ETATS MOUSE 3D ---
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // --- LOGIQUE TELEPROMPTEUR ---
  useEffect(() => {
    if (isPrompterActive) {
      scrollIntervalRef.current = setInterval(() => {
        const activeRef = isFullscreen ? fullscreenScriptRef.current : scriptContainerRef.current;

        if (activeRef) {
          activeRef.scrollTop += scrollSpeed;

          // Arrêt automatique en bas
          const { scrollTop, scrollHeight, clientHeight } = activeRef;
          if (scrollTop + clientHeight >= scrollHeight - 1) {
            setIsPrompterActive(false);
          }
        }
      }, 20);
    } else {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    }
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isPrompterActive, scrollSpeed, isFullscreen]);

  const togglePrompter = () => setIsPrompterActive(!isPrompterActive);
  const increaseSpeed = () => setScrollSpeed(prev => Math.min(prev + 0.2, 4));
  const decreaseSpeed = () => setScrollSpeed(prev => Math.max(prev - 0.2, 0.2));

  // --- LOGIQUE TIMER ---
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(duration * 60);
    }
  }, [duration]);

  useEffect(() => {
    if (isRunning && timeLeft > 0 && countdown === null) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft <= 0 && isRunning) {
      setIsRunning(false);
      setTimeLeft(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, countdown]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const countdownTimeout = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(countdownTimeout);
    }
    if (countdown === 0) {
      setCountdown(null);
      setIsRunning(true);
    }
  }, [countdown]);

  // --- EVENTS SOURIS 3D ---
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  // --- FONCTIONS ---
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (timeLeft > 0) {
      setIsRunning(prev => !prev);
    }
  };

  const handleStartPresentation = () => {
    setIsFullscreen(true);
    setTimeLeft(duration * 60);
    setCountdown(3);
    setIsPrompterActive(false);
  };

  const handleStopPresentation = () => {
    setIsFullscreen(false);
    setIsRunning(false);
    setCountdown(null);
    setTimeLeft(duration * 60);
    setIsPrompterActive(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setIsPrompterActive(false);
  };

  const currentSlide = presentation.slides[currentSlideIndex];
  const originalScript = currentSlide.scriptPro || currentSlide.scriptMedium || currentSlide.scriptSimple || "Aucun script généré.";
  const displayScript = editableScripts[currentSlide.id] ?? originalScript;

  const goToPrevious = () => {
    setIsPrompterActive(false);
    setCurrentSlideIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setIsPrompterActive(false);
    setCurrentSlideIndex(prev => Math.min(presentation.slides.length - 1, prev + 1));
  };

  const handleEditOpen = () => {
    setCurrentEditingText(displayScript);
    setIsEditDialogOpen(true);
    setIsPrompterActive(false);
  };

  const handleEditSave = () => {
    setEditableScripts(prev => ({ ...prev, [currentSlide.id]: currentEditingText }));
    setIsEditDialogOpen(false);
  };

  const insertAtCursor = (textToInsert: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = currentEditingText;
      const newText = text.substring(0, start) + textToInsert + text.substring(end);
      setCurrentEditingText(newText);
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
      }, 0);
    }
  };

  const wrapSelection = (prefix: string, suffix: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = currentEditingText;
      const selectedText = text.substring(start, end);
      const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
      setCurrentEditingText(newText);
    }
  };

  const cycleFontSize = () => {
    setEditorFontSize(prev =>
      prev === 'text-base' ? 'text-xl' : prev === 'text-xl' ? 'text-3xl' : prev === 'text-3xl' ? 'text-5xl' : 'text-base'
    );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentEditingText);
  };

  const wordCount = currentEditingText.trim().split(/\s+/).length;
  const readingTime = Math.ceil((wordCount / 130) * 60);

  // ==========================================
  // === VUE PLEIN ÉCRAN (MODE PRÉSENTATION) ===
  // ==========================================
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-emerald-950 z-[100] flex flex-col text-white overflow-hidden">

        {/* --- OVERLAY COMPTE A REBOURS --- */}
        <AnimatePresence>
          {countdown !== null && countdown > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-[200]"
            >
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute w-64 h-64 rounded-full border-2 border-emerald-500/30"
                />
                <motion.div
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.8, 0, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="absolute w-48 h-48 rounded-full bg-emerald-500/10 blur-xl"
                />
                <motion.p
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 to-white font-mono relative z-10"
                >
                  {countdown}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- HEADER FLOTTANT (Timer & Contrôles globaux) --- */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50 pointer-events-none">
          {/* Timer Widget */}
          <div className={cn(
            "pointer-events-auto flex items-center gap-4 p-4 rounded-2xl backdrop-blur-xl border shadow-2xl transition-colors duration-500",
            timeLeft === 0 ? "bg-red-950/80 border-red-500/50" : "bg-black/40 border-white/10"
          )}>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Temps Restant</span>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-4xl font-bold font-mono tabular-nums tracking-tight", timeLeft === 0 ? "text-red-400" : "text-white")}>
                  {formatTime(timeLeft)}
                </span>
                <span className="text-sm text-white/40 font-medium">/ {duration} min</span>
              </div>
            </div>
            <div className="h-10 w-px bg-white/10 mx-2" />
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleStartStop} className="h-10 w-10 rounded-full hover:bg-white/10">
                {isRunning ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleReset} className="h-10 w-10 rounded-full hover:bg-white/10">
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStopPresentation}
            className="pointer-events-auto h-12 w-12 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* --- CONTENU PRINCIPAL (Split Screen) --- */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 h-full">

          {/* GAUCHE : Slide Actuelle */}
          <div className="relative bg-black flex items-center justify-center border-r border-white/10 p-12">
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              {currentSlide.imageUrl ? (
                <Image src={currentSlide.imageUrl} alt={`Slide ${currentSlide.slideNumber}`} layout="fill" objectFit="contain" />
              ) : <p className="p-10 text-center text-neutral-400 text-xl">{currentSlide.extractedText}</p>}
            </div>

            <div className="absolute bottom-8 left-8 bg-black/60 backdrop-blur px-4 py-2 rounded-lg border border-white/10 text-white/60 font-mono text-sm">
              Slide {currentSlide.slideNumber} / {presentation.slides.length}
            </div>
          </div>

          {/* DROITE : Télé-Prompteur */}
          <div className="relative bg-emerald-950 flex flex-col overflow-hidden">

            {/* BARRE D'OUTILS PROMPTEUR */}
            <div className="h-20 border-b border-white/10 bg-black/20 backdrop-blur flex items-center justify-between px-6 z-20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-emerald-100 tracking-wide uppercase text-sm">Prompteur</span>
              </div>

              <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-xl border border-white/5">
                <Button
                  size="icon"
                  onClick={togglePrompter}
                  className={cn(
                    "h-10 w-10 rounded-lg transition-all",
                    isPrompterActive
                      ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  )}
                >
                  {isPrompterActive ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
                </Button>

                <div className="w-px h-6 bg-white/10 mx-1" />

                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={decreaseSpeed} disabled={scrollSpeed <= 0.2} className="h-9 w-9 rounded-lg hover:bg-white/10"><ChevronDown className="h-4 w-4" /></Button>
                  <div className="flex flex-col items-center w-14">
                    <span className="text-xs text-white/40 font-bold uppercase">Vitesse</span>
                    <span className="text-lg font-mono font-bold text-white leading-none">{scrollSpeed.toFixed(1)}x</span>
                  </div>
                  <Button size="icon" variant="ghost" onClick={increaseSpeed} disabled={scrollSpeed >= 4} className="h-9 w-9 rounded-lg hover:bg-white/10"><ChevronUp className="h-4 w-4" /></Button>
                </div>

                <div className="w-px h-6 bg-white/10 mx-1" />

                <Button size="icon" variant="ghost" onClick={cycleFontSize} className="h-10 w-10 rounded-lg hover:bg-white/10" title="Taille du texte">
                  <Type className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* ZONE DE TEXTE DÉFILANTE */}
            <div className="relative flex-grow overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-950 to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-950 to-transparent z-10 pointer-events-none" />

              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-emerald-500/20 z-0 pointer-events-none hidden" />

              <div
                ref={fullscreenScriptRef}
                className={cn(
                  "absolute inset-0 overflow-y-auto scroll-smooth px-16 custom-scrollbar",
                  editorFontSize
                )}
              >
                <div className="min-h-[40vh]" />
                <p className="leading-relaxed whitespace-pre-wrap break-words text-emerald-50 font-medium max-w-4xl mx-auto pb-20 transition-all duration-300 ease-in-out">
                  {displayScript}
                </p>
                <div className="min-h-[60vh]" />
              </div>
            </div>

            {/* NAVIGATION BOTTOM BAR */}
            <div className="h-20 bg-black/20 border-t border-white/10 backdrop-blur flex items-center justify-center gap-8 z-20 shrink-0">
              <Button
                onClick={goToPrevious}
                disabled={currentSlideIndex === 0}
                variant="secondary"
                size="lg"
                className="w-48 h-12 text-lg bg-white/10 hover:bg-white/20 text-white border-white/5"
              >
                <ArrowLeft className="mr-2 h-5 w-5" /> Précédent
              </Button>

              <div className="h-10 w-px bg-white/10" />

              <Button
                onClick={goToNext}
                disabled={currentSlideIndex === presentation.slides.length - 1}
                size="lg"
                className="w-48 h-12 text-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50"
              >
                Suivant <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // === VUE NORMALE (MODE PREPARATION) ===
  // ==========================================
  return (
    <div className="pt-24 pb-12 min-h-screen" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} ref={containerRef}>
      <header className="mb-10 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col items-start gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 -ml-3">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Mes Projets
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">{presentation.fileName}</h1>
              <p className="text-emerald-200/60 text-lg">
                Slide <span className="text-emerald-400 font-bold">{currentSlideIndex + 1}</span> sur {presentation.slides.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-emerald-950/50 p-2 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
            <Dialog open={isTimerSetupOpen} onOpenChange={setIsTimerSetupOpen}>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-4 py-3 bg-emerald-900/50 border border-emerald-500/30 rounded-xl cursor-pointer hover:bg-emerald-800/50 transition-colors"
                >
                  <Timer className="h-5 w-5 text-emerald-400" />
                  <span className="font-mono text-lg font-bold text-emerald-100 w-[60px] text-center">{formatTime(timeLeft)}</span>
                </motion.div>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[400px] bg-emerald-950/95 backdrop-blur-2xl border-emerald-500/20 text-white shadow-[0_0_50px_-12px_rgba(16,185,129,0.25)] rounded-3xl p-0 overflow-hidden gap-0">
                <div className="bg-gradient-to-b from-emerald-500/10 to-transparent p-6 pb-0 flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/30 shadow-inner shadow-emerald-500/20">
                    <Timer className="h-8 w-8 text-emerald-400" />
                  </div>
                  <DialogHeader className="mb-2">
                    <DialogTitle className="text-2xl font-bold text-center tracking-tight text-white">
                      Temps de parole
                    </DialogTitle>
                  </DialogHeader>
                  <p className="text-center text-emerald-200/60 text-sm max-w-[80%]">
                    Définissez la durée cible pour votre présentation.
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="relative flex justify-center group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                    <div className="relative flex items-baseline gap-2">
                      <Input
                        id="minutes"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
                        className="no-spinners w-32 text-center text-5xl font-bold bg-black/20 border-emerald-500/30 text-emerald-400 focus:border-emerald-400 focus:ring-emerald-400/20 h-20 rounded-xl selection:bg-emerald-500/30 font-mono"
                      />
                      <span className="text-lg text-emerald-200/50 font-medium absolute right-[-40px] bottom-4">min</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3">
                    {[5, 10, 15, 20].map((val) => (
                      <button key={val} onClick={() => setDuration(val)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all border", duration === val ? "bg-emerald-500 text-emerald-950 border-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-emerald-900/30 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/40")}>{val}m</button>
                    ))}
                  </div>
                </div>

                <DialogFooter className="p-6 pt-2 bg-emerald-950/50">
                  <Button type="submit" onClick={() => setIsTimerSetupOpen(false)} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 font-bold h-12 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">Valider la durée</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={handleStartPresentation} size="lg" className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400 font-bold text-lg px-6 py-6 rounded-xl shadow-lg shadow-emerald-500/20">
                <Play className="h-5 w-5 mr-2 fill-current" />
                Présenter
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 perspective-1000">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Slide Card */}
          <motion.div className="lg:col-span-7 relative z-10" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} style={{ rotateY: mousePosition.x * 5, rotateX: -mousePosition.y * 5 }}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <Card className="bg-emerald-950/80 border-emerald-500/20 backdrop-blur-xl overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-500">
                <CardContent className="p-0 aspect-video relative bg-black/40">
                  {currentSlide.imageUrl ? (
                    <Image src={currentSlide.imageUrl} alt={`Slide ${currentSlide.slideNumber}`} layout="fill" objectFit="contain" className="transition-transform duration-700 hover:scale-105" />
                  ) : <div className="p-10 flex items-center justify-center h-full"><div className="text-center text-neutral-300"><h3 className="font-bold text-2xl mb-4 text-white">Slide {currentSlide.slideNumber}</h3><p className="text-base opacity-70 line-clamp-6">{currentSlide.extractedText}</p></div></div>}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Script Editor Panel */}
          <motion.div className="lg:col-span-5 relative" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="bg-emerald-950/40 border-emerald-500/20 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-300px)] min-h-[500px] ring-1 ring-white/5 group">
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-xl z-20">
                <div className="flex items-center gap-3"><div className="h-8 w-1 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" /><h2 className="font-bold text-lg text-white tracking-wide">Script</h2></div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={cycleFontSize} className="text-emerald-300/70 hover:text-emerald-300 hover:bg-emerald-500/10" title="Taille du texte"><Type className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={handleEditOpen} className="text-emerald-300/70 hover:text-emerald-300 hover:bg-emerald-500/10 h-8 px-3 text-xs uppercase font-medium tracking-wider border border-emerald-500/10 rounded-lg"><Pencil className="h-3 w-3 mr-2" /> Editer</Button>
                </div>
              </div>

              {/* Mini Prompter Toolbar inside Editor view as well */}
              <div className="px-4 py-2 border-b border-white/5 bg-emerald-900/10 flex items-center justify-between gap-2 z-20">
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className={cn("h-8 w-8 rounded-full transition-all", isPrompterActive ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30")} onClick={togglePrompter} title={isPrompterActive ? "Pause" : "Lecture automatique"}>
                    {isPrompterActive ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                  </Button>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-emerald-500/60 ml-1">{isPrompterActive ? "ON AIR" : "Prompteur"}</span>
                </div>
                <div className="flex items-center gap-1 bg-black/20 rounded-lg p-0.5 border border-white/5">
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-200/60 hover:text-white hover:bg-white/5 rounded-md" onClick={decreaseSpeed} disabled={scrollSpeed <= 0.2}><ChevronDown className="h-3 w-3" /></Button>
                  <div className="flex items-center gap-1.5 px-2 min-w-[60px] justify-center"><Gauge className="h-3 w-3 text-emerald-500" /><span className="text-xs font-mono text-emerald-100 font-bold">{scrollSpeed.toFixed(1)}x</span></div>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-200/60 hover:text-white hover:bg-white/5 rounded-md" onClick={increaseSpeed} disabled={scrollSpeed >= 4}><ChevronUp className="h-3 w-3" /></Button>
                </div>
              </div>

              <div className="relative flex-grow overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-emerald-950/90 to-transparent z-10 pointer-events-none" />
                <div ref={scriptContainerRef} className={cn("absolute inset-0 p-8 overflow-y-auto custom-scrollbar scroll-smooth", editorFontSize)}>
                  <div className="prose prose-invert max-w-none">
                    <div className="min-h-[50px]" />
                    <p className="leading-relaxed whitespace-pre-wrap break-words text-emerald-50 font-medium tracking-wide pb-32">{displayScript}</p>
                    <div className="min-h-[200px]" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-emerald-950 to-transparent z-10 pointer-events-none" />
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="mt-12 flex justify-center gap-6 pb-20">
          <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }}><Button onClick={goToPrevious} disabled={currentSlideIndex === 0} size="lg" className="bg-emerald-950/50 hover:bg-emerald-900 text-emerald-100 border border-emerald-500/30 backdrop-blur-sm px-8 py-6 text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:hover:y-0"><ArrowLeft className="h-5 w-5 mr-2" /> Précédent</Button></motion.div>
          <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }}><Button onClick={goToNext} disabled={currentSlideIndex === presentation.slides.length - 1} size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-8 py-6 text-lg rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:hover:y-0">Suivant <ArrowRight className="h-5 w-5 ml-2" /></Button></motion.div>
        </div>
      </div>

      {/* Modale d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[1000px] bg-emerald-950/95 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_0_50px_-12px_rgba(16,185,129,0.25)] rounded-3xl p-0 overflow-hidden flex flex-col max-h-[90vh] gap-0">
          <div className="px-8 py-6 border-b border-emerald-500/10 bg-gradient-to-r from-emerald-900/20 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner shadow-emerald-500/10">
                <Pencil className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight text-white">Édition du script</DialogTitle>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-emerald-200/50 text-sm flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Slide {currentSlide.slideNumber}</p>
                  <div className="h-3 w-px bg-white/10" />
                  <p className="text-emerald-200/40 text-xs font-mono flex items-center gap-1"><Clock className="w-3 h-3" /> ~{readingTime} sec</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-emerald-200/60 hover:text-white" onClick={copyToClipboard}><Copy className="w-4 h-4 mr-2" />Copier</Button>
            </div>
          </div>
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 p-0 relative bg-black/20">
              <Textarea ref={textareaRef} value={currentEditingText} onChange={(e) => setCurrentEditingText(e.target.value)} placeholder="Rédigez votre script ici..." className={cn("w-full h-full bg-transparent border-0 focus:ring-0 text-emerald-50 p-8 resize-none custom-scrollbar selection:bg-emerald-500/30 leading-relaxed transition-all duration-200", `!${editorFontSize}`)} />
              <div className="absolute bottom-4 right-6 text-xs text-emerald-500/30 font-mono pointer-events-none">{wordCount} mots • {currentEditingText.length} caractères</div>
            </div>
            <div className="w-64 border-l border-emerald-500/10 bg-emerald-900/10 p-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider pl-1">Mise en forme</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="flex-1 text-emerald-100 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-white h-9" onClick={() => wrapSelection(' **', '** ')} title="Gras (Markdown)"><Bold className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" className="flex-1 text-emerald-100 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-white h-9" onClick={() => wrapSelection(' *', '* ')} title="Italique (Markdown)"><Italic className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" className="flex-1 text-emerald-100 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-white h-9" onClick={() => wrapSelection(' __', '__ ')} title="Souligné (Markdown)"><Underline className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider pl-1">Didascalies</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" className="justify-start text-emerald-100 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-white text-xs h-9" onClick={() => insertAtCursor(' [PAUSE] ')}><Pause className="w-3 h-3 mr-2 opacity-70" /> Pause</Button>
                  <Button variant="outline" className="justify-start text-emerald-100 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-white text-xs h-9" onClick={() => insertAtCursor(' [CLIC] ')}><MousePointerClick className="w-3 h-3 mr-2 opacity-70" /> Clic Slide</Button>
                  <Button variant="outline" className="justify-start text-emerald-100 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-white text-xs h-9" onClick={() => insertAtCursor(' [REGARD] ')}><Eye className="w-3 h-3 mr-2 opacity-70" /> Regarder Public</Button>
                  <Button variant="outline" className="justify-start text-emerald-100 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-white text-xs h-9" onClick={() => insertAtCursor(' [TON] ')}><Mic className="w-3 h-3 mr-2 opacity-70" /> Changer Ton</Button>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider pl-1 flex items-center gap-2">Assistant IA <Sparkles className="w-3 h-3" /></h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="ghost" className="justify-start text-purple-200/70 hover:bg-purple-500/10 hover:text-purple-200 text-xs h-9 w-full border border-purple-500/10" disabled><Sparkles className="w-3 h-3 mr-2" /> Reformuler</Button>
                  <Button variant="ghost" className="justify-start text-purple-200/70 hover:bg-purple-500/10 hover:text-purple-200 text-xs h-9 w-full border border-purple-500/10" disabled><Scissors className="w-3 h-3 mr-2" /> Raccourcir</Button>
                </div>
                <p className="text-[10px] text-purple-200/30 italic px-1">* Fonctionnalités IA bientôt disponibles</p>
              </div>
            </div>
          </div>
          <DialogFooter className="px-8 py-5 bg-emerald-950/80 border-t border-emerald-500/10 backdrop-blur-md flex gap-3 justify-end z-10">
            <DialogClose asChild><Button type="button" variant="ghost" className="text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/30 h-11 px-6 rounded-xl transition-all">Annuler</Button></DialogClose>
            <Button type="button" onClick={handleEditSave} className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 font-bold h-11 px-8 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] border border-emerald-400/20"><Check className="w-4 h-4 mr-2" />Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}