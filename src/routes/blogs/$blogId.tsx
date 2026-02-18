import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { allPosts } from "content-collections";
import { ArrowLeft } from "lucide-react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Streamdown } from "streamdown";
import { Header } from "@/components/landing/header";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/blogs/$blogId")({
  loader: ({ params }) => {
    const post = allPosts.find((p) => p.blogId === params.blogId);
    if (!post) {
      throw notFound();
    }
    return post;
  },
  component: BlogPost,
});

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BlogPost() {
  const post = Route.useLoaderData();

  return (
    <article>
      <Header />
      <div className="p-4 pb-12 w-full max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          to="/blogs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All posts
        </Link>

        {/* Post header */}
        <header className="mb-6">
          <h1 className="font-ebg text-3xl md:text-4xl leading-tight tracking-tight mb-2">
            {post.title}
          </h1>
          {post.description && (
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              {post.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{formatDate(post.published)}</span>
            {post.authors?.length > 0 && (
              <>
                <span>·</span>
                <span>{post.authors.join(", ")}</span>
              </>
            )}
          </div>
        </header>

        {/* Post content */}
        <Streamdown
          className={cn(
            "w-full",
            // Tables
            "[&_table]:overflow-x-auto",
            // Code blocks
            "[&_pre]:overflow-x-auto",
          )}
          remarkPlugins={[
            [remarkGfm, {}],
            [remarkMath, { singleDollarTextMath: true }],
          ]}
          linkSafety={{ enabled: false }}
        >
          {post.content}
        </Streamdown>
      </div>
    </article>
  );
}
