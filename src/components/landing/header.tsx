import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { UserIcon } from "../auth/user-icon";
import { Logo } from "../logo";
import { ThemeSwitch } from "../theme-switch";

const HEADER_PATHS = ["/", "/models", "/pricing"];

export const Header = () => {
  const path = useLocation();
  const router = useRouter();
  const { data } = authClient.useSession();
  const user = data?.user;

  const handleSignOut = async () => {
    await authClient.signOut();
    await router.invalidate();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex justify-between items-center px-4 py-3 w-full max-w-6xl mx-auto">
        <Logo />

        {HEADER_PATHS.includes(path.pathname) && (
          <div className="hidden md:flex items-center gap-3 font-ebg text-muted-foreground text-lg">
            <Link to="/">Blogs</Link>
            <Link to="/models">Models</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
        )}

        <nav className="hidden md:flex items-center justify-center">
          <ThemeSwitch />
          <UserIcon />
        </nav>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 font-ebg">
              <DropdownMenuItem asChild>
                <Link to="/models">Blogs</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/models">Models</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/pricing">Pricing</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {user ? (
                <>
                  <div className="flex items-center justify-between px-2 py-2">
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      <span className="text-sm font-medium leading-none truncate">
                        {user.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                    <ThemeSwitch />
                  </div>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-500 focus:text-red-500"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </>
              ) : (
                <div className="flex items-center justify-between p-1">
                  <ThemeSwitch />
                  <Button size="sm" asChild>
                    <Link to="/auth/login">Login</Link>
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
