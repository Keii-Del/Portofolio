import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { getPublishedPosts } from "@/lib/services/posts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: "Tulisan tentang web development, teknologi, dan pengalaman.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <section className="section pt-32">
      <div className="container-narrow">
        <Reveal>
          <h1 className="heading-display text-center mb-4">Blog</h1>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Catatan tentang web development, eksplorasi teknologi, dan
            pengalaman membangun project.
          </p>
        </Reveal>

        {posts.length === 0 ? (
          <Reveal>
            <div className="card p-10 text-center text-slate-500">
              Belum ada post.
            </div>
          </Reveal>
        ) : (
          <div className="space-y-6">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="card p-8 block hover:border-purple-500/40 transition-all group"
                >
                  <div className="flex justify-between items-start gap-6 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-2xl mb-3 group-hover:text-purple-400 transition">
                        {p.title}
                      </h2>
                      <p className="text-slate-400 line-clamp-2">{p.excerpt}</p>
                    </div>
                    {p.publishedAt && (
                      <time className="text-sm text-slate-500 shrink-0">
                        {new Date(p.publishedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </time>
                    )}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
