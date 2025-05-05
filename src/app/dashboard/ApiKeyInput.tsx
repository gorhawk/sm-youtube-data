"use client";

import React, { useState } from "react";
import Button from "./Button";
import TextInput from "./TextInput";
import clsx from "clsx";
import { CheckState, CheckStateMap } from "./inputChecks";

type Props = {
  initKey?: string;
  onSuccess: (validKey: string) => void;
};

export default function ApiKeyInput(props: Props) {
  const [apiKey, setApiKey] = useState(props.initKey ?? "");
  const [status, setStatus] = useState<CheckState>(
    props.initKey ? CheckState.Valid : CheckState.Idle
  );

  const checkApiKey = async () => {
    setStatus(CheckState.Checking);
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=id&key=${apiKey}`
      );
      const json = await res.json();
      if (res.ok && json.kind === "youtube#channelListResponse") {
        console.log("API key is valid");
        setStatus(CheckState.Valid);
        props.onSuccess(apiKey);
      } else if (
        res.status === 400 &&
        json.error?.errors?.some(
          (e: any) => e.reason === "missingRequiredParameter"
        )
      ) {
        setStatus(CheckState.Valid);
        props.onSuccess(apiKey);
      } else if (
        res.status === 400 &&
        json.error?.status === "INVALID_ARGUMENT" &&
        json.error?.details?.some((d: any) => d.reason === "API_KEY_INVALID")
      ) {
        setStatus(CheckState.Invalid);
      } else {
        console.log("Invalid or restricted API key, ", json.error?.message);
        setStatus(CheckState.Invalid);
      }
    } catch (err) {
      console.error(err);
      setStatus(CheckState.Invalid);
    }
  };

  return (
    <div className="flex gap-4 items-center flex-wrap">
      <div className="flex gap-4 items-center">
        <div className="min-w-36 whitespace-nowrap">
          <label className="font-semibold">YouTube API kulcs:</label>
        </div>
        <div className="min-w-[26rem]">
          <TextInput
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSyCqh..."
          />
        </div>
        <Button onClick={checkApiKey} disabled={status === CheckState.Checking}>
          <div className="flex gap-2 items-center">
            <div className="min-w-28 text-center">API kulcs teszt</div>
          </div>
        </Button>
      </div>
      <div
        className={clsx("flex gap-1 items-center", CheckStateMap[status].class)}
      >
        <div>Kulcs: </div>
        <div className="min-w-4 whitespace-nowrap">
          {status === CheckState.Valid && props.initKey}{" "}
          {CheckStateMap[status].content}
        </div>
      </div>
    </div>
  );
}
