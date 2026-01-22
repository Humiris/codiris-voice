"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CheckCircle2, Download, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <section className="pt-32 pb-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
          >
            Welcome to Codiris Voice Pro!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl text-slate-600 mb-8"
          >
            Your subscription is now active. Thank you for your purchase!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-8"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-4">Next Steps</h2>
            <ol className="text-left space-y-4">
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">1</span>
                <div>
                  <p className="font-semibold text-slate-900">Open Codiris Voice</p>
                  <p className="text-slate-600 text-sm">Launch the app from your Applications folder</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">2</span>
                <div>
                  <p className="font-semibold text-slate-900">Sign in with your email</p>
                  <p className="text-slate-600 text-sm">Use the same email you used for payment to activate Pro</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">3</span>
                <div>
                  <p className="font-semibold text-slate-900">Start dictating!</p>
                  <p className="text-slate-600 text-sm">Hold Option key and speak to transcribe</p>
                </div>
              </li>
            </ol>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a href="/Codiris-Voice.dmg" download>
              <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-colors">
                <Download className="w-5 h-5" />
                Download App
              </button>
            </a>
            <a href="/">
              <button className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 px-8 py-4 rounded-full font-semibold transition-colors">
                Back to Home
                <ArrowRight className="w-5 h-5" />
              </button>
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-slate-500 text-sm"
          >
            A receipt has been sent to your email. Need help?{" "}
            <a href="mailto:support@codiris.build" className="text-blue-600 hover:underline">
              Contact support
            </a>
          </motion.p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
