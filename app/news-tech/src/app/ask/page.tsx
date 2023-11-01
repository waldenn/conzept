"use client";
import React from "react";
import { FrontPageViewerWrapper } from "@/components/front-page-viewer";
import { useHnQueryUrlParams } from "@/components/usePageFromParams";
import { useIsMounted } from "@/components/useIsMounted";

const Page = () => {
  const mounted = useIsMounted();
  const params = useHnQueryUrlParams();

  const viewer = React.useMemo(
    () =>
      mounted ? (
        <FrontPageViewerWrapper
          tag="ask_hn"
          page={params.page}
          pageSize={params.perPage}
          createdAfterI={params.createdAfterI}
          createdBeforeI={params.createdBeforeI}
        />
      ) : null,
    [mounted, params]
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-3">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        {viewer}
      </div>
    </main>
  );
};

export default Page;
