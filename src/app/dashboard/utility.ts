import {
  AccountInfo,
  InteractionRequiredAuthError,
  IPublicClientApplication,
} from "@azure/msal-browser";
import { useState } from "react";

export function getGraphEndpointFromShareLink(shareLink: string): string {
  const base64 = btoa(shareLink)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `https://graph.microsoft.com/v1.0/shares/u!${base64}/driveItem`;
}

const loginRequest = {
  scopes: [
    "User.Read", // Basic login info
    "Files.Read", // Only allows access to user-owned/shared files
    "offline_access", // For refresh tokens (optional)
  ],
};

export const getMicrosoftToken = async (
  msalInstance: IPublicClientApplication,
  account: AccountInfo
): Promise<string> => {
  try {
    const authResponse = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: account,
    });

    return authResponse.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      const res = await msalInstance.acquireTokenPopup(loginRequest);

      return res.accessToken;
    } else {
      throw error;
    }
  }
};

export function useLocalState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  return [value, setValue] as const;
}

export async function getViews(videoIds: string[], apiKey: string) {
  const batchSize = 50; // youtube api v3 limit
  const views: Record<string, number> = {};
  for (let i = 0; i < videoIds.length; i += batchSize) {
    const batch = videoIds.slice(i, i + batchSize);
    const ytResponse = await fetch(
      `https://content-youtube.googleapis.com/youtube/v3/videos?id=${batch.join()}&part=statistics&key=${apiKey}`
    );
    const ytData = await ytResponse.json();
    console.log(i, ytData);
    ytData.items?.forEach((item: any) => {
      views[item?.id] = Number(item?.statistics?.viewCount);
    });
    if (ytData.error) {
      console.error("found error, breaking loop", ytData.error);
      break;
    }
  }

  return views;
}
