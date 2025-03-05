import { useState, useEffect } from "react";

export default function ScrollToTop() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // ✅ ปรับเงื่อนไขให้ตรวจจับการเลื่อนลงมากกว่า 100px
      if (window.scrollY > 100) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-5 right-5 z-50 w-12 h-12 bg-white border border-gray-300 rounded-full shadow-md flex items-center justify-center text-lg cursor-pointer hover:bg-gray-100 transition-opacity duration-300 ${
        showButton ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      ▲
    </button>
  );
}
