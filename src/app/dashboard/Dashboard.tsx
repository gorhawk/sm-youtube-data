"use client";

import { useMsal } from "@azure/msal-react";
import { useState } from "react";
import { Roboto } from "next/font/google";
import DocumentInput from "./DocumentInput";
import TextInput from "./TextInput";
import ApiKeyInput from "./ApiKeyInput";
import Button from "./Button";
import { FilterButton } from "./FilterButton";
import clsx from "clsx";
import Spinner from "./Spinner";
import * as Sentry from "@sentry/react";
import {
  getGraphEndpointFromShareLink,
  getMicrosoftToken,
  getThreshold,
  getViews,
  useLocalState,
} from "./utility";
import ViewsMilestones from "./ViewsMilestones";

const robotoSans = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
});

const ENV_API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";
const SHEET_NAME = "tracks1";

enum SortDirection {
  NONE,
  VIEWS_ASC,
  VIEWS_DESC,
}

const SORT_MAP = {
  [SortDirection.NONE]: {
    nextDir: SortDirection.VIEWS_DESC,
    icon: "⭥",
  },
  [SortDirection.VIEWS_DESC]: {
    nextDir: SortDirection.VIEWS_ASC,
    icon: "⭣",
  },
  [SortDirection.VIEWS_ASC]: {
    nextDir: SortDirection.NONE,
    icon: "⭡",
  },
};

type Video = {
  channel: string;
  track: string;
  link: string;
  videoId: string;
};

