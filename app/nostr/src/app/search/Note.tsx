/* eslint-disable @next/next/no-img-element */
"use client";

import { useApp } from "@/lib/App";
import { Event, GenericProfile, Profile } from "nostr-mux";
import { MouseEventHandler, useEffect, useState } from "react";
import { Avatar } from "./Avatar";
import {
  differenceInMinutes,
  differenceInSeconds,
  format,
  isSameDay,
} from "date-fns";
import { SnippableContent } from "./SnippableContent";
import { encodeBech32ID } from "nostr-mux/dist/core/utils";
import { Nip36Protection } from "./Nip36Protection";
import { FaCheck, FaCopy } from "react-icons/fa";

type Props = {
  note: Event;
};

function formatDatetime(date: Date, currentTime: Date) {
  const sec = differenceInSeconds(currentTime, date);

  if (sec < 60) {
    return "<1m";
  } else if (sec < 60 * 60) {
    return differenceInMinutes(currentTime, date) + "m";
  } else if (isSameDay(currentTime, date)) {
    return format(date, "HH:mm");
  } else {
    return format(date, "yyyy-MM-dd");
  }
}

const CopyButton = ({ text, title }: { text: string; title: string }) => {
  const [isCopied, setIsCopied] = useState(false);
  const handleClick = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  if (isCopied) {
    return (
      <span
        className={"btn btn-primary btn-ghost btn-xs text-success"}
        title={title}
        onClick={handleClick}
      >
        <FaCheck />
      </span>
    );
  } else {
    return (
      <span
        className={"btn btn-primary btn-ghost btn-xs"}
        title={title}
        onClick={handleClick}
      >
        <FaCopy />
      </span>
    );
  }
};

export const Note = ({ note }: Props) => {
  const app = useApp();
  const [profile, setProfile] = useState<Profile<GenericProfile>>();

  useEffect(() => {
    app.aps.get(note.pubkey).then((profile) => profile && setProfile(profile));
  }, [app.aps, note.pubkey]);

  const date = new Date(note.created_at * 1000);
  const npub = encodeBech32ID("npub", note.pubkey);
  const noteId = encodeBech32ID("note", note.id);
  const pubkeyUri = "nostr:" + npub;
  const noteUri = "nostr:" + noteId;

  const handleNoteBodyClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target instanceof HTMLAnchorElement) {
      // Anchors have priority. We do not have to navigate to the note.
      return;
    }
    window.location.replace(noteUri);
  };

  return (
    <div key={note.id} className="card card-bordered shadow-lg my-3">
      <div className="card-body break-all p-5">
        <div className="flex gap-3">
          <Avatar pubkeyUri={pubkeyUri} profile={profile} />
          <div className="flex flex-col w-full gap-2">
            <div className="flex flex-row items-top">
              <div className="flex-none text-sm">
                <a href={pubkeyUri}>
                  {!profile && (
                    <div className="my-2 h-2 w-32 bg-slate-200 rounded animate-pulse"></div>
                  )}
                </a>
              </div>

              <div className="flex-1 mr-4">
                <a href={pubkeyUri}>
                  <strong>{profile?.properties.displayName}</strong>{" "}
                  {profile?.properties.name && "@" + profile?.properties.name}
                </a>
                <span className="ml-1">
                  {npub && <CopyButton text={npub} title="Copy author npub" />}
                </span>
              </div>

              <div>
                <span title={date.toISOString()} className="text-sm flex-none">
                  {formatDatetime(date, app.currentTime)}
                </span>
              </div>
            </div>
            <Nip36Protection note={note}>
              <SnippableContent
                note={note}
                onNoteBodyClick={handleNoteBodyClick}
              />
            </Nip36Protection>
          </div>
        </div>
        <div className="text-right">
          {noteId && <CopyButton text={noteId} title="Copy note Id" />}
        </div>
      </div>
    </div>
  );
};
