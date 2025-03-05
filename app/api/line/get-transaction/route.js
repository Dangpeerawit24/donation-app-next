import { PrismaClient } from "@prisma/client";
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url, 'http://localhost');
        const transactionID = searchParams.get("transactionID");

        if (!transactionID) {
            return new NextResponse(
                JSON.stringify({ success: false, message: "Missing transactionID parameter" }),
                { status: 400 }
            );
        }
        console.log(transactionID)
        const transaction = await prisma.campaign_transactions.findMany({
            where: { transactionID: transactionID },
            select: {
                id: true,
                transactionID: true,
                campaignsname: true,
                lineId: true,
                lineName: true,
                value: true,
            },
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
