"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Search,
  Command
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const AppleIcon = () => (
  <img src="https://cdn-icons-png.flaticon.com/512/15/15476.png" alt="Apple" className="w-5 h-5" />
);

const menuItems = [
  { label: "Home", href: "/" },
  { label: "Try Voice AI", href: "/voice" },
  { label: "Download", href: "https://github.com/Humiris/codiris-voice/releases/latest/download/Codiris-Voice.dmg" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  const navWidth = useTransform(scrollY, [0, 100], ["100%", "90%"]);
  const navTop = useTransform(scrollY, [0, 100], ["0px", "20px"]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      style={{ top: navTop }}
      className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out px-4 flex justify-center",
      )}
    >
      <motion.nav
        style={{ width: navWidth }}
        className={cn(
          "max-w-7xl transition-all duration-500 ease-in-out rounded-[2rem] border",
          isScrolled 
            ? "bg-white/70 backdrop-blur-2xl border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] px-6 py-3" 
            : "bg-transparent border-transparent px-4 py-4"
        )}
      >
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-11 h-11 flex items-center justify-center bg-white rounded-2xl shadow-xl shadow-blue-100/50 border border-slate-100 overflow-hidden"
            >
              <img 
                src="https://framerusercontent.com/images/6hd2q32TCQkqeTR6lgvTAQAClWE.svg?width=375&height=375" 
                alt="Codiris" 
                className="w-8 h-8 relative z-10"
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-blue-500/5 rounded-full blur-xl"
              />
            </motion.div>
            <div className="flex flex-col -space-y-1">
              <span className="text-2xl font-black tracking-tighter text-slate-900">
                Codiris
              </span>
              <span className="text-[10px] font-bold text-blue-500/60 uppercase tracking-[0.2em]">Intelligence</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
            {menuItems.map((item, index) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "relative px-5 py-2.5 text-sm font-bold transition-all duration-300 flex items-center gap-1.5 rounded-full",
                    hoveredIndex === index ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {item.label}
                  {hoveredIndex === index && (
                    <motion.div
                      layoutId="nav-hover-pill"
                      className="absolute inset-0 bg-white shadow-sm rounded-full -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </div>
            ))}
          </div>

          {/* CTA & Actions */}
          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-600 transition-colors group">
              <Search className="w-4 h-4" />
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-bold">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </div>
            </button>

            <a href="https://github.com/Humiris/codiris-voice/releases/latest/download/Codiris-Voice.dmg">
              <Button
                className="hidden sm:flex rounded-full px-7 py-6 font-bold transition-all duration-500 active:scale-95 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg"
              >
                Download
              </Button>
            </a>

            <Link href="/voice">
              <Button
                className={cn(
                  "hidden sm:flex rounded-full px-7 py-6 font-bold transition-all duration-500 active:scale-95",
                  pathname === "/voice"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-slate-900 hover:bg-blue-600 text-white hover:shadow-xl hover:shadow-blue-200"
                )}
              >
                {pathname === "/voice" ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Voice Live
                  </span>
                ) : (
                  "Try Codiris Voice"
                )}
              </Button>
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-full left-4 right-4 mt-4 lg:hidden"
          >
            <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] border border-slate-200 shadow-2xl p-8 space-y-6">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-xl font-black text-slate-900 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-6 border-t border-slate-100">
                <Link href="/voice" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] py-8 text-xl font-black shadow-xl shadow-blue-200">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
