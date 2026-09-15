import { NextResponse } from "next/server";

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxrHavr1PGN1Su8PJ1FNKM8DwAghBqQLA717AEkZQRvdoAJJYHTzB87CeiomM07i2dT/exec";

export async function POST(request: Request) {
  try {

    const data = await request.json();

    console.log(
      "Data diterima dari website:",
      data
    );

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
      nama: String(data.nama),
      nik: String(data.nik),
      department: String(data.department),

      testType: String(data.testType),

      jawaban1: data.jawaban1 || "",
      jawaban2: data.jawaban2 || "",

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
    
    let responseText = "";

    try {
      responseText = await response.text();
    } catch (error) {
      console.warn(
        "Tidak bisa membaca response Apps Script:",
        error
      );
    }

    console.log(
      "Status Apps Script:",
      response.status
    );

    console.log(
      "Response Apps Script:",
      responseText
    );

    if (
      response.status >= 400
    ) {
      console.error(
        "Google Apps Script mengembalikan error:",
        response.status,
        responseText
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Google Apps Script mengembalikan error.",
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
      "DATA BERHASIL DISIMPAN"
    );

    console.log(
      "================================"
    );

    return NextResponse.json(
      {
        success: true,
        message:
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
