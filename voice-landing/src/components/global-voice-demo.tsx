"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalVoiceDemo() {
    const [isOptionHeld, setIsOptionHeld] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [audioLevels, setAudioLevels] = useState<number[]>([0.15, 0.15, 0.15, 0.15, 0.15, 0.15]);
    const recognitionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);
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
                    let currentTranscript = '';
                    for (let i = 0; i < event.results.length; i++) {
                        currentTranscript += event.results[i][0].transcript;
                    }
                    setTranscript(currentTranscript);
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.log('Speech recognition error:', event.error);
                };
            }
        }
    }, []);

    // Audio visualization
    const startAudioVisualization = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            analyserRef.current.fftSize = 32;

            const updateLevels = () => {
                if (!analyserRef.current) return;
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(dataArray);

                const levels = Array.from({ length: 6 }, (_, i) => {
                    const value = dataArray[i * 2] / 255;
                    return Math.max(0.15, value);
                });
                setAudioLevels(levels);
                animationRef.current = requestAnimationFrame(updateLevels);
            };
            updateLevels();
        } catch (err) {
            console.log('Audio visualization error:', err);
        }
    };

    const stopAudioVisualization = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setAudioLevels([0.15, 0.15, 0.15, 0.15, 0.15, 0.15]);
    };

    // Option key Interaction
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if editing
            if (isEditing) return;

            if (e.key === "Alt" && !e.repeat && !isOptionHeld) {
                setIsOptionHeld(true);
                setTranscript("");
                e.preventDefault();

                // Start recording
                if (recognitionRef.current) {
                    try {
                        recognitionRef.current.start();
                    } catch (err) {
                        // Already started
                    }
                }
                startAudioVisualization();
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
                stopAudioVisualization();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            stopAudioVisualization();
        };
    }, [isOptionHeld, isEditing]);

    // Focus input when editing
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleBarClick = () => {
        if (!isOptionHeld) {
            setIsEditing(true);
        }
    };

    const handleInputBlur = () => {
        setIsEditing(false);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsEditing(false);
        }
    };

    return (
        <>
            {/* Floating bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999]">
                {/* Editable text area above the bar */}
                <AnimatePresence>
                    {(isEditing || transcript) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[500px] max-w-[90vw]"
                        >
                            <div
                                className={`bg-black/95 backdrop-blur-xl border rounded-xl p-4 shadow-2xl transition-colors ${
                                    isEditing ? "border-blue-500/50 ring-1 ring-blue-500/30" : "border-white/10"
                                }`}
                            >
                                {isEditing ? (
                                    <textarea
                                        ref={inputRef}
                                        value={transcript}
                                        onChange={(e) => setTranscript(e.target.value)}
                                        onBlur={handleInputBlur}
                                        onKeyDown={handleInputKeyDown}
                                        placeholder="Type here to test the demo..."
                                        className="w-full bg-transparent text-white text-sm leading-relaxed resize-none outline-none min-h-[60px] placeholder-slate-500"
                                        rows={3}
                                    />
                                ) : (
                                    <p
                                        onClick={() => setIsEditing(true)}
                                        className="text-white text-sm leading-relaxed cursor-text hover:text-blue-300 transition-colors"
                                    >
                                        {transcript}
                                    </p>
                                )}
                                {isEditing && (
                                    <p className="text-slate-500 text-xs mt-2">
                                        Press Esc to close or click outside
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* The floating bar itself */}
                <motion.div
                    onClick={handleBarClick}
                    animate={{
                        backgroundColor: isOptionHeld ? "rgba(10, 10, 12, 0.98)" : "rgba(10, 10, 12, 0.95)",
                    }}
                    className={`flex items-center gap-3 px-4 py-2 rounded-full border shadow-2xl backdrop-blur-xl cursor-pointer transition-all hover:border-white/20 ${
                        isOptionHeld ? "border-blue-500/30" : "border-white/10"
                    }`}
                    style={{ minWidth: "140px" }}
                >
                    {/* Mode label */}
                    <span className={`text-xs font-medium transition-colors ${isOptionHeld ? "text-blue-400" : "text-slate-400"}`}>
                        {isOptionHeld ? "Recording" : "Clean"}
                    </span>

                    {/* Waveform bars */}
                    <div className="flex items-center gap-0.5 h-5">
                        {audioLevels.map((level, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    height: isOptionHeld ? `${level * 20}px` : "3px",
                                }}
                                transition={{ duration: 0.05 }}
                                className={`w-0.5 rounded-full ${isOptionHeld ? "bg-blue-400" : "bg-slate-500"}`}
                                style={{ minHeight: "3px" }}
                            />
                        ))}
                    </div>

                    {/* Stop button when recording */}
                    <AnimatePresence>
                        {isOptionHeld && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="w-3 h-3 bg-red-500 rounded-sm"
                            />
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Hint text */}
                <AnimatePresence>
                    {!isOptionHeld && !isEditing && !transcript && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-slate-500 text-xs whitespace-nowrap"
                        >
                            Hold <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Option</span> to record or <span className="text-blue-400 cursor-pointer" onClick={() => setIsEditing(true)}>click to type</span>
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
