"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const Linestatus = () => {
    const [profile, setProfile] = useState(null);
    const router = useRouter();
    const [images, setImages] = useState([]);
    const [campaign, setCampaign] = useState([]);
    const { id } = useParams();

    useEffect(() => {
        const userProfile = getCookie("profile");
        if (!userProfile) {
            router.push("/line/index");
            return;
        }
        setProfile(JSON.parse(userProfile));
    }, [router]);

    const getimages = async () => {
        try {
            const response = await fetch(`/api/line/get-images?transactionID=${id}`);
            const data = await response.json();
            
            if (data.success && Array.isArray(data.transaction) && data.transaction.length > 0) {
                const imgString = data.transaction[0].url_img;
                const imgArray = imgString ? imgString.split(",").map(img => img.trim()).filter(Boolean) : [];
    
                setImages(imgArray);
                setCampaign(data.transaction[0])
            }
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการดึงรูปภาพ:", error);
        }
    };

    useEffect(() => {
        
        getimages();
        
    }, [id]);

    return (
        <>
            <div
                className="w-screen min-w-[375px] max-w-[425px] min-h-screen bg-cover bg-no-repeat px-0 m-0 flex flex-col"
                style={{ backgroundImage: "url('/img/Background2.png')" }}
            >

                <div className="row w-screen min-w-[375px] max-w-[425px] z-50 h-16 top-0 fixed bg-red-950 content-center justify-items-center">
                    <nav className="flex items-center">
                        <img src="https://donation.kuanimtungpichai.com/img/AdminLogo.png" width="50px" height="50px" alt="" />
                        <h3 className=" mx-2 text-white text-xl">ศาลพระโพธิสัตว์กวนอิมทุ่งพิชัย</h3>
                    </nav>
                </div>

                <div className="max-w-[425px] my-20 contain-content px-4 overflow-y-auto">
                    <div>
                        <h1 className="text-xl text-center">ภาพจากกองบุญ</h1>
                        <h1 className="text-lg text-center">{campaign?.campaignsname}</h1>
                        <h1 className="text-lg text-center">คุณ{campaign?.detailsname}</h1>
                    </div>
                    <div className=" mt-4">
                        <div className="bg-gray-200 rounded-lg p-2">
                        {images?.length > 0 ? (
                                images.map((image, index) => (
                                    <div key={index} className="flex flex-row gap-4 p-2">
                                        <img src={`/api/uploads/img/pushimages/${image}`} alt="" />
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-600 py-4">ไม่มีรายการกองบุญ</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 w-screen min-w-[375px] max-w-[425px] h-16 rounded-t-xl bg-red-950 fixed bottom-0">
                    <div className="text-lg text-white text-center py-4">
                        <a href="/line/index">หน้าหลัก</a>
                    </div>
                    <div className="text-lg text-white text-center py-4">
                        <a href="/line/status">สถานะกองบุญ</a>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Linestatus