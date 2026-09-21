import { NextResponse } from "next/server";

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzZrieHuBab0DzmRpGlupXrCMYuzTSwivqGZ-Cvu27pp6Y9d29ow45EV9PyM0uCbySQKA/exec";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log("Data diterima dari website:", data);


    if (
      !data.nama ||
      !data.nik ||
      !data.department ||
      !data.testType
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Data belum lengkap.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      data.testType !== "pre-test" &&
      data.testType !== "post-test"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Jenis test tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    const payload = {
      nama: String(data.nama).trim(),
      nik: String(data.nik).trim(),
      department: String(data.department).trim(),

      testType: String(data.testType),

      jawaban1: String(data.jawaban1 || "").trim(),
      jawaban2: String(data.jawaban2 || "").trim(),

      jumlahPartBenar:
        Number(data.jumlahPartBenar) || 0,

      totalPart:
        Number(data.totalPart) || 0,

      score:
        Number(data.score) || 0,
    };

    console.log(
      "Mengirim ke Google Apps Script:",
      payload
    );

    const response = await fetch(
      GOOGLE_APPS_SCRIPT_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8",
        },

        body: JSON.stringify(payload),

        cache: "no-store",

        redirect: "follow",
      }
    );

    const responseText = await response.text();

    console.log(
      "Status Apps Script:",
      response.status
    );

    console.log(
      "Response Apps Script:",
      responseText
    );

    if (!response.ok) {
      console.error(
        "Google Apps Script HTTP Error:",
        response.status,
        responseText
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Google Apps Script mengembalikan error.",
          detail: responseText,
        },
        {
          status: 500,
        }
      );
    }

    let appsScriptResult: {
      success?: boolean;
      message?: string;
    } | null = null;

    try {
      appsScriptResult = JSON.parse(responseText);
    } catch {
      // Jika Apps Script tidak mengembalikan JSON,
      // kita tetap lanjut berdasarkan HTTP status.
      console.warn(
        "Response Apps Script bukan JSON."
      );
    }

    if (
      appsScriptResult &&
      appsScriptResult.success === false
    ) {
      console.error(
        "Apps Script gagal:",
        appsScriptResult
      );

      return NextResponse.json(
        {
          success: false,
          message:
            appsScriptResult.message ||
            "Google Apps Script gagal menyimpan data.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "================================"
    );

    console.log(
      "DATA BERHASIL DIKIRIM KE GOOGLE SHEET"
    );

    console.log(
      "================================"
    );

    return NextResponse.json(
      {
        success: true,
        message:
          appsScriptResult?.message ||
          "Data berhasil disimpan.",
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "================================"
    );

    console.error(
      "ERROR SIMPAN DATA:"
    );

    console.error(error);

    console.error(
      "================================"
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
