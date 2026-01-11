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
  ArrowRightLeft,
  RefreshCw,
  Edit3,
  X
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [refinementStyle, setRefinementStyle] = useState<"professional" | "casual" | "concise">("professional");
  
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
          body: JSON.stringify({ text: transcribeData.text, style: refinementStyle }),
        });

        const refineData = await refineRes.json();

        if (refineData.refinedText) {
          setRefinedText(refineData.refinedText);
          setEditedText(refineData.refinedText);
        }
      }
    } catch (err) {
      console.error("Process failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegenerateWithStyle = async (style: "professional" | "casual" | "concise") => {
    setIsRegenerating(true);
    setRefinementStyle(style);
    try {
      const refineRes = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript, style }),
      });

      const refineData = await refineRes.json();

      if (refineData.refinedText) {
        setRefinedText(refineData.refinedText);
        setEditedText(refineData.refinedText);
      }
    } catch (err) {
      console.error("Regeneration failed:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAccept = () => {
    const finalText = isEditing ? editedText : refinedText;
    const newRefinement: Refinement = {
      id: Math.random().toString(36).substring(7),
      original: transcript,
      refined: finalText,
      timestamp: new Date(),
    };
    setRefinements(prev => [newRefinement, ...prev]);
    setRefinedText(finalText);
    setIsEditing(false);
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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-200 overflow-hidden flex flex-col">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
            <img
              src="https://framerusercontent.com/images/6hd2q32TCQkqeTR6lgvTAQAClWE.svg?width=375&height=375"
              alt="Codiris"
              className="w-7 h-7 relative z-10 brightness-0 invert"
            />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
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
                    opacity: isListening ? [0.1, 0.2, 0.1] : 0.05
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-slate-900 blur-[80px] rounded-full"
                />

                <div className="relative w-48 h-48 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-xl">
                  <div className="flex items-center gap-1 h-20">
                    {volume.map((v, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: v / 2 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={cn(
                          "w-1 rounded-full transition-colors duration-300",
                          isListening ? "bg-slate-900" : "bg-slate-300"
                        )}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center shadow-sm">
                      {isProcessing ? (
                        <Loader2 className="w-6 h-6 text-slate-900 animate-spin" />
                      ) : (
                        <AudioLines className={cn("w-6 h-6 transition-colors", isListening ? "text-slate-900" : "text-slate-400")} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {isListening ? "Listening..." : isProcessing ? "Transcribing your words..." : "Speak to Transcribe"}
                </h2>
                <p className="text-slate-500">We'll turn your spoken thoughts into clear text.</p>
              </div>

              <button
                onClick={isListening ? stopRecording : startRecording}
                disabled={isProcessing}
                className={cn(
                  "group relative flex items-center gap-4 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 active:scale-95 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed shadow-lg",
                  isListening
                    ? "bg-red-50 border-2 border-red-200 text-red-600 hover:bg-red-100"
                    : "bg-slate-900 hover:bg-slate-800 text-white border-2 border-slate-900"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isListening ? "bg-red-100" : "bg-white/10"
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
                  className="space-y-6"
                >
                  {/* Refinement Style Selector */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" />
                      Refinement Style
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: "professional", label: "Professional", desc: "Formal and clear" },
                        { value: "casual", label: "Casual", desc: "Friendly tone" },
                        { value: "concise", label: "Concise", desc: "Brief and direct" }
                      ].map((style) => (
                        <button
                          key={style.value}
                          onClick={() => handleRegenerateWithStyle(style.value as any)}
                          disabled={isRegenerating}
                          className={cn(
                            "flex-1 px-4 py-3 rounded-xl border-2 transition-all text-left",
                            refinementStyle === style.value
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300",
                            isRegenerating && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className="font-semibold text-sm">{style.label}</div>
                          <div className="text-xs opacity-70">{style.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* View Mode Selector */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setViewMode("both")}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2",
                        viewMode === "both"
                          ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <ArrowRightLeft className="w-4 h-4 inline mr-2" />
                      Compare
                    </button>
                    <button
                      onClick={() => setViewMode("refined")}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2",
                        viewMode === "refined"
                          ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
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
                      <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 space-y-4 relative group">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Original</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-200"
                            onClick={() => copyToClipboard(transcript, "transcript")}
                          >
                            {copiedId === "transcript" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                          </Button>
                        </div>
                        <p className="text-base text-slate-600 leading-relaxed">
                          {transcript}
                        </p>
                      </div>

                      {/* Improved Version */}
                      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 space-y-4 relative group shadow-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            Improved
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setIsEditing(!isEditing)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm text-slate-900 transition-colors font-semibold"
                            >
                              <Edit3 className="w-3 h-3" />
                              {isEditing ? "Stop" : "Edit"}
                            </button>
                            <button
                              onClick={() => handleRegenerateWithStyle(refinementStyle)}
                              disabled={isRegenerating}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm text-slate-900 transition-colors disabled:opacity-50 font-semibold"
                            >
                              <RefreshCw className={cn("w-3 h-3", isRegenerating && "animate-spin")} />
                              Regen
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
                              onClick={() => copyToClipboard(refinedText, "refined")}
                            >
                              {copiedId === "refined" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-900" />}
                            </Button>
                          </div>
                        </div>
                        {isRegenerating ? (
                          <div className="p-8 flex items-center justify-center">
                            <div className="flex items-center gap-3 text-slate-900">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span className="font-medium">Regenerating...</span>
                            </div>
                          </div>
                        ) : isEditing ? (
                          <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 leading-relaxed font-medium resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
                            rows={6}
                          />
                        ) : (
                          <p className="text-base text-slate-900 leading-relaxed font-medium">
                            {refinedText}
                          </p>
                        )}
                        {isEditing && (
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={() => {
                                setIsEditing(false);
                                setEditedText(refinedText);
                              }}
                              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold transition-colors text-sm border-2 border-slate-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleAccept}
                              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors text-sm"
                            >
                              Save Changes
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Refined Only View */
                    <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 space-y-4 relative group shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-900 flex items-center gap-2">
                          <Sparkles className="w-3 h-3" />
                          Improved Version
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm text-slate-900 transition-colors font-semibold"
                          >
                            <Edit3 className="w-3 h-3" />
                            {isEditing ? "Stop" : "Edit"}
                          </button>
                          <button
                            onClick={() => handleRegenerateWithStyle(refinementStyle)}
                            disabled={isRegenerating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm text-slate-900 transition-colors disabled:opacity-50 font-semibold"
                          >
                            <RefreshCw className={cn("w-3 h-3", isRegenerating && "animate-spin")} />
                            Regen
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
                            onClick={() => copyToClipboard(refinedText, "refined")}
                          >
                            {copiedId === "refined" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-900" />}
                          </Button>
                        </div>
                      </div>
                      {isRegenerating ? (
                        <div className="p-8 flex items-center justify-center">
                          <div className="flex items-center gap-3 text-slate-900">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="font-medium">Regenerating...</span>
                          </div>
                        </div>
                      ) : isEditing ? (
                        <textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 leading-relaxed font-medium resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
                          rows={8}
                        />
                      ) : (
                        <p className="text-lg text-slate-900 leading-relaxed font-medium">
                          {refinedText}
                        </p>
                      )}
                      {isEditing && (
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setEditedText(refinedText);
                            }}
                            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold transition-colors text-sm border-2 border-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAccept}
                            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors text-sm"
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State */}
            {!transcript && !isListening && !isProcessing && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                  <Sparkles className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-lg">Your transcript will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: History Sidebar */}
        <div className="hidden lg:flex flex-col w-96 bg-slate-50 border-l-2 border-slate-200">
          <div className="p-6 border-b-2 border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <History className="w-4 h-4" />
              Recent Sessions
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearHistory}
              className="text-slate-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {refinements.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-sm">No history yet</p>
                </div>
              ) : (
                refinements.map((ref) => (
                  <div
                    key={ref.id}
                    className="group p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-900 transition-all cursor-pointer"
                    onClick={() => {
                      setTranscript(ref.original);
                      setRefinedText(ref.refined);
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {ref.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-slate-900 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[9px] text-slate-900 uppercase tracking-wider font-bold flex items-center gap-1 mb-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Improved
                        </span>
                        <p className="text-sm text-slate-900 line-clamp-2 font-medium">{ref.refined}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-1 block">Original</span>
                        <p className="text-xs text-slate-600 italic line-clamp-1">"{ref.original}"</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="p-6 border-t-2 border-slate-200 bg-white">
            <div className="flex items-center gap-4 text-xs text-slate-600 font-semibold">
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
