import { useEffect, useState } from "react";
import { getBlogPostPreviews, type PostPreview } from "../lib/sanityContent";

export default function Blog() {
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const postPreviews = await getBlogPostPreviews();
        setPosts(postPreviews);
        setStatus("ready");
      } catch (error) {
        console.error("Failed to load blog posts from Sanity", error);
        setStatus("error");
      }
    };

    loadPosts();
  }, []);

  return (
    <main className="blog-container flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-64">
        <header className="page-header flex flex-col items-center gap-8">
          <div className="w-[800px] max-w-[300vw] p-4">
            <h1>blog</h1>
          </div>
        </header>
        <section className="blog-content flex flex-col items-center gap-4">
          {status === "loading" && <p>Loading posts...</p>}
          {status === "error" && <p>Posts are unavailable right now.</p>}
          {status === "ready" && posts.length === 0 && <p>Posts coming soon.</p>}
          {posts.map((post) => (
            <article key={post._id} className="w-[800px] max-w-[90vw] p-4">
              <h2>{post.title}</h2>
              {post.publishedAt && (
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              )}
              {post.excerpt && <p>{post.excerpt}</p>}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
