"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Sparkles,
  FileText,
  Mail,
  Code,
  StickyNote,
  Wand2,
  ArrowRight,
  Check,
  Plus,
  Settings,
  Globe,
  MessageSquare,
} from "lucide-react";

const modes = [
  {
    id: "raw",
    name: "Raw",
    icon: Mic,
    color: "slate",
    description: "Pure transcription",
    longDesc: "Get your exact words transcribed without any AI processing. Perfect when you need word-for-word accuracy.",
    before: "so basically um i was thinking we could maybe meet tomorrow around like 2pm or something if that works for you",
    after: "so basically um i was thinking we could maybe meet tomorrow around like 2pm or something if that works for you",
  },
  {
    id: "clean",
    name: "Clean",
    icon: Sparkles,
    color: "blue",
    description: "Fix grammar & punctuation",
    longDesc: "Automatically clean up your speech. Fixes grammar, adds punctuation, and removes filler words like 'um' and 'uh'.",
    before: "so basically um i was thinking we could maybe meet tomorrow around like 2pm or something if that works for you",
    after: "I was thinking we could meet tomorrow around 2pm if that works for you.",
  },
  {
    id: "format",
    name: "Format",
    icon: FileText,
    color: "purple",
    description: "Professional formatting",
    longDesc: "Transform casual speech into well-structured, professional text with proper formatting and clarity.",
    before: "so the project has three parts first we need to do research then design and finally development",
    after: "The project consists of three phases:\n1. Research\n2. Design\n3. Development",
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    color: "green",
    description: "Perfect emails instantly",
    longDesc: "Turn your spoken thoughts into polished, professional emails. No more staring at a blank compose window.",
    before: "hey john just wanted to follow up on our meeting yesterday about the budget can you send me those numbers when you get a chance thanks",
    after: "Hi John,\n\nI wanted to follow up on our meeting yesterday regarding the budget. When you have a moment, could you please send me those numbers?\n\nThank you!",
  },
  {
    id: "code",
    name: "Code",
    icon: Code,
    color: "orange",
    description: "Code comments & docs",
    longDesc: "Perfect for developers. Transform spoken explanations into clean code comments and documentation.",
    before: "this function takes a user id and returns their profile data from the database it throws an error if the user is not found",
    after: "// Retrieves user profile data from the database\n// @param userId - The unique identifier of the user\n// @returns User profile object\n// @throws Error if user is not found",
  },
  {
    id: "notes",
    name: "Notes",
    icon: StickyNote,
    color: "yellow",
    description: "Meeting notes & bullets",
    longDesc: "Convert your rambling thoughts into organized bullet points. Great for meetings, brainstorming, and note-taking.",
    before: "so in the meeting we decided to push the launch to next month also sarah will handle marketing and we need to hire two more developers",
    after: "Meeting Notes:\n- Launch postponed to next month\n- Sarah will handle marketing\n- Action item: Hire 2 additional developers",
  },
  {
    id: "askme",
    name: "Ask Me",
    icon: MessageSquare,
    color: "emerald",
    description: "Ask AI to do anything",
    longDesc: "Like having an AI assistant in any app. Ask it to write, rewrite, summarize, explain, or transform your text in any way you want.",
    before: "rewrite this to sound more professional: hey guys the meeting is pushed to next week lol",
    after: "Dear Team,\n\nPlease note that our scheduled meeting has been rescheduled to next week. I will send an updated calendar invite with the new date and time shortly.\n\nBest regards",
  },
  {
    id: "superprompt",
    name: "Super Prompt",
    icon: Wand2,
    color: "pink",
    description: "Expand into detailed AI prompts",
    longDesc: "Turn a simple idea into a powerful, detailed prompt for ChatGPT, Claude, or Cursor. Get better AI results with less effort.",
    before: "create a landing page for my startup",
    after: "Create a modern, conversion-focused landing page with the following requirements:\n\nSTRUCTURE\n- Hero section with compelling headline\n- Features section with icons\n- Social proof (testimonials)\n- Clear call-to-action buttons\n\nTECHNICAL\n- React/Next.js with TypeScript\n- Tailwind CSS for styling\n- Responsive design\n- SEO optimized",
  },
  {
    id: "translate",
    name: "Translate",
    icon: Globe,
    color: "cyan",
    description: "Translate to any language",
    longDesc: "Speak in your native language and get instant translation to English, French, Spanish, German, or any language you need.",
    before: "Bonjour, je voudrais réserver une table pour deux personnes ce soir à 20 heures s'il vous plaît.",
    after: "Hello, I would like to book a table for two people tonight at 8 PM please.",
  },
  {
    id: "custom",
    name: "Custom",
    icon: Plus,
    color: "indigo",
    description: "Create your own mode",
    longDesc: "Build your own custom modes with personalized system prompts. Perfect for specific workflows, company tone guidelines, or unique use cases.",
    before: "your voice input here...",
    after: "Your custom transformation!\n\nExamples:\n- Legal document formatter\n- Customer support replies\n- Social media posts\n- Translation + cleanup\n- Your unique workflow",
    isCustom: true,
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string; light: string }> = {
  slate: { bg: "bg-slate-500", text: "text-slate-600", border: "border-slate-300", light: "bg-slate-50" },
  blue: { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-300", light: "bg-blue-50" },
  purple: { bg: "bg-purple-500", text: "text-purple-600", border: "border-purple-300", light: "bg-purple-50" },
  green: { bg: "bg-green-500", text: "text-green-600", border: "border-green-300", light: "bg-green-50" },
  orange: { bg: "bg-orange-500", text: "text-orange-600", border: "border-orange-300", light: "bg-orange-50" },
  yellow: { bg: "bg-yellow-500", text: "text-yellow-600", border: "border-yellow-300", light: "bg-yellow-50" },
  pink: { bg: "bg-pink-500", text: "text-pink-600", border: "border-pink-300", light: "bg-pink-50" },
  cyan: { bg: "bg-cyan-500", text: "text-cyan-600", border: "border-cyan-300", light: "bg-cyan-50" },
  indigo: { bg: "bg-indigo-500", text: "text-indigo-600", border: "border-indigo-300", light: "bg-indigo-50" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-300", light: "bg-emerald-50" },
};

export function ModesSection() {
  const [selectedMode, setSelectedMode] = useState(modes[1]); // Default to "Clean"

  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            9 modes + unlimited custom
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose how your voice is transformed. From raw transcription to AI-powered prompts, or create your own.
          </p>
        </motion.div>

        {/* Mode Selector Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {modes.map((mode) => {
            const Icon = mode.icon;
            const colors = colorClasses[mode.color];
            const isSelected = selectedMode.id === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode)}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm
                  transition-all duration-300 border-2
                  ${isSelected
                    ? `${colors.bg} text-white border-transparent shadow-lg scale-105`
                    : `bg-white ${colors.text} ${colors.border} hover:scale-105`
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {mode.name}
              </button>
            );
          })}
        </motion.div>

        {/* Selected Mode Detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            {/* Mode Description */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colorClasses[selectedMode.color].light} ${colorClasses[selectedMode.color].text} font-semibold text-sm mb-4`}>
                <selectedMode.icon className="w-4 h-4" />
                {selectedMode.name} Mode
              </div>
              <p className="text-lg text-slate-600 max-w-xl mx-auto">
                {selectedMode.longDesc}
              </p>
            </div>

            {/* Before/After Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Before */}
              <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Mic className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    You say
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  "{selectedMode.before}"
                </p>
              </div>

              {/* After */}
              <div className={`rounded-2xl p-6 border-2 ${colorClasses[selectedMode.color].border} ${colorClasses[selectedMode.color].light}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Check className={`w-4 h-4 ${colorClasses[selectedMode.color].text}`} />
                  <span className={`text-xs font-bold uppercase tracking-widest ${colorClasses[selectedMode.color].text}`}>
                    You get
                  </span>
                </div>
                <p className={`${colorClasses[selectedMode.color].text} leading-relaxed whitespace-pre-line font-medium`}>
                  {selectedMode.after}
                </p>
              </div>
            </div>

            {/* How to use */}
            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm">
                <span className="font-semibold">How to switch modes:</span> Right-click the floating bar or use the menu bar icon
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <Link href="/voice">
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 py-6 text-base font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
            >
              <Mic className="w-5 h-5" />
              Try Codiris Voice Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="text-slate-500 text-sm mt-4">
            Test all modes in your browser, no download required
          </p>
        </motion.div>
      </div>
    </section>
  );
}
