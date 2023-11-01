import { Footer } from "@/components/Footer";
import "./globals.css";
import { Header } from "@/components/Header";

export default function RootLayout(props: React.PropsWithChildren<{}>) {
  return (
    <html lang="en" className="flex justify-center scroll-smooth" style={{ background: "#fbfaf9" }}>
      <body className="max-w-3xl w-full">
        <Header />
        <div style={{ background: "#f6f6ef" }}>{props.children}</div>
        <Footer />
      </body>
    </html>
  );
}
