import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import LineProvider from "next-auth/providers/line";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    LineProvider({
      clientId: process.env.NEXT_PUBLIC_LINE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_LINE_CLIENT_SECRET,
      authorization: {
        params: { scope: "profile openid email" },
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("ไม่มีผู้ใช้นี้ในระบบ");
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) {
          throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        return user;
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "line") {
        const lineUid = profile.sub;
        let dbUser = await prisma.user.findUnique({
          where: { lineuid: lineUid },
        });

        if (!dbUser) {
          throw new Error("ไม่พบบัญชีที่เชื่อมโยงกับ LINE นี้");
          
        }

        token.user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          lineuid: dbUser.lineuid,
        };
      } else if (user) {
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          lineuid: user.lineuid,
        };
      }

      return token;
    },

    async session({ session, token }) {
      session.user = token.user;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
