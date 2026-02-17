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
  const { fo, co } = useSearch({ from: "/viewer/" });
  const isMobile = useIsMobile();

  const navigate = (updates: Record<string, unknown>) => {
    getRouter().navigate({
      to: "/viewer",
      search: (prev) => ({ ...prev, ...updates }),
      replace: true,
    });
  };

  const togglePanel = (panel: "library" | "chat") => {
    if (isMobile) {
      if (panel === "library") {
        if (fo) return;
        navigate({ fo: true, co: false });
      } else {
        if (co) return;
        navigate({ fo: false, co: true });
      }
      return;
    }

    if (panel === "library") {
      if (fo && !co) return;
      navigate({
        fo: !fo,
        co,
      });
    } else {
      if (co && !fo) return;
      navigate({
        co: !co,
        fo,
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
            active={fo}
            onClick={() => togglePanel("library")}
            icon={<Library className="h-3.5 w-3.5" />}
            title="Library"
          />

          <PanelToggle
            active={co}
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
