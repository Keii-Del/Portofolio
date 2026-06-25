// Layer 1: Frontend — Home (Server Component).
// Data: featured projects from DB (cached).
// Cache-Control: public, s-maxage=60, stale-while-revalidate=300.

import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { getFeaturedProjects } from "@/lib/services/projects";

export const revalidate = 60;

const skills = [
  { name: "Next.js", level: "Advanced" },
  { name: "TypeScript", level: "Advanced" },
  { name: "React", level: "Advanced" },
  { name: "PostgreSQL", level: "Intermediate" },
  { name: "Tailwind CSS", level: "Advanced" },
  { name: "Node.js", level: "Intermediate" },
  { name: "Prisma", level: "Intermediate" },
  { name: "Vercel", level: "Advanced" },
];

const timeline = [
  {
    title: "Universitas Muhammadiyah Surakarta",
    role: "Teknik Informatika",
    period: "2026 — 2029",
  },
  {
    title: "SMA Negeri 2 Wonosari",
    role: "IPA",
    period: "2024 — 2026",
  },
];

export default async function HomePage() {
  const projects = await getFeaturedProjects();

  return (
    <>
      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center pt-24 px-6">
        <div className="container-narrow grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="badge mb-6">Open To Work</div>
            <h1 className="heading-display mb-6">
              Halo, Saya<span className="text-purple-500"> Pandu</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Mahasiswa Teknik Informatika UMS. Spesialisasi web development
              modern, UI design, dan arsitektur production-grade.
              Terbuka untuk project freelance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/#contact" className="btn-primary">
                Hubungi Saya
              </Link>
              <Link href="/projects" className="btn-outline">
                Lihat Project
              </Link>
            </div>
          </Reveal>

          <Reveal delay={150} className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
              <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full border-4 border-purple-500 overflow-hidden bg-slate-900 shadow-2xl shadow-purple-500/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/guwa.jpg"
                  alt="Pandu"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* About */}
      <section id="about" className="section">
        <div className="container-narrow">
          <Reveal>
            <h2 className="heading-display text-center mb-12">Tentang Saya</h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="card p-10">
              <p className="text-slate-300 text-center leading-relaxed text-lg">
                Saya mahasiswa Teknik Informatika UMS dengan passion di web
                development, database design, UI/UX, dan teknologi digital.
                Saat ini fokus membangun project dengan arsitektur modern
                (Next.js, Postgres, edge deployment) dan terbuka kolaborasi.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="section bg-slate-900/30">
        <div className="container-narrow">
          <Reveal>
            <h2 className="heading-display text-center mb-16">Skills</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skills.map((s, i) => (
              <Reveal key={s.name} delay={i * 50}>
                <div className="card p-6 text-center hover:-translate-y-1 hover:border-purple-500/40 transition-all">
                  <div className="font-display text-lg mb-1">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.level}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="section">
        <div className="container-narrow">
          <Reveal>
            <div className="flex justify-between items-end mb-12">
              <h2 className="heading-display">Featured Projects</h2>
              <Link
                href="/projects"
                className="text-purple-400 hover:text-purple-300 text-sm hidden sm:block"
              >
                Lihat semua →
              </Link>
            </div>
          </Reveal>

          {projects.length === 0 ? (
            <Reveal>
              <div className="card p-10 text-center text-slate-500">
                Belum ada project published. Tambah lewat{" "}
                <Link href="/admin" className="text-purple-400 underline">
                  admin panel
                </Link>
                .
              </div>
            </Reveal>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((p, i) => (
                <Reveal key={p.id} delay={i * 100}>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="card p-8 block hover:border-purple-500/40 hover:-translate-y-1 transition-all group"
                  >
                    <div className="flex flex-wrap gap-2 mb-4">
                      {p.tech.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-display text-xl mb-2 group-hover:text-purple-400 transition">
                      {p.title}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-3">
                      {p.description}
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Education */}
      <section id="education" className="section bg-slate-900/30">
        <div className="container-narrow max-w-4xl">
          <Reveal>
            <h2 className="heading-display text-center mb-16">
              Timeline Pendidikan
            </h2>
          </Reveal>
          <div className="border-l-2 border-purple-500 pl-10 space-y-12">
            {timeline.map((t, i) => (
              <Reveal key={t.title} delay={i * 150}>
                <div>
                  <h3 className="font-display text-xl mb-1">{t.title}</h3>
                  <p className="text-purple-400">{t.role}</p>
                  <p className="text-slate-500 text-sm">{t.period}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <ContactSection />
    </>
  );
}

// ============================================
// Contact section — client island for form
// ============================================
import { ContactForm } from "@/components/contact-form";
function ContactSection() {
  return (
    <section id="contact" className="section">
      <div className="container-narrow max-w-3xl">
        <Reveal>
          <h2 className="heading-display text-center mb-6">Hubungi Saya</h2>
          <p className="text-slate-400 text-center mb-12">
            Punya project atau pertanyaan? Kirim pesan di bawah.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
