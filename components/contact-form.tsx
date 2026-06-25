"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Mirror server-side schema untuk client-side early validation.
const schema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(100),
  email: z.string().trim().email("Email tidak valid"),
  message: z
    .string()
    .trim()
    .min(10, "Pesan minimal 10 karakter")
    .max(5000, "Pesan terlalu panjang"),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const [status, setStatus] = useState<
    { kind: "idle" } | { kind: "ok" } | { kind: "error"; message: string }
  >({ kind: "idle" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setStatus({ kind: "ok" });
      reset();
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Gagal mengirim",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <input
          {...register("name")}
          placeholder="Nama"
          className="input"
          autoComplete="name"
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className="input"
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div>
        <textarea
          {...register("message")}
          rows={5}
          placeholder="Pesan (min 10 karakter)"
          className="input resize-none"
        />
        {errors.message && (
          <p className="mt-2 text-sm text-red-400">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
      </button>

      {status.kind === "ok" && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
          ✓ Pesan berhasil dikirim. Saya balas via email secepatnya.
        </div>
      )}
      {status.kind === "error" && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          ✗ {status.message}
        </div>
      )}
    </form>
  );
}
