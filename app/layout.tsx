import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "午前四時に消える",
  description: "午前一時から四時までだけ開く、知らない誰かと一言を交わす場所。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}