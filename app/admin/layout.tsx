import { Providers } from "@/components/providers";

// Force dynamic untuk semua admin routes (uses session, search params, DB).
export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}