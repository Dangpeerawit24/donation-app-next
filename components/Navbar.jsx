"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Swal from "sweetalert2";
import {
  Menu,
  Bell,
  X,
  ChevronDown,
  Brush,
  List,
  Tag,
  Users,
  User,
} from "lucide-react";
import LinkLineButton from "../components/LinkLineButton";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const router = useRouter();
  const pathname = usePathname();

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const toggleNotifications = () => setNotificationOpen((prev) => !prev);

  const handleLogout = () => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการออกจากระบบใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        signOut({ callbackUrl: "/login" });
      }
    });
  };

  const handleRedirect = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    const role = session.user.role;
    if (role === "admin") router.push("/admin/dashboard");
    else if (role === "moderator") router.push("/moderator/dashboard");
    else router.push("/user/dashboard");
  };

  const isActive = (href) => {
    return pathname.startsWith(href)
      ? "bg-sky-600 text-white"
      : "text-white hover:bg-sky-800 hover:scale-105";
  };

  // ฟังก์ชันดึงข้อมูล pending transactions
  const fetchPendingTransactions = async () => {
    try {
      const response = await fetch("/api/pending-transactions");
      const data = await response.json();
      // คำนวณยอดรวม pending transactions
      const totalPending = data.reduce(
        (sum, item) => sum + Number(item.total_transactions),
        0
      );
      setNotificationCount(totalPending);
      setPendingTransactions(data);
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลได้", "error");
    }
  };

  // ดึงข้อมูลครั้งแรกและตั้ง interval ทุก 5 วินาที
  useEffect(() => {
    fetchPendingTransactions();
    const intervalId = setInterval(fetchPendingTransactions, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <nav className="w-full fixed top-0 mb-4 bg-sky-900 px-4 sm:px-4 lg:px-8 shadow-md">
      <div className="flex justify-between h-16 items-center">
        {/* Logo และ Redirect */}
        <button
          onClick={handleRedirect}
          className="text-lg flex flex-row gap-2 items-center font-semibold text-white"
        >
          <img src="/img/AdminLogo.png" width="50px" alt="Logo" />
          ระบบกองบุญออนไลน์
        </button>

        {/* Desktop Navigation */}
        <div className="hidden xl:flex items-center gap-4">
          {session?.user?.role === "admin" && (
            <>
              <Link
                href="/admin/dashboard"
                className={`text-lg px-4 py-2 rounded-lg transition ${isActive(
                  "/admin/dashboard"
                )}`}
              >
                แดชบอร์ด
              </Link>
              <Link
                href="/admin/manage-campaign"
                className={`text-lg px-4 py-2 rounded-lg transition ${isActive(
                  "/admin/manage-campaign"
                )}`}
              >
                จัดการกองบุญ
              </Link>
              <Link
                href="/admin/manage-topic"
                className={`text-lg px-4 py-2 rounded-lg transition ${isActive(
                  "/admin/manage-topic"
                )}`}
              >
                จัดการหัวข้อกองบุญ
              </Link>
              <Link
                href="/admin/line-history"
                className={`text-lg px-4 py-2 rounded-lg transition ${isActive(
                  "/admin/line-history"
                )}`}
              >
                ลูกบุญย้อนหลัง
              </Link>
              <Link
                href="/admin/users"
                className={`text-lg px-4 py-2 rounded-lg transition ${isActive(
                  "/admin/users"
                )}`}
              >
                จัดการข้อมูลสมาชิก
              </Link>
            </>
          )}
        </div>

        {/* ปุ่มแจ้งเตือน & Dropdown ผู้ใช้ */}
        <div className="flex items-center gap-4">
          {/* ปุ่มแจ้งเตือน */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="relative flex items-center gap-2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-900"
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-600 rounded-full">
                {notificationCount}
              </span>
            </button>

            {/* Dropdown แจ้งเตือน */}
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg">
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold text-gray-900">
                    การแจ้งเตือน
                  </p>
                </div>
                {pendingTransactions.length === 0 ? (
                  <div className="px-4 py-2 text-center text-gray-500">
                    ไม่มีรายการค้าง
                  </div>
                ) : (
                  <ul className="p-2 space-y-2 text-gray-700">
                    {pendingTransactions.map((item) => (
                      <li
                        key={item.campaign_id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <a
                          href={`/admin/manage-campaign/campaign-detail/${item.campaign_id}`}
                        >
                          <p className="text-sm font-semibold text-gray-900">
                            กองบุญ: {item.campaign_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            จำนวน: {item.total_transactions}
                          </p>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Dropdown ผู้ใช้ (Desktop) */}
          <div className="relative hidden xl:block">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-100"
            >
              <span className="font-semibold text-gray-900">
                {session?.user?.name || "ผู้ใช้"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg">
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    สิทธิ์: {session?.user?.role}
                  </p>
                </div>
                {!session?.user?.lineuid && <LinkLineButton />}
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                >
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Slide-in Menu */}
        {menuOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-end z-50">
            <div className="w-80 bg-sky-900 text-white h-full p-6 shadow-lg relative">
              <button
                onClick={toggleMenu}
                className="absolute top-4 right-4 text-white hover:text-gray-300"
              >
                <X size={28} />
              </button>
              <h2 className="text-xl font-bold mb-6">เมนูจัดการระบบ</h2>
              <ul className="space-y-4">
                {session?.user?.role === "admin" && (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-2 p-2 rounded hover:bg-sky-800"
                    >
                      <li className="flex items-center gap-2">
                        <Brush className="w-5 h-5" />
                        แดชบอร์ด
                      </li>
                    </Link>
                    <Link
                      href="/admin/manage-campaign"
                      className="flex items-center gap-2 p-2 rounded hover:bg-sky-800"
                    >
                      <li className="flex items-center gap-2">
                        <List className="w-5 h-5" />
                        จัดการกองบุญ
                      </li>
                    </Link>
                    <Link
                      href="/admin/manage-topic"
                      className="flex items-center gap-2 p-2 rounded hover:bg-sky-800"
                    >
                      <li className="flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        จัดการหัวข้อกองบุญ
                      </li>
                    </Link>
                    <Link
                      href="/admin/line-history"
                      className="flex items-center gap-2 p-2 rounded hover:bg-sky-800"
                    >
                      <li className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        ลูกบุญย้อนหลัง
                      </li>
                    </Link>
                    <Link
                      href="/admin/users"
                      className="flex items-center gap-2 p-2 rounded hover:bg-sky-800"
                    >
                      <li className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        จัดการพนักงาน
                      </li>
                    </Link>
                  </>
                )}
              </ul>
              <div className="absolute bottom-6 left-6 right-6 border-t pt-4">
                <p className="text-lg font-bold">{session?.user?.name}</p>
                <p className="text-md">
                  สิทธิ์การใช้งาน : {session?.user?.role}
                </p>
                {!session?.user?.lineuid && <LinkLineButton />}
                <button
                  onClick={handleLogout}
                  className="mt-3 w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu Button */}
        <div className="xl:hidden flex items-center">
          <button onClick={toggleMenu} className="cursor-pointer text-white">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}
