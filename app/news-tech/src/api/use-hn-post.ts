"use client";
import { useQuery } from "react-query";

export function useHnPost(postId: string) {
  const query = useQuery(
    "post-" + postId,
    () => fetchHackerNewsPost(postId + ""),
    {
      enabled: postId != null,
    }
  );
  return query;
}

export type Story = {
  id: number;
  created_at: string;
  created_at_i: number;
  type: string;
  author: string;
  title: string;
  url: string;
  text: string | null;
  points: number | null;
  parent_id: number | null;
  story_id: number | null;
  children: StoryComment[];
};

export type StoryComment = {
  id: number;
  created_at: string;
  created_at_i: number;
  type: string;
  author: string;
  title: string | null;
  url: string | null;
  text: string | undefined;
  _textMarked: string | undefined;
  points: number | null;
  parent_id: number;
  story_id: number;
  children: StoryComment[];
};

const fetchHackerNewsPost = async (itemId: string) => {
  const url = `https://hn.algolia.com/api/v1/items/${itemId}`;
  return fetch(url).then((response) => response.json() as unknown as Story);
};
