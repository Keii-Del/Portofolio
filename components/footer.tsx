import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 mt-auto">
      <div className="container-narrow flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
        <div>© {new Date().getFullYear()} Pandu. All rights reserved.</div>
        <div className="flex gap-6">
          <Link href="/blog" className="hover:text-purple-400 transition">
            Blog
          </Link>
          <Link href="/projects" className="hover:text-purple-400 transition">
            Projects
          </Link>
          <Link href="/#contact" className="hover:text-purple-400 transition">
            Contact
          </Link>
          <Link href="/admin" className="hover:text-purple-400 transition">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
