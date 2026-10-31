import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
import { getSiteSettings } from "@/lib/db";
import { VisitTracker } from "@/components/visit-tracker";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
 const settings=await getSiteSettings();
 return {
  metadataBase: new URL("https://advance-dental-concepts.vercel.app"),
  title: { default: settings.clinicName + " | Thoughtful, comprehensive dental care", template: "%s | " + settings.clinicName },
  description: "Explore dental treatments, understand your options and prepare for a more informed conversation with your dentist.",
  robots: { index: true, follow: true }
 };
}
export default async function RootLayout({children}:{children:React.ReactNode}) {
 const settings=await getSiteSettings();
 return <html lang="en"><body><VisitTracker/><SiteHeader settings={settings}/>{children}<SiteFooter settings={settings}/></body></html>;
}
