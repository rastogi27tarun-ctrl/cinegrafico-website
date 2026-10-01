import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const siteTitle = "Cinegrafico Studios | Cinematic Brand Films, Motion & Design";
const siteDescription = "Boutique studio for animation, VFX, motion graphics, design, photography, and cinematography — Lucknow and remote worldwide.";
const siteUrl = "https://www.cinegraficostudios.in";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "Cinegrafico Studios",
    type: "website",
    images: [{ url: "/assets/cinegrafico-studio-logo-white.png", alt: "Cinegrafico Studios" }]
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/assets/cinegrafico-studio-logo-white.png"]
  },
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" }
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
