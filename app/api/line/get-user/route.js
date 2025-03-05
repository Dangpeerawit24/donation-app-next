import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
    try {
        // ดึง query parameters
        const { searchParams } = new URL(req.url);
        const name = searchParams.get("name");
        const userid = searchParams.get("userid");

        if (!name) {
            return new Response(
                JSON.stringify({ success: false, message: "Missing name parameter" }),
                { status: 400 }
            );
        }
        if (!userid) {
            return new Response(
                JSON.stringify({ success: false, message: "Missing userid parameter" }),
                { status: 400 }
            );
        }

        const users = await prisma.campaign_transactions.findMany({
            where: {
                detailsname: {
                    contains: name
                },
                lineId: {
                    contains: userid
                },
                detailsbirthdate: {
                    not: null,
                },
            },
            select: {
                detailsname: true,
                detailsbirthdate: true,
                detailsbirthmonth: true,
                detailsbirthyear: true,
                detailsbirthtime: true,
                detailsbirthconstellation: true,
                detailsbirthage: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 1,
        });

        if (users.length === 0) {
            return new Response(
                JSON.stringify({ success: false, message: "No users found" }),
                { status: 404 }
            );
        }

        return new Response(JSON.stringify({ success: true, users }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return new Response(
            JSON.stringify({ success: false, message: "Internal Server Error" }),
            { status: 500 }
        );
    }
}
