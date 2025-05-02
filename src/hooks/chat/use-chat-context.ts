import {
  activeBoundingContextAtom,
  activeContextsAtom,
  Context,
} from "@/atoms/chat/contexts";
import { useNavigatePdf } from "@/queries/pdf/use-pdf";
import { useAtom, useSetAtom } from "jotai";

export const useChatContext = () => {
  const [activeContexts, setActiveContexts] = useAtom(activeContextsAtom);
  const setActiveBoundingContext = useSetAtom(activeBoundingContextAtom);
  const { navigatePdf } = useNavigatePdf();

  const addContext = (context: Context) => {
    setActiveContexts([...activeContexts, context]);
  };

  const removeContext = (id: string) => {
    setActiveContexts(activeContexts.filter((context) => context.id !== id));
  };

  const jumpToContext = (context: Context) => {
    navigatePdf({
      pdfId: context.pdfId,
      page: context.page,
    });
    setActiveBoundingContext(context);
  };

  return { addContext, removeContext, jumpToContext };
};
