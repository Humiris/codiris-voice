"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const DOWNLOAD_URL = "https://github.com/Humiris/codiris-voice/releases/download/v1.1.0/CodirisVoice-v1.1.0.dmg";

export default function DownloadsPage() {
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    // Auto-start download after a short delay
    const timer = setTimeout(() => {
      window.location.href = DOWNLOAD_URL;
      setDownloadStarted(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f5f7] flex">
      {/* Left side - Instructions */}
      <div className="flex-1 flex flex-col justify-center px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-slate-900">Codiris Voice</span>
          </Link>

          {/* Title */}
          <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-12 leading-tight">
            Open Codiris Voice<br />
            <span className="text-blue-600">in 3 steps:</span>
          </h1>

          {/* Steps */}
          <ol className="space-y-4 text-xl text-slate-600 mb-12">
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
              <span className="pt-1">Open your Downloads folder</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">2</span>
              <span className="pt-1">Double-click <code className="bg-slate-200 px-2 py-0.5 rounded text-sm">CodirisVoice-v1.1.0.dmg</code></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">3</span>
              <span className="pt-1">Drag to Applications — then start using<br />Codiris Voice</span>
            </li>
          </ol>

          {/* Try again link */}
          <p className="text-slate-500">
            Not working?{" "}
            <a
              href={DOWNLOAD_URL}
              className="text-blue-600 underline hover:text-blue-700 transition-colors font-medium"
            >
              Try again
            </a>
            .
          </p>
        </motion.div>

        {/* Bottom iOS link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="absolute bottom-8 left-12"
        >
          <a
            href="mailto:joel@codiris.build?subject=I'd%20like%20to%20try%20Codiris%20Voice%20on%20iPhone!&body=Hi!%0A%0AI'd%20love%20to%20try%20Codiris%20Voice%20on%20my%20iPhone.%20Please%20add%20me%20to%20the%20iOS%20waitlist!%0A%0AThanks!"
            className="flex items-center gap-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 transition-all shadow-sm hover:shadow-md"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">GET VOICE FOR</p>
              <p className="text-sm font-semibold text-slate-900">YOUR IPHONE</p>
            </div>
          </a>
        </motion.div>
      </div>

      {/* Right side - App Preview */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
        >
          {/* Window header */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>

          {/* Waveform visualization */}
          <div className="flex justify-center items-center gap-1 h-16 mb-6">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [8, 20 + (i % 5) * 8, 8],
                }}
                transition={{
                  duration: 1.2 + (i % 3) * 0.3,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: "easeInOut"
                }}
                className="w-1 bg-blue-500 rounded-full"
              />
            ))}
          </div>

          {/* Text preview */}
          <div className="space-y-3">
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-4/5" />
            <div className="h-3 bg-slate-100 rounded w-3/5" />
          </div>

          {/* Mode indicator */}
          <div className="mt-8 flex justify-center">
            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              Super Prompt Mode
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
