import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/header";
import { PricingSection } from "@/components/landing/pricing-section";

const Pricing = () => {
  return (
    <div className="bg-panel min-h-screen">
      <Header />
      <PricingSection />
    </div>
  );
};

export const Route = createFileRoute("/pricing")({
  component: Pricing,
  head: () => ({
    meta: [
      {
        title: "Pricing | Notesify",
      },
    ],
  }),
});
