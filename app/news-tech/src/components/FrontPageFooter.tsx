"use client";
import React from "react";
import { useSetUrlQueryParams } from "./usePageFromParams";

export function FrontPageFooter(props: { pageCount: number }) {
  const pages = new Array(props.pageCount).fill(0).map((_, i) => i + 1);
  const { patchQueryParams } = useSetUrlQueryParams();

  return (
    <div className="flex gap-2 pt-4 justify-center w-full flex-wrap">
      {pages.map((page) => (
        <span
          key={page}
          className="cursor-pointer hover:underline"
          onClick={() => patchQueryParams({ page })}
        >
          {page}
        </span>
      ))}
    </div>
  );
}
