import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjectPostPreviews, type PostPreview } from "../lib/sanityContent";

export default function Projects() {
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const postPreviews = await getProjectPostPreviews();
        setPosts(postPreviews);
        setStatus("ready");
      } catch (error) {
        console.error("Failed to load project posts from Sanity", error);
        setStatus("error");
      }
    };

    loadPosts();
  }, []);

  return (
    <main className="projects-container flex items-center justify-center pt-32 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-64">
        <header className="page-header flex flex-col items-center gap-8">
          <div className="w-[800px] max-w-[300vw] p-4">
            <h1>projects</h1>
          </div>
        </header>
        <section className="projects-content flex flex-col items-center gap-4">
          {status === "loading" && <p className="post-status-panel w-[800px] max-w-[90vw]">Loading projects...</p>}
          {status === "error" && <p className="post-status-panel w-[800px] max-w-[90vw]">Projects are unavailable right now.</p>}
          {status === "ready" && posts.length === 0 && <p className="post-status-panel w-[800px] max-w-[90vw]">Projects coming soon.</p>}
          {posts.map((post) => (
            <Link key={post._id} to={`/projects/${post.slug}`} className="post-preview-link w-[800px] max-w-[90vw] block">
              <article className="post-preview">
                <header className="post-preview-title-section">
                  <h2>{post.title}</h2>
                </header>
                <div className="post-preview-body-section">
                  {post.publishedAt && (
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  )}
                  {post.excerpt && <p className="italic">{post.excerpt}</p>}
                </div>
              </article>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
