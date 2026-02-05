import type { Metadata } from "next";
import { Heebo, Assistant } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/providers/cart-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { FlyToCartProvider } from "@/components/ui/fly-to-cart";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew"],
  weight: ["400", "500", "700"],
  display: "swap",
  adjustFontFallback: false,
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew"],
  weight: ["400", "600"],
  display: "swap",
  adjustFontFallback: false,
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
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>
            <FlyToCartProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </FlyToCartProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
