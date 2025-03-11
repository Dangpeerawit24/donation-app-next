import { PrismaClient } from "@prisma/client";
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url, 'http://localhost');
        const UID = searchParams.get("UID");

        if (!UID) {
            return new NextResponse(
                JSON.stringify({ success: false, message: "Missing UID" }),
                { status: 400 }
            );
        }
        const transaction = await prisma.campaign_transactions.findMany({
            where: { lineId: UID, form: "A"},
        });

        if (transaction.length === 0) {
            return new NextResponse(
                JSON.stringify({ success: false, message: "No transactionID found" }),
                { status: 404 }
            );
        }

        return new Response(JSON.stringify({ success: true, transaction }), {
            status: 200,
        });
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 });
    }
}
