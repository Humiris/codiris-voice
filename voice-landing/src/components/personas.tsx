"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const personas = [
  "Accessibility", "Creators", "Customer Support", "Developers", 
  "Lawyers", "Leaders", "Sales", "Students", "Teams"
];

export const Personas = () => {
  const [active, setActive] = useState("Developers");

  return (
    <section className="bg-[#050505] py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-tight mb-8 md:mb-12">
              Codiris Voice is made <br />
              <span className="italic text-blue-400 relative">
                for you
                <svg className="absolute -bottom-2 left-0 w-full h-2 text-blue-400/40" viewBox="0 0 200 8" fill="none">
                  <path d="M1 6C50 6 50 2 100 2C150 2 150 6 200 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </h2>

            <div className="flex flex-wrap gap-2 md:gap-3">
              {personas.map((persona) => (
                <button
                  key={persona}
                  onClick={() => setActive(persona)}
                  className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-medium transition-all duration-300 border ${
                    active === persona
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-transparent text-white/60 border-white/10 hover:border-white/30"
                  }`}
                >
                  {persona}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/50 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 border border-white/5 min-h-[350px] md:min-h-[400px] flex flex-col justify-center backdrop-blur-sm mt-8 lg:mt-0">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl md:text-3xl font-serif text-white mb-4 md:mb-6">For {active}</h3>
              <p className="text-lg md:text-xl text-white/60 leading-relaxed">
                {active === "Developers" && "Dictate complex code structures, documentation, and pull request descriptions without ever taking your hands off the keyboard. Codiris Voice understands technical jargon and formatting."}
                {active === "Lawyers" && "Draft briefs, emails, and contracts at the speed of thought. Codiris Voice ensures your legal terminology is captured accurately and formatted professionally."}
                {active === "Creators" && "Capture your creative sparks instantly. Whether it's a script, a blog post, or social media copy, Codiris Voice turns your spoken ideas into polished drafts."}
                {!["Developers", "Lawyers", "Creators"].includes(active) && `Codiris Voice helps ${active.toLowerCase()} communicate faster and more effectively by removing the friction of typing.`}
              </p>
              
              <div className="mt-8 md:mt-12 pt-8 md:pt-12 border-t border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-800" />
                <div>
                  <p className="text-white font-medium text-sm md:text-base">Alex Rivera</p>
                  <p className="text-white/40 text-xs md:text-sm">Senior {active} at Vercel</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
