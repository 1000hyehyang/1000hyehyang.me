"use client";

import { useEffect, useReducer } from "react";
import type { LinkMetadata } from "@/lib/link-metadata/types";

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: LinkMetadata }
  | { status: "error" };

type FetchAction =
  | { type: "idle" }
  | { type: "load" }
  | { type: "success"; data: LinkMetadata }
  | { type: "error" };

function fetchReducer(_: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case "idle":
      return { status: "idle" };
    case "load":
      return { status: "loading" };
    case "success":
      return { status: "success", data: action.data };
    case "error":
      return { status: "error" };
  }
}

export function useLinkMetadata(url: string) {
  const [state, dispatch] = useReducer(fetchReducer, { status: "loading" });

  useEffect(() => {
    if (!url) {
      dispatch({ type: "idle" });
      return;
    }

    const controller = new AbortController();

    dispatch({ type: "load" });

    const run = async () => {
      try {
        const response = await fetch(
          `/api/link-metadata?url=${encodeURIComponent(url)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("메타데이터를 가져올 수 없습니다.");
        }
        const data = (await response.json()) as LinkMetadata;
        if (!controller.signal.aborted) {
          dispatch({ type: "success", data });
        }
      } catch {
        if (controller.signal.aborted) return;
        dispatch({ type: "error" });
      }
    };

    void run();

    return () => controller.abort();
  }, [url]);

  return state;
}
