"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mic, Sparkles, Command,
    Hash, MessageSquare, Code2, FileText,
    Send, Play, CornerDownLeft, X, Minus, Square
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

const SlackLogo = ({ className }: { className?: string }) => (
    <img src="/slack.svg" alt="Slack" className={cn("object-contain", className)} />
);

const CursorLogo = ({ className }: { className?: string }) => (
    <img src="/cursor.svg" alt="Cursor" className={cn("object-contain", className)} />
);

const NotionLogo = ({ className }: { className?: string }) => (
    <img src="/notion.svg" alt="Notion" className={cn("object-contain", className)} />
);

type AppId = "slack" | "vscode" | "notion";

type AppConfig = {
    id: AppId;
    name: string;
    icon: any;
    color: string;
    description: string;
    prompt: string; // The voice command simulation
    typingContent: string; // The result typing
};

const APPS: AppConfig[] = [
    {
        id: "slack",
        name: "Slack",
        icon: SlackLogo,
        color: "#E01E5A",
        description: "Drafting messages",
        prompt: "Tell the design team the new mockups look fantastic but we need to adjust the contrast on the dark mode buttons.",
        typingContent: "Hey @design-team! 🎨\n\nThe new mockups are looking fantastic! Great work on the layout.\n\nCould we just tweak the contrast on the dark mode buttons? They're getting a bit lost against the background.\n\nThanks!",
    },
    {
        id: "vscode",
        name: "Cursor",
        icon: CursorLogo,
        color: "#007ACC",
        description: "Writing code",
        prompt: "Create a React component for a floating action button with a ripple effect using Framer Motion.",
        typingContent: "export const FloatingButton = () => {\n  return (\n    <motion.button\n      whileTap={{ scale: 0.95 }}\n      className=\"absolute botoom-4 right-4 bg-blue-500 rounded-full p-4 shadow-lg\"\n    >\n      <Plus className=\"w-6 h-6 text-white\" />\n    </motion.button>\n  );\n};",
    },
    {
        id: "notion",
        name: "Notion",
        icon: NotionLogo,
        color: "#000000",
        description: "Meeting notes",
        prompt: "Summarize the key decisions from the marketing sync about the Q3 launch strategy.",
        typingContent: "# Q3 Launch Strategy Sync\n\n**Key Decisions:**\n- Launch date set for October 15th\n- Primary channel: YouTube & Twitter\n- Budget approved: $50k\n\n**Action Items:**\n-[ ] Finalize ad copy by Friday\n-[ ] Brief influencers",
    }
];

