"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative pt-40 pb-32 overflow-hidden bg-[#f5f5f7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight mb-6 tracking-tight"
        >
          Your voice,{" "}
          <span className="text-blue-600">perfected</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed"
        >
          Speak naturally, get polished text instantly. The fastest way to write emails, notes, and messages.
        </motion.p>

        {/* CTA Button - Like Cluely */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col items-center gap-6"
        >
          <Link href="/install">
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-10 py-7 text-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Get for Mac
            </Button>
          </Link>

          <p className="text-slate-500 text-sm">
            Free to try. Works on macOS 10.15+
          </p>
        </motion.div>

        {/* Product Preview Image Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 relative"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 max-w-2xl mx-auto">
            {/* Waveform visualization */}
            <div className="flex justify-center items-center gap-1 h-20 mb-6">
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [8, Math.random() * 50 + 8, 8],
                  }}
                  transition={{
                    duration: 1.5 + Math.random(),
                    repeat: Infinity,
                    delay: i * 0.03,
                    ease: "easeInOut"
                  }}
                  className="w-1 bg-blue-500 rounded-full"
                />
              ))}
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm font-medium">Speak naturally...</p>
              <p className="text-slate-900 text-lg font-medium mt-2">"Hey, can you let me know when you're free for a quick call?"</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
