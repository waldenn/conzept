import { Event } from "nostr-mux";
import { useState } from "react";

type Props = {
  note: Event;
  children: React.ReactNode;
};

export const Nip36Protection = ({ note, children }: Props) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const contentWarningTag = note.tags.find(
    (tag) => tag[0] === "content-warning"
  );

  if (contentWarningTag) {
    const reason = contentWarningTag ? contentWarningTag[1] : "";
    if (isRevealed) {
      return <>{children}</>;
    } else {
      return (
        <p>
          <button
            className="btn btn-outline btn-warn"
            onClick={() => setIsRevealed(true)}
          >
            Content warning (Reason: {reason})
          </button>
        </p>
      );
    }
  }

  return <>{children}</>;
};
