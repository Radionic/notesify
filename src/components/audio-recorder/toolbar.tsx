import { useState } from "react";
import { XIcon, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "../ui/card";
import { TooltipButton } from "../tooltip/tooltip-button";
import { toast } from "sonner";
import { useSetAtom } from "jotai";
import { audioRecorderOpenAtom } from "@/atoms/recording/audio-recorder";

export const AudioRecorderToolbar = () => {
  const setIsOpen = useSetAtom(audioRecorderOpenAtom);

  // const [isSearchOpen, setIsSearchOpen] = useState(false);
  // const [searchQuery, setSearchQuery] = useState("");

  // const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const query = e.target.value;
  //   setSearchQuery(query);
  //   if (onSearch) {
  //     onSearch(query);
  //   }
  // };

  return (
    <Card className="sticky top-0 flex flex-row justify-end px-2 border-2 border-transparent z-30 rounded-none bg-header">
      <TooltipButton
        tooltip="Search recordings"
        onClick={() => {
          toast.info("Not implemented yet");
          // setIsSearchOpen(true)
        }}
      >
        <Search className="h-4 w-4" />
      </TooltipButton>
      <TooltipButton tooltip="Close" onClick={() => setIsOpen(false)}>
        <XIcon className="h-4 w-4" />
      </TooltipButton>
    </Card>
  );
};
