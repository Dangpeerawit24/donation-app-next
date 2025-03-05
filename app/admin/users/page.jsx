"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";

export default function UserManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ ตรวจสอบสิทธิ์ (อนุญาตเฉพาะ Admin)
  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "admin") {
      Swal.fire({
        title: "ปฏิเสธการเข้าถึง",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
        icon: "error",
      }).then(() => router.push("/login"));
    }
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
      
    fetchUsers();
  
    const intervalId = setInterval(fetchUsers, 5000);
  
    return () => clearInterval(intervalId);
  }, []);

  // ✅ เพิ่มสมาชิกใหม่
  async function handleAddUser() {
    const { value: formValues } = await Swal.fire({
      title: "เพิ่มสมาชิกใหม่",
      html: `
        <div class="w-full max-w-lg mx-auto p-4">
          <!-- ชื่อ -->
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">ชื่อ:</label>
            <input id="swal-name" class="w-full p-3 border border-gray-300 rounded-lg" placeholder="กรอกชื่อ" required />
          </div>
    
          <!-- อีเมล -->
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">อีเมล:</label>
            <input id="swal-email" type="email" class="w-full p-3 border border-gray-300 rounded-lg" placeholder="กรอกอีเมล" required />
          </div>
    
          <!-- รหัสผ่าน -->
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">รหัสผ่าน:</label>
            <input id="swal-password" type="password" class="w-full p-3 border border-gray-300 rounded-lg" placeholder="กรอกรหัสผ่าน" required />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById("swal-name").value.trim();
        const email = document.getElementById("swal-email").value.trim();
        const password = document.getElementById("swal-password").value.trim();

        if (!name || !email || !password) {
          Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง!");
          return false;
        }

        return { name, email, password, role: "user" };
      }
    });


    if (!formValues) return;

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      if (!res.ok) throw new Error("เพิ่มสมาชิกไม่สำเร็จ");
      Swal.fire("สำเร็จ!", "เพิ่มสมาชิกใหม่แล้ว", "success");
      fetchUsers();
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด!", error.message, "error");
    }
  }

  // ✅ ลบสมาชิก
  const handleDeleteUser = async (id) => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "ต้องการลบสมาชิกนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch("/api/users", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) throw new Error("ลบสมาชิกไม่สำเร็จ");
        Swal.fire("ลบสำเร็จ!", "สมาชิกถูกลบแล้ว", "success");
        fetchUsers()
      } catch (error) {
        Swal.fire("เกิดข้อผิดพลาด!", error.message, "error");
      }
    }
  };

  // ✅ แก้ไขสมาชิก
  const handleEditUser = async (user) => {
    const { value: formValues } = await Swal.fire({
      title: "แก้ไขข้อมูลสมาชิก",
      html: `
        <div class="w-full max-w-lg mx-auto p-4">
          <!-- ชื่อ -->
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">ชื่อ:</label>
            <input id="swal-name" class="w-full p-3 border border-gray-300 rounded-lg" value="${user.name}" required />
          </div>
    
          <!-- อีเมล -->
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">อีเมล:</label>
            <input id="swal-email" type="email" class="w-full p-3 border border-gray-300 rounded-lg" value="${user.email}" required />
          </div>
    
          <!-- สิทธิ์ -->
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">สิทธิ์:</label>
            <select id="swal-role" class="w-full p-3 border border-gray-300 rounded-lg">
              <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
              <option value="moderator" ${user.role === "moderator" ? "selected" : ""}>Moderator</option>
              <option value="user" ${user.role === "user" ? "selected" : ""}>User</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById("swal-name").value.trim();
        const email = document.getElementById("swal-email").value.trim();
        const role = document.getElementById("swal-role").value.trim();

        if (!name || !email || !role) {
          Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง!");
          return false;
        }

        return { id: user.id, name, email, role };
      }
    });


    if (!formValues) return;

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      if (!res.ok) throw new Error("แก้ไขข้อมูลไม่สำเร็จ");
      Swal.fire("บันทึกสำเร็จ!", "ข้อมูลสมาชิกถูกอัปเดตแล้ว", "success");
      fetchUsers()
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด!", error.message, "error");
    }
  };

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

  return (
    <div className="min-h-screen pt-16 bg-gray-100 ">
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold text-gray-900  text-center mb-6">
          จัดการข้อมูลสมาชิก
        </h1>

        <div className="flex justify-end mb-4">
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            + เพิ่มสมาชิก
          </button>
        </div>

        <div className="overflow-x-auto table-container table-fixed">
          <div className="overflow-auto rounded-lg shadow-lg">
            <table id="myTable" className="w-full table-fixed border-collapse bg-white rounded-lg">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-4 w-[5%] text-center">#</th>
                  <th className="p-4 w-[20%] text-left">ชื่อ</th>
                  <th className="p-4 text-left">อีเมล</th>
                  <th className="p-4 w-[15%] text-center">สิทธิ์</th>
                  <th className="p-4 w-[15%] text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-100 transition">
                    <td className="p-4 text-center">{index + 1}</td>
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4 text-center">{user.role}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 mr-2"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        ลบ
                      </button>
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
