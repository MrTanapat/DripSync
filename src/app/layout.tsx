import "~/styles/globals.css";
import { Noto_Sans_Thai } from "next/font/google";
import { type Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";
import Navbar from "~/app/_components/Navbar";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-thai",
});

export const metadata: Metadata = {
  title: "DripSync",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`scroll-smooth ${notoSansThai.variable}`}>
      <body className={notoSansThai.className}>
        <SessionProvider>
          <TRPCReactProvider>
            <Navbar />
            <div>{children}</div>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}