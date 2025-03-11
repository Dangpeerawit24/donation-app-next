"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Linestatus = () => {
    const [profile, setProfile] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const userProfile = getCookie("profile");
        if (!userProfile) {
            router.push("/line/index");
            return;
        }
        setProfile(JSON.parse(userProfile));
    }, [router]);

    const fetchdata = async () => {
        if (!profile || !profile.userId) return;
        try {
            const res = await fetch(`/api/line/get-transaction/UID?UID=${profile.userId}`);
            if (!res.ok) throw new Error("Network response was not ok");

            const data = await res.json();
            setTransactions(data.transaction || []); // ✅ ดึงเฉพาะ `transaction` และป้องกัน `null`
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก:", error);
            setTransactions([]); // ✅ ตั้งค่าเป็นอาร์เรย์ว่างถ้าเกิด Error
        }
    };

    useEffect(() => {
        if (!profile) return;
        fetchdata();
        const intervalId = setInterval(fetchdata, 5000);
        return () => clearInterval(intervalId);
    }, [profile]);

    return (
        <>
            <div className="w-screen min-w-[375px] max-w-[425px] min-h-screen bg-cover bg-no-repeat px-0 m-0 flex flex-col"
                style={{ backgroundImage: "url('/img/Background2.png')" }}>

                <div className="row w-screen min-w-[375px] max-w-[425px] z-50 h-16 top-0 fixed bg-red-950 content-center justify-items-center">
                    <nav className="flex items-center">
                        <img src="https://donation.kuanimtungpichai.com/img/AdminLogo.png" width="50px" height="50px" alt="" />
                        <h3 className=" mx-2 text-white text-xl">ศาลพระโพธิสัตว์กวนอิมทุ่งพิชัย</h3>
                    </nav>
                </div>

                <div className="w-full my-20 contain-content px-4 overflow-y-auto overflow-x-hidden">
                    <div>
                        <h1 className="text-xl text-center">ติดตามสถานะกองบุญ</h1>
                    </div>
                    <div className="mt-6">
                        <div className="bg-gray-200 rounded-lg">
                            {transactions?.length > 0 ? (
                                transactions.map((transaction, index) => (
                                    <div key={transaction.id} className="flex flex-row gap-4 p-4">
                                        <div className="w-full flex flex-col justify-between">
                                            <h1 className="truncate-text text-nowrap">กองบุญ{transaction.campaignsname}</h1>
                                            <span className="truncate-text">{transaction.detailsname}</span>
                                        </div>
                                        <div className="w-[40%] flex flex-col justify-between items-center">
                                            {transaction.status === "ส่งภาพกองบุญแล้ว" && (
                                                <Link href={`/line/status/img/${transaction.transactionID}`}>
                                                    <span className="inline-flex text-center items-center rounded-md bg-green-700 px-2 py-1 text-sm font-medium text-white ring-1 ring-inset ring-green-600/20">
                                                        ส่งภาพ<br />กองบุญแล้ว
                                                    </span>
                                                </Link>
                                            )}
                                            {transaction.status === "ข้อมูลของท่านเข้าระบบแล้ว" && (
                                                <span className="inline-flex text-center items-center rounded-md bg-green-700 px-2 py-1 text-sm font-medium text-white ring-1 ring-inset ring-green-600/20">
                                                    บันทึก<br />ข้อมูลแล้ว
                                                </span>
                                            )}
                                            {transaction.status === "รอดำเนินการ" && (
                                                <span className="inline-flex text-center items-center rounded-md bg-yellow-500 px-2 py-1 text-sm font-medium text-black ring-1 ring-inset ring-green-600/20">
                                                    รอ<br />ดำเนินการ
                                                </span>
                                            )}
                                        </div>
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

export default Linestatus;
