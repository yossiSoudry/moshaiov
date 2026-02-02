import type { Metadata } from "next";
import { Heebo, Assistant } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/providers/cart-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "מושיוב | תכשיטי זהב ויהלומים",
    template: "%s | מושיוב",
  },
  description: "מושיוב - תכשיטי זהב ויהלומים יוקרתיים. רבי עקיבא 113. טבעות, שרשראות, עגילים ועוד.",
  keywords: ["תכשיטים", "זהב", "יהלומים", "טבעות", "שרשראות", "עגילים", "מושיוב"],
  authors: [{ name: "מושיוב" }],
  creator: "מושיוב",
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "מושיוב - תכשיטי זהב ויהלומים",
    title: "מושיוב | תכשיטי זהב ויהלומים",
    description: "תכשיטי זהב ויהלומים יוקרתיים",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${heebo.variable} ${assistant.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
