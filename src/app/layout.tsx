import type { Metadata } from "next";
import "./globals.css";
import { MsalProviderWrapper } from "./components/MsalProviderWrapper";

export const metadata: Metadata = {
  title: "Youtube adatok",
  description: "Youtube adatok",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`min-h-screen mx-auto antialiased dark:bg-slate-800`}>
        <MsalProviderWrapper>{children}</MsalProviderWrapper>
      </body>
    </html>
  );
}
