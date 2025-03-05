import { signIn } from "next-auth/react";

export default function LoginWithLineButton() {
    return (
        <button
            onClick={() => signIn("line")}
            className="w-full flex items-center justify-center px-4 py-2 space-x-2 border rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
            <img src="/icon/LINE_logo.svg" alt="LINE" className="w-5 h-5" />
            <span className="text-gray-700 dark:text-gray-300">
                เข้าสู่ระบบด้วย LINE
            </span>
        </button>
    );
}
