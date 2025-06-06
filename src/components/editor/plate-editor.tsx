import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plate } from "@udecode/plate/react";
import { useCreateEditor } from "@/components/editor/use-create-editor";
import { Editor, EditorContainer } from "@/components/plate-ui/editor";
import { useEffect, useRef, useCallback, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { StatesPlugin } from "../plate-ui/custom/states";
import { useNotes, useUpdateNotes } from "@/queries/notes/use-notes";

export function PlateEditor({
  notesId,
  pdfId,
}: {
  notesId?: string;
  pdfId?: string;
}) {
  const initedNotesId = useRef<string>("");
  const editor = useCreateEditor();
  const { data: notes } = useNotes({ notesId, pdfId });
  const { mutateAsync: updateNotes } = useUpdateNotes();
  const [readOnly, setReadOnly] = useState(false);
  const hasUnsavedChanges = useRef<boolean>(false);

  const saveNotes = useCallback(
    (notesId: string, value: any) => {
      console.log("Saving notes", value);
      updateNotes({ notesId, content: JSON.stringify(value) });
      hasUnsavedChanges.current = false;
    },
    [updateNotes]
  );

  const debouncedSave = useDebouncedCallback(saveNotes, 2000);

  // Load initial notes
  useEffect(() => {
    if (!editor || !notes || initedNotesId.current === notes.id) return;
    console.log("Loading notes", notes.id);

    const parsedData = JSON.parse(notes.content);

    // console.time("Loading notes");
    // editor.tf.setValue(parsedData);
    // console.timeEnd("Loading notes");

    setReadOnly(true);

    // Insert data in chunks of 10 items
    // TODO: any better way to init?
    const insertDataInChunks = (data: any[], chunkSize: number = 10) => {
      let currentIndex = 0;

      const insertNextChunk = () => {
        if (currentIndex >= data.length) {
          console.timeEnd("Chunked insertion");
          setReadOnly(false);
          return;
        }

        const chunk = data.slice(currentIndex, currentIndex + chunkSize);
        if (currentIndex === 0) {
          editor.tf.setValue(chunk);
        } else {
          editor.tf.insertNodes(chunk);
        }
        currentIndex += chunkSize;

        requestAnimationFrame(insertNextChunk);
      };

      insertNextChunk();
    };

    console.time("Chunked insertion");
    insertDataInChunks(parsedData);

    initedNotesId.current = notes.id;
    return () => {
      console.log("Flushing notes save");
      debouncedSave.flush();
    };
  }, [editor, notes]);

  // Handle tab closing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        debouncedSave.flush();
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!editor || !notes) return;
    editor.setOption(StatesPlugin, "notesId", notes.id);
  }, [editor, notes]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate
        readOnly={readOnly}
        editor={editor}
        onChange={({ value }) => {
          if (!notes || initedNotesId.current !== notes.id) return;
          hasUnsavedChanges.current = true;
          debouncedSave(notes.id, value);
        }}
      >
        <EditorContainer data-registry="plate" className="h-full flex">
          <Editor className="h-full flex-1 bg-panel rounded-none pt-10" />
        </EditorContainer>

        {/* <SettingsDialog /> */}
      </Plate>
    </DndProvider>
  );
}
