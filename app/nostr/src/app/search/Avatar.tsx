/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { GenericProfile, Profile } from "nostr-mux";

type Props = {
  pubkeyUri: string;
  profile: Profile<GenericProfile> | undefined;
};

export const Avatar = ({ pubkeyUri, profile }: Props) => {
  return (
    <div className="avatar placeholder">
      <div className={"w-14 h-14 rounded" + (profile ? "" : " bg-slate-200")}>
        <a href={pubkeyUri}>
          {profile?.properties.picture && (
            <img
              src={profile?.properties.picture}
              alt={profile.properties.displayName}
              className={profile ? "" : "animate-pulse"}
            />
          )}
        </a>
      </div>
    </div>
  );
};
