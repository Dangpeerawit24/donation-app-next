import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const campaigns = await prisma.$queryRaw`
            SELECT c.*, 
                COALESCE(SUM(t.value), 0) AS total_value
            FROM Campaign c
            LEFT JOIN Campaign_transactions t ON c.id = t.campaignsid
            WHERE c.status = 'เปิดกองบุญ'
            GROUP BY c.id
            HAVING c.stock > COALESCE(SUM(t.value), 0)
            ORDER BY c.updated_at DESC;
        `;

        return NextResponse.json(campaigns);
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }
}
