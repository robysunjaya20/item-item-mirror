import { NextResponse } from "next/server";

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwYDoThmCEkd3ZXMXpf-2mgkMXHqZZbGHN5oubLkQXdK9_sB-9Y48IvrjQxQpXTEPo/exec";

export async function POST(request: Request) {
  try {

    const data = await request.json();

    console.log("Data yang diterima:", data);

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
      nama: String(data.nama),
      nik: String(data.nik),
      department: String(data.department),

      testType: String(data.testType),

      jawaban1: data.jawaban1,
      jawaban2: data.jawaban2,

      jumlahPartBenar:
        Number(data.jumlahPartBenar) || 0,

      totalPart:
        Number(data.totalPart) || 0,

      score:
        Number(data.score) || 0,
    };

    console.log("Data yang dikirim ke Google Sheet:", payload);

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

    const responseText =
      await response.text();

    console.log(
      "HTTP Status Google Apps Script:",
      response.status
    );

    console.log(
      "Response Google Apps Script:",
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
            "Google Apps Script gagal menerima data.",
        },
        {
          status: 500,
        }
      );
    }

    let result: {
      success?: boolean;
      message?: string;
    } | null = null;

    try {
      result = JSON.parse(responseText);

      console.log(
        "JSON dari Google Apps Script:",
        result
      );
    } catch (error) {
      console.warn(
        "Response Google Apps Script bukan JSON.",
        responseText
      );
    }

    if (result?.success === false) {
      console.error(
        "Google Apps Script mengatakan gagal:",
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

    console.log(
      "Data berhasil dikirim ke Google Sheet."
    );

    return NextResponse.json(
      {
        success: true,
        message:
          result?.message ||
          "Data berhasil disimpan.",
      },
      {
        status: 200,
      }
    );

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
