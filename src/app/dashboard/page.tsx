"use client";

import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { Fragment } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";

export default function YoutubeInfo() {
  return (
    <Fragment>
      <UnauthenticatedTemplate>
        <Login />
      </UnauthenticatedTemplate>
      <AuthenticatedTemplate>
        <Dashboard />
      </AuthenticatedTemplate>
    </Fragment>
  );
}
