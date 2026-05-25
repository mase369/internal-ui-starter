import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Internal UI",
  description: "社内業務ツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
