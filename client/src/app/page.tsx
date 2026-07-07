"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/HeroSection";
import { FeatureCards } from "@/components/FeatureCards";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { TriviaSection } from "@/components/TriviaSection";
import { CtaBand } from "@/components/CtaBand";
import { Footer } from "@/components/Footer";

export default function Home() {
  const router = useRouter();

  const handleGenerateRedirect = () => {
    router.push("/generate");
  };

  return (
    <div className="flex flex-col flex-1 bg-canvas">
      {/* Full Width Hero Section with Text Overlay */}
      <HeroSection onGenerateClick={handleGenerateRedirect} />

      {/* Saturated Feature Cards Section */}
      <FeatureCards />

      {/* Testimonials Review Grid Section */}
      <TestimonialsSection />

      {/* Interactive Gokuldham Trivia Quiz Corner */}
      <TriviaSection />

      {/* Pre-footer Call-To-Action Illustrated Band */}
      <CtaBand />

      {/* Footer */}
      <Footer />
    </div>
  );
}
