import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InsideSuccess Marketing",
  description:
    "Your marketing, prepared for you. Nothing goes out without your yes.",
};

// Applies the saved theme before first paint so switching never flashes.
const themeInit = `try{var t=localStorage.getItem("v2theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="cobalt" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body
        className={`${bricolage.variable} ${inter.variable} min-h-full antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
