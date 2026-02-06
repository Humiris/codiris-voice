"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    Code, Terminal, FileText, MessageSquare,
    Mic, Command, ExternalLink, Image as ImageIcon,
    Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

// Define types for visual components
interface VisualProps {
    transcript: string;
    isRecording: boolean;
}

const USE_CASES = [
    {
        id: "coding",
        category: "Coding & Prompting",
        title: "Prompt faster with your voice",
        description: "Speak your ideas into existence with ease. Codiris understands syntax, libraries, and frameworks as you speak.",
        apps: [
            { name: "VS Code", icon: Code },
            { name: "Cursor", icon: Terminal },
            { name: "Zed", icon: Command },
        ],
        defaultText: "Can you modify the ToDoList to use Zustand instead of local state? And add a dark mode toggle.",
    },
    {
        id: "agents",
        category: "Prompt at the speed of thought",
        title: "Interact with AI Agents naturally",
        description: "Codiris turns natural, rambling speech into precise prompts — letting you build faster without stopping to edit your thoughts.",
        apps: [
            { name: "ChatGPT", icon: MessageSquare },
            { name: "Claude", icon: Bot },
        ],
        defaultText: "Research the latest trends in Japanese font design and summarize for the styling guide.",
    },
    {
        id: "docs",
        category: "Work docs at the speed of voice",
        title: "Write as fast as you imagine",
        description: "From project briefs to proposals, skip the keyboard and let Codiris draft clear, detailed documents — faster and with less effort.",
        apps: [
            { name: "Notion", icon: FileText },
            { name: "Google Docs", icon: FileText },
            { name: "Word", icon: FileText },
        ],
        defaultText: "Please share initial wireframes by next Tuesday so we can align before copywriting begins.",
    },
];

export const UseCasesCarousel = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isOptionHeld, setIsOptionHeld] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [recordingTime, setRecordingTime] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const recognitionRef = useRef<any>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event: any) => {
                    let interimTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const result = event.results[i];
                        if (result.isFinal) {
                            setTranscript(prev => prev + result[0].transcript + ' ');
                        } else {
                            interimTranscript += result[0].transcript;
                        }
                    }
                    if (interimTranscript) {
                        setTranscript(prev => {
                            const base = prev.split('...')[0];
                            return base + interimTranscript;
                        });
                    }
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.log('Speech recognition error:', event.error);
                };
            }
        }
    }, []);

    // Option key Interaction - Start/Stop Recording
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't start recording if editing
            if (isEditing) return;

            if (e.key === "Alt" && !e.repeat && !isOptionHeld) {
                setIsOptionHeld(true);
                setTranscript("");
                setRecordingTime(0);
                e.preventDefault();

                // Start recording
                if (recognitionRef.current) {
                    try {
                        recognitionRef.current.start();
                    } catch (err) {
                        // Already started
                    }
                }

                // Start timer
                timerRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Alt") {
                setIsOptionHeld(false);

                // Stop recording
                if (recognitionRef.current) {
                    try {
                        recognitionRef.current.stop();
                    } catch (err) {
                        // Already stopped
                    }
                }

                // Stop timer
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isOptionHeld, isEditing]);

    return (
        <section className="py-24 bg-black text-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12" />

            {/* Carousel Container */}
            <div
                className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-4 sm:px-8 lg:px-32 pb-12 scrollbar-hide"
                ref={scrollContainerRef}
            >
                {USE_CASES.map((useCase) => (
                    <div
                        key={useCase.id}
                        className="flex-shrink-0 w-full md:w-[85vw] lg:w-[1000px] snap-center"
                    >
                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

                            {/* Left Content (Text) */}
                            <div className="order-2 lg:order-1 max-w-lg">
                                <div className="text-slate-500 font-medium mb-4 flex items-center gap-2">
                                    {useCase.category}
                                </div>
                                <h3 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
                                    {useCase.title}
                                </h3>
                                <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                                    {useCase.description}
                                </p>

                                {/* Visualizer interaction hint */}
                                <div className="mb-8 flex items-center gap-3">
                                    <div className={cn(
                                        "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors duration-200",
                                        isOptionHeld
                                            ? "bg-blue-500 text-white border-blue-500 animate-pulse"
                                            : "bg-slate-900 text-slate-400 border-slate-700"
                                    )}>
                                        {isOptionHeld ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                Recording... {recordingTime}s
                                            </span>
                                        ) : (
                                            <>Hold <span className="font-bold font-mono mx-1">Option</span> and try yourself</>
                                        )}
                                    </div>
                                </div>

                                {/* Designed For Icons */}
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-600 font-medium mr-2">Designed for</span>
                                    <div className="flex gap-2">
                                        {useCase.apps.map((app) => (
                                            <div key={app.name} className="p-2 bg-slate-900 rounded-md border border-slate-800" title={app.name}>
                                                <app.icon className="w-4 h-4 text-slate-400" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Content (Visual Card) */}
                            <div className="order-1 lg:order-2">
                                <VisualCardWrapper isOptionHeld={isOptionHeld}>
                                    {useCase.id === "coding" && (
                                        <CodingVisual
                                            transcript={transcript || useCase.defaultText}
                                            isRecording={isOptionHeld}
                                        />
                                    )}
                                    {useCase.id === "agents" && (
                                        <AgentVisual
                                            transcript={transcript || useCase.defaultText}
                                            isRecording={isOptionHeld}
                                            recordingTime={recordingTime}
                                            isEditing={isEditing}
                                            setIsEditing={setIsEditing}
                                            setTranscript={setTranscript}
                                            inputRef={inputRef}
                                        />
                                    )}
                                    {useCase.id === "docs" && (
                                        <DocsVisual
                                            transcript={transcript || useCase.defaultText}
                                            isRecording={isOptionHeld}
                                        />
                                    )}
                                </VisualCardWrapper>
                            </div>

                        </div>
                    </div>
                ))}
                {/* Spacer at the end */}
                <div className="w-8 flex-shrink-0" />
            </div>

        </section>
    );
};

