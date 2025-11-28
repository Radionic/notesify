import { type ReactNode, useState } from "react";
import Draggable, {
  type DraggableData,
  type DraggableEvent,
} from "react-draggable";

import { Card } from "@/components/ui/card";
import type { Position } from "@/lib/types";
import { cn } from "@/lib/utils";

const Handle = ({ isDragging }: { isDragging: boolean }) => {
  return (
    <div
      className={cn(
        "handle w-16 h-2 mx-auto cursor-grab rounded-md hover:bg-neutral-300 transition-colors duration-200",
        isDragging ? "bg-neutral-300 cursor-grabbing" : "bg-neutral-200",
      )}
    />
  );
};

export default function DraggableContainer({
  defaultPosition,
  actionButtons,
  content,
  bounds,
  className,
  // draggable,
}: {
  defaultPosition: Position;
  actionButtons?: ReactNode;
  content: ReactNode;
  bounds?: string;
  className?: string;
  // draggable?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  // const [tmpPosition, setTmpPosition] = useState(defaultPosition);
  // console.log("Is", tmpPosition);

  // if (
  //   (typeof tmpPosition.top !== "number" &&
  //     typeof tmpPosition.bottom !== "number") ||
  //   (typeof tmpPosition.left !== "number" &&
  //     typeof tmpPosition.right !== "number")
  // )
  //   return;
  return (
    <Draggable
      bounds={bounds}
      handle=".handle"
      // disabled={!draggable}
      onStart={() => setIsDragging(true)}
      onDrag={(_: DraggableEvent, data: DraggableData) => {
        // console.log("Hello?", tmpPosition.top, tmpPosition.left, data);
        // setTmpPosition((tmpPosition) => ({
        //   ...tmpPosition,
        //   top: tmpPosition.top! + data.deltaY,
        //   left: tmpPosition.left! + data.deltaX,
        // }));
      }}
      onStop={() => setIsDragging(false)}
    >
      {/* Have to wrap the Card with a div, otherwise the handle is not draggable (a bug?) */}
      <div
        className={cn("absolute", className)}
        style={{
          top: defaultPosition.top,
          left: defaultPosition.left,
          bottom: defaultPosition.bottom,
          right: defaultPosition.right,
        }}
      >
        <Card className={cn("rounded-md p-1", isDragging && "select-none")}>
          <Handle isDragging={isDragging} />
          <div>
            {actionButtons}
            {content}
          </div>
        </Card>
      </div>
    </Draggable>
  );
}
