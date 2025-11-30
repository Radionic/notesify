import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { UserIcon } from "../auth/user-icon";
import { Logo } from "../logo";
import { ThemeSwitch } from "../theme-switch";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-header/95 backdrop-blur supports-[backdrop-filter]:bg-header/60">
      <div className="flex justify-between items-center p-4 w-full max-w-6xl mx-auto">
        <Logo />

        <nav className="flex items-center justify-center">
          <a
            href="https://github.com/Radionic/notesify"
            className="mr-2"
          >
            <GitHubLogoIcon className="h-5 w-5" />
          </a>
          <ThemeSwitch />
          <UserIcon />
        </nav>
      </div>
    </header>
  );
};
