import "./globals.css";

export const metadata = {
  title: "Cinegrafico CMS",
  description: "Cinegrafico Studios full CMS"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
