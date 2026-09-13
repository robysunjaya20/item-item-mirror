import { NextResponse } from "next/server";

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwYDoThmCEkd3ZXMXpf-2mgkMXHqZZbGHN5oubLkQXdK9_sB-9Y48IvrjQxQpXTEPo/exec";

export async function POST(request: Request) {
  try {
    // ========================================
    // AMBIL DATA DARI TESTFORM
    // ========================================

    const data = await request.json();

    // ========================================
    // VALIDASI DASAR
    // ========================================

    if (
      !data.nama ||
      !data.nik ||
      !data.department ||
      !data.testType ||
      !data.jawaban1 ||
      !data.jawaban2
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data belum lengkap.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // VALIDASI JENIS TEST
    // ========================================

    if (
      data.testType !== "pre-test" &&
      data.testType !== "post-test"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Jenis test tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // KIRIM KE GOOGLE APPS SCRIPT
    // ========================================

    const response = await fetch(
      GOOGLE_APPS_SCRIPT_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8",
        },

        body: JSON.stringify({
          nama: data.nama,
          nik: data.nik,
          department: data.department,

          testType: data.testType,

          jawaban1: data.jawaban1,
          jawaban2: data.jawaban2,

          jumlahPartBenar:
            data.jumlahPartBenar,

          totalPart:
            data.totalPart,

          score:
            data.score,
        }),

        cache: "no-store",
      }
    );

    // ========================================
    // BACA RESPONSE APPS SCRIPT
    // ========================================

    const result = await response.json();

    // ========================================
    // JIKA APPS SCRIPT GAGAL
    // ========================================

    if (!result.success) {
      console.error(
        "Apps Script error:",
        result.message
      );

      return NextResponse.json(
        {
          success: false,
          message:
            result.message ||
            "Data gagal disimpan ke Google Sheet.",
        },
        {
          status: 500,
        }
      );
    }

    // ========================================
    // BERHASIL
    // ========================================

    return NextResponse.json({
      success: true,
      message:
        "Data berhasil disimpan.",
    });

  } catch (error) {
    console.error(
      "Submit test error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan saat menyimpan data.",
      },
      {
        status: 500,
      }
    );
  }
}