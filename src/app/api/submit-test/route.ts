import { NextResponse } from "next/server";

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw2GOqfxjoThorUo3-6Z8EgLj6JV98M9OjEdY4HDtXh3NSjeXRwCa6egHBb4dCx9XyOYQ/exec";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log("Data diterima dari website:", data);

    if (
      !data.nama ||
      !data.nik ||
      !data.department ||
      !data.email ||
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

    const score = Number(data.score) || 0;

    const payload = {
      nama: String(data.nama).trim(),
      nik: String(data.nik).trim(),
      department: String(data.department).trim(),
      email: String(data.email).trim(),

      testType: String(data.testType).trim(),

      jawaban1: String(data.jawaban1 || "").trim(),
      jawaban2: String(data.jawaban2 || "").trim(),

      jumlahPartBenar:
        Number(data.jumlahPartBenar) || 0,

      totalPart:
        Number(data.totalPart) || 0,

      score,
    };

    console.log("Payload ke Google Apps Script:", payload);

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
      testType?: string;
      sheet?: string;
      score?: number;
      certificateStatus?: string;
    } = {};

    try {
      appsScriptResult =
        JSON.parse(responseText);
    } catch {
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
      "Data berhasil dikirim ke Google Sheet."
    );

    return NextResponse.json(
      {
        success: true,

        message:
          appsScriptResult.message ||
          "Data berhasil disimpan.",

        testType:
          appsScriptResult.testType ||
          data.testType,

        sheet:
          appsScriptResult.sheet ||
          null,

        score:
          appsScriptResult.score ??
          score,

        certificateStatus:
          appsScriptResult.certificateStatus ||
          null,

        certificateSent: false,

        certificateUrl: null,
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