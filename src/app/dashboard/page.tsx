"use client";

import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { Fragment, useEffect } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import * as Sentry from "@sentry/react";

export default function YoutubeInfo() {
  useEffect(() => {
    Sentry.init({
      dsn: "https://fc5087736dbf8399c418e8fa47586d0f@o4509264262594560.ingest.de.sentry.io/4509264266985552",
      sendDefaultPii: true,
    });
  });

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
