/**
 * @jest-environment jsdom
 */

import { markTheHtml } from "./useDataFiltered";

describe("markTheHtml", () => {
  it("replaces normal text", () => {
    const res = markTheHtml("<p>Hello world</p>", "world");
    expect(res.htmlNew).toBe("<p><span>Hello <mark>world</mark></span></p>");
    expect(res.numReplacements).toBe(1);
  });
  it("does not replace within href", () => {
    const res = markTheHtml(
      '<a href="https://hello.world">Hello world</a>',
      "world"
    );
    expect(res.htmlNew).toBe(
      '<a href="https://hello.world"><span>Hello <mark>world</mark></span></a>'
    );
  });
  it("replaces multiple instances", () => {
    const res = markTheHtml("<p>Hello world world</p>", "world");
    expect(res.htmlNew).toBe(
      "<p><span>Hello <mark>world</mark> <mark>world</mark></span></p>"
    );
  });
});
