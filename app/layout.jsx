import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper"; 

export const metadata = {
  title: "ระบบจัดการกองบุญออนไลน์",
  description: "ระบบจัดการกองบุญออนไลน์ วิหารพระโพธิสัตว์กวนอิมทุ่งพิชัย",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
