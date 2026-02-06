"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mic, Globe, Sparkles, ArrowRight, Check, Mail,
    Code, StickyNote, Wand2, Settings, FileText,
    MousePointer2, Play, Pause
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types for our demo stages
type DemoStage = "recording" | "processing" | "result";

type Mode = {
    id: string;
    name: string;
    icon: any;
    color: string;
    description: string;
    actionLabel: string;
    input: string;
    output: string;
    processIcon: any;
};

const MODES: Mode[] = [
    {
        id: "super-prompt",
        name: "Super Prompt",
        icon: Wand2,
        color: "violet",
        description: "Turn simple ideas into powerful prompts",
        actionLabel: "Enhance Prompt",
        processIcon: Sparkles,
        input: "Create a landing page for a coffee shop startup",
        output: "Create a modern, ultra-premium landing page for 'Lumina Coffee', a specialty roaster.\n\n# DESIGN AESTHETIC\n- Style: Minimalist japanese-scandinavian fusion (Japandi)\n- Colors: Warm beige, slate gray, and matte black accents\n- Typography: Sans-serif for headers (Inter), Serif for body (Playfair Display)\n\n# HERO SECTION\n- Background: Cinematic slow-motion video of espresso extraction\n- Headline: 'Coffee isn't just a drink. It's a ritual.'\n- CTA: 'Subscribe - $25/mo' (Glassmorphism effect)\n\n# KEY FEATURES\n1. Single Origin Series: Carousel of bags with origin maps\n2. The Roasting Process: Parallax scroll telling the story\n3. Barista Choice: AI-recommended blend quiz\n\n# TECHNICAL SPECS\n- Framework: Next.js 15 + React Server Components\n- Styling: Tailwind CSS + Framer Motion for scroll reveals\n- Performance: 99+ Lighthouse score\n- SEO: Optimized meta tags for 'specialty coffee subscription'"
    },
    {
        id: "translation",
        name: "Translation",
        icon: Globe,
        color: "blue",
        description: "Translate voice to any language instantly",
        actionLabel: "Translate to Portuguese",
        processIcon: Globe,
        input: "Je voudrais réserver une table pour deux personnes ce soir.",
        output: "Gostaria de reservar uma mesa para duas pessoas esta noite."
    },
    {
        id: "email",
        name: "Email",
        icon: Mail,
        color: "green",
        description: "Draft professional emails from rough notes",
        actionLabel: "Draft Email",
        processIcon: Mail,
        input: "Tell the team great job on the launch today really impressed",
        output: "Hi Team,\n\nI just wanted to say fantastic job on the launch today! I'm really impressed with everyone's hard work and dedication.\n\nBest regards,"
    },
    {
        id: "code",
        name: "Code",
        icon: Code,
        color: "orange",
        description: "Convert logic explanations into code",
        actionLabel: "Generate Code",
        processIcon: Code,
        input: "Function to check if a number is prime",
        output: "function isPrime(n: number): boolean {\n  if (n <= 1) return false;\n  for (let i = 2; i <= Math.sqrt(n); i++) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}"
    },
    {
        id: "notes",
        name: "Notes",
        icon: StickyNote,
        color: "yellow",
        description: "Summarize meetings into bullet points",
        actionLabel: "Summarize Notes",
        processIcon: StickyNote,
        input: "So we need to buy milk eggs and bread and don't forget the coffee",
        output: "Shopping List:\n• Milk\n• Eggs\n• Bread\n• Coffee"
    },
    {
        id: "clean",
        name: "Clean",
        icon: Sparkles,
        color: "cyan",
        description: "Remove filler words and fix grammar",
        actionLabel: "Clean Up",
        processIcon: Sparkles,
        input: "So basically um I think that like we should totally do that",
        output: "I think we should do that."
    },
    {
        id: "format",
        name: "Format",
        icon: FileText,
        color: "indigo",
        description: "Structure unstructured text",
        actionLabel: "Format Text",
        processIcon: FileText,
        input: "Title is My Report Section 1 is Introduction then Section 2 Analysis",
        output: "# My Report\n\n## 1. Introduction\n\n## 2. Analysis"
    },
    {
        id: "custom",
        name: "Custom",
        icon: Settings,
        color: "rose",
        description: "Create your own custom workflow",
        actionLabel: "Run Custom Agent",
        processIcon: Settings,
        input: "Analyze this text for sentiment and tone",
        output: "Analysis Report:\n- Sentiment: Positive (0.85)\n- Tone: Professional, Enthusiastic\n- Key Themes: Growth, Innovation"
    }
];

