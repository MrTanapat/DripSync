import "~/styles/globals.css";

import { type Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";
import Navbar from "~/app/_components/Navbar";

export const metadata: Metadata = {
  title: "DripSync",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className="scroll-smooth">
      <body>
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