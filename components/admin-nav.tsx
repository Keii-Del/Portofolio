"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/leads", label: "Leads" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 mb-8 border-b border-white/10 overflow-x-auto">
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "px-4 py-3 text-sm whitespace-nowrap transition border-b-2",
              active
                ? "border-purple-500 text-purple-300"
                : "border-transparent text-slate-400 hover:text-white",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}