import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/badge";
import { Header } from "@/components/landing/header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getModelDisplayName,
  getProviderIcon,
  sortModels,
} from "@/lib/model-utils";
import { useLlmModels } from "@/queries/model/use-llm-models";

const ModelsPage = () => {
  const { data: models = [], isLoading } = useLlmModels();
  const sortedModels = [...models].sort(sortModels);

  return (
    <div className="bg-panel min-h-screen font-sans">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-16 space-y-12">
        <div className="space-y-6 text-center">
          <h1 className="font-ebg text-4xl md:text-5xl font-medium tracking-tight text-primary">
            Available Models
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Notesify supports a wide range of state-of-the-art AI models. Choose
            the one that best fits your needs.
          </p>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>AI Model</TableHead>
                <TableHead className="hidden sm:table-cell w-px whitespace-nowrap">
                  Provider
                </TableHead>
                <TableHead className="w-px whitespace-nowrap">
                  Capabilities
                </TableHead>
                <TableHead className="w-px whitespace-nowrap">
                  Public Preview
                </TableHead>
                <TableHead className="w-px whitespace-nowrap">Pro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading models...
                  </TableCell>
                </TableRow>
              ) : sortedModels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No models found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedModels.map((model) => (
                  <TableRow key={model.id} className="group hover:bg-muted/50">
                    <TableCell className="font-medium min-w-76">
                      <div className="flex items-center gap-3">
                        <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground shadow-sm group-hover:text-primary transition-colors">
                          {getProviderIcon(model.provider, "h-5 w-5")}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            {getModelDisplayName(model)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="capitalize text-sm font-medium text-muted-foreground">
                        {model.provider}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="gray">Text</Badge>
                        {model.type === "vlm" && (
                          <Badge variant="blue">Image</Badge>
                        )}
                        {model.thinking && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="indigo" className="cursor-help">
                                  Thinking
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Capable of deep reasoning and chain-of-thought
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-medium">
                        {model.scope === "basic" ? (
                          <>
                            <Check className="size-4" />
                            <span>Free</span>
                          </>
                        ) : (
                          <>
                            <X className="size-4" />
                            <span>N/A</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Check className="size-4" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export const Route = createFileRoute("/models")({
  component: ModelsPage,
});
