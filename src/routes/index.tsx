import { createFileRoute, redirect } from "@tanstack/react-router";

import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { isTauri } from "@/lib/tauri";

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
  beforeLoad: async () => {
    if (isTauri) {
      throw redirect({
        to: "/library",
      });
    }
  },
});