export const VoiceModesGallery = () => {
    const [activeMode, setActiveMode] = useState<Mode>(MODES[0]);
    const [stage, setStage] = useState<DemoStage>("recording");
    const [transcript, setTranscript] = useState("");
    const [resultText, setResultText] = useState("");
    const [isPaused, setIsPaused] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Animation refs to handle cleanup
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isPaused) return;

        const runSequence = () => {
            // CLEAR PREVIOUS
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);

            // RESET
            setStage("recording");
            setTranscript("");
            setResultText("");
            setIsSpeaking(false);

            // 1. RECORDING PHASE
            const text = activeMode.input;
            let charIndex = 0;
            let currentText = "";

            // Start speaking animation
            setIsSpeaking(true);

            const typeInput = setInterval(() => {
                if (charIndex < text.length) {
                    currentText += text[charIndex];
                    setTranscript(currentText);
                    charIndex++;
                } else {
                    clearInterval(typeInput);
                    // Stop speaking animation immediately when text finishes
                    setIsSpeaking(false);

                    // TRANSITION TO PROCESSING
                    timeoutRef.current = setTimeout(() => {
                        setStage("processing");

                        // TRANSITION TO RESULT
                        timeoutRef.current = setTimeout(() => {
                            setStage("result");

                            // TYPE RESULT
                            const outText = activeMode.output;
                            let outIndex = 0;
                            let currentOut = "";

                            const typeOutput = setInterval(() => {
                                if (outIndex < outText.length) {
                                    currentOut += outText[outIndex];
                                    setResultText(currentOut);
                                    outIndex++;
                                } else {
                                    clearInterval(typeOutput);

                                    // LOOP RESTART
                                    timeoutRef.current = setTimeout(() => {
                                        runSequence();
                                    }, 5000);
                                }
                            }, 10); // Faster typing for result
                            intervalRef.current = typeOutput;

                        }, 2500); // Processing duration (includes cursor animation time)
                    }, 800); // Pause after recording
                }
            }, 50); // Typing speed input
            intervalRef.current = typeInput;
        };

        runSequence();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [activeMode, isPaused]);

    return (
        <section className="py-24 bg-slate-950 overflow-hidden relative border-t border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,41,59,1),rgba(2,6,23,1))] -z-10" />

            {/* Background ambient glow based on mode color */}
            <motion.div
                animate={{ backgroundColor: getModeColor(activeMode.color) }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-10 transition-colors duration-1000"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
                    >
                        7 Modes + <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">Unlimited Custom</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto"
                    >
                        Switch between specialized AI modes or build your own. Watch how Codiris Intelligence transforms your voice in real-time.
                    </motion.p>
                </div>

                {/* Mode Selector */}
                <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="flex justify-center min-w-max px-4 gap-2">
                        {MODES.map((mode) => {
                            const isActive = activeMode.id === mode.id;
                            const Icon = mode.icon;
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => setActiveMode(mode)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border",
                                        isActive
                                            ? "bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-105"
                                            : "bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", isActive ? getUserColorText(mode.color) : "")} />
                                    {mode.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3D Visualization Area */}
                <div className="relative h-[650px] w-full max-w-5xl mx-auto" style={{ perspective: "1000px" }}>
                    <motion.div
                        animate={{
                            rotateX: stage === "processing" ? 8 : 0,
                            scale: stage === "processing" ? 0.98 : 1,
                            y: stage === "processing" ? 10 : 0
                        }}
                        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                        className="w-full h-full bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col"
                    >
                        {/* Window Controls (Mac style) */}
                        <div className="h-14 border-b border-slate-800/50 flex items-center justify-between px-6 bg-slate-900/50 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20" />
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-widest">
                                <activeMode.icon className="w-3 h-3" />
                                {activeMode.name} Mode
                            </div>
                            <div className="w-16" /> {/* Spacer */}
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 relative p-8 md:p-12 flex flex-col items-center justify-center overflow-hidden">

                            <AnimatePresence mode="wait">

                                {/* STAGE 1: RECORDING */}
                                {stage === "recording" && (
                                    <motion.div
                                        key="recording"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                        className="flex flex-col items-center gap-8 max-w-2xl w-full"
                                    >
                                        {/* Animated Waveform - Controlled by isSpeaking */}
                                        <div className="h-32 flex items-center justify-center gap-2 min-h-[120px]">
                                            {[...Array(15)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    variants={{
                                                        speaking: {
                                                            height: [20, Math.random() * 80 + 30, 20],
                                                            opacity: 1,
                                                            transition: {
                                                                repeat: Infinity,
                                                                duration: 0.4 + Math.random() * 0.2,
                                                                delay: i * 0.05,
                                                                ease: "easeInOut"
                                                            }
                                                        },
                                                        silent: {
                                                            height: 10,
                                                            opacity: 0.3,
                                                            transition: { duration: 0.3 }
                                                        }
                                                    }}
                                                    animate={isSpeaking ? "speaking" : "silent"}
                                                    style={{ backgroundColor: getUserHex(activeMode.color) }}
                                                    className="w-3 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                                />
                                            ))}
                                        </div>

                                        <div className="text-3xl md:text-4xl font-light text-slate-300 text-center leading-normal">
                                            "{transcript}<span className={cn("inline-block w-1 bg-current h-[1em] translate-y-[2px] ml-1", isSpeaking ? "animate-pulse" : "opacity-0")} />"
                                        </div>
                                    </motion.div>
                                )}

                                {/* STAGE 2: PROCESSING (The "Click") */}
                                {stage === "processing" && (
                                    <motion.div
                                        key="processing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                                        className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                                    >
                                        {/* Action Card */}
                                        <motion.div
                                            initial={{ scale: 0.8, y: 40, opacity: 0 }}
                                            animate={{ scale: 1, y: 0, opacity: 1 }}
                                            className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-2xl min-w-[300px] relative overflow-hidden group"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                                            {/* Simulated Cursor Click */}
                                            <motion.div
                                                initial={{ x: 100, y: 100, opacity: 0 }}
                                                animate={{
                                                    x: 0,
                                                    y: 0,
                                                    opacity: 1,
                                                    scale: [1, 1, 0.8, 1] // Click animation
                                                }}
                                                transition={{ duration: 1, times: [0, 0.4, 0.5, 1] }}
                                                className="absolute bottom-4 right-4 z-50 text-white drop-shadow-lg"
                                            >
                                                <MousePointer2 className="w-8 h-8 fill-black stroke-white" />
                                            </motion.div>

                                            <div className="flex items-center gap-4 mb-4">
                                                <div className={cn("p-3 rounded-xl bg-slate-900/50", getUserColorText(activeMode.color))}>
                                                    <activeMode.processIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-slate-400 font-medium">{activeMode.actionLabel || "Processing..."}</div>
                                                    <div className="text-white font-semibold">{activeMode.name}</div>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: "0%" }}
                                                        animate={{ width: "100%" }}
                                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                                        className={cn("h-full", getUserBgColor(activeMode.color))}
                                                    />
                                                </div>
                                                <div className="mt-2 flex justify-between text-xs text-slate-500">
                                                    <span>Input</span>
                                                    <span>AI Process</span>
                                                </div>
                                            </div>

                                            {/* Ripple effect on click (simulated) */}
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: [0, 0.5, 0], scale: 2 }}
                                                transition={{ delay: 0.5, duration: 0.6 }}
                                                className={cn("absolute bottom-4 right-4 w-12 h-12 rounded-full -translate-x-1/2 translate-y-1/2", getUserBgColor(activeMode.color))}
                                            />
                                        </motion.div>
                                    </motion.div>
                                )}

                                {/* STAGE 3: RESULT */}
                                {stage === "result" && (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, filter: "blur(10px)" }}
                                        animate={{ opacity: 1, filter: "blur(0px)" }}
                                        className="w-full h-full flex justify-center items-center px-4 overflow-hidden"
                                    >
                                        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden max-w-3xl w-full shadow-2xl relative h-full flex flex-col">
                                            {/* Glow effect */}
                                            <div className={cn("absolute top-0 left-0 w-1 h-full", getUserBgColor(activeMode.color))} />

                                            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                                                <div className="flex items-center gap-2 mb-4 sticky top-0 bg-slate-900/50 backdrop-blur-sm py-2">
                                                    <div className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-2", getUserColorText(activeMode.color))}>
                                                        <activeMode.icon className="w-3 h-3" />
                                                        {activeMode.name} Output
                                                    </div>
                                                </div>
                                                <div className="font-mono text-sm md:text-base text-slate-200 whitespace-pre-wrap leading-relaxed pb-8">
                                                    {resultText}
                                                    <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                            </AnimatePresence>

                        </div>
                    </motion.div>

                    {/* Floor Reflection */}
                    <div className="absolute -bottom-16 left-12 right-12 h-16 bg-gradient-to-t from-transparent to-slate-900/80 blur-2xl transform scale-y-[-1] opacity-40 pointer-events-none" />
                </div>
            </div>
        </section>
    );
};

