import { getFromNowStr } from "@/components/time";
import React from "react";

export function ExternalLink(
  props: React.PropsWithChildren<{ href: string; className?: string }>
) {
  return (
    <a
      href={props.href}
      target="_blank"
      referrerPolicy="no-referrer"
      className={"hover:underline " + props.className}
    >
      {props.children}
    </a>
  );
}

export function LinkToAuthor(props: { author: string; className?: string }) {
  const linkToUser = `https://news.ycombinator.com/user?id=${props.author}`;
  return (
    <ExternalLink href={linkToUser} className={props.className}>
      {props.author}
    </ExternalLink>
  );
}

export function LinkToDiscussion(props: {
  discussionId: number;
  createdAt: string;
  className?: string;
}) {
  return (
    <LinkToDiscussionWrapper
      discussionId={props.discussionId}
      className={props.className}
    >
      {getFromNowStr(props.createdAt)}
    </LinkToDiscussionWrapper>
  );
}

export function LinkToDiscussionWrapper(
  props: React.PropsWithChildren<{ discussionId: number; className?: string }>
) {
  const linkToDiscussion = `https://news.ycombinator.com/item?id=${props.discussionId}`;
  return (
    <ExternalLink href={linkToDiscussion} className={props.className}>
      {props.children}
    </ExternalLink>
  );
}
