import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";

const Landing = () => {
  return (
    <div className="bg-panel min-h-screen">
      <Header />
      <HeroSection />
    </div>
  );
};

export const Route = createFileRoute("/")({
  component: Landing,
});
