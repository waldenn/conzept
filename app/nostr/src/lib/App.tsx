"use client";

import {
  AutoProfileSubscriber,
  GenericProfile,
  Mux,
  parseGenericProfile,
  Relay,
} from "nostr-mux";
import { createContext, useContext, useEffect, useState } from "react";
import { relays } from "./config";

type AppContext = {
  mux: Mux;
  aps: AutoProfileSubscriber<GenericProfile>;
  currentTime: Date;
};

const mux = new Mux();

const aps = new AutoProfileSubscriber<GenericProfile>({
  parser: parseGenericProfile,
  autoEvict: false,
  collectPubkeyFromEvent: (e, relayURL) => {
    return relayURL && (e.kind === 1 || e.kind === 42) ? [e.pubkey] : [];
  },
});
mux.installPlugin(aps);

export const App = createContext<AppContext>({
  mux,
  aps,
  currentTime: new Date(),
});

export function useApp() {
  return useContext(App);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10_000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    for (const url of relays) {
      mux.addRelay(new Relay(url));
    }
  }, []);

  const ctx = {
    mux,
    aps,
    currentTime,
  };

  return <App.Provider value={ctx}>{children}</App.Provider>;
}
