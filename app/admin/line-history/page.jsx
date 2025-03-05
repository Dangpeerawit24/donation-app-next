"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import ReactDOM from "react-dom/client";
import { X } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default function LineHistory() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [Lineusers, setLineusers] = useState([]);
  const router = useRouter();

  useEffect(() => {
      if (status === "loading") return;
  
      if (!session || session.user.role !== "admin") {
        Swal.fire({
          title: "ปฏิเสธการเข้าถึง",
          text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
          icon: "error",
        }).then(() => router.push("/login"));
      } else {
        setLoading(false);
      }
    }, [session, status, router]);

    const fetchdata = async () => {
      try {
        const res = await fetch("/api/line-history");
        const data = await res.json();
        setLineusers(data);
        setLoading(false);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก:", error);
      }
      setLoading(false);
    };
  
    useEffect(() => {
      
      fetchdata();
    
      const intervalId = setInterval(fetchdata, 5000);
    
      return () => clearInterval(intervalId);
    }, []);

    if (loading) {
      return (
        <div
          id="loader"
          className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-dashed rounded-full animate-spin"></div>
            <p className="mt-4 text-blue-400 text-lg font-semibold">Loading...</p>
          </div>
        </div>
      );
    }

    const imgswl = async (img) => {
      await Swal.fire({
        html: `
          <div class="flex flex-col items-end">
            <div id="close-btn-container"></div>
            <div class="flex flex-col items-center">
              <img class="rounded-lg shadow-lg max-w-full" src="${img}" alt="img" />
            </div>
          </div>
        `,
        showConfirmButton: false, // 🔹 ซ่อนปุ่ม OK
        didOpen: () => {
          const closeBtnContainer = document.getElementById(
            "close-btn-container"
          );
          if (closeBtnContainer) {
            const root = ReactDOM.createRoot(closeBtnContainer);
            root.render(
              <X
                size={28}
                id="close-btn"
                className="cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={() => Swal.close()}
              />
            );
          }
        },
      });
    };

  return (
    <div className="min-h-screen pt-16 bg-gray-100 ">
      <Navbar />
      {/* Content */}
      <main className="p-6">
        <h1 className="text-2xl font-bold text-gray-900  text-center mb-6">
        รายการลูกบุญย้อนหลัง
        </h1>

        

        <div className="overflow-x-auto table-container table-fixed">
          <div className="overflow-auto rounded-lg shadow-lg">
            <table id="myTable" className="w-full table-fixed border-collapse bg-white rounded-lg">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-4 w-[5%] text-center">#</th>
                  <th className="p-4  text-left">UID</th>
                  <th className="p-4 text-left">display_name</th>
                  <th className="p-4  text-center">picture</th>
                </tr>
              </thead>
              <tbody>
                {Lineusers.map((Lineuser, index) => (
                  <tr key={Lineuser.id} className="hover:bg-gray-100 transition h-20">
                    <td className="p-4 text-center">{index + 1}</td>
                    <td className="p-4">{Lineuser.user_id}</td>
                    <td className="p-4">{Lineuser.display_name}</td>
                    <td className="p-4">
                      <a
                        className="flex justify-center"
                        href="#"
                        onClick={() =>
                          imgswl(`${Lineuser.picture_url}`)
                        }
                      >
                        <img
                          className="w-16 h-16 object-cover rounded-md shadow-sm"
                          src={Lineuser.picture_url}
                          alt="campaign"
                        />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
}
