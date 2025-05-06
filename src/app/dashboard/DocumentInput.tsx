"use client";

import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getGraphEndpointFromShareLink, getMicrosoftToken } from "./utility";
import TextInput from "./TextInput";
import Button from "./Button";
import { CheckState, CheckStateMap } from "./inputChecks";
import clsx from "clsx";
import * as Sentry from "@sentry/react";

type Props = {
  initLink?: string;
  filename?: string;
  onSuccess: (validLink: string, filename: string) => void;
};

export default function DocumentInput(props: Props) {
  const { instance, accounts } = useMsal();
  const account = accounts[0];
  const [link, setLink] = useState(props.initLink ?? "");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<CheckState>(
    props.initLink ? CheckState.Valid : CheckState.Idle
  );

  const handleCheck = async () => {
    if (!link) return;

    setStatus(CheckState.Checking);
    setMessage("");

    try {
      const accessToken = await getMicrosoftToken(instance, account);
      const graphEndpoint = getGraphEndpointFromShareLink(link);
      const response = await fetch(graphEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        setStatus(CheckState.Invalid);
        setMessage("Rossz link");

        return;
      }

      const data = await response.json();

      if (data?.name?.endsWith(".xlsx") || data?.name?.endsWith(".xls")) {
        setStatus(CheckState.Valid);
        setMessage(`Excel fájl: ${data.name}`);
        props.onSuccess(link, data.name);
      } else {
        setStatus(CheckState.Invalid);
        setMessage(`Rossz fájlformátum: ${data.name}`);
      }
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      setStatus(CheckState.Invalid);
      setMessage("Hiba");
    }
  };

  return (
    <div className="flex gap-4 items-center flex-wrap">
      <div className="flex gap-4 items-center">
        <div className="min-w-36 whitespace-nowrap">
          <label className="font-semibold">Excel táblázat link:</label>
        </div>
        <div className="min-w-md">
          <TextInput
            placeholder="Sharepoint Excel link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>
        <Button
          onClick={handleCheck}
          disabled={status === CheckState.Checking || !account}
        >
          <div className="min-w-20">Link teszt</div>
        </Button>
      </div>
      <div
        className={clsx("flex gap-1 items-center", CheckStateMap[status].class)}
      >
        <div>Fájl: </div>
        <div className="min-w-4 whitespace-nowrap">
          {status === CheckState.Valid && props.filename}{" "}
          {CheckStateMap[status].content}
        </div>
      </div>
    </div>
  );
}
