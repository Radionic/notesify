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
        "flex items-center gap-1.5 px-2.5 py-2.5 text-xs font-medium transition-all duration-200 border-b-2 -mb-px cursor-pointer",
        recording
          ? "border-red-500 text-red-500"
          : active
            ? "border-foreground text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
      title={title}
    >
      {icon}
      <span>{title}</span>
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
      navigate({
        so: !sourceOpen,
        co: chatOpen,
      });
    } else {
      navigate({
        co: !chatOpen,
        so: sourceOpen,
      });
    }
  };

  return (
    <Card className="sticky grid grid-cols-[auto_1fr_auto] w-full px-1 border-b border-border z-30 rounded-none bg-header shadow-none">
      <div className="flex items-center">
        <Link to="/viewer" search={{}}>
          <img
            src="/favicon.png"
            alt="Notesify Icon"
            className="w-6 h-6 rounded-sm mx-1"
          />
        </Link>
      </div>

      <div className="flex items-center justify-start md:justify-center">
        <div className="flex flex-row items-center gap-1.5">
          <PanelToggle
            active={sourceOpen}
            onClick={() => togglePanel("source")}
            icon={<Library className="h-3.5 w-3.5" />}
            title="Source"
          />

          <PanelToggle
            active={chatOpen}
            onClick={() => togglePanel("chat")}
            icon={<Sparkles className="h-3.5 w-3.5" />}
            title="AI"
          />
        </div>
      </div>

      <div className="flex items-center">
        <UserIcon />
      </div>
    </Card>
  );
};
