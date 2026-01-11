import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/badge";
import { Header } from "@/components/landing/header";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getModelDisplayName,
  getProviderIcon,
  sortModels,
} from "@/lib/model-utils";
import { useLlmModels } from "@/queries/model/use-llm-models";

const ModelsPage = () => {
  const { data: models = [], isLoading } = useLlmModels();
  const [showAllModels, setShowAllModels] = useState(false);

  const sortedModels = useMemo(() => {
    const filtered = showAllModels
      ? models
      : models.filter((model) => !model.thinking);

    return [...filtered].sort(sortModels);
  }, [models, showAllModels]);

  return (
    <div className="bg-panel min-h-screen font-sans">
      <Header />
      <main className="container max-w-xl mx-auto px-4 py-16 space-y-12">
        <div className="space-y-6 text-center">
          <h1 className="font-ebg text-4xl md:text-5xl font-medium tracking-tight text-primary">
            Available AI Models
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Notesify supports most state-of-the-art AI models.
            <br /> Model credits are subject to change.
          </p>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>AI Model</TableHead>
                <TableHead className="w-px whitespace-nowrap">
                  Capabilities
                </TableHead>
                <TableHead className="w-px whitespace-nowrap">
                  Credits
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Loading models...
                  </TableCell>
                </TableRow>
              ) : sortedModels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
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
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {getModelDisplayName(model)}
                            </span>
                            {model.scope === "advanced" && (
                              <Badge variant="purple">Pro</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="gray">Text</Badge>
                        {model.type === "vlm" && (
                          <Badge variant="blue">Image</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium tabular-nums">
                        {model.credits}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>

            {!isLoading && models.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="py-4">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setShowAllModels((prev) => !prev)}
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        {showAllModels ? "Show less models" : "Show all models"}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </main>
    </div>
  );
};

export const Route = createFileRoute("/models")({
  component: ModelsPage,
  head: () => ({
    meta: [
      {
        title: "Models | Notesify",
      },
    ],
  }),
});
