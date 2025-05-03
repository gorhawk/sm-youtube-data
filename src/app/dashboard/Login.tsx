"use client";

import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../../authConfig";

export default function Login() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((e) => console.error(e));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-200/60 to-blue-50 px-4">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Belépés</h1>
      <button
        onClick={handleLogin}
        className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6 text-white"
        >
          <path d="M1 1h10v10H1zM13 1h10v10H13zM1 13h10v10H1zM13 13h10v10H13z" />
        </svg>
        Sign in with Microsoft
      </button>
    </div>
  );
}
