"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [campaigns, setCampaigns] = useState([]);

    const redirectToLineLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_LINE_LOGIN_CLIENT_ID;
        const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI);
        const state = Math.random().toString(36).substring(7);

        const url = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=openid%20profile%20email`;

        window.location.href = url;
    };

    useEffect(() => {
        const userProfile = getCookie("profile");

        if (!userProfile) {
            redirectToLineLogin();
            return;
        }

        setProfile(JSON.parse(userProfile));

        axios
            .get("/api/line/campaigns")
            .then((response) => setCampaigns(response.data))
            .catch((error) => console.error("Error fetching campaigns:", error));
    }, []);

    return (
        <div className="bg-gray-300 w-screen min-w-[375px] max-w-[425px] min-h-screen">
            {/* Navbar */}
            <nav className="w-full h-20 bg-red-950 flex items-center px-5">
                <h3 className="text-white text-2xl ml-2">ศาลพระโพธิสัตว์กวนอิมทุ่งพิชัย</h3>
            </nav>
            <div className="px-4 overflow-y-auto overflow-x-hidden" >
                {/* Campaign List */}
                <div className="w-full grid grid-cols-2 my-10">
                    {campaigns.length === 0 ? (
                        <p className="text-xl text-gray-500">
                            ขออภัย ไม่มีกองบุญที่เปิดให้ร่วมบุญในขณะนี้
                        </p>
                    ) : (
                        campaigns.map((campaign) => (
                            <div
                                key={campaign.id}
                                className="max-w-sm p-6 mb-4 bg-white border rounded-3xl shadow"
                            >



                                {campaign.price !== 1 && (
                                    <Link href={`/line/form/campaigns/${campaign.id}`}>
                                        <Image
                                            src={campaign.campaign_img}
                                            width={500}
                                            height={500}
                                            alt="Campaign Image"
                                            className="rounded-2xl"
                                            priority
                                        />
                                    </Link>
                                )}
                                {campaign.price === 1 && (
                                    <Link href={`/line/formall/campaigns/${campaign.id}`}>
                                        <Image
                                            src={campaign.campaign_img}
                                            width={500}
                                            height={500}
                                            alt="Campaign Image"
                                            className="rounded-2xl"
                                            priority
                                        />
                                    </Link>
                                )}

                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="fixed w-screen min-w-[375px] max-w-[425px] bottom-0 h-20 bg-red-950 text-white flex justify-around items-center">
                <div className="text-center">
                    <Link href="/">
                        <i className="fa-solid fa-house fa-xl"></i>
                    </Link>
                    <h3 className="mt-1">หน้าหลัก</h3>
                </div>
                {profile && (
                    <div className="text-center">
                        <Link href={`/campaignstatus?userId=${profile.userId}`}>
                            <i className="fa-solid fa-clipboard-list fa-xl"></i>
                        </Link>
                        <h3 className="mt-1">สถานะกองบุญ</h3>
                    </div>
                )}
            </div>
        </div>
    );
}
