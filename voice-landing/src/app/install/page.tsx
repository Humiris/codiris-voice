"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CheckCircle2, AlertCircle, Download, Settings, Mic, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function InstallPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <section className="pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
              Installation Guide
            </h1>
            <p className="text-xl text-slate-600 mb-6">
              Get Codiris Voice up and running in minutes
            </p>
            <a href="/Codiris-Voice.dmg" download>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
                <Download className="w-5 h-5 inline-block mr-2" />
                Download Codiris Voice.dmg
              </button>
            </a>
          </motion.div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white border-2 border-green-200 rounded-2xl p-8 mb-8 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Apple Notarized</h3>
                <p className="text-slate-600 mb-2">
                  Codiris Voice is signed and notarized by Apple for your security.
                  It will install smoothly without security warnings.
                </p>
                <p className="text-slate-500 text-sm">
                  14-day free trial included. No credit card required.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Steps */}
          <div className="space-y-6">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Step 1: Download & Open DMG</h3>
                  <ol className="space-y-2 text-slate-600">
                    <li>1. Download <code className="bg-slate-100 px-2 py-1 rounded text-sm">Codiris-Voice.dmg</code></li>
                    <li>2. Open the DMG file from your Downloads folder</li>
                    <li>3. Drag Codiris Voice to your Applications folder</li>
                  </ol>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Mic className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Step 2: Grant Microphone Permission</h3>
                  <p className="text-slate-600 mb-3">
                    Codiris Voice needs microphone access to transcribe your speech:
                  </p>
                  <ol className="space-y-2 text-slate-600">
                    <li>1. Click "OK" when prompted for microphone access</li>
                    <li>2. If you accidentally denied it, go to System Settings → Privacy & Security → Microphone</li>
                    <li>3. Enable the toggle for Codiris Voice</li>
                  </ol>
                </div>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Step 3: Grant Input Monitoring Permission</h3>
                  <p className="text-slate-600 mb-3">
                    Codiris Voice needs input monitoring to detect the Option key:
                  </p>
                  <ol className="space-y-2 text-slate-600">
                    <li>1. Go to System Settings → Privacy & Security → Input Monitoring</li>
                    <li>2. Enable the toggle for Codiris Voice</li>
                    <li>3. You may need to restart the app after granting permission</li>
                  </ol>
                </div>
              </div>
            </motion.div>

            {/* Step 5 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Step 4: Grant Accessibility Permission</h3>
                  <p className="text-slate-600 mb-3">
                    Codiris Voice needs accessibility access to type transcribed text:
                  </p>
                  <ol className="space-y-2 text-slate-600">
                    <li>1. The app will open System Settings automatically</li>
                    <li>2. Enable the toggle for Codiris Voice in the Accessibility list</li>
                    <li>3. If it shows as "Pending", toggle it OFF then ON again</li>
                  </ol>
                </div>
              </div>
            </motion.div>

            {/* Step 6 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white border-2 border-blue-200 rounded-2xl p-8 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">You're All Set!</h3>
                  <p className="text-slate-600 mb-4">
                    Codiris Voice is now ready to use. Here's how:
                  </p>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">1</span>
                      <span>Hold down the <kbd className="bg-slate-100 px-3 py-1 rounded border border-slate-300 font-mono font-semibold">⌥ Option</kbd> key to start recording</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">2</span>
                      <span>Speak your message while holding the key</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">3</span>
                      <span>Release <kbd className="bg-slate-100 px-3 py-1 rounded border border-slate-300 font-mono font-semibold">⌥ Option</kbd> to stop and transcribe</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">4</span>
                      <span>The text will be typed automatically where your cursor is</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-12 text-center"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-3">Need Help?</h3>
            <p className="text-slate-600 mb-4">
              Having trouble with installation? Contact our support team for assistance.
            </p>
            <a
              href="mailto:support@codiris.build"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-slate-800 transition-colors"
            >
              Contact Support
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
