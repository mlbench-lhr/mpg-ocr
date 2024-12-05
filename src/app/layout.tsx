import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MPG OCR",
  description: "MPG OCR - Streamline your document processing with cutting-edge Optical Character Recognition technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen bg-white">
        {children}
      </body>
    </html>
  );
}
