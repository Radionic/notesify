import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PricingSection() {
  const features = [
    "Unlimited AI usage",
    "Ask questions about PDFs",
    "Generate flashcards and quizzes",
    "Highlight and write notes on PDFs",
    "Early access to new features",
  ];

  return (
    <section className="py-12 px-4 max-w-6xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="flex justify-center">
          <Badge
            variant="secondary"
            className="px-4 py-1.5 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            Public Preview
          </Badge>
        </div>
        <h2 className="font-ebg text-4xl md:text-5xl font-medium tracking-tight text-primary">
          Free During Public Preview
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
          We are currently in public preview. You get access to all features for
          free.
        </p>
      </div>

      <div className="flex justify-center">
        <Card className="max-w-md w-full relative border-primary shadow-lg">
          <div className="absolute -top-4 left-0 right-0 flex justify-center">
            <Badge className="bg-primary text-primary-foreground">
              Everything Included
            </Badge>
          </div>
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-3xl font-bold">Public Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center items-baseline gap-1">
              <span className="text-5xl font-bold">$0</span>
              <span className="text-muted-foreground text-xl">/month</span>
            </div>

            <ul className="space-y-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-base">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pb-8">
            <Button size="lg" className="w-full text-lg h-12">
              Start Using For Free
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
