"use client";
import React from "react";
import { PostViewerWrapper } from "./post_viewer";
import { useIsMounted } from "@/components/useIsMounted";

const Page = () => {
  const mounted = useIsMounted();
  const viewer = React.useMemo(
    () => (mounted ? <PostViewerWrapper /> : null),
    [mounted]
  );
  return viewer;
};

export default Page;
