"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getNow, getNowMinus } from "./time";

export function usePageFromParams() {
  const params = useSearchParams();
  return Number(params?.get("page") || 1);
}

type HnQueryUrlParams = {
  page: number;
  perPage: number;
  createdAfterI: number;
  createdBeforeI: number;
};

export function useHnQueryUrlParams(): HnQueryUrlParams {
  const params = useSearchParams();

  function getParam(key: keyof HnQueryUrlParams) {
    return params?.get(key);
  }

  const defaults: HnQueryUrlParams = {
    page: 1,
    perPage: 50,
    createdBeforeI: getNow(),
    createdAfterI: getNowMinus(24, "hours"),
  };
  const page = Number(getParam("page") || defaults.page);
  const perPage = Number(getParam("perPage") || defaults.perPage);
  const createdAfterI = Number(
    getParam("createdAfterI") || defaults.createdAfterI
  );
  const createdBeforeI = Number(
    getParam("createdBeforeI") || defaults.createdBeforeI
  );
  return {
    page,
    perPage,
    createdAfterI,
    createdBeforeI,
  };
}

export function useSetUrlQueryParams() {
  const router = useRouter();
  const pathname = usePathname();

  function patchQueryParams(query: Partial<HnQueryUrlParams>) {
    const existing = new URLSearchParams(window.location.search);
    const existingQueryAsObj = Array.from(existing.entries()).reduce(
      (acc, [key, val]) => {
        acc[key] = val;
        return acc;
      },
      {} as { [key: string]: string }
    );
    const patchedQueryObj = {
      ...existingQueryAsObj,
      ...query,
    };
    const newQueryAsString = Object.entries(patchedQueryObj)
      .map(([paramName, paramValue]) => `${paramName}=${paramValue}`)
      .join("&");
    router.push(pathname + `?${newQueryAsString}`);
  }

  return { patchQueryParams };
}
