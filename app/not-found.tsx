import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <div className="font-display text-9xl text-purple-500 mb-4">404</div>
        <h1 className="heading-display mb-6">Halaman Tidak Ditemukan</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Halaman yang kamu cari mungkin sudah dipindahkan atau tidak pernah ada.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Kembali ke Home
        </Link>
      </div>
    </section>
  );
}
