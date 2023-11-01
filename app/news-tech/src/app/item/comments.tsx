import { Fragment, useState } from "react";
import React from "react";
import {
  ExternalLink,
  LinkToAuthor,
  LinkToDiscussion,
  LinkToDiscussionWrapper,
} from "@/components/ExternalLink";
import { Story, StoryComment } from "@/api/use-hn-post";
import { ILinkToDiscussionWrapper } from "@/components/InternalLink";

type CommentIdMaps = {
  idTotalMap: Map<number, number>;
  idRootMap: Map<number, number>;
  idParentMap: Map<number, number>;
  idNextMap: Map<number, number>;
  idPrevMap: Map<number, number>;
};

export const CommentResults = (props: {
  story: Story;
  filterText: string;
  commentCount: number;
  maps: CommentIdMaps;
  filterOptions: React.ReactNode;
}) => {
  const comments = props.story.children;
  return (
    <div className="font-sans">
      <div className="flex flex-col gap-2">
        <DiscussionHeader
          story={props.story}
          commentCount={props.commentCount}
          filterOptions={props.filterOptions}
        />
        {comments.map((child) => (
          <CommentCard
            key={child.id}
            comment={child}
            maps={props.maps}
            filterText={props.filterText}
          />
        ))}
      </div>
    </div>
  );
};

function DiscussionHeader({
  story,
  commentCount,
  filterOptions,
}: {
  story: Story;
  commentCount: number;
  filterOptions: React.ReactNode;
}) {
  const title = story.title;
  const readOnHnLink = (
    <LinkToDiscussionWrapper
      discussionId={story.id}
      className="text-xs flex-shrink-0"
    >
      (read on hn)
    </LinkToDiscussionWrapper>
  );
  const parentLink = story.parent_id != null && (
    <ILinkToDiscussionWrapper discussionId={story.parent_id}>
      parent comment
    </ILinkToDiscussionWrapper>
  );
  const submissionLink = title && (
    <ExternalLink href={story.url}>
      <h1 className="text flex items-center gap-2">{title}</h1>
    </ExternalLink>
  );
  return (
    <div className="flex flex-col text-gray-700">
      {submissionLink && (
        <div className="flex flex-col tiny:flex-row gap-2 items-center justify-between">
          {submissionLink}
          {readOnHnLink}
        </div>
      )}
      <div className="text-xs flex justify-between">
        <div>
          {story.points} points by <LinkToAuthor author={story.author} />
          <Space />
          <LinkToDiscussion
            discussionId={story.id}
            createdAt={story.created_at}
          />
          <Bar />
          {commentCount} comments
        </div>
        {parentLink && (
          <div>
            {parentLink}
            <Bar />
            {readOnHnLink}
          </div>
        )}
      </div>
      {story.text && <HTMLOutput className="text-xs pt-2" html={story.text} />}
      <div className="border border-gray-300 p-2 rounded mt-1">
        {filterOptions}
      </div>
    </div>
  );
}

function Bar() {
  return <span className="px-1">|</span>;
}

function Space() {
  return <span className="px-1"></span>;
}

const CommentCard = (props: {
  comment: StoryComment;
  maps: CommentIdMaps;
  filterText: string;
}) => {
  const { comment, filterText, maps } = props;
  const html = comment._textMarked || comment.text || "<i>[deleted]<i/>";
  const commentChildrenCount = maps.idTotalMap.get(comment.id) || 0;

  const expanderText = useTextCollapse(comment._textMarked, filterText);
  const expanderThread = useThreadCollapse(filterText, commentChildrenCount);

  return (
    <CommentCardContent
      id={comment.id}
      html={html}
      comments={comment.children}
      maps={maps}
      isTextCollapsed={expanderText.isCollapsed}
      isThreadCollapsed={expanderThread.isCollapsed}
      header={
        <CommentHeader
          comment={comment}
          maps={maps}
          expanderThread={<Expander {...expanderThread} />}
          expanderText={<Expander {...expanderText} />}
        />
      }
      filterText={filterText}
    />
  );
};

