"use client";
import { QueryClient } from "react-query";
import { createWebStoragePersistor } from "react-query/createWebStoragePersistor-experimental";
import { persistQueryClient } from "react-query/persistQueryClient-experimental";

const MS_IN_HOUR = 1000 * 60 * 60;
const cacheTime = MS_IN_HOUR * 1;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime,
    },
  },
});

const getLocalStorage = () => {
  try {
    return window.localStorage;
  } catch (e) {
    return null as any;
  }
};

const localStoragePersistor = createWebStoragePersistor({
  storage: getLocalStorage(),
});

persistQueryClient({
  queryClient,
  persistor: localStoragePersistor,
  maxAge: cacheTime,
  hydrateOptions: {},
  dehydrateOptions: {},
});
