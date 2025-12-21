import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CtaSection({ className }: { className?: string }) {
  return (
    <section className={cn("pb-12 px-4 max-w-6xl mx-auto", className)}>
      <div className="relative overflow-hidden rounded-3xl bg-background shadow-md ring-1 ring-border/60">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-60",
            "bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.08)_1px,transparent_0)]",
            "bg-size-[24px_24px]",
          )}
        />

        <div className="relative px-5 py-8 sm:px-10 sm:py-16 text-center">
          <h2 className="font-ebg text-3xl md:text-4xl font-medium tracking-tight">
            Ready to upgrade your learning experience?
          </h2>
          <p className="mt-3 text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Read, write, and organize your notes — all in one place.
          </p>

          <div className="mt-4 md:mt-8 flex justify-center">
            <Link to="/library">
              <Button className="text-base rounded-md bg-blue-500 px-8 py-5 font-medium text-white hover:bg-blue-600">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
