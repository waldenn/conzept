import { AppProvider } from "@/lib/App";
import "./globals.css";
import Navbar from "./Navbar";

export const metadata = {
  title: "nostr",
  description: "nostr",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <AppProvider>
        <body>
          <Navbar />
          {children}
        </body>
      </AppProvider>
    </html>
  );
}
