import React from "react";
import { Linkedin, Mail, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-white pt-20 pb-12 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-lg shadow-blue-100/50 border border-slate-100 overflow-hidden">
                <img
                  src="https://framerusercontent.com/images/6hd2q32TCQkqeTR6lgvTAQAClWE.svg?width=375&height=375"
                  alt="Codiris"
                  className="w-7 h-7"
                />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-2xl font-black tracking-tighter text-slate-900">
                  Codiris
                </span>
                <span className="text-[10px] font-bold text-blue-500/60 uppercase tracking-[0.2em]">Voice</span>
              </div>
            </Link>
            <p className="text-slate-500 max-w-xs mb-8 font-medium leading-relaxed">
              Building the Voice OS for the next generation of computing. Speak your mind, we'll do the rest.
            </p>
            <div className="flex gap-3">
              <SocialIcon icon={Linkedin} href="https://www.linkedin.com/company/codirisbuild/" />
              <SocialIcon icon={Mail} href="https://humiris.substack.com/" />
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Product</h4>
            <FooterLink label="Download" href="/install" />
            <FooterLink label="Try Voice AI" href="/voice" />
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-400 text-sm font-medium">
            © 2025 Codiris Intelligence Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ label, href, isNew = false }: { label: string; href?: string; isNew?: boolean }) => (
  <Link href={href || "#"} className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-4 transition-all duration-300 font-medium">
    {label}
    {isNew && (
      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-600">New</span>
    )}
    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
  </Link>
);

const SocialIcon = ({ icon: Icon, href }: { icon: any; href?: string }) => {
  const content = (
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 cursor-pointer group">
      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
    </div>
  );

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : content;
};
