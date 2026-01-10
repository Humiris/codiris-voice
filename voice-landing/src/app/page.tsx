import React from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { PlatformSection } from "@/components/platform-section";
import { SpeedComparison } from "@/components/speed-comparison";
import { Personas } from "@/components/personas";
import { Footer } from "@/components/footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <Hero />
      <PlatformSection />
      <SpeedComparison />
      <Personas />
      <Footer />
    </main>
  );
}
