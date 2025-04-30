// import { atom } from "jotai";
// import { toast } from "sonner";

// import { highlightAtomFamily } from "@/atoms/pdf/highlights";
// import { pushActionAtom } from "./history";
// import { generateId } from "@/lib/id";
// import { Highlight } from "@/db/schema";
// import { ActionError } from "@/hooks/state/use-action";

// export const addHighlightAtom = atom(
//   null,
//   (
//     get,
//     set,
//     params: Omit<Highlight, "id"> & {
//       pdfId: string;
//     }
//   ) => {
//     const { pdfId, ...highlightParams } = params;
//     const newHighlight: Highlight = {
//       id: generateId(),
//       pdfId,
//       ...highlightParams,
//     };
//     set(pushActionAtom, {
//       action: "create",
//       type: "highlight",
//       pdfId,
//       data: newHighlight,
//     });
//   }
// );

// export const copyHighlightAtom = atom(null, async (get, set, text: string) => {
//   await navigator.clipboard.writeText(text);
//   toast.success("Copied to clipboard");
// });

// export const deleteHighlightAtom = atom(
//   null,
//   async (get, set, params: { pdfId: string; highlightId: string }) => {
//     const highlight = await get(highlightAtomFamily(params.highlightId));
//     if (!highlight) {
//       throw new ActionError("Failed to delete highlight");
//     }

//     set(pushActionAtom, {
//       action: "delete",
//       type: "highlight",
//       pdfId: params.pdfId,
//       data: highlight,
//     });
//   }
// );

// export const changeHighlightColorAtom = atom(
//   null,
//   async (
//     get,
//     set,
//     params: { pdfId: string; highlightId: string; color: string }
//   ) => {
//     const highlight = await get(highlightAtomFamily(params.highlightId));
//     if (!highlight) {
//       throw new ActionError("Failed to change highlight color");
//     }

//     set(pushActionAtom, {
//       action: "update",
//       type: "highlight",
//       pdfId: params.pdfId,
//       data: {
//         id: params.highlightId,
//         color: params.color,
//       },
//       oldData: {
//         id: params.highlightId,
//         color: highlight.color,
//       },
//     });
//   }
// );
