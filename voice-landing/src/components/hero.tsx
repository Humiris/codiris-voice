"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Play, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-[#f8fafc]">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/20 blur-[120px] rounded-full" />
      </div>

      {/* Decorative Floating Text - Static for performance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
        <div className="whitespace-nowrap text-7xl font-serif italic text-blue-900/5 absolute -top-10 -left-20 rotate-[-5deg]">
          "I'll be there in five minutes" • "Let's schedule a meeting"
        </div>
        <div className="whitespace-nowrap text-7xl font-serif italic text-blue-900/5 absolute -bottom-10 -right-20 rotate-[5deg]">
          "Happy birthday!" • "See you at the conference"
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl md:text-[8rem] font-serif text-slate-900 leading-[0.85] mb-10 tracking-tight"
        >
          Speak your mind, <br />
          <span className="italic font-normal text-blue-600 relative">
            we'll do the rest
            <svg className="absolute -bottom-2 left-0 w-full h-4 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
            </svg>
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-12 font-sans leading-relaxed"
        >
          Turn messy thoughts into polished prose, instantly. The fastest way to write is to speak.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/voice">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 md:px-10 md:py-8 text-lg md:text-xl font-semibold transition-all duration-300 shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95"
              >
                <Play className="w-5 h-5 md:w-6 md:h-6 mr-3 fill-current" />
                Try Codiris Voice
              </Button>
            </Link>
            <Link href="https://github.com/Humiris/codiris-voice/releases/latest">
              <Button
                variant="outline"
                className="border-slate-200 bg-white text-slate-900 rounded-full px-8 py-6 md:px-10 md:py-8 text-lg md:text-xl font-semibold transition-all duration-300 hover:bg-slate-50 hover:scale-105 active:scale-95 shadow-sm"
              >
                <img src="https://cdn-icons-png.flaticon.com/512/15/15476.png" alt="Apple" className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                Download for macOS
              </Button>
            </Link>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white">
                +2k
              </div>
            </div>
            <p className="text-slate-500 text-sm md:text-base font-medium">
              Trusted by <span className="text-slate-900 font-bold">2,000+</span> professionals worldwide
            </p>
          </div>
        </motion.div>

        {/* Waveform Indicator */}
        <div className="mt-20 flex justify-center items-center gap-1.5 md:gap-2 h-16 md:h-20">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                height: [15, Math.random() * 60 + 15, 15],
                opacity: [0.3, 0.6, 0.3],
                backgroundColor: ["#2563eb", "#60a5fa", "#2563eb"]
              }}
              transition={{ 
                duration: 1 + Math.random(), 
                repeat: Infinity, 
                delay: i * 0.02,
                ease: "easeInOut"
              }}
              className="w-1.5 md:w-2 bg-blue-600 rounded-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
};
