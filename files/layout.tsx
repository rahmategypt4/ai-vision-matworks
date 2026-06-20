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
