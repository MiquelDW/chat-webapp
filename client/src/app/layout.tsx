import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// all Clerk hooks and components must be children of the <ClerkProvider> component, which provides active session and user context
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

// Root Layout Component wraps around all routes inside the application
// it ensures a consistent layout for all routes within the application
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
