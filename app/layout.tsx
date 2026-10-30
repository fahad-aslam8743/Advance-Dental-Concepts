import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
import { getSiteSettings } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { metadataBase: new URL("https://advance-dental-concepts.vercel.app"), title: { default: "Advance Dental Concepts | Thoughtful, comprehensive dental care", template: "%s | Advance Dental Concepts" }, description: "Explore dental treatments, understand your options and prepare for a more informed conversation with your dentist.", robots: { index: true, follow: true } };
export default async function RootLayout({children}:{children:React.ReactNode}) {
 const settings=await getSiteSettings();
 return <html lang="en"><body><SiteHeader settings={settings}/>{children}<SiteFooter settings={settings}/></body></html>;
}
