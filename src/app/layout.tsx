import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "./context/SidebarContext";

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
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
