"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { UserViewerWrapper } from "./user_viewer";
import { useIsMounted } from "@/components/useIsMounted";

const Page = () => {
  const mounted = useIsMounted();
  const params = useSearchParams();
  const userId = params.get("id");

  const viewer = React.useMemo(
    () => (mounted ? <UserViewerWrapper userId={userId} /> : null),
    [mounted, userId]
  );

  return viewer;
};

export default Page;