// -- VISUAL COMPONENTS --

function VisualCardWrapper({ children, isOptionHeld }: { children: React.ReactNode, isOptionHeld: boolean }) {
    return (
        <div className={cn(
            "relative rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/10 aspect-[4/3] lg:aspect-square xl:aspect-[4/3] shadow-2xl transition-all duration-500",
            isOptionHeld ? "ring-2 ring-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.2)]" : ""
        )}>
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full h-full p-6 md:p-10 flex flex-col">
                {children}
            </div>
        </div>
    );
}

function CodingVisual({ transcript, isRecording }: VisualProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                </div>
                <div className="text-xs text-slate-500 font-mono">MyComponent.tsx</div>
            </div>

            {/* Code Editor Mock */}
            <div className="flex-1 font-mono text-xs md:text-sm text-slate-400 space-y-1.5 leading-relaxed overflow-hidden">
                <p><span className="text-purple-400">import</span> <span className="text-blue-400">{`{ useState, useEffect }`}</span> <span className="text-purple-400">from</span> <span className="text-green-400">'react'</span>;</p>
                <p className="h-4" />
                <p><span className="text-purple-400">export const</span> <span className="text-yellow-400">TodoList</span> = () <span className="text-purple-400">{`=>`}</span> {'{'}</p>
                <p className="pl-4"><span className="text-slate-500">// TODO: Add state management</span></p>
                <p className="pl-4"><span className="text-purple-400">const</span> [items, setItems] = <span className="text-blue-400">useState</span>([]);</p>
                <p className="h-4" />
                <p className="pl-4"><span className="text-purple-400">return</span> (</p>
                <p className="pl-8"><span className="text-blue-300">{'<div'}</span> <span className="text-green-300">className</span>=<span className="text-green-400">"p-4"</span><span className="text-blue-300">{'>'}</span></p>
                <p className="pl-12"><span className="text-blue-300">{'<h1'}</span><span className="text-blue-300">{'>'}</span>My Tasks<span className="text-blue-300">{'</h1>'}</span></p>
                <p className="pl-8"><span className="text-blue-300">{'</div>'}</span></p>
                <p className="pl-4">);</p>
                <p>{'}'}</p>
            </div>

            {/* Floating Prompt Bubble */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={cn(
                    "absolute bottom-8 right-8 left-8 bg-[#1e1e1e] border rounded-xl p-4 shadow-2xl transition-all",
                    isRecording ? "border-blue-500/50 ring-1 ring-blue-500/30" : "border-white/10"
                )}
            >
                <div className="flex items-center gap-2 mb-2">
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Codiris Voice</div>
                    {isRecording && (
                        <span className="flex items-center gap-1 text-xs text-blue-400">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            Live
                        </span>
                    )}
                </div>
                <div className={cn(
                    "text-lg font-medium leading-snug transition-colors",
                    isRecording ? "text-blue-400" : "text-white"
                )}>
                    "{transcript}"
                </div>
                <div className="mt-3 flex justify-end">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                        isRecording ? "bg-red-500 animate-pulse" : "bg-blue-600"
                    )}>
                        <Mic className="w-4 h-4 text-white" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

