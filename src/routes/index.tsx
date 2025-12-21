import { createFileRoute } from "@tanstack/react-router";
import { CtaSection } from "@/components/landing/cta-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FeatureSection } from "@/components/landing/feature-section";
import { FlowSection } from "@/components/landing/flow-section";
import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";

const Landing = () => {
  return (
    <div className="bg-panel min-h-screen">
      <Header />
      <HeroSection />
      <FlowSection />
      <FeatureSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
};

export const Route = createFileRoute("/")({
  component: Landing,
});
