import React from "react";
import { Linkedin, Mail } from "lucide-react";
import Link from "next/link";

const footerSections = [
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "https://humiris.substack.com/" },
      { label: "Demo", href: "https://www.codiris.build/demo" }
    ]
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "#" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "https://www.codiris.build/privacy-policy" },
      { label: "Terms", href: "https://www.codiris.build/terms-of-service" }
    ]
  }
];


export const Footer = () => {
  return (
    <footer className="bg-[#f5f5f7] pt-16 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Logo and Status */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <img
                  src="https://framerusercontent.com/images/6hd2q32TCQkqeTR6lgvTAQAClWE.svg?width=375&height=375"
                  alt="Codiris"
                  className="w-6 h-6"
                />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Codiris Voice
              </span>
            </Link>

            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              All systems operational
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © 2025 Codiris Intelligence Inc.
          </p>

          {/* Social Icons - dark navy like Cluely */}
          <div className="flex items-center gap-2">
            <a
              href="https://twitter.com/codiris"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#1a1f36] hover:bg-[#2a2f46] text-white flex items-center justify-center transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/codirisbuild/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#1a1f36] hover:bg-[#2a2f46] text-white flex items-center justify-center transition-all"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://humiris.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#1a1f36] hover:bg-[#2a2f46] text-white flex items-center justify-center transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://instagram.com/codiris"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#1a1f36] hover:bg-[#2a2f46] text-white flex items-center justify-center transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
