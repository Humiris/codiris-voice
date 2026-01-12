"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "Why real-time vs. a regular AI notetaker?",
    answer: "Traditional AI notetakers work after your meetings, transcribing and summarizing hours later. Codiris Voice works in real-time as you speak, instantly converting your voice to polished text anywhere on your Mac. It's not just for meetings—use it in any app, from Slack to email to code editors."
  },
  {
    question: "Who is Codiris Voice for?",
    answer: "Codiris Voice is perfect for anyone who thinks faster than they type: developers writing documentation, product managers drafting specs, writers capturing ideas, students taking notes, or anyone who wants to be more productive on their Mac. If you can speak it, we can type it."
  },
  {
    question: "Is Codiris Voice free?",
    answer: "Yes! Codiris Voice is completely free for all Codiris users. We believe voice should be the future of how we interact with computers, and we're making it accessible to everyone. No credit card required, no limits on usage."
  },
  {
    question: "How is it undetectable in meetings?",
    answer: "Unlike bot-based notetakers that join your calls, Codiris Voice works locally on your Mac. It captures audio only when you hold the Option key, processes everything on-device or securely in the cloud, and types directly into your active application. No one knows you're using it—it's just you, typing faster."
  },
  {
    question: "What languages and apps are supported?",
    answer: "Codiris Voice supports 50+ languages including English, Spanish, French, German, Chinese, Japanese, and many more. It works in every Mac application—from productivity apps like Notion and Slack, to code editors like VS Code, to messaging apps like iMessage. Anywhere you can type, Codiris Voice can help."
  },
  {
    question: "Can I talk to customer support?",
    answer: "Absolutely! We're here to help. Reach out via email at support@codiris.com, join our community Discord, or check out our Help Center for quick answers. We typically respond within a few hours during business days."
  }
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-16 text-center">
          Frequently asked questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQItem = ({
  question,
  answer,
  isOpen,
  onClick
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="border-b border-slate-200">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left hover:opacity-70 transition-opacity"
      >
        <span className="text-lg font-semibold text-slate-900 pr-8">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-slate-600 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
