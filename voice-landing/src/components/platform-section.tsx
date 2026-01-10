"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Smartphone, Monitor, Laptop } from "lucide-react";

const platforms = [
  { id: "ios", label: "iOS", icon: Smartphone },
  { id: "mac", label: "Mac", icon: Laptop },
  { id: "windows", label: "Windows", icon: Monitor },
];

export const PlatformSection = () => {
  const [activeTab, setActiveTab] = useState("ios");

  return (
    <section className="bg-[#050505] py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-zinc-900/50 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl backdrop-blur-sm">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 p-8 md:p-12 lg:p-20 items-center">
          <div>
            <div className="flex gap-1.5 mb-8 bg-black/60 p-1 rounded-full w-fit border border-white/10">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setActiveTab(platform.id)}
                  className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 ${
                    activeTab === platform.id
                      ? "bg-blue-600 text-white shadow-xl scale-105"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <platform.icon className="w-3.5 h-3.5 md:w-4 h-4" />
                  {platform.label}
                </button>
              ))}
            </div>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.1] mb-6 tracking-tight">
              Write faster in all your apps, on any device
            </h2>
            <p className="text-lg md:text-xl text-white/50 mb-8 max-w-lg leading-relaxed">
              Codiris Voice works everywhere you do. Just speak, and watch your words appear instantly in Slack, WhatsApp, Gmail, and more.
            </p>

            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 md:px-10 md:py-8 text-base md:text-lg font-bold group transition-all duration-300 hover:scale-105">
              <Play className="w-4 h-4 md:w-5 md:h-5 mr-3 fill-current" />
              Watch in action
            </Button>
          </div>

          <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="relative w-full max-w-[300px] md:max-w-[340px] aspect-[9/18.5] bg-[#050505] rounded-[2.5rem] md:rounded-[3.5rem] border-[8px] md:border-[12px] border-[#222] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
              {/* Mockup Content */}
              <div className="p-6 md:p-8 h-full flex flex-col">
                <div className="flex justify-between items-center mb-8 md:mb-10">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-zinc-900 border border-white/5" />
                  <div className="flex gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-zinc-900 border border-white/5" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-zinc-900 border border-white/5" />
                  </div>
                </div>
                
                <div className="space-y-4 md:space-y-6 flex-1">
                  <div className="bg-zinc-900/80 h-10 md:h-14 rounded-xl md:rounded-2xl w-4/5 border border-white/5" />
                  <div className="bg-zinc-900/80 h-10 md:h-14 rounded-xl md:rounded-2xl w-3/5 border border-white/5" />
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-blue-500/10 h-24 md:h-32 rounded-2xl md:rounded-3xl w-full border border-blue-500/30 p-4 md:p-5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <motion.p 
                      className="text-blue-200 text-sm md:text-base font-medium leading-snug"
                    >
                      "Hey team, let's sync up on the new design tomorrow morning at 10am. I've got some ideas for the hero section..."
                    </motion.p>
                  </motion.div>
                </div>

                <div className="mt-auto flex justify-center pb-4 md:pb-6">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.5)] cursor-pointer"
                  >
                    <div className="flex gap-1 md:gap-1.5 items-end h-6 md:h-8">
                      <motion.div animate={{ height: [8, 20, 8] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-1 md:w-1.5 bg-white rounded-full" />
                      <motion.div animate={{ height: [12, 28, 12] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.1 }} className="w-1 md:w-1.5 bg-white rounded-full" />
                      <motion.div animate={{ height: [10, 24, 10] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }} className="w-1 md:w-1.5 bg-white rounded-full" />
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Floating App Icons - Hidden on small screens to save space */}
              <div className="absolute -left-12 md:-left-16 top-1/3 space-y-4 md:space-y-6 hidden sm:block">
                <AppIcon color="bg-[#4A154B]" label="Slack" delay={0} />
                <AppIcon color="bg-[#25D366]" label="WhatsApp" delay={0.2} />
                <AppIcon color="bg-[#FFFC00]" label="Snapchat" delay={0.4} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AppIcon = ({ color, label, delay }: { color: string; label: string; delay: number }) => (
  <motion.div 
    initial={{ x: -20, opacity: 0 }}
    whileInView={{ x: 0, opacity: 1 }}
    transition={{ delay, duration: 0.5 }}
    className={`${color} w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl shadow-2xl flex items-center justify-center border border-white/10 hover:scale-110 transition-transform cursor-pointer`}
  >
    <span className={`text-[10px] md:text-xs font-black ${label === 'Snapchat' ? 'text-black' : 'text-white'}`}>{label[0]}</span>
  </motion.div>
);
