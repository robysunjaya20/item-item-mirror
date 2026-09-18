import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {

  title: {
    default: "Item - Item Mirror | Quality Training",
    template: "%s | Item - Item Mirror",
  },

  description:
    "Platform Pre-Test dan Post-Test Training Item - Item Mirror untuk evaluasi pengetahuan dan pemahaman karyawan.",

  keywords: [
    "Item Item Mirror",
    "Item Mirror",
    "Mirror Training",
    "Quality Training",
    "Pre-Test",
    "Post-Test",
    "Training",
    "Quality Control",
    "Automotive",
  ],

  authors: [
    {
      name: "Quality Training",
    },
  ],

  creator: "Quality Training",

  publisher: "Quality Training",

  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },

  openGraph: {
    type: "website",

    locale: "id_ID",

    url: "https://item-item-mirror.vercel.app",

    siteName: "Item - Item Mirror",

    title: "Item - Item Mirror | Quality Training",

    description:
      "Platform Pre-Test dan Post-Test Training Item - Item Mirror untuk evaluasi pengetahuan karyawan.",

    images: [
      {
        url: "/og_bei.png",
        width: 1200,
        height: 630,
        alt: "Item - Item Mirror | Quality Training",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Item - Item Mirror | Quality Training",

    description:
      "Platform Pre-Test dan Post-Test Training Item - Item Mirror.",

    images: ["/og-image.png"],
  },

  robots: {
    index: false,
    follow: false,

    googleBot: {
      index: false,
      follow: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col"
      >
        {children}
      </body>
    </html>
  );
}