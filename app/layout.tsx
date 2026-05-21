import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Predictive Maintenance Platform",
  description:
    "Predict equipment failures and quantify the cost of unplanned downtime for dairy manufacturers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden">
            <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