// Helper to handle color mapping roughly
function getModeColor(color: string) {
    if (color === 'violet') return 'rgba(139, 92, 246, 0.1)';
    if (color === 'blue') return 'rgba(59, 130, 246, 0.1)';
    if (color === 'green') return 'rgba(34, 197, 94, 0.1)';
    if (color === 'orange') return 'rgba(249, 115, 22, 0.1)';
    if (color === 'yellow') return 'rgba(234, 179, 8, 0.1)';
    if (color === 'pink') return 'rgba(236, 72, 153, 0.1)';
    if (color === 'indigo') return 'rgba(99, 102, 241, 0.1)';
    if (color === 'cyan') return 'rgba(6, 182, 212, 0.1)';
    if (color === 'rose') return 'rgba(244, 63, 94, 0.1)';
    return 'rgba(148, 163, 184, 0.1)';
}

function getUserColorText(color: string) {
    if (color === 'violet') return 'text-violet-400';
    if (color === 'blue') return 'text-blue-400';
    if (color === 'green') return 'text-green-400';
    if (color === 'orange') return 'text-orange-400';
    if (color === 'yellow') return 'text-yellow-400';
    if (color === 'pink') return 'text-pink-400';
    if (color === 'indigo') return 'text-indigo-400';
    if (color === 'cyan') return 'text-cyan-400';
    if (color === 'rose') return 'text-rose-400';
    return 'text-slate-400';
}

function getUserBgColor(color: string) {
    if (color === 'violet') return 'bg-violet-500';
    if (color === 'blue') return 'bg-blue-500';
    if (color === 'green') return 'bg-green-500';
    if (color === 'orange') return 'bg-orange-500';
    if (color === 'yellow') return 'bg-yellow-500';
    if (color === 'pink') return 'bg-pink-500';
    if (color === 'indigo') return 'bg-indigo-500';
    if (color === 'cyan') return 'bg-cyan-500';
    if (color === 'rose') return 'bg-rose-500';
    return 'bg-slate-500';
}

function isActiveColor(color: string, index: number) {
    // Returns an array of colors for the wave
    const base = getUserHex(color);
    return [base, "#ffffff", base];
}

function getUserHex(color: string) {
    if (color === 'violet') return '#8b5cf6';
    if (color === 'blue') return '#3b82f6';
    if (color === 'green') return '#22c55e';
    if (color === 'orange') return '#f97316';
    if (color === 'yellow') return '#eab308';
    if (color === 'pink') return '#ec4899';
    if (color === 'indigo') return '#6366f1';
    if (color === 'cyan') return '#06b6d4';
    if (color === 'rose') return '#f43f5e';
    return '#94a3b8';
}