interface AgentVisualProps extends VisualProps {
    recordingTime?: number;
    isEditing?: boolean;
    setIsEditing?: (editing: boolean) => void;
    setTranscript?: (transcript: string) => void;
    inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

function AgentVisual({ transcript, isRecording, recordingTime, isEditing, setIsEditing, setTranscript, inputRef }: AgentVisualProps) {
    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef?.current) {
            inputRef.current.focus();
        }
    }, [isEditing, inputRef]);

    const handleInputClick = () => {
        if (!isRecording && setIsEditing) {
            setIsEditing(true);
        }
    };

    const handleInputBlur = () => {
        if (setIsEditing) {
            setIsEditing(false);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape" && setIsEditing) {
            setIsEditing(false);
        }
    };

    return (
        <div className="flex flex-col h-full justify-between">
            {/* Chat History Mock */}
            <div className="space-y-6 opacity-60">
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0" />
                    <div className="space-y-2">
                        <div className="h-2 w-24 bg-slate-800 rounded-full" />
                        <div className="h-2 w-64 bg-slate-800 rounded-full" />
                        <div className="h-2 w-48 bg-slate-800 rounded-full" />
                    </div>
                </div>
                <div className="flex gap-4 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex-shrink-0" />
                    <div className="space-y-2 flex flex-col items-end">
                        <div className="h-2 w-20 bg-indigo-500/20 rounded-full" />
                        <div className="h-2 w-56 bg-indigo-500/20 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Floating Input Area */}
            <div className={cn(
                "bg-[#1A1A1A] border rounded-2xl p-1 shadow-2xl mt-auto transition-all",
                isRecording ? "border-blue-500/50 ring-1 ring-blue-500/30" : isEditing ? "border-blue-500/50 ring-1 ring-blue-500/30" : "border-white/10"
            )}>
                <div className="bg-black/50 rounded-xl p-4">
                    <div className="text-slate-500 text-sm mb-4">
                        {isRecording ? "Listening..." : isEditing ? "Type your prompt..." : "Ask our agent..."}
                    </div>
                    {isEditing && setTranscript ? (
                        <textarea
                            ref={inputRef}
                            value={transcript.replace(/^"|"$/g, '')}
                            onChange={(e) => setTranscript(e.target.value)}
                            onBlur={handleInputBlur}
                            onKeyDown={handleInputKeyDown}
                            placeholder="Type here to test..."
                            className="w-full bg-transparent text-blue-400 text-xl font-medium mb-4 resize-none outline-none min-h-[60px] placeholder-slate-600"
                            rows={2}
                        />
                    ) : (
                        <div
                            onClick={handleInputClick}
                            className={cn(
                                "text-xl font-medium mb-4 transition-colors cursor-text hover:text-blue-300",
                                isRecording ? "text-blue-400" : "text-white"
                            )}
                        >
                            "{transcript}"
                        </div>
                    )}
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex gap-2">
                            <div className="p-1.5 rounded-md hover:bg-white/5"><ImageIcon className="w-4 h-4 text-slate-500" /></div>
                            <div className="p-1.5 rounded-md hover:bg-white/5"><ExternalLink className="w-4 h-4 text-slate-500" /></div>
                        </div>
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                            isRecording ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white"
                        )}>
                            <Mic className={cn("w-3 h-3", isRecording && "animate-pulse")} />
                            {isRecording ? `${recordingTime || 0}s` : "5s"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DocsVisual({ transcript, isRecording }: VisualProps) {
    return (
        <div className="h-full bg-white text-black p-8 rounded-xl shadow-inner relative overflow-hidden">
            <div className="max-w-[80%] mx-auto space-y-4">
                <div className="h-8 w-3/4 bg-slate-100 rounded-md" />
                <div className="space-y-2">
                    <div className="h-3 w-full bg-slate-100 rounded-sm" />
                    <div className="h-3 w-full bg-slate-100 rounded-sm" />
                    <div className="h-3 w-5/6 bg-slate-100 rounded-sm" />
                </div>

                <div className="pt-4 space-y-2">
                    <div className="h-4 w-1/3 bg-slate-100 rounded-md mb-2" />
                    <div className="h-3 w-full bg-slate-100 rounded-sm" />
                    <div className="h-3 w-full bg-slate-100 rounded-sm" />
                </div>
            </div>

            {/* Floating Action Overlay */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={cn(
                    "absolute inset-x-8 bottom-8 bg-black/90 text-white p-5 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all",
                    isRecording ? "border-blue-500/50 ring-1 ring-blue-500/30" : "border-white/20"
                )}
            >
                <div className="flex items-start gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-colors",
                        isRecording ? "bg-red-500 animate-pulse" : "bg-blue-600"
                    )}>
                        <Mic className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="text-slate-400 text-xs font-semibold uppercase">
                                {isRecording ? "Recording..." : "Dictation Mode"}
                            </div>
                            {isRecording && (
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </div>
                        <div className={cn(
                            "text-lg font-medium transition-colors",
                            isRecording ? "text-blue-400" : "text-white"
                        )}>
                            "{transcript}"
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
