"use client";
import { StoryFrontPageJson, StoryItem } from "@/api/use-hn-page";
import { ExternalLink, LinkToAuthor } from "./ExternalLink";
import { ILinkToDiscussion, ILinkToDiscussionWrapper } from "./InternalLink";

export function FrontPageViewer(props: { data: StoryFrontPageJson }) {
  const data = props.data;
  const page = props.data.page;
  const hitsPerPage = props.data.hitsPerPage;
  return (
    <div className="flex flex-col gap-1 font-sans">
      {data.hits.map((item, index) => (
        <FrontPageItem
          key={item.objectID}
          index={index + 1 + hitsPerPage * page}
          item={item}
        />
      ))}
    </div>
  );
}

function FrontPageItem({ item, index }: { item: StoryItem; index: number }) {
  return (
    <div className="flex flex-row items-start gap-1">
      <span>{index}.</span>
      <div className="flex flex-col">
        <ExternalLink href={item.url}>{item.title}</ExternalLink>
        <div className="flex items-center flex-wrap gap-1 text-gray-500 text-xxs sm:text-xs">
          <p className="flex-shrink-0">{item.points} points by</p>
          <LinkToAuthor author={item.author} />
          <ILinkToDiscussion
            discussionId={Number(item.objectID)}
            createdAt={item.created_at}
          />
          <span>|</span>
          <ILinkToDiscussionWrapper discussionId={Number(item.objectID)}>
            {item.num_comments} comments
          </ILinkToDiscussionWrapper>
        </div>
      </div>
    </div>
  );
}
