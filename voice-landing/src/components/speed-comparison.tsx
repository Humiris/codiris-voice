"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const SpeedComparison = () => {
  return (
    <section className="bg-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif text-slate-900 mb-6 relative inline-block">
            4x faster than typing
            <svg className="absolute -bottom-4 left-0 w-full h-4 text-blue-500" viewBox="0 0 400 20" fill="none">
              <path d="M1 15.5C50 15.5 50 1.5 100 1.5C150 1.5 150 15.5 200 15.5C250 15.5 250 1.5 300 1.5C350 1.5 350 15.5 400 15.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </h2>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mt-8 md:mt-12">
            For 150 years, the keyboard has been the bottleneck between your thoughts and the screen. Codiris Voice finally breaks that barrier.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 md:mt-12">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 font-semibold">
              Try Codiris Voice
            </Button>
            <Button variant="outline" className="border-slate-900 text-slate-900 hover:bg-slate-900/5 rounded-full px-8 py-6 font-semibold">
              Download for macOS
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <ComparisonCard 
            title="Keyboard" 
            speed="45" 
            unit="wpm" 
            label="Average typing speed"
            color="bg-slate-50"
            textColor="text-slate-900"
          />
          <ComparisonCard 
            title="Codiris Voice" 
            speed="220" 
            unit="wpm" 
            label="Average speaking speed"
            color="bg-blue-600"
            textColor="text-white"
            isHighlighted
          />
        </div>
      </div>
    </section>
  );
};

const ComparisonCard = ({ title, speed, unit, label, color, textColor, isHighlighted = false }: any) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className={`${color} ${textColor} p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm`}
  >
    <h3 className="text-xl md:text-2xl font-semibold mb-8 md:mb-12">{title}</h3>
    <div className="flex items-baseline gap-2 mb-4">
      <span className="text-7xl md:text-9xl font-serif italic">{speed}</span>
      <span className="text-xl md:text-2xl font-medium opacity-60">{unit}</span>
    </div>
    <p className="text-base md:text-lg opacity-60">{label}</p>
    
    {isHighlighted && (
      <div className="mt-8 md:mt-12 flex gap-1 h-6 md:h-8 items-end">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ height: [8, Math.random() * 32 + 8, 8] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
            className="w-1.5 bg-blue-200 rounded-full"
          />
        ))}
      </div>
    )}
  </motion.div>
);
