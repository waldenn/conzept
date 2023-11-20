import * as linkify from "linkifyjs";
import linkifyString from "linkify-string";

linkify.registerCustomProtocol("nostr", true);

const linkifyOptions = {
  target: "_blank",
  rel: "noopener noreferrer",
  nl2br: true,

  format: (href: string, type: string) => {
    if (type === "url") {
      const m = href.match(
        /^nostr:((?:npub|note|nprofile|nevent|nrelay|naddr)1)(.+)$/
      );
      if (m && m[2].length > 14) {
        return m[1] + m[2].slice(0, 7) + ":" + m[2].slice(m[2].length - 7);
      }
    }

    return href;
  },

  validate: (href: string, type: string) => {
    if (type === "url") {
      if (href.startsWith("http") || href.startsWith("nostr:")) {
        return true;
      }
    }
    return false;
  },
};

export function renderContent(content: string): string {
  return linkifyString(content, linkifyOptions);
}