export const VoiceProcessVisualization = () => {
    const [activeApp, setActiveApp] = useState<AppConfig>(APPS[0]);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [outputText, setOutputText] = useState("");

    // Auto-play demo logic
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        // Reset state when app changes
        setTranscript("");
        setOutputText("");
        setIsRecording(false);

        // DELAY START
        timeout = setTimeout(() => {
            handleStartRecording();
        }, 1000);

        return () => clearTimeout(timeout);
    }, [activeApp]);


    const handleStartRecording = () => {
        setIsRecording(true);
        const text = activeApp.prompt;
        let i = 0;

        const interval = setInterval(() => {
            setTranscript(text.substring(0, i + 1));
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                // FINISHED RECORDING 
                setTimeout(() => {
                    setIsRecording(false);
                    // START TYPING RESULT
                    handleTypingResult();
                }, 800);
            }
        }, 30); // Speed of "Speech"
    };

    const handleTypingResult = () => {
        const text = activeApp.typingContent;
        let i = 0;
        const interval = setInterval(() => {
            setOutputText(text.substring(0, i + 1));
            i++;
            if (i >= text.length) {
                clearInterval(interval);
            }
        }, 10); // Speed of "Result"
    };

    return (
        <section className="py-24 bg-black overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,41,59,0.5),rgba(0,0,0,1))] -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Use it <span className="text-blue-500">Everywhere</span>.
                    </h2>
                    <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                        Codiris floats above your apps, ready to transform your voice into action. Works seamlessly with your favorite tools.
                    </p>
                </div>

                {/* MACBOOK MOCKUP CONTAINER */}
                <div className="relative w-full max-w-5xl mx-auto aspect-[16/10] bg-[#0d0d0d] rounded-[2rem] border-[8px] border-[#1a1a1a] shadow-2xl overflow-hidden ring-1 ring-white/10">

                    {/* CAMERA NOTCH (Visual) */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-[#1a1a1a] rounded-b-xl z-50 flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0d0d0d]/50" />
                        <div className="w-1 h-1 rounded-full bg-blue-500/20" />
                    </div>

                    {/* DESKTOP BACKGROUND */}
                    <div className="absolute inset-0 bg-slate-900/50 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-50" />

                    {/* APP WINDOW */}
                    <div className="absolute inset-4 md:inset-12 bottom-24 bg-[#1E1E1E] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-white/5 transition-all duration-500">
                        {/* Window Title Bar */}
                        <div className="h-10 bg-[#252526] flex items-center px-4 gap-2 border-b border-black/20 shrink-0">
                            <div className="flex gap-2 group">
                                <div className="w-3 h-3 rounded-full bg-[#FF5F56] group-hover:brightness-90 transition-all cursor-pointer" />
                                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] group-hover:brightness-90 transition-all cursor-pointer" />
                                <div className="w-3 h-3 rounded-full bg-[#27C93F] group-hover:brightness-90 transition-all cursor-pointer" />
                            </div>
                            <div className="flex-1 text-center text-xs text-slate-500 font-medium ml-[-50px]">
                                {activeApp.name}
                            </div>
                        </div>

                        {/* APP CONTENT AREA */}
                        <div className="flex-1 relative overflow-hidden bg-[#1E1E1E]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeApp.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-0"
                                >
                                    {activeApp.id === 'slack' && <SlackMockup content={outputText} />}
                                    {activeApp.id === 'vscode' && <VSCodeMockup content={outputText} />}
                                    {activeApp.id === 'notion' && <NotionMockup content={outputText} />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* FLOATING BAR (THE PRODUCT) */}
                    <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
                        <motion.div
                            layout
                            className={cn(
                                "relative overflow-hidden cursor-pointer", // REMOVED CSS transitions which conflict with layout animation
                                isRecording
                                    ? "bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
                                    : "bg-[#1f1f1f] border border-white/10 rounded-full shadow-2xl hover:border-white/20"
                            )}
                            animate={{
                                width: isRecording ? 420 : 170,
                                height: isRecording ? 100 : 44,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 30
                            }}
                            onClick={() => {
                                if (!isRecording) handleStartRecording();
                            }}
                        >
                            <AnimatePresence mode="wait">
                                {/* IDLE STATE: Super Prompt Pill */}
                                {!isRecording ? (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center justify-between px-4 h-full w-full"
                                    >
                                        <span className="text-slate-200 font-medium text-xs">Super Prompt</span>
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="w-1 h-1 rounded-full bg-slate-500" />
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* EXPANDED (RECORDING) STATE */
                                    <motion.div
                                        key="recording"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute inset-0 p-5 flex flex-col justify-between"
                                    >
                                        {/* Transcript area */}
                                        <div className="text-sm font-medium text-white leading-snug line-clamp-2 pr-8">
                                            {transcript || <span className="text-slate-400">Listening...</span>}
                                        </div>

                                        {/* Bottom Row: Waveform + Stop */}
                                        <div className="flex items-center justify-between mt-auto">
                                            {/* Waveform */}
                                            <div className="flex items-center gap-1 h-4">
                                                {[...Array(12)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{
                                                            height: [4, Math.random() * 16 + 4, 4],
                                                        }}
                                                        transition={{
                                                            duration: 0.4,
                                                            repeat: Infinity,
                                                            delay: i * 0.05,
                                                            ease: "easeInOut"
                                                        }}
                                                        className="w-1 rounded-full bg-blue-500"
                                                    />
                                                ))}
                                            </div>

                                            {/* Stop Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsRecording(false);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-colors"
                                            >
                                                <Square className="w-3 h-3 fill-current" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* DOCK */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-3 bg-white/10 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center gap-4 z-40 transition-transform duration-300 hover:scale-105">
                        {APPS.map((app) => (
                            <button
                                key={app.id}
                                onClick={() => setActiveApp(app)}
                                className="group relative flex flex-col items-center gap-1"
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden",
                                    activeApp.id === app.id
                                        ? "bg-white text-black shadow-lg scale-110 -translate-y-2"
                                        : "bg-white/5 text-white hover:bg-white/10 hover:scale-105"
                                )}>
                                    {/* Updated to just render the icon component, which is now an image */}
                                    <app.icon className="w-full h-full object-cover" />
                                </div>
                                <div className={cn(
                                    "w-1 h-1 rounded-full bg-white transition-opacity duration-300",
                                    activeApp.id === app.id ? "opacity-100" : "opacity-0"
                                )} />

                                {/* Tooltip */}
                                <span className="absolute -top-10 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                                    {app.name}
                                </span>
                            </button>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

// --- MOCKUP COMPONENTS ---

const SlackMockup = ({ content }: { content: string }) => (
    <div className="flex h-full w-full">
        {/* Sidebar */}
        <div className="w-[60px] md:w-[240px] border-r border-white/5 bg-[#19171D] flex flex-col shrink-0">
            <div className="p-4 border-b border-white/5 font-bold text-white hidden md:block">Acme Corp v</div>
            <div className="flex-1 p-2 space-y-1">
                <div className="flex items-center gap-2 p-2 rounded bg-[#27242C] text-slate-100">
                    <Hash className="w-4 h-4 text-slate-400" />
                    <span className="hidden md:inline text-sm">design-team</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded text-slate-400 hover:bg-[#27242C]/50">
                    <Hash className="w-4 h-4" />
                    <span className="hidden md:inline text-sm">general</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded text-slate-400 hover:bg-[#27242C]/50">
                    <Hash className="w-4 h-4" />
                    <span className="hidden md:inline text-sm">announcements</span>
                </div>
            </div>
        </div>
        {/* Main Chat */}
        <div className="flex-1 flex flex-col bg-[#1A1D21]">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="font-bold text-white flex items-center gap-2">
                    <Hash className="w-5 h-5 text-slate-400" /> design-team
                </div>
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Fake History */}
                <div className="flex gap-4 opacity-50">
                    <img src="/alex-rivera.png" alt="Sarah" className="w-10 h-10 rounded object-cover shrink-0" />
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-slate-200">Sarah Design</span>
                            <span className="text-xs text-slate-500">10:42 AM</span>
                        </div>
                        <p className="text-slate-400 text-sm mt-1">Uploaded the figma files!</p>
                    </div>
                </div>
            </div>
            {/* Input Area */}
            <div className="p-4 pt-0">
                <div className="border border-white/20 rounded-xl bg-[#222529] overflow-hidden min-h-[100px] relative transition-all duration-200 focus-within:border-slate-500">
                    <div className="p-3 text-slate-200 text-sm whitespace-pre-wrap">{content}</div>

                    {content.length === 0 && (
                        <div className="absolute top-3 left-3 text-slate-500 text-sm">Message #design-team</div>
                    )}

                    <div className="absolute bottom-0 w-full h-10 bg-[#222529] border-t border-white/5 flex items-center justify-between px-2">
                        <div className="flex gap-2">
                            <div className="p-1.5 hover:bg-white/5 rounded"><Sparkles className="w-4 h-4 text-slate-400" /></div>
                        </div>
                        <div className={cn("p-1.5 rounded transition-colors", content.length > 0 ? "bg-[#007a5a] text-white" : "bg-transparent text-slate-600")}>
                            <Send className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const VSCodeMockup = ({ content }: { content: string }) => (
    <div className="flex h-full w-full bg-[#1E1E1E] text-sm font-mono text-[#d4d4d4]">
        {/* Sidebar */}
        <div className="w-12 border-r border-white/5 flex flex-col items-center py-4 gap-4 shrink-0">
            <FileText className="w-6 h-6 text-slate-400" />
            <Command className="w-6 h-6 text-slate-600" />
            <div className="flex-1" />
        </div>
        {/* Explorer */}
        <div className="w-48 border-r border-[#2b2b2b] bg-[#252526] p-2 hidden md:block shrink-0">
            <div className="text-xs font-bold text-slate-400 mb-2 pl-2">EXPLORER</div>
            <div className="pl-2 py-1 bg-[#37373d] text-white flex items-center gap-2 rounded-sm cursor-pointer">
                <span className="text-blue-400 text-xs">TSX</span> FloatingButton.tsx
            </div>
            <div className="pl-2 py-1 text-slate-500 flex items-center gap-2">
                <span className="text-yellow-400 text-xs">CSS</span> style.css
            </div>
        </div>
        {/* Code Area */}
        <div className="flex-1 flex flex-col">
            <div className="h-9 bg-[#1E1E1E] flex items-center border-b border-[#2b2b2b]">
                <div className="px-4 py-2 bg-[#1E1E1E] border-t-2 border-blue-500 text-white flex items-center gap-2">
                    <span className="text-blue-400 text-xs">TSX</span> FloatingButton.tsx
                    <X className="w-3 h-3 ml-2 text-slate-500 hover:text-white" />
                </div>
            </div>
            <div className="flex-1 p-4 overflow-auto">
                <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                    {content || <span className="opacity-50">// Start speaking to generate code...</span>}
                    <span className="inline-block w-2 h-4 bg-white animate-pulse align-middle ml-1" />
                </pre>
            </div>
        </div>
    </div>
);

const NotionMockup = ({ content }: { content: string }) => (
    <div className="flex h-full w-full bg-white text-[#37352f]">
        {/* Sidebar */}
        <div className="w-[0px] md:w-[200px] bg-[#F7F7F5] border-r border-[#E9E9E7] flex flex-col shrink-0 overflow-hidden">
            <div className="p-4 flex items-center gap-2 font-medium text-sm">
                <div className="w-5 h-5 rounded bg-orange-400 flex items-center justify-center text-[10px] text-white">M</div>
                Marketing
            </div>
            <div className="px-3 py-1 space-y-1">
                <div className="px-2 py-1 bg-[#E9E9E7] rounded text-sm font-medium text-[#37352f] flex items-center gap-2">
                    <span className="text-lg">📄</span> Q3 Strategy
                </div>
                <div className="px-2 py-1 rounded text-sm text-[#5f5e5b] flex items-center gap-2 hover:bg-[#E9E9E7]">
                    <span className="text-lg">📅</span> Content Cal
                </div>
            </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col p-8 md:p-12 overflow-y-auto">
            {/* Cover */}
            <div className="h-32 bg-gradient-to-r from-red-100 to-orange-100 rounded-t-xl -mt-12 -mx-12 mb-8 opacity-50" />

            <h1 className="text-4xl font-bold mb-8 text-[#37352f]">Q3 Launch Strategy Sync</h1>

            <div className="pl-4 border-l-2 border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">@Meeting Notes</span>
                    <span>October 12, 2025</span>
                </div>
            </div>

            <div className="whitespace-pre-wrap leading-relaxed text-[#37352f] font-sans">
                {content}
                {content.length === 0 && <span className="text-slate-300">Type '/' for commands or ask Codiris...</span>}
            </div>
        </div>
    </div>
);
