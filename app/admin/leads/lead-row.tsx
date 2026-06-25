"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Lead = {
  id: string;
  name: string;
  email: string;
  message: string;
  source: string | null;
  read: boolean;
  createdAt: string;
};

export function LeadRow({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);

  const toggleRead = () => {
    startTransition(async () => {
      await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, read: !lead.read }),
      });
      router.refresh();
    });
  };

  return (
    <div
      className={`card p-5 ${lead.read ? "opacity-60" : "border-purple-500/30"}`}
    >
      <div className="flex justify-between items-start gap-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 text-left min-w-0"
        >
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium">{lead.name}</span>
            <span className="text-sm text-slate-500">{lead.email}</span>
            {!lead.read && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                New
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 line-clamp-1">{lead.message}</p>
          <div className="text-xs text-slate-500 mt-1">
            {new Date(lead.createdAt).toLocaleString("id-ID")} · {lead.source ?? "contact-form"}
          </div>
        </button>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleRead}
            disabled={pending}
            className="text-sm px-3 py-1.5 rounded-xl border border-white/20 hover:bg-white/10 transition disabled:opacity-50"
          >
            {lead.read ? "Tandai Unread" : "Tandai Read"}
          </button>
          <a
            href={`mailto:${lead.email}`}
            className="text-sm px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white transition"
          >
            Reply
          </a>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <pre className="whitespace-pre-wrap font-body text-slate-300 text-sm leading-relaxed">
            {lead.message}
          </pre>
        </div>
      )}
    </div>
  );
}