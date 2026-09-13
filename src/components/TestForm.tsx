"use client";

import { useState } from "react";
import { soal } from "@/data/Soal";
import { kunciJawaban } from "@/data/KunciJawaban";

interface TestFormProps {
  type: "pre-test" | "post-test";
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[.,;:!?()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitAnswers(answer: string) {
  return answer
    .replace(/\b\d+\s*[.)]\s*/g, "\n")
    .split(/[\n,;]+/)
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function checkPartAnswer(answer: string) {
  const answers = splitAnswers(answer);

  const foundParts = kunciJawaban.part.filter((part) => {
    return answers.some((userAnswer) => {
      return part.aliases.some((alias) => {
        return normalizeText(alias) === userAnswer;
      });
    });
  });

  return foundParts;
}

export default function TestForm({ type }: TestFormProps) {
  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");
  const [department, setDepartment] = useState("");
  const [jawaban1, setJawaban1] = useState("");
  const [jawaban2, setJawaban2] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [jumlahBenar, setJumlahBenar] = useState(0);

  // Status ketika data sedang dikirim
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPreTest = type === "pre-test";

  // ==========================================
  // SUBMIT TEST
  // ==========================================

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Cek kelengkapan data
    if (
      !nama.trim() ||
      !nik.trim() ||
      !department ||
      !jawaban1.trim() ||
      !jawaban2.trim()
    ) {
      alert("Mohon lengkapi semua data dan jawaban.");
      return;
    }

    // Mencegah submit dua kali
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // ========================================
      // HITUNG NILAI SOAL 1
      // ========================================

      const foundParts = checkPartAnswer(jawaban1);

      const totalParts = kunciJawaban.part.length;

      const scorePart = Math.round(
        (foundParts.length / totalParts) * 100
      );

      // ========================================
      // KIRIM DATA KE NEXT.JS API
      // ========================================

      const response = await fetch("/api/submit-test", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          nama: nama.trim(),
          nik: nik.trim(),
          department,

          // pre-test atau post-test
          testType: type,

          // Jawaban peserta
          jawaban1: jawaban1.trim(),
          jawaban2: jawaban2.trim(),

          // Hasil penilaian
          jumlahPartBenar: foundParts.length,
          totalPart: totalParts,
          score: scorePart,
        }),
      });

      // ========================================
      // BACA RESPONSE
      // ========================================

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            "Data gagal disimpan. Silakan coba lagi."
        );

        setIsSubmitting(false);
        return;
      }

      // ========================================
      // BERHASIL
      // ========================================

      setJumlahBenar(foundParts.length);
      setScore(scorePart);
      setSubmitted(true);

    } catch (error) {
      console.error("Submit error:", error);

      alert(
        "Terjadi kesalahan koneksi. Silakan coba lagi."
      );

    } finally {
      setIsSubmitting(false);
    }
  }

  // ==========================================
  // HALAMAN HASIL
  // ==========================================

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

            {/* HEADER HASIL */}
            <div className="bg-slate-950 px-6 py-10 text-center text-white sm:px-10">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-3xl font-black">
                ✓
              </div>

              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
                ITEM - ITEM MIRROR
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                {isPreTest ? "PRE-TEST" : "POST-TEST"}
              </h1>

              <p className="mt-3 text-base font-medium text-slate-200">
                Jawaban Anda telah berhasil dikirim.
              </p>

            </div>

            <div className="p-6 sm:p-8">

              {/* DATA PESERTA */}
              <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-5">

                <h2 className="mb-5 text-base font-black uppercase tracking-wide text-slate-900">
                  Data Peserta
                </h2>

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <p className="text-sm font-bold text-slate-500">
                      Nama
                    </p>

                    <p className="mt-1 text-base font-bold text-slate-950">
                      {nama}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-500">
                      NIK
                    </p>

                    <p className="mt-1 text-base font-bold text-slate-950">
                      {nik}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-500">
                      Department
                    </p>

                    <p className="mt-1 text-base font-bold text-slate-950">
                      {department}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-500">
                      Jenis Test
                    </p>

                    <p className="mt-1 text-base font-bold capitalize text-slate-950">
                      {type}
                    </p>
                  </div>

                </div>

              </div>

              {/* NILAI */}
              <div className="mt-5 rounded-2xl border-2 border-slate-200 bg-white p-7 text-center">

                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">
                  Nilai
                </p>

                <p className="mt-2 text-7xl font-black tracking-tight text-slate-950">
                  {score}
                </p>

                <div className="mx-auto mt-5 max-w-sm">

                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">

                    <div
                      className="h-full rounded-full bg-slate-950 transition-all duration-700"
                      style={{
                        width: `${score}%`,
                      }}
                    />

                  </div>

                </div>

                <p className="mt-5 text-base font-medium text-slate-600">

                  <span className="font-black text-slate-950">
                    {jumlahBenar}
                  </span>

                  {" "}dari{" "}

                  <span className="font-black text-slate-950">
                    {kunciJawaban.part.length}
                  </span>

                  {" "}part berhasil ditemukan.

                </p>

              </div>

              {/* SOAL 2 */}
              <div className="mt-5 rounded-2xl border-2 border-blue-200 bg-blue-50 p-5">

                <p className="text-base font-black text-blue-950">
                  Soal 2
                </p>

                <p className="mt-2 text-sm font-medium leading-6 text-blue-900">
                  Jawaban history problem / claim telah
                  diterima. Jawaban ini sebagai catatan.
                </p>

              </div>

              {/* KEMBALI */}
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setScore(null);
                  setJumlahBenar(0);
                }}
                className="mt-6 w-full rounded-xl border-2 border-slate-300 bg-white px-5 py-4 text-base font-black text-slate-900 transition hover:border-slate-950 hover:bg-slate-50"
              >
                Kembali
              </button>

            </div>
          </div>

        </div>
      </main>
    );
  }

  // ==========================================
  // FORM
  // ==========================================

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* ================================== */}
        {/* HEADER */}
        {/* ================================== */}

        <header className="mb-6 overflow-hidden rounded-3xl bg-slate-950 shadow-xl">

          <div className="px-6 py-9 sm:px-10 sm:py-11">

            <div className="flex items-center gap-5">

              {/* LOGO */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-black text-slate-950 shadow-lg">
                IM
              </div>

              <div>

                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-300">
                  ITEM - ITEM MIRROR
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {isPreTest ? "PRE-TEST" : "POST-TEST"}
                </h1>

              </div>

            </div>

            <div className="mt-7 h-px bg-white/20" />

            <p className="mt-5 max-w-3xl text-base font-medium leading-7 text-slate-200 sm:text-lg">
              Silakan isi data diri dan jawab seluruh
              pertanyaan berdasarkan pengetahuan Anda.
              Tuliskan jawaban dengan jelas dan lengkap.
            </p>

          </div>

        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* ================================== */}
          {/* DATA KARYAWAN */}
          {/* ================================== */}

          <section className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-7 flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-base font-black text-white">
                01
              </div>

              <div>

                <p className="text-sm font-black uppercase tracking-widest text-slate-500">
                  INFORMASI
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Data Karyawan
                </h2>

              </div>

            </div>

            <div className="grid gap-6 md:grid-cols-3">

              {/* NAMA */}
              <div>

                <label
                  htmlFor="nama"
                  className="mb-2.5 block text-base font-black text-slate-950"
                >
                  Nama
                  <span className="ml-1 text-red-600">
                    *
                  </span>
                </label>

                <input
                  id="nama"
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  autoComplete="off"
                  className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-4 text-base font-semibold text-slate-950 placeholder:text-slate-500 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
                />

              </div>

              {/* NIK */}
              <div>

                <label
                  htmlFor="nik"
                  className="mb-2.5 block text-base font-black text-slate-950"
                >
                  NIK
                  <span className="ml-1 text-red-600">
                    *
                  </span>
                </label>

                <input
                  id="nik"
                  type="text"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="Masukkan NIK"
                  autoComplete="off"
                  className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-4 text-base font-semibold text-slate-950 placeholder:text-slate-500 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
                />

              </div>

              {/* DEPARTMENT */}
              <div>

                <label
                  htmlFor="department"
                  className="mb-2.5 block text-base font-black text-slate-950"
                >
                  Department
                  <span className="ml-1 text-red-600">
                    *
                  </span>
                </label>

                <div className="relative">

                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`w-full appearance-none rounded-xl border-2 border-slate-300 bg-white px-4 py-4 pr-12 text-base font-semibold outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10 ${
                      department
                        ? "text-slate-950"
                        : "text-slate-500"
                    }`}
                  >

                    <option value="" disabled>
                      Pilih Department
                    </option>

                    <option value="IQC">
                      IQC
                    </option>

                    <option value="OQC">
                      OQC
                    </option>

                    <option value="ASSY MIRROR">
                      ASSY MIRROR
                    </option>

                    <option value="ASSY SEAT">
                      ASSY SEAT
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                  {/* ICON */}
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-800">

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* ================================== */}
          {/* SOAL 1 */}
          {/* ================================== */}

          <section className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-6 flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-base font-black text-white">
                02
              </div>

              <div className="pt-0.5">

                <p className="text-sm font-black uppercase tracking-widest text-slate-500">
                  PERTANYAAN 1
                </p>

                <h2 className="mt-2 text-lg font-black leading-8 text-slate-950 sm:text-xl">
                  {soal.soal1}
                </h2>

              </div>

            </div>

            {/* TIPS */}
            <div className="mb-6 rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4">

              <p className="text-base font-medium leading-7 text-slate-800">

                <span className="font-black text-slate-950">
                  💡 Tips:
                </span>{" "}

                Tuliskan setiap item part pada baris yang
                berbeda agar lebih mudah dibaca.

              </p>

            </div>

            <label
              htmlFor="jawaban1"
              className="mb-3 block text-base font-black text-slate-950"
            >
              Jawaban Anda
              <span className="ml-1 text-red-600">
                *
              </span>
            </label>

            <textarea
              id="jawaban1"
              value={jawaban1}
              onChange={(e) => setJawaban1(e.target.value)}
              placeholder={`Contoh:
1. ...
2. ...
3. ...
4. ...
5. ...`}
              rows={13}
              autoComplete="off"
              spellCheck={false}
              className="w-full resize-y rounded-2xl border-2 border-slate-300 bg-white px-5 py-5 text-[17px] font-semibold leading-8 text-slate-950 placeholder:font-medium placeholder:text-slate-500 outline-none transition duration-200 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
            />

            <div className="mt-3 flex items-center justify-between text-sm font-medium text-slate-500">

              <span>
                Satu item per baris disarankan
              </span>

              <span className="font-bold text-slate-700">
                {jawaban1.length} karakter
              </span>

            </div>

          </section>

          {/* ================================== */}
          {/* SOAL 2 */}
          {/* ================================== */}

          <section className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-6 flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-base font-black text-white">
                03
              </div>

              <div className="pt-0.5">

                <p className="text-sm font-black uppercase tracking-widest text-slate-500">
                  PERTANYAAN 2
                </p>

                <h2 className="mt-2 text-lg font-black leading-8 text-slate-950 sm:text-xl">
                  {soal.soal2}
                </h2>

              </div>

            </div>

            {/* INFORMASI */}
            <div className="mb-6 rounded-xl border-2 border-blue-200 bg-blue-50 px-5 py-4">

              <p className="text-base font-medium leading-7 text-blue-950">

                <span className="font-black">
                  ℹ️ Informasi:
                </span>{" "}

                Jawab dengan format Histori defect -
                Internal/Exsternal

              </p>

            </div>

            <label
              htmlFor="jawaban2"
              className="mb-3 block text-base font-black text-slate-950"
            >
              Jawaban Anda
              <span className="ml-1 text-red-600">
                *
              </span>
            </label>

            <textarea
              id="jawaban2"
              value={jawaban2}
              onChange={(e) => setJawaban2(e.target.value)}
              placeholder={`Contoh:
1. ...
2. ...
3. ...`}
              rows={13}
              autoComplete="off"
              spellCheck={false}
              className="w-full resize-y rounded-2xl border-2 border-slate-300 bg-white px-5 py-5 text-[17px] font-semibold leading-8 text-slate-950 placeholder:font-medium placeholder:text-slate-500 outline-none transition duration-200 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
            />

            <div className="mt-3 flex items-center justify-between text-sm font-medium text-slate-500">

              <span>
                Tuliskan history problem / claim yang Anda ketahui
              </span>

              <span className="font-bold text-slate-700">
                {jawaban2.length} karakter
              </span>

            </div>

          </section>

          {/* ================================== */}
          {/* SUBMIT */}
          {/* ================================== */}

          <section className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-5 text-lg font-black text-white shadow-lg transition duration-200 ${
                isSubmitting
                  ? "cursor-not-allowed bg-slate-500"
                  : "bg-slate-950 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl active:translate-y-0"
              }`}
            >

              {isSubmitting ? (
                <>
                  {/* LOADING */}
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-30"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>

                  <span>
                    Menyimpan Jawaban...
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Submit{" "}
                    {isPreTest
                      ? "Pre-Test"
                      : "Post-Test"}
                  </span>

                  <span className="text-xl">
                    →
                  </span>
                </>
              )}

            </button>

          </section>

        </form>

        {/* FOOTER */}
        <footer className="py-8 text-center">

          <p className="text-sm font-bold text-slate-500">
            Item Item Mirror • Bei Quality Training
          </p>

        </footer>

      </div>

    </main>
  );
}