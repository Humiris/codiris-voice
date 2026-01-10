"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Settings,
  AudioLines,
  Loader2,
  History,
  Trash2,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  Volume2,
  ArrowRightLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Refinement {
  id: string;
  original: string;
  refined: string;
  timestamp: Date;
}

export function VoiceAI() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [refinedText, setRefinedText] = useState("");
  const [refinements, setRefinements] = useState<Refinement[]>([]);
  const [volume, setVolume] = useState<number[]>(Array(30).fill(10));
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"both" | "refined">("both");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Audio Context for Visualizer
  const startVisualizer = (stream: MediaStream) => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 64;
    source.connect(analyserRef.current);

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVisualizer = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const newVolume = Array.from(dataArray).slice(0, 30).map(v => Math.max(5, (v / 255) * 80));
      setVolume(newVolume);
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    updateVisualizer();
  };

  const stopVisualizer = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    setVolume(Array(30).fill(10));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        await handleTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      startVisualizer(stream);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      stopVisualizer();
    }
  };

  const handleTranscription = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, "audio.wav");

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const transcribeData = await transcribeRes.json();

      if (transcribeData.text) {
        setTranscript(transcribeData.text);

        // Now refine the text
        const refineRes = await fetch("/api/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: transcribeData.text }),
        });

        const refineData = await refineRes.json();

        if (refineData.refinedText) {
          setRefinedText(refineData.refinedText);
          const newRefinement: Refinement = {
            id: Math.random().toString(36).substring(7),
            original: transcribeData.text,
            refined: refineData.refinedText,
            timestamp: new Date(),
          };
          setRefinements(prev => [newRefinement, ...prev]);
        }
      }
    } catch (err) {
      console.error("Process failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearHistory = () => {
    setRefinements([]);
    setTranscript("");
    setRefinedText("");
  };

  const latestRefinement = refinements[0];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-blue-500/10 group-hover:scale-105 transition-transform overflow-hidden">
            <img 
              src="https://framerusercontent.com/images/6hd2q32TCQkqeTR6lgvTAQAClWE.svg?width=375&height=375" 
              alt="Codiris" 
              className="w-7 h-7 relative z-10"
            />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Codiris Voice
          </span>
        </Link>

        {/* Right side header elements removed as requested */}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Interaction & Result */}
        <div className="flex-1 flex flex-col p-6 md:p-12 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full space-y-12">
            
            {/* Visualizer & Control */}
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="relative">
                <motion.div 
                  animate={{ 
                    scale: isListening ? [1, 1.1, 1] : 1,
                    opacity: isListening ? [0.3, 0.6, 0.3] : 0.1
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full"
                />
                
                <div className="relative w-48 h-48 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                  <div className="flex items-center gap-1 h-20">
                    {volume.map((v, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: v / 2 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={cn(
                          "w-1 rounded-full transition-colors duration-300",
                          isListening ? "bg-blue-400" : "bg-slate-700"
                        )}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 rounded-full bg-slate-950/80 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-inner">
                      {isProcessing ? (
                        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                      ) : (
                        <AudioLines className={cn("w-6 h-6 transition-colors", isListening ? "text-blue-400" : "text-slate-600")} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">
                  {isListening ? "Listening..." : isProcessing ? "Transcribing your words..." : "Speak to Transcribe"}
                </h2>
                <p className="text-slate-400">We'll turn your spoken thoughts into clear text.</p>
              </div>

              <button
                onClick={isListening ? stopRecording : startRecording}
                disabled={isProcessing}
                className={cn(
                  "group relative flex items-center gap-4 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 active:scale-95 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed",
                  isListening 
                    ? "bg-red-500/10 border border-red-500/50 text-red-400" 
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_40px_rgba(37,99,235,0.3)]"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isListening ? "bg-red-500/20" : "bg-white/20"
                )}>
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </div>
                <span>{isListening ? "Stop Recording" : "Start Talking"}</span>
              </button>
            </div>

            {/* Result Display - View Mode Toggle */}
            <AnimatePresence mode="wait">
              {transcript && !isListening && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* View Mode Selector */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setViewMode("both")}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                        viewMode === "both"
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                          : "bg-white/5 text-slate-400 hover:bg-white/10"
                      )}
                    >
                      <ArrowRightLeft className="w-4 h-4 inline mr-2" />
                      Compare
                    </button>
                    <button
                      onClick={() => setViewMode("refined")}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                        viewMode === "refined"
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                          : "bg-white/5 text-slate-400 hover:bg-white/10"
                      )}
                    >
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      Improved Only
                    </button>
                  </div>

                  {/* Display based on view mode */}
                  {viewMode === "both" ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Original Transcript */}
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 relative group">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Original</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(transcript, "transcript")}
                          >
                            {copiedId === "transcript" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-base text-slate-400 leading-relaxed">
                          {transcript}
                        </p>
                      </div>

                      {/* Improved Version */}
                      <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-3xl p-6 space-y-4 relative group">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            Improved
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(refinedText, "refined")}
                          >
                            {copiedId === "refined" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-base text-white leading-relaxed font-medium">
                          {refinedText}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Refined Only View */
                    <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-3xl p-8 space-y-4 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                          <Sparkles className="w-3 h-3" />
                          Improved Version
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(refinedText, "refined")}
                        >
                          {copiedId === "refined" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-lg text-white leading-relaxed font-medium">
                        {refinedText}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State */}
            {!transcript && !isListening && !isProcessing && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600 space-y-4">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 opacity-20" />
                </div>
                <p className="text-lg">Your transcript will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: History Sidebar */}
        <div className="hidden lg:flex flex-col w-96 bg-slate-950/30 backdrop-blur-sm border-l border-white/5">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <History className="w-4 h-4 text-blue-400" />
              Recent Sessions
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={clearHistory}
              className="text-slate-500 hover:text-red-400 hover:bg-red-400/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {refinements.length === 0 ? (
                <div className="text-center py-12 text-slate-600">
                  <p className="text-sm">No history yet</p>
                </div>
              ) : (
                refinements.map((ref) => (
                  <div
                    key={ref.id}
                    className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all cursor-pointer"
                    onClick={() => {
                      setTranscript(ref.original);
                      setRefinedText(ref.refined);
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {ref.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[9px] text-blue-400 uppercase tracking-wider font-bold flex items-center gap-1 mb-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Improved
                        </span>
                        <p className="text-sm text-slate-200 line-clamp-2">{ref.refined}</p>
                      </div>
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-[9px] text-slate-600 uppercase tracking-wider font-bold mb-1 block">Original</span>
                        <p className="text-xs text-slate-500 italic line-clamp-1">"{ref.original}"</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="p-6 border-t border-white/5 bg-slate-950/50">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Whisper-1
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
