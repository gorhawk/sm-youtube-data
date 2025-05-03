"use client";

import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../../authConfig";

export default function LoginPage() {
  const { instance } = useMsal();

  const login = () => {
    instance.loginPopup(loginRequest).catch(e => console.error(e));
  };

  return (
    <div>
      <h1>Login Page</h1>
      <button onClick={login}>Login with Microsoft</button>
    </div>
  );
}
