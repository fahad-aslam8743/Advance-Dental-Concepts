import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website administration",
  description: "Private clinic website administration.",
  robots: { index: false, follow: false, nocache: true }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
