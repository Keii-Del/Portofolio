import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { getPostBySlug } from "@/lib/services/posts";

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Post tidak ditemukan" };
  return { title: post.title, description: post.excerpt };
}

export default async function PostDetailPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <article className="section pt-32">
      <div className="container-narrow max-w-3xl">
        <Reveal>
          <Link
            href="/blog"
            className="text-sm text-purple-400 hover:text-purple-300 mb-8 inline-block"
          >
            ← Kembali ke Blog
          </Link>

          <h1 className="heading-display mb-4">{post.title}</h1>
          {post.publishedAt && (
            <time className="text-sm text-slate-500 mb-8 block">
              {new Date(post.publishedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          )}
        </Reveal>

        <Reveal delay={100}>
          <div className="card p-10">
            <pre className="whitespace-pre-wrap font-body text-slate-300 leading-relaxed">
              {post.content}
            </pre>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
