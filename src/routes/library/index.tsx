import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import z from "zod";
import { FileBrowser } from "@/components/file-system/file-browser";
import { Header } from "@/components/landing/header";
import { protectRouteFn } from "@/server/auth";

const RouteComponent = () => {
  const searchParams = useSearch({ from: "/library/" });
  const navigate = useNavigate({ from: "/library" });

  const handleSearchChange = (value?: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        q: value || undefined,
      }),
      replace: true,
    });
  };

  const handleFolderIdChange = (folderId: string | null) => {
    navigate({
      search: (prev) => ({
        ...prev,
        p: folderId || undefined,
      }),
      replace: true,
    });
  };

  return (
    <div className="bg-panel min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <FileBrowser
          initialSearch={searchParams.q}
          onSearchChanged={handleSearchChange}
          initialFolderId={searchParams.p}
          onFolderIdChanged={handleFolderIdChange}
        />
      </main>
    </div>
  );
};

export const Route = createFileRoute("/library/")({
  component: RouteComponent,
  ssr: "data-only",
  validateSearch: z.object({
    q: z.string().optional(),
    p: z.string().optional(),
  }),
  beforeLoad: async ({ location }) => {
    await protectRouteFn({
      data: {
        redirect: location.href,
      },
    });
  },
  head: () => ({
    meta: [
      {
        title: "Library | Notesify",
      },
    ],
  }),
});
