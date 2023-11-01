"use client";
import { useQuery } from "react-query";

export function useHnUser(userId: string | null) {
  const query = useQuery(
    "user-" + userId,
    () => fetchHackerNewsUser(userId + ""),
    {
      enabled: userId != null,
    }
  );
  return query;
}

export type User = {
  about: string;
  karma: string;
  username: string;
};

const fetchHackerNewsUser = async (itemId: string) => {
  const url = `http://hn.algolia.com/api/v1/users/${itemId}`;
  return fetch(url).then((response) => response.json() as unknown as User);
};
