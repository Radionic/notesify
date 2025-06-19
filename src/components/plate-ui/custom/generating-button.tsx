import {
  useEditorPlugin,
  useEditorRef,
  usePlateState,
} from "@udecode/plate/react";
import { useAtom, useAtomValue } from "jotai";
import { generatingNotesAtom } from "@/atoms/notes/notes";
import { StatesPlugin } from "./states";
import { PenOff, Sparkles } from "lucide-react";
import { ToolbarButton } from "../toolbar";
import {
  GenerateNotesDialog,
  LengthType,
  QualityType,
} from "./generate-notes-dialog";
import { activePdfIdAtom } from "@/atoms/pdf/pdf-viewer";
import { toast } from "sonner";
import { deserializeMd, MarkdownPlugin } from "@udecode/plate-markdown";
import { SkeletonPlugin } from "./skeleton";
import { useState } from "react";
import { useGenerateSummary } from "@/queries/notes/use-notes";

export const GeneratingButton = () => {
  const { getOption } = useEditorPlugin(StatesPlugin);
  const notesId = getOption("notesId");
  const [generatingSignal, setGeneratingSignal] = useAtom(
    generatingNotesAtom(notesId)
  );
  const [readOnly, setReadOnly] = usePlateState("readOnly");
  const [generating, setGenerating] = useState(false);
  const editor = useEditorRef();
  const pdfId = useAtomValue(activePdfIdAtom);
  const { mutateAsync: generateSummary } = useGenerateSummary();

  const handleGenerate = async (quality: QualityType, length: LengthType) => {
    if (generatingSignal) {
      toast.error("Notes are already being generated");
      return;
    }

    if (!pdfId) {
      toast.error("Please open a PDF first");
      return;
    }

    try {
      const abortSignal = new AbortController();
      setGeneratingSignal(abortSignal);
      setGenerating(true);
      setReadOnly(true);

      const block = editor.api.create.block({
        type: SkeletonPlugin.key,
      });
      editor.tf.setValue([block]);

      const onUpdate = async (summaryPart: string) => {
        try {
          const markdown = editor
            .getApi(MarkdownPlugin)
            .markdown.deserialize(summaryPart);
          editor.tf.insertNodes(markdown, {
            // Using 'at: block' doesn't work for some reasons
            at: editor.children[editor.children.length - 2],
          });
        } catch (error) {
          console.error(error);
          toast.error("Something went wrong when generating notes");
        }
      };

      await generateSummary({ pdfId, quality, length, abortSignal, onUpdate });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(`Failed to generate summary: ${error.message}`);
      }
    } finally {
      editor.tf.removeNodes({
        match: (n) => n.type === SkeletonPlugin.key,
        at: [],
        children: true,
      });

      setGeneratingSignal(undefined);
      setGenerating(false);
      setReadOnly(false);
    }
  };

  const stopGenerate = async () => {
    if (generatingSignal) {
      generatingSignal?.abort();
      setGeneratingSignal(undefined);
    }
  };

  if (generating && notesId) {
    return (
      <ToolbarButton
        className="text-red-500 hover:text-red-600 px-2 py-1"
        onClick={() => {
          stopGenerate();
          setReadOnly(false);
          setGenerating(false);
        }}
      >
        <PenOff />
        Stop Generating
      </ToolbarButton>
    );
  }

  return (
    <GenerateNotesDialog
      onGenerate={handleGenerate}
      trigger={
        <ToolbarButton className="leading-4">
          <Sparkles />
          Generate Notes
        </ToolbarButton>
      }
    />
  );
};
