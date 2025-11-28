import { useAtom } from "jotai";
import { withThinkingAtom } from "@/atoms/chat/chats";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ResponseQualityButton = () => {
  const [withThinking, setWithThinking] = useAtom(withThinkingAtom);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="mr-2 text-muted-foreground"
        >
          {withThinking ? "High Quality" : "Normal Quality"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-pointer">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="with-thinking"
              checked={withThinking}
              onCheckedChange={(checked) => setWithThinking(checked as boolean)}
            />
            <label
              htmlFor="with-thinking"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              With Thinking
            </label>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
