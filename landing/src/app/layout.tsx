import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOTP Extension - 2FA desde tu navegador",
  description: "Genera codigos 2FA directamente en tu navegador. Sin desbloquear el celular.",
  keywords: ["TOTP", "2FA", "autenticador", "extension chrome", "MFA"],
  openGraph: {
    title: "TOTP Extension",
    description: "2FA sin desbloquear tu celular",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
