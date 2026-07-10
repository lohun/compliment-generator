import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { TransitionProvider } from "@/components/transitions/TransitionContext";
import TransitionLayer from "@/components/transitions/TransitionLayer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Grand Praiser | AI Generated Grandiosity",
  description: "Over-the-top, slightly unhinged compliments at your service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-surface text-on-surface font-sans flex flex-col overflow-x-hidden selection:bg-primary-fixed selection:text-on-primary-fixed">
        <TransitionProvider>
          <TransitionLayer />
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}
