import { Link, useSearch } from "@tanstack/react-router";
import { Library, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { getRouter } from "@/router";
import { UserIcon } from "../auth/user-icon";

const PanelToggle = ({
  active,
  onClick,
  icon,
  title,
  recording,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  recording?: boolean;
}) => {
  return (
    <button
      type="button"
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200",
        recording
          ? "text-red-500"
          : active
            ? "text-blue-500"
            : "text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
      title={title}
    >
      {icon}
    </button>
  );
};

export const Header = () => {
  const { sid, so, co } = useSearch({ from: "/viewer/" });
  const isMobile = useIsMobile();

  const sourceOpen = so ?? !!sid;
  const chatOpen = isMobile && sourceOpen ? false : (co ?? !sourceOpen);

  const navigate = (updates: Record<string, unknown>) => {
    getRouter().navigate({
      to: "/viewer",
      search: (prev) => ({ ...prev, ...updates }),
      replace: true,
    });
  };

  const togglePanel = (panel: "source" | "chat") => {
    if (isMobile) {
      const isOpen = panel === "source" ? sourceOpen : chatOpen;
      if (isOpen) return;
      if (panel === "source") {
        navigate({ so: true, co: false });
      } else {
        navigate({ so: false, co: undefined });
      }
      return;
    }

    const isOpen = panel === "source" ? sourceOpen : chatOpen;
    if (isOpen) {
      const activeCount = [sourceOpen, chatOpen].filter(Boolean).length;
      if (activeCount <= 1) return;
    }

    if (panel === "source") {
      navigate({ so: !sourceOpen });
    } else {
      navigate({ co: !chatOpen });
    }
  };

  return (
    <Card className="sticky flex flex-row w-full px-0.5 py-1 border-2 border-transparent border-b-border justify-between z-30 rounded-none bg-header">
      <div className="flex flex-row items-center gap-1">
        <Link to="/viewer" search={{}}>
          <img
            src="/favicon.png"
            alt="Notesify Icon"
            className="w-6 h-6 rounded-sm mx-1"
          />
        </Link>

        <div className="flex flex-row items-center gap-0.5 rounded-md bg-muted p-0.5">
          <PanelToggle
            active={sourceOpen}
            onClick={() => togglePanel("source")}
            icon={<Library className="h-3.5 w-3.5" />}
            title="Library"
          />

          <PanelToggle
            active={chatOpen}
            onClick={() => togglePanel("chat")}
            icon={<Sparkles className="h-3.5 w-3.5" />}
            title="AI Assistant"
          />
        </div>
      </div>

      <div className="flex flex-row items-center gap-0.5">
        <UserIcon />
      </div>
    </Card>
  );
};
