import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url, 'http://localhost');
        const id = searchParams.get("id");

        if (!id || isNaN(id)) {
            return NextResponse.json({ error: "Invalid or missing id parameter" }, { status: 400 });
        }

        const campaign = await prisma.campaign.findUnique({
            where: { id: Number(id) },
        });

        if (!campaign) {
            return NextResponse.json({ error: "No campaign found for the provided id" }, { status: 404 });
        }

        return NextResponse.json(campaign);

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }
}
