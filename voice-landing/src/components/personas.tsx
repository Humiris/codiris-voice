"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const personas = [
  "Accessibility", "Creators", "Customer Support", "Developers",
  "Lawyers", "Leaders", "Sales", "Students", "Teams"
];

export const Personas = () => {
  const [active, setActive] = useState("Accessibility");

  return (
    <section className="bg-[#050505] py-24 md:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Abstract Image */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Image
          src="/abstract-personas.png"
          alt="Abstract Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-tight mb-8 md:mb-12"
            >
              Codiris Voice is made <br />
              <span className="italic text-blue-400 relative inline-block">
                for you
                <svg className="absolute -bottom-2 left-0 w-full h-2 text-blue-400/40" viewBox="0 0 200 8" fill="none">
                  <path d="M1 6C50 6 50 2 100 2C150 2 150 6 200 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h2>

            <div className="flex flex-wrap gap-2 md:gap-3">
              {personas.map((persona) => (
                <button
                  key={persona}
                  onClick={() => setActive(persona)}
                  className={`px-5 py-2.5 md:px-7 md:py-3.5 rounded-full text-sm md:text-base font-medium transition-all duration-300 border ${active === persona
                    ? "bg-blue-600 text-white border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                    : "bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:bg-white/10"
                    }`}
                >
                  {persona}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-blue-500/10 blur-3xl rounded-full" />
            <div className="bg-zinc-900/40 rounded-[2.5rem] md:rounded-[3.5rem] p-10 md:p-14 border border-white/10 min-h-[400px] md:min-h-[450px] flex flex-col justify-center backdrop-blur-xl relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6">
                    {active}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-serif text-white mb-6 md:mb-8 leading-tight">
                    Empowering {active === "Accessibility" ? "diverse needs" : active.toLowerCase()}
                  </h3>
                  <p className="text-xl md:text-2xl text-white/70 leading-relaxed font-light">
                    {active === "Accessibility" && "Voice technology that adapts to you. Codiris Voice makes digital interaction effortless for everyone, regardless of physical ability."}
                    {active === "Creators" && "Capture raw creativity the moment it strikes. From scripts to newsletters, turn your spoken brilliance into polished, ready-to-publish content."}
                    {active === "Developers" && "Dictate complex code, documentation, and logic without losing your flow. Precision voice control for the modern engineer."}
                    {active === "Lawyers" && "Draft briefs and capture case notes with surgical precision. Legal-grade accuracy for every spoken word."}
                    {!["Accessibility", "Creators", "Developers", "Lawyers"].includes(active) && `Transforming how ${active.toLowerCase()} work. Codiris Voice removes the barrier between thought and text.`}
                  </p>

                  <div className="mt-12 md:mt-16 pt-10 md:pt-14 border-t border-white/10 flex items-center gap-5">
                    {active === "Accessibility" && (
                      <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-blue-500/30">
                        <Image
                          src="/alex-rivera.png"
                          alt="Alex Rivera"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold text-base md:text-lg">
                        {active === "Accessibility" ? "Alex Rivera" : `Featured in ${active}`}
                      </p>
                      <p className="text-white/40 text-sm md:text-base">
                        {active === "Accessibility" ? "Senior Accessibility at Vercel" : "Trusted by industry leaders"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
