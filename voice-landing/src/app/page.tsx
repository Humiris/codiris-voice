import React from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { PlatformSection } from "@/components/platform-section";
import { SpeedComparison } from "@/components/speed-comparison";
import { Personas } from "@/components/personas";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import { VoiceProcessVisualization } from "@/components/voice-process-visualization";
import { VoiceModesGallery } from "@/components/voice-modes-gallery";
import { UseCasesCarousel } from "@/components/use-cases-carousel";
import { GlobalVoiceDemo } from "@/components/global-voice-demo";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <Hero />
      <VoiceProcessVisualization />
      <VoiceModesGallery />
      <UseCasesCarousel />
      <PlatformSection />
      <SpeedComparison />
      <Personas />
      <FAQ />
      <Footer />
      <GlobalVoiceDemo />
    </main>
  );
}