export default function Dashboard() {
  const { instance, accounts } = useMsal();
  const [account] = accounts;
  const [views, setViews] = useLocalState<Record<string, number>>("views", {});
  const [videos, setVideos] = useLocalState<Video[]>("videos", []);
  const [excelLink, setExcelLink] = useLocalState("excel_link", "");
  const [excelFilename, setExcelFilename] = useLocalState("excel_filename", "");
  const [ytApiKey, setYtApiKey] = useLocalState("youtube_api_key", ENV_API_KEY);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [milestoneFilter, setMilestoneFilter] = useState<boolean>(false);
  const [sortDir, setSortDir] = useState(SortDirection.NONE);
  const [filterText, setFilterText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [numbers, setNumbers] = useLocalState<number[]>(
    "views_milestones",
    [0.1, 0.5, 1, 3, 5, 10, 20, 30, 50, 80, 100]
  );
  const [viewsDate, setViewsDate] = useLocalState<number | undefined>(
    "views_date",
    undefined
  );
  const [videosDate, setVideosDate] = useLocalState<number | undefined>(
    "videos_date",
    undefined
  );

  const setViewMilestones = (numbers: number[]) => {
    setNumbers(numbers);
    setTimeout(() => {
      window.localStorage.setItem("views_milestones", JSON.stringify(numbers));
    }, 50);
  };

  const filters = videos
    .map((video) => video.channel)
    .filter((value, index, array) => array.indexOf(value) === index);

  const getExcelData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const accessToken = await getMicrosoftToken(instance, account);
      const headers = { Authorization: `Bearer ${accessToken}` };
      const driveResponse = await fetch(
        getGraphEndpointFromShareLink(excelLink),
        { headers }
      );

      const data = await driveResponse.json();
      console.log(data); // file info

      const itemId = data.id;
      const driveId = data.parentReference.driveId;

      const excelResponse = await fetch(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets('${SHEET_NAME}')/usedRange`,
        { headers }
      );

      const excelData = await excelResponse.json();
      console.log(excelData);

      const videoValues: Array<[string, string, string]> =
        excelData.values.slice(1);
      const videoData = videoValues
        .map(([channel, track, link]) => ({
          channel,
          track,
          link,
          videoId: new URL(link).searchParams.get("v"),
        }))
        .filter((v): v is Video => v.videoId !== null);
      const videoIds = videoData.map((v) => v.videoId);
      const viewData = await getViews(videoIds, ytApiKey);
      const now = Date.now();
      setViews(viewData);
      setVideos(videoData);
      setViewsDate(now);
      setVideosDate(now);
      setIsLoading(false);
      setIsError(false);
      setTimeout(() => {
        window.localStorage.setItem("views", JSON.stringify(viewData));
        window.localStorage.setItem("videos", JSON.stringify(videoData));
        window.localStorage.setItem("views_date", JSON.stringify(now));
        window.localStorage.setItem("videos_date", JSON.stringify(now));
      }, 100);
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      setIsLoading(false);
      setIsError(true);
    }
  };

  const getViewsData = async () => {
    if (!videos.length) {
      return;
    }
    setIsLoading(true);
    setIsError(false);
    try {
      const viewData = await getViews(
        videos.map((v) => v.videoId),
        ytApiKey
      );
      const now = Date.now();
      setViews(viewData);
      setViewsDate(now);
      setIsLoading(false);
      setIsError(false);
      setTimeout(() => {
        window.localStorage.setItem("views", JSON.stringify(viewData));
        window.localStorage.setItem("views_date", JSON.stringify(now));
      }, 100);
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      setIsLoading(false);
      setIsError(true);
    }
  };

  const viewMilestoneMap = videos.reduce((acc, current) => {
    acc[current.videoId] = numbers.some((value) => {
      const viewCount = value * 1000000;
      return (
        views[current.videoId] <= viewCount &&
        views[current.videoId] >= viewCount - getThreshold(viewCount)
      );
    });

    return acc;
  }, {} as Record<string, boolean>);

  const handleLinkCheck = (link: string, filename: string) => {
    setExcelLink(link);
    setExcelFilename(filename);
    setTimeout(() => {
      window.localStorage.setItem("excel_link", JSON.stringify(link));
      window.localStorage.setItem("excel_filename", JSON.stringify(filename));
    }, 50);
  };

  const handleApiKeyCheck = (key: string) => {
    setYtApiKey(key);
    setTimeout(() => {
      window.localStorage.setItem("youtube_api_key", JSON.stringify(key));
    }, 50);
  };

  const handleFilterClick = (name: string) => {
    if (activeFilters.includes(name)) {
      setActiveFilters(activeFilters.filter((item) => item !== name));
    } else {
      setActiveFilters([...activeFilters, name]);
    }
  };

  let displayedVideos = videos;

  if (activeFilters.length > 0) {
    displayedVideos = displayedVideos.filter((v) =>
      activeFilters.includes(v.channel)
    );
  }

  if (filterText.length > 0) {
    displayedVideos = displayedVideos.filter((v) =>
      v.track.toLowerCase().includes(filterText.toLowerCase())
    );
  }

  if (milestoneFilter) {
    displayedVideos = displayedVideos.filter(
      (v) => viewMilestoneMap[v.videoId]
    );
  }

  if (sortDir !== SortDirection.NONE) {
    displayedVideos = displayedVideos.toSorted((a, b) => {
      const viewsA = views[a.videoId] ?? 0;
      const viewsB = views[b.videoId] ?? 0;
      const diff = viewsA - viewsB;
      return sortDir === SortDirection.VIEWS_ASC ? diff : -diff;
    });
  }

  return (
    <div
      className={`mx-8 mb-12 max-w-7xl pt-6 text-sm text-slate-700 dark:text-slate-300 ${robotoSans.className}`}
    >
      <div className="mb-4 gap-2">
        <DocumentInput
          initLink={excelLink}
          filename={excelFilename}
          onSuccess={handleLinkCheck}
        />
      </div>
      <div className="my-4 gap-2">
        <ApiKeyInput initKey={ytApiKey} onSuccess={handleApiKeyCheck} />
      </div>
      <div
        className={clsx("mt-12", {
          "opacity-30 pointer-events-none select-none":
            (!excelLink || !ytApiKey) && !videos.length,
        })}
      >
        <div className="my-4 flex gap-4 items-center flex-wrap">
          <div className="flex gap-4 items-center">
            <div className="font-semibold whitespace-nowrap">
              Adatok betöltése:
            </div>
            <div className="flex gap-2">
              <Button
                onClick={getExcelData}
                title="Videók és nézettség letöltése"
                disabled={isLoading}
              >
                Videók&nbsp;⬇
              </Button>
              <Button
                onClick={getViewsData}
                title="Nézettség frissítése"
                disabled={isLoading || videos.length === 0}
              >
                Nézettség&nbsp;<span className="">↻</span>
              </Button>
            </div>
            {isLoading && (
              <div>
                <Spinner />
              </div>
            )}
            {isError && <div className="text-red-600">✕</div>}
          </div>
          <div className="flex gap-4 items-center">
            {videosDate && (
              <div className="text-slate-400 whitespace-nowrap dark:text-slate-600">
                Videók ({new Date(videosDate).toLocaleString("sv-SE")})
              </div>
            )}
            {viewsDate && (
              <div className="text-slate-400 whitespace-nowrap dark:text-slate-600">
                Nézettség ({new Date(viewsDate).toLocaleString("sv-SE")})
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-4 my-4 items-center">
          <div className="block font-bold">Nézettségkiemelő:</div>
          <div className="my-2">
            <ViewsMilestones numbers={numbers} setNumbers={setViewMilestones} />
          </div>
        </div>
        <div className="flex gap-4 my-4 items-center">
          <div className="flex gap-2 items-center grow">
            <div className="block font-bold">Kiemelt filter:</div>
            <div className="flex gap-2 flex-wrap">
              <input
                type="checkbox"
                checked={milestoneFilter}
                onChange={(e) => setMilestoneFilter(e.target.checked)}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-4 my-4 items-center">
          <div className="flex gap-2 items-center grow">
            <div className="block font-bold">Csatorna filter:</div>
            <div className="flex gap-2 flex-wrap">
              {filters.map((name) => (
                <FilterButton
                  key={name}
                  title={name}
                  onClick={() => handleFilterClick(name)}
                  isActive={activeFilters.includes(name)}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 items-center grow-5 max-w-72">
            <label className="block font-bold" htmlFor="filterText">
              Track:
            </label>
            <div className="grow min-w-32">
              <TextInput
                id="filterText"
                name="filterText"
                value={filterText}
                placeholder="Keresés névre"
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="max-w-full">
          <table className="w-full max-w-full border-collapse bg-transparent shadow-sm">
            <thead>
              <tr className="bg-gray-100 font-bold text-gray-700 dark:bg-slate-700 dark:text-slate-200">
                <th className="border border-gray-300 px-4 py-1 text-left dark:border-slate-500">
                  Csatorna
                </th>
                <th className="border border-gray-300 px-4 py-1 text-left dark:border-slate-500">
                  Track
                </th>
                <th className="border border-gray-300 px-4 py-1 text-left dark:border-slate-500">
                  Youtube link
                </th>
                <th className="border border-gray-300 px-4 py-1 text-left select-none cursor-pointer hover:bg-gray-200 dark:border-slate-500  dark:hover:bg-gray-600">
                  <div
                    onClick={() => {
                      setSortDir(SORT_MAP[sortDir].nextDir);
                    }}
                  >
                    Nézettség&nbsp;{SORT_MAP[sortDir].icon}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-900 dark:text-gray-300">
              {displayedVideos.map((video, index) => (
                <tr
                  key={index}
                  className={clsx("even:bg-gray-50 dark:even:bg-gray-700/25")}
                >
                  <td className="border border-gray-300 px-4 py-1 whitespace-nowrap dark:border-slate-500">
                    {video.channel}
                  </td>
                  <td className="border border-gray-300 px-4 py-1 dark:border-slate-500">
                    {video.track}
                  </td>
                  <td
                    className={clsx(
                      "border border-gray-300 px-4 py-1 text-blue-600 hover:text-blue-800",
                      "dark:border-slate-500 dark:text-cyan-500 dark:hover:text-sky-300"
                    )}
                  >
                    <a
                      href={video.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:underline overflow-hidden text-ellipsis whitespace-nowrap max-w-sm"
                      title={video.link}
                    >
                      {video.link}
                    </a>
                  </td>
                  <td
                    className={clsx(
                      "border border-gray-300 px-4 py-1 dark:border-slate-500",
                      viewMilestoneMap[video.videoId]
                        ? "bg-amber-200 dark:bg-cyan-500/35 dark:inset-shadow-[0_0_3px_0px_#00000055]"
                        : "even:bg-gray-50 dark:even:bg-gray-700/25"
                    )}
                  >
                    {views[video.videoId]?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {displayedVideos.length === 0 && (
            <div className="p-4 text-center">
              {videos.length > 0 ? "Nincs találat." : "Nincsenek videók"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
