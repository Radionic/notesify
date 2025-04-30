// import { atom } from "jotai";
// import { annotationsAtomFamily } from "../../atoms/pdf/annotations";
// import { pushActionAtom } from "./history";
// import { generateId } from "@/lib/id";
// import { Annotation } from "@/db/schema";
// import { ActionError } from "@/hooks/state/use-action";

// export const createAnnotationAtom = atom(
//   null,
//   async (
//     get,
//     set,
//     params: {
//       pdfId: string;
//       type: "pen" | "highlighter";
//       path: string;
//       color: string;
//       size: number;
//       page: number;
//     }
//   ) => {
//     const { pdfId, type, path, color, size, page } = params;
//     // const annotationsAtom = annotationsAtomFamily(pdfId);
//     // const annotations = await get(annotationsAtom);

//     const newAnnotation: Annotation = {
//       id: generateId(),
//       type,
//       path,
//       color,
//       size,
//       page,
//       pdfId,
//     };

//     set(pushActionAtom, {
//       action: "create",
//       type: "annotation",
//       pdfId,
//       data: [newAnnotation],
//     });
//     return newAnnotation;
//   }
// );

// export const removeAnnotationAtom = atom(
//   null,
//   async (get, set, params: { pdfId: string; ids: string[] }) => {
//     const { pdfId, ids } = params;
//     if (ids.length === 0) {
//       throw new ActionError("No annotations to delete");
//     }

//     const annotationsAtom = annotationsAtomFamily(pdfId);
//     const annotations = await get(annotationsAtom);
//     set(pushActionAtom, {
//       action: "delete",
//       type: "annotation",
//       pdfId,
//       data: annotations.filter((annotation) => ids.includes(annotation.id)),
//     });
//   }
// );
