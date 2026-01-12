import React from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { PlatformSection } from "@/components/platform-section";
import { SpeedComparison } from "@/components/speed-comparison";
import { Personas } from "@/components/personas";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <Hero />
      <PlatformSection />
      <SpeedComparison />
      <Personas />
      <FAQ />
      <Footer />
    </main>
  );
}
