// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import { Providers } from "@/components/providers";
// import "./globals.css";

// const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
// const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "中古品の査定 — Identifikasi Barang Bekas",
//   description:
//     "Upload foto barang bekas, AI akan mengenali nama, kondisi, dan estimasi harga jualnya.",
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="id" suppressHydrationWarning>
//       <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "就労規則モデル Q&A",
  description: "AWS Bedrock ナレッジベース搭載 RAG システム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
