"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const PushImages = () => {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

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

    }, []);


    const fetchdata = async () => {
        try {
            const res = await fetch("/api/line/campaigns");
            const data = await res.json();
            setCampaigns(data);
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก:", error);
        }
    };

    useEffect(() => {

        fetchdata();

        const intervalId = setInterval(fetchdata, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const nextCampaign = () => {
        if (currentIndex < campaigns.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevCampaign = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const campaign = campaigns[currentIndex];

    return (
        <>
            <div
                className="w-screen min-w-[375px] max-w-[425px] min-h-screen bg-cover bg-no-repeat px-0 m-0 flex flex-col"
                style={{ backgroundImage: "url('/img/Background2.png')" }}
            >

                <div className="row w-full h-20 top-0 bg-red-950 content-center justify-items-center">
                    <nav className="flex items-center">
                        <img src="https://donation.kuanimtungpichai.com/img/AdminLogo.png" width="50px" height="50px" alt="" />
                        <h3 className=" mx-2 text-white text-xl">ศาลพระโพธิสัตว์กวนอิมทุ่งพิชัย</h3>
                    </nav>
                </div>
                {campaigns.length !== 0 && (
                    <>
                        <h1 className="mt-4 text-xl text-center">กองบุญที่เปิดให้ร่วมบุญขณะนี้</h1>

                        <div className="mt-4 max-w-[425px] contain-content px-4 overflow-y-auto">
                            <div className="w-full px-6 pb-6 rounded-3xl shadow-lg ">
                                <h2 className="text-xl text-center break-words">กองบุญ<br />{campaign.name}</h2>
                                {campaign.campaign_img && (
                                    <div className="flex justify-center mt-4">
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
                                )}
                                <Image className="mt-4 w-full" src="/img/Asset 279.png" width={500} height={500} alt="Campaign" />
                                <p className="mt-4 text-center text-lg">
                                    ร่วมบุญ {campaign.price === 1 ? "ตามกำลังศรัทธา" : `${campaign.price} บาท`}
                                </p>
                                {campaign.price !== 1 && (
                                    <p className="text-center text-md">รับเจ้าภาพจำนวน {campaign.stock} กองบุญ</p>
                                )}
                                <h2 className="text-lg text-start break-words">{campaign.description}</h2>

                                {campaign.price !== 1 && (
                                    <Link href={`/line/form/campaigns/${campaign.id}`}>
                                        <button className="w-full flex items-center justify-center gap-2 mt-4 py-3 px-6 bg-[#742F1E] font-semibold text-white rounded-full shadow-md">
                                            ร่วมบุญ
                                        </button>
                                    </Link>
                                )}
                                {campaign.price === 1 && (
                                    <Link href={`/line/formall/campaigns/${campaign.id}`}>
                                        <button className="w-full flex items-center justify-center gap-2 mt-4 py-3 px-6 bg-[#742F1E] font-semibold text-white rounded-full shadow-md">
                                            ร่วมบุญ
                                        </button>
                                    </Link>
                                )}
                            </div>

                            <div className="flex justify-between px-6 py-4">
                                <button
                                    onClick={prevCampaign}
                                    disabled={currentIndex === 0}
                                    className={`py-3 px-6 rounded-full shadow-md ${currentIndex === 0 ? "bg-[#742F1E]" : "bg-[#742F1E] text-white"
                                        }`}
                                >
                                    ◄ กลับ
                                </button>
                                <button
                                    onClick={nextCampaign}
                                    disabled={currentIndex === campaigns.length - 1}
                                    className={`py-3 px-6 rounded-full shadow-md ${currentIndex === campaigns.length - 1 ? "bg-[#742F1E]" : "bg-[#742F1E] text-white"
                                        }`}
                                >
                                    ถัดไป ►
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {campaigns.length === 0 && (
                    <>
                        <div className="flex items-center justify-center min-h-screen bg-gray-300">
                            <p className="text-xl text-gray-500">ไม่มีกองบุญที่เปิดให้ร่วมบุญในขณะนี้</p>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default PushImages;
