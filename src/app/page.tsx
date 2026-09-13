import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-black text-white">
          IM
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Item Mirror Training
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
          Full Assembly Mirror
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-500">
          Pilih jenis test yang ingin Anda kerjakan.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/pre-test"
            className="rounded-2xl bg-slate-900 px-6 py-5 font-bold text-white transition hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="block text-lg">
              Pre-Test
            </span>

            <span className="mt-1 block text-xs font-normal text-slate-300">
              Test sebelum training
            </span>
          </Link>

          <Link
            href="/post-test"
            className="rounded-2xl border border-slate-200 bg-white px-6 py-5 font-bold text-slate-900 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="block text-lg">
              Post-Test
            </span>

            <span className="mt-1 block text-xs font-normal text-slate-500">
              Test setelah training
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}