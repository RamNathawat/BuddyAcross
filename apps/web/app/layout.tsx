import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider, QueryProvider } from "@/components/providers";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "BuddyAcross — Get Things Done, Locally",
    template: "%s | BuddyAcross",
  },
  description:
    "Connect with trusted local service providers for everyday tasks. Post a task, get bids, and get it done.",
  keywords: ["task marketplace", "local services", "errands", "hyperlocal"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                className: "font-sans",
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
