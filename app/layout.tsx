import type React from "react";
import Header from "@/components/layouts/Header";
import SubHeader from "@/components/layouts/SubHeader";
import "./globals.css";
import Providers from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <Providers>
          <Header />
          <SubHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
