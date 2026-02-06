"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Smartphone, Monitor, Laptop, Download, ExternalLink } from "lucide-react";
import Link from "next/link";

const platforms = [
  { id: "ios", label: "iOS", icon: Smartphone },
  { id: "mac", label: "Mac", icon: Laptop },
  { id: "windows", label: "Windows", icon: Monitor },
];

const platformContent = {
  ios: {
    title: "Coming soon to iOS",
    description: "We're bringing AI-powered voice typing to iPhone. Replace your keyboard's dictation and use it in Messages, Slack, WhatsApp, and more.",
    cta: "Join Waitlist",
    ctaLink: "mailto:support@codiris.build?subject=iOS%20Waitlist&body=I%27d%20like%20to%20join%20the%20iOS%20waitlist%20for%20Codiris%20Voice.",
    available: false,
  },
  mac: {
    title: "Instant voice-to-text for Mac",
    description: "Press a hotkey, speak naturally, and watch AI-polished text appear anywhere. Perfect for emails, docs, and code comments.",
    cta: "Download for Mac",
    ctaLink: "/install",
    available: true,
  },
  windows: {
    title: "Coming soon to Windows",
    description: "We're working on bringing Codiris Voice to Windows. Join the waitlist to be notified when it's ready.",
    cta: "Join Waitlist",
    ctaLink: "mailto:support@codiris.build?subject=Windows%20Waitlist&body=I%27d%20like%20to%20join%20the%20Windows%20waitlist%20for%20Codiris%20Voice.",
    available: false,
  },
};

export const PlatformSection = () => {
  const [activeTab, setActiveTab] = useState("ios");
  const content = platformContent[activeTab as keyof typeof platformContent];

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

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.1] mb-6 tracking-tight">
                  {content.title}
                </h2>
                <p className="text-lg md:text-xl text-white/50 mb-8 max-w-lg leading-relaxed">
                  {content.description}
                </p>

                {content.available ? (
                  activeTab === "mac" ? (
                    <Link href={content.ctaLink}>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 md:px-10 md:py-8 text-base md:text-lg font-bold group transition-all duration-300 hover:scale-105">
                        <Download className="w-4 h-4 md:w-5 md:h-5 mr-3" />
                        {content.cta}
                      </Button>
                    </Link>
                  ) : (
                    <a href={content.ctaLink} target="_blank" rel="noopener noreferrer">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 md:px-10 md:py-8 text-base md:text-lg font-bold group transition-all duration-300 hover:scale-105">
                        <ExternalLink className="w-4 h-4 md:w-5 md:h-5 mr-3" />
                        {content.cta}
                      </Button>
                    </a>
                  )
                ) : (
                  <a href={content.ctaLink}>
                    <Button className="bg-white/10 hover:bg-white/20 text-white rounded-full px-8 py-6 md:px-10 md:py-8 text-base md:text-lg font-bold group transition-all duration-300 hover:scale-105 border border-white/20">
                      {content.cta}
                    </Button>
                  </a>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                {activeTab === "ios" && <PhoneMockup />}
                {activeTab === "mac" && <MacMockup />}
                {activeTab === "windows" && <WindowsMockup />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

// Phone Mockup for iOS (Coming Soon)
const PhoneMockup = () => (
  <div className="relative w-full max-w-[300px] md:max-w-[340px] aspect-[9/18.5] bg-[#050505] rounded-[2.5rem] md:rounded-[3.5rem] border-[8px] md:border-[12px] border-[#222] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center">
    <div className="text-center">
      <Smartphone className="w-16 h-16 text-white/20 mx-auto mb-4" />
      <p className="text-white/40 text-lg font-medium">Coming Soon</p>
      <p className="text-white/20 text-sm mt-2">Join the waitlist to be notified</p>
    </div>
  </div>
);

// Mac Mockup
const MacMockup = () => (
  <div className="relative w-full max-w-[500px] aspect-[16/10] bg-[#1a1a1a] rounded-xl border-4 border-[#333] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
    {/* Menu bar */}
    <div className="h-6 bg-[#2a2a2a] flex items-center px-3 gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
      <span className="text-white/40 text-[10px] ml-2 font-medium">Codiris Voice</span>
    </div>

    <div className="p-6 h-full flex flex-col">
      {/* Floating bar mockup */}
      <div className="flex justify-center mb-8">
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-[#1a1a1c] rounded-full px-4 py-2 flex items-center gap-3 border border-white/10"
        >
          <span className="text-white/60 text-xs font-medium">Super Prompt</span>
          <div className="flex gap-0.5 items-end h-4">
            <motion.div animate={{ height: [4, 12, 4] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-1 bg-blue-500 rounded-full" />
            <motion.div animate={{ height: [6, 16, 6] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }} className="w-1 bg-blue-500 rounded-full" />
            <motion.div animate={{ height: [5, 14, 5] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1 bg-blue-500 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* Text editor mockup */}
      <div className="flex-1 bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
        <div className="space-y-2">
          <div className="bg-white/5 h-3 rounded w-3/4" />
          <div className="bg-white/5 h-3 rounded w-1/2" />
          <div className="bg-blue-500/20 h-6 rounded w-full border border-blue-500/30 mt-4" />
        </div>
      </div>
    </div>

    <div className="absolute -right-12 top-1/4 space-y-4 hidden sm:block">
      <AppIcon color="bg-gradient-to-br from-blue-500 to-purple-600" label="VS" delay={0} />
      <AppIcon color="bg-[#EA4335]" label="Gmail" delay={0.2} />
      <AppIcon color="bg-[#0077B5]" label="LinkedIn" delay={0.4} />
    </div>
  </div>
);

// Windows Mockup (Coming Soon)
const WindowsMockup = () => (
  <div className="relative w-full max-w-[500px] aspect-[16/10] bg-[#1a1a1a] rounded-lg border-4 border-[#333] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center">
    <div className="text-center">
      <Monitor className="w-16 h-16 text-white/20 mx-auto mb-4" />
      <p className="text-white/40 text-lg font-medium">Coming Soon</p>
      <p className="text-white/20 text-sm mt-2">Join the waitlist to be notified</p>
    </div>
  </div>
);

const AppIcon = ({ color, label, delay }: { color: string; label: string; delay: number }) => (
  <motion.div
    initial={{ x: -20, opacity: 0 }}
    whileInView={{ x: 0, opacity: 1 }}
    transition={{ delay, duration: 0.5 }}
    className={`${color} w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl shadow-2xl flex items-center justify-center border border-white/10 hover:scale-110 transition-transform cursor-pointer`}
  >
    <span className={`text-[10px] md:text-xs font-black text-white`}>{label[0]}</span>
  </motion.div>
);
