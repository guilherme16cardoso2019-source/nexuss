import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus — Learn. Connect. Compete. Evolve.",
  description:
    "Nexus is an interactive educational platform connecting students, teachers and schools through learning, challenges and collaboration.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