function CommentCardContent(props: {
  id: number;
  comments: StoryComment[];
  maps: CommentIdMaps;
  header: React.ReactElement;
  isTextCollapsed: boolean;
  isThreadCollapsed: boolean;
  filterText: string;
  html: string;
}) {
  const {
    id,
    comments,
    header,
    isTextCollapsed,
    isThreadCollapsed,
    filterText,
    html,
  } = props;
  const shouldCollapseText = isThreadCollapsed || isTextCollapsed;
  return (
    <ul className="list-decimal bg-black bg-opacity-3 rounded pl-1 sm:pl-2">
      <div id={id + ""}>
        {header}
        {!shouldCollapseText && (
          <HTMLOutput className="text-xs pr-2" html={html} />
        )}
      </div>
      {!isThreadCollapsed && (
        <div className="flex flex-col gap-2">
          {comments.map((child) => (
            <CommentCard
              key={child.id}
              comment={child}
              maps={props.maps}
              filterText={filterText}
            />
          ))}
        </div>
      )}
    </ul>
  );
}

function HTMLOutput(props: { html: string; className?: string }) {
  return (
    <div
      className={props.className + " comment-text"}
      dangerouslySetInnerHTML={{ __html: props.html }}
    />
  );
}

function CommentHeader({
  comment,
  maps,
  expanderThread,
  expanderText,
}: {
  comment: StoryComment;
  maps: CommentIdMaps;
  expanderThread: React.ReactNode;
  expanderText: React.ReactNode;
}) {
  const rootId = maps.idRootMap.get(comment.id);
  const prevId = maps.idPrevMap.get(comment.id);
  const nextId = maps.idNextMap.get(comment.id);
  const parentId = maps.idParentMap.get(comment.id);
  const internalLinks = [
    { link: rootId, label: "root" },
    { link: parentId, label: "parent" },
    { link: prevId, label: "prev" },
    { link: nextId, label: "next" },
  ].filter(({ link }) => link != null);
  const internalLinkElements = internalLinks.map(({ link, label }, i) => (
    <Fragment key={i}>
      <a href={"#" + link}>{label}</a>
      {i < internalLinks.length - 1 && <Bar />}
    </Fragment>
  ));
  return (
    <div className="text-gray-500 text-xs">
      <div className="flex items-center gap-2 py-1">
        <LinkToAuthor className="flex-shrink-0" author={comment.author} />
        <LinkToDiscussion
          className="line-clamp-1"
          discussionId={comment.id}
          createdAt={comment.created_at}
        />
        <div className="flex-shrink-0">{expanderThread}</div>
        <div className="flex-grow"></div>
        <div className="hidden xs:flex justify-end flex-wrap gap-0">
          {internalLinkElements}
        </div>
        <div className="flex-shrink-0 pr-2">{expanderText}</div>
      </div>
      <div className="flex xs:hidden gap-0">{internalLinkElements}</div>
    </div>
  );
}

function useThreadCollapse(
  filterText: string,
  commentCount: number | undefined
): ExpanderProps {
  const [isCollapsed, setIsCollapsed] = useState(false);

  React.useEffect(() => {
    if (filterText) {
      setIsCollapsed(false);
    }
  }, [filterText]);

  const onCollapse = React.useCallback(() => setIsCollapsed(true), []);
  const onExpand = React.useCallback(() => setIsCollapsed(false), []);

  const labelIsCollapsed =
    !!commentCount && commentCount > 1 ? `${commentCount} more` : "+";

  return {
    expanderText: isCollapsed ? labelIsCollapsed : "-",
    isCollapsed,
    onCollapse,
    onExpand,
  };
}

function useTextCollapse(
  textMarked: string | undefined,
  filterText: string
): ExpanderProps {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const shouldCollapse = !textMarked;

  React.useEffect(() => {
    const isFiltering = !!filterText;
    setIsCollapsed(isFiltering && shouldCollapse);
  }, [filterText, shouldCollapse]);

  const onCollapse = React.useCallback(() => setIsCollapsed(true), []);
  const onExpand = React.useCallback(() => setIsCollapsed(false), []);

  return {
    expanderText: isCollapsed ? "+" : "-",
    isCollapsed,
    onCollapse,
    onExpand,
  };
}

type ExpanderProps = {
  isCollapsed: boolean;
  expanderText: string;
  onExpand: () => void;
  onCollapse: () => void;
};

function Expander({
  isCollapsed,
  expanderText,
  onExpand,
  onCollapse,
}: ExpanderProps) {
  const onClickExpander = React.useCallback(() => {
    isCollapsed ? onExpand() : onCollapse();
  }, [isCollapsed, onCollapse, onExpand]);
  return <button onClick={onClickExpander}>[{expanderText}]</button>;
}
