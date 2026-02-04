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
    <main className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Left side - Instructions */}
      <div className="flex-1 flex flex-col justify-center px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold">Codiris Voice</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl lg:text-6xl font-light mb-12 leading-tight">
            Open Codiris Voice<br />
            in 3 steps:
          </h1>

          {/* Steps */}
          <ol className="space-y-4 text-xl text-gray-300 mb-12">
            <li className="flex items-start gap-3">
              <span className="text-white font-medium">1.</span>
              <span>Open your Downloads</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white font-medium">2.</span>
              <span>Double-click CodirisVoice-v1.1.0.dmg</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white font-medium">3.</span>
              <span>Drag to Applications — then start using<br />Codiris Voice</span>
            </li>
          </ol>

          {/* Try again link */}
          <p className="text-gray-400">
            Not working?{" "}
            <a
              href={DOWNLOAD_URL}
              className="text-white underline hover:text-blue-400 transition-colors"
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
            className="flex items-center gap-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-5 py-4 transition-all"
          >
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold">GET VOICE FOR</p>
              <p className="text-sm font-semibold">YOUR IPHONE</p>
            </div>
          </a>
        </motion.div>
      </div>

      {/* Right side - App Preview */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-teal-600 to-teal-700 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
        >
          {/* Window controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg" />
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-lg" />
              <div className="w-8 h-8 bg-gray-100 rounded-lg" />
              <div className="w-8 h-8 bg-gray-100 rounded-lg" />
            </div>
          </div>

          {/* Content placeholder */}
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>

          {/* Cursor */}
          <div className="flex justify-end mt-8">
            <svg className="w-12 h-12 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.64 21.97C13.14 22.21 12.54 22 12.31 21.5L10.13 16.76L7.62 18.78C7.45 18.92 7.24 19 7.02 19C6.55 19 6.16 18.61 6.16 18.14V5.51C6.16 5.04 6.55 4.65 7.02 4.65C7.27 4.65 7.5 4.76 7.67 4.93L18.55 15.81C18.88 16.14 18.88 16.69 18.55 17.02C18.38 17.19 18.15 17.27 17.92 17.27C17.74 17.27 17.57 17.21 17.42 17.1L14.87 15.04L17.05 19.78C17.28 20.28 17.08 20.88 16.58 21.11L13.64 21.97Z"/>
            </svg>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
