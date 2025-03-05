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
    <html lang="en">
      <body>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}