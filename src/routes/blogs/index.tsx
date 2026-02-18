import { createFileRoute, Link } from "@tanstack/react-router";
import { allPosts } from "content-collections";
import { CalendarDays } from "lucide-react";
import { Header } from "@/components/landing/header";

export const Route = createFileRoute("/blogs/")({
  component: BlogIndex,
});

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BlogIndex() {
  const sortedPosts = [...allPosts].sort(
    (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime(),
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 py-8 w-full max-w-4xl mx-auto">
        {/* Rest of posts */}
        {sortedPosts.length > 0 && (
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
            {sortedPosts.map((post) => (
              <Link
                key={post.blogId}
                to="/blogs/$blogId"
                params={{ blogId: post.blogId }}
                className="group flex flex-col gap-2"
              >
                {post.headerImage && (
                  <div className="overflow-hidden rounded-lg border bg-muted aspect-video mb-1">
                    <img
                      src={post.headerImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] pointer-events-none select-none"
                    />
                  </div>
                )}
                <h3 className="font-ebg text-2xl leading-snug group-hover:text-muted-foreground transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  <span>{formatDate(post.published)}</span>
                  {post.authors?.length > 0 && (
                    <>
                      <span>·</span>
                      <span>{post.authors.join(", ")}</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
