"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

// Pre-written emails for waitlists
const WAITLIST_EMAIL = "support@codiris.build";

const IOS_SUBJECT = "I'd like to try Codiris Voice on iPhone!";
const IOS_BODY = `Hi!

I'd love to try Codiris Voice on my iPhone. Please add me to the iOS waitlist!

Thanks!`;

const WINDOWS_SUBJECT = "I'd like to try Codiris Voice on Windows!";
const WINDOWS_BODY = `Hi!

I'd love to try Codiris Voice on Windows. Please add me to the Windows waitlist!

Thanks!`;

const iosMailtoLink = `mailto:${WAITLIST_EMAIL}?subject=${encodeURIComponent(IOS_SUBJECT)}&body=${encodeURIComponent(IOS_BODY)}`;
const windowsMailtoLink = `mailto:${WAITLIST_EMAIL}?subject=${encodeURIComponent(WINDOWS_SUBJECT)}&body=${encodeURIComponent(WINDOWS_BODY)}`;

// Pre-computed waveform heights to avoid hydration mismatch
const waveformBars = [
  { height: 45, duration: 1.8 },
  { height: 32, duration: 2.1 },
  { height: 28, duration: 1.6 },
  { height: 52, duration: 2.3 },
  { height: 38, duration: 1.9 },
  { height: 25, duration: 2.0 },
  { height: 48, duration: 1.7 },
  { height: 35, duration: 2.2 },
  { height: 42, duration: 1.5 },
  { height: 30, duration: 2.4 },
  { height: 55, duration: 1.8 },
  { height: 28, duration: 2.1 },
  { height: 40, duration: 1.6 },
  { height: 33, duration: 2.0 },
  { height: 50, duration: 1.9 },
  { height: 22, duration: 2.3 },
  { height: 45, duration: 1.7 },
  { height: 38, duration: 2.2 },
  { height: 30, duration: 1.5 },
  { height: 52, duration: 2.0 },
  { height: 35, duration: 1.8 },
  { height: 48, duration: 2.1 },
  { height: 28, duration: 1.6 },
  { height: 42, duration: 2.4 },
  { height: 55, duration: 1.9 },
  { height: 32, duration: 2.0 },
  { height: 40, duration: 1.7 },
  { height: 25, duration: 2.3 },
  { height: 50, duration: 1.5 },
  { height: 38, duration: 2.2 },
  { height: 45, duration: 1.8 },
  { height: 30, duration: 2.1 },
  { height: 52, duration: 1.6 },
  { height: 35, duration: 2.0 },
  { height: 28, duration: 1.9 },
  { height: 48, duration: 2.4 },
  { height: 42, duration: 1.7 },
  { height: 55, duration: 2.2 },
  { height: 32, duration: 1.5 },
  { height: 40, duration: 2.0 },
];

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
          ChatGPT voice mode, everywhere. Speak naturally in any app and get polished text, perfect prompts, or professional emails instantly.
        </motion.p>

        {/* CTA Buttons - Mac Download + Waitlists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col items-center gap-4 mb-6"
        >
          {/* Mac Download - Primary */}
          <Link href="/install">
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 py-6 text-base font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Download for Mac
            </Button>
          </Link>

          {/* Waitlist Row - iOS + Windows */}
          <div className="flex flex-row items-center gap-3">
            {/* iOS Waitlist */}
            <a href={iosMailtoLink}>
              <Button
                variant="outline"
                className="rounded-full px-6 py-5 text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 border-2 border-slate-300 hover:border-slate-400 text-slate-700"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                iOS Waitlist
              </Button>
            </a>

            {/* Windows Waitlist */}
            <a href={windowsMailtoLink}>
              <Button
                variant="outline"
                className="rounded-full px-6 py-5 text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 border-2 border-slate-300 hover:border-slate-400 text-slate-700"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                </svg>
                Windows Waitlist
              </Button>
            </a>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-slate-500 text-sm"
        >
          Free to try &bull; macOS 10.15+ &bull; iOS & Windows coming soon
        </motion.p>

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
              {waveformBars.map((bar, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [8, bar.height, 8],
                  }}
                  transition={{
                    duration: bar.duration,
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
