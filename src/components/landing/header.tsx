import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Menu, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "../logo";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { ThemeSwitch } from "../theme-switch";

const NavItem = ({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Link
      to={href}
      className={cn(
        `flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary`,
        className
      )}
    >
      {children}
    </Link>
  );
};

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-header/95 backdrop-blur supports-[backdrop-filter]:bg-header/60">
      <div className="flex justify-between items-center p-4 w-full max-w-6xl mx-auto">
        <Logo />

        <nav className="flex items-center justify-center space-x-2">
          <ThemeSwitch />
          <NavItem
            href="https://github.com/Radionic/notesify"
            className="hover:text-primary gap-2"
          >
            GitHub
            <GitHubLogoIcon className="h-5 w-5" />
          </NavItem>
        </nav>

        {/* Mobile Menu */}
        {/* <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <NavItem
                  href="https://github.com/Radionic/notesify"
                  className="gap-2"
                >
                  <GitHubLogoIcon className="h-4 w-4" />
                  GitHub
                </NavItem>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
      </div>
    </header>
  );
};
