import { getFromNowStr } from "@/components/time";
import Link from "next/link";
import React from "react";

export function InternalLink(
  props: React.PropsWithChildren<{ href: string; className?: string }>
) {
  return (
    <Link href={props.href} className={"hover:underline " + props.className}>
      {props.children}
    </Link>
  );
}

export function ILinkToDiscussion(props: {
  discussionId: number;
  createdAt: string;
  className?: string;
}) {
  return (
    <ILinkToDiscussionWrapper
      discussionId={props.discussionId}
      className={props.className}
    >
      {getFromNowStr(props.createdAt)}
    </ILinkToDiscussionWrapper>
  );
}

export function ILinkToDiscussionWrapper(
  props: React.PropsWithChildren<{ discussionId: number; className?: string }>
) {
  const linkToDiscussion = `/app/news-tech/dist/item.html?id=${props.discussionId}`; // CONZEPT PATCH
  //const linkToDiscussion = `/item?id=${props.discussionId}`;
  return (
    <InternalLink href={linkToDiscussion} className={props.className}>
      {props.children}
    </InternalLink>
  );
}
