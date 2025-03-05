"use client"; // ✅ กำหนดให้เป็น Client Component

import { SessionProvider } from "next-auth/react";

export default function SessionWrapper({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
