"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Check, Zap, Shield, Clock, Mic } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!email) {
      alert("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error: " + (data.error || "Could not start checkout"));
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <section className="pt-32 pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-slate-600">
              Start with a 14-day free trial. No credit card required.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Trial */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Free Trial</h3>
                <p className="text-slate-600">Try everything for 14 days</p>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold text-slate-900">$0</span>
                <span className="text-slate-500 ml-2">for 14 days</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Unlimited transcriptions</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">All AI enhancement modes</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">History & statistics</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">No credit card required</span>
                </li>
              </ul>

              <a href="/install">
                <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-4 rounded-full font-semibold transition-colors">
                  Download Free Trial
                </button>
              </a>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden"
            >
              {/* Popular badge */}
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className="text-blue-100">For power users</p>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold">$9.99</span>
                <span className="text-blue-200 ml-2">/month</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-200 flex-shrink-0" />
                  <span>Unlimited transcriptions</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-200 flex-shrink-0" />
                  <span>All AI enhancement modes</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-200 flex-shrink-0" />
                  <span>Priority processing</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-200 flex-shrink-0" />
                  <span>Email support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-200 flex-shrink-0" />
                  <span>Cancel anytime</span>
                </li>
              </ul>

              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-white text-blue-600 py-4 rounded-full font-bold hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Subscribe Now"}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20"
          >
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
              Everything you need
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Voice to Text</h3>
                <p className="text-slate-600 text-sm">Instant transcription powered by OpenAI Whisper</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">AI Enhancement</h3>
                <p className="text-slate-600 text-sm">Clean, format, and polish your text automatically</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Save Time</h3>
                <p className="text-slate-600 text-sm">Type 3x faster with your voice</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Privacy First</h3>
                <p className="text-slate-600 text-sm">Your audio is processed and deleted instantly</p>
              </div>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-20 max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">
              Questions?
            </h2>
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Can I cancel anytime?</h3>
                <p className="text-slate-600">Yes! Cancel your subscription at any time. You'll keep access until the end of your billing period.</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">What happens after the trial?</h3>
                <p className="text-slate-600">After 14 days, you'll need to subscribe to continue using Codiris Voice. Your history and settings are preserved.</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Is my data secure?</h3>
                <p className="text-slate-600">Absolutely. Audio is processed in real-time and never stored. We use end-to-end encryption for all API calls.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
