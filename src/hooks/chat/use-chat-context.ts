import { useAtom, useSetAtom } from "jotai";
import {
  activeBoundingContextAtom,
  activeContextsAtom,
  type Context,
  type TextContext,
} from "@/atoms/chat/contexts";
import { useNavigatePdf } from "@/queries/pdf/use-pdf";

export const useChatContext = () => {
  const [activeContexts, setActiveContexts] = useAtom(activeContextsAtom);
  const setActiveBoundingContext = useSetAtom(activeBoundingContextAtom);
  const { navigatePdf } = useNavigatePdf();

  const addContext = (context: Context) => {
    setActiveContexts([...activeContexts, context]);
  };

  const removeContext = (id: string) => {
    setActiveContexts(
      activeContexts.filter(
        (context) => context.type !== "text" || context.id !== id,
      ),
    );
  };

  const jumpToContext = (context: TextContext) => {
    if (!context.fileId || !context.page) {
      return;
    }
    navigatePdf({
      pdfId: context.fileId,
      page: context.page,
    });
    setActiveBoundingContext(context);
  };

  return { addContext, removeContext, jumpToContext };
};
