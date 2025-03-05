import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const campaigns = await prisma.campaign.findMany({
            where: { status: "เปิดกองบุญ" },
            orderBy: { id: 'desc' }
        });

        return NextResponse.json(campaigns); 
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }
}
