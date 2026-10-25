import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, JetBrains_Mono } from "next/font/google";
import { profile } from "@/data/profile";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--nf-display",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

const body = Figtree({
  variable: "--nf-body",
  subsets: ["latin"],
});

const code = JetBrains_Mono({
  variable: "--nf-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vikram-portfolio-in.vercel.app"),
  title: `${profile.name} | Full-Stack Software Engineer`,
  description: profile.summary,
  authors: [{ name: profile.name }],
  keywords: [
    "Vikram Aathithayan",
    "Full-Stack Developer",
    "Software Engineer Tamil Nadu",
    "Next.js Developer",
    "Node.js Developer",
    "PostgreSQL",
  ],
  openGraph: {
    title: `${profile.name} | Full-Stack Software Engineer`,
    description: profile.summary,
    type: "website",
    images: ["/images/vikram-photo.jpg"],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${code.variable} antialiased`}
      // The inline script below adds a "js" class before hydration.
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {children}
      </body>
    </html>
  );
}
