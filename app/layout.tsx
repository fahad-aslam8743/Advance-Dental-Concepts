import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
export const metadata: Metadata = { metadataBase: new URL("https://advancedentalconcepts.com"), title: { default: "Advance Dental Concepts | Thoughtful, comprehensive dental care", template: "%s | Advance Dental Concepts" }, description: "Explore dental treatments, understand your options and prepare for a more informed conversation with your dentist.", robots: { index: true, follow: true } };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body><SiteHeader />{children}<SiteFooter /></body></html>; }
