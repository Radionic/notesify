import { Button } from "@/components/ui/button";
import { isTauri } from "@/lib/tauri";
import { Link } from "@tanstack/react-router";
import { IoLogoApple, IoLogoWindows } from "react-icons/io5";
import { AiOutlineLinux } from "react-icons/ai";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-background to-background/50 py-16 px-4 max-w-5xl mx-auto">
      <div className="text-center">
        <h1 className="font-ebg text-4xl md:text-5xl lg:text-6xl">
          Read, Write, and Organize Notes
        </h1>
        <p className="font-ebg mt-4 text-muted-foreground text-xl sm:text-2xl">
          The AI-powered note-taking workspace
        </p>

        <Link to="/library" className="p-0">
          <Button className="text-lg rounded-md bg-blue-500 px-8 py-5 font-medium text-white hover:bg-blue-600 mt-6">
            {isTauri ? "Get Started" : "Try Online"}
          </Button>
        </Link>

        <div className="flex justify-center items-center my-4 space-x-2">
          <span className="text-sm text-muted-foreground">
            Available soon on
          </span>
          <IoLogoApple className="cursor-pointer" />
          <IoLogoWindows className="cursor-pointer" />
          <AiOutlineLinux className="cursor-pointer" />
        </div>
      </div>

      <div className="relative w-full max-w-[80rem]">
        <img
          src="/demo.jpg"
          alt="Notesify Demo"
          className="rounded-xl shadow-2xl"
        />
      </div>
    </section>
  );
}
