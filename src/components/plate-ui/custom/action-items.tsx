import {
  createPlatePlugin,
  useEditorPlugin,
  useEditorRef,
  usePlateState,
} from "@udecode/plate/react";
import { Card } from "@/components/ui/card";
import { deserializeMd } from "@udecode/plate-markdown";
import { useAtomValue, useSetAtom } from "jotai";
import { activePdfIdAtom } from "@/atoms/pdf/pdf-viewer";
import { toast } from "sonner";
import { generatingNotesAtom } from "@/atoms/notes/notes";
import { StatesPlugin } from "./states";
import { SkeletonPlugin } from "./skeleton";
import { getSelectedModelAtom } from "@/actions/setting/providers";

const ActionCard = ({
  title,
  description,
  onClick,
  children,
}: {
  title: string;
  description: string;
  onClick?: () => void;
  children?: React.ReactNode;
}) => {
  return (
    <Card
      className="px-4 py-2 hover:bg-muted cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="text-left w-full overflow-hidden">
        <div className="font-medium overflow-wrap-anywhere">{title}</div>
        <div className="text-sm text-muted-foreground overflow-wrap-anywhere">
          {description}
        </div>
      </div>
      {children}
    </Card>
  );
};

export const ActionItemsElement = () => {
  const editor = useEditorRef();
  const pdfId = useAtomValue(activePdfIdAtom);
  const { getOption } = useEditorPlugin(StatesPlugin);
  const notesId = getOption("notesId");

  const [readOnly, setReadOnly] = usePlateState("readOnly");
  const generateSummary = useSetAtom(generateSummaryAtom);
  const generatingSignal = useAtomValue(generatingNotesAtom(notesId));

  const getModel = useSetAtom(getSelectedModelAtom);

  const startGenerate = async (concise: boolean) => {
    if (generatingSignal) {
      toast.error("Summary is already being generated");
      return;
    }

    if (!pdfId) {
      toast.error("Please open a PDF first");
      return;
    }

    const model = await getModel("Chat");
    if (!model) {
      return;
    }

    setReadOnly(true);

    const onUpdate = async (summary: string, finished: boolean) => {
      editor.tf.setValue(deserializeMd(editor, summary));
      if (!finished) {
        editor.tf.insertNodes({
          children: [{ text: "" }],
          type: SkeletonPlugin.key,
        });
      }
    };
    await generateSummary({
      notesId,
      pdfId,
      quality: "Standard",
      length: concise ? "Concise" : "Detail",
      onUpdate,
    });

    setReadOnly(false);
  };

  if (generatingSignal) {
    return;
  }

  return (
    <div
      contentEditable={false}
      className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-8"
    >
      <ActionCard
        title="Generate Summary"
        description="Concise summary in point forms"
        onClick={() => startGenerate(true)}
      />
      <ActionCard
        title="Generate Detailed Summary"
        description="Detailed summary with background context"
        onClick={() => startGenerate(false)}
      />
    </div>
  );
};

export const ActionItemsPlugin = createPlatePlugin({
  key: "action_items",
  node: {
    isElement: true,
    isVoid: true,
    isSelectable: false,
    type: "action_items",
    component: ActionItemsElement,
  },
  handlers: {
    onChange: (editor) => {
      const nodes = editor.editor.children.filter(
        (node) => node.type !== ActionItemsPlugin.key
      );
      if (nodes.length >= 3) {
        // console.log("Hide actions");
        editor.tf.removeNodes({
          match: (node) => node.type === ActionItemsPlugin.key,
          at: [],
          children: true,
        });
        return;
      }

      const hasActions = editor.editor.children.some(
        (node) => node.type === ActionItemsPlugin.key
      );
      if (!hasActions) {
        // console.log("Show actions");
        editor.tf.insertNodes(
          {
            children: [{ text: "" }],
            type: ActionItemsPlugin.key,
          },
          {
            at: [0],
          }
        );
      }
    },
  },
});
