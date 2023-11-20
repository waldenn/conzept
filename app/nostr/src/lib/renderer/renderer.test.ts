import { renderContent } from "./renderer";

test("regular note", () => {
  expect(renderContent("こんにちは")).toBe("こんにちは");
});

test("line break", () => {
  expect(renderContent("foo\nbar")).toBe("foo<br>\nbar");
});

test("<", () => {
  expect(renderContent("<")).toBe("&lt;");
});

test(">", () => {
  expect(renderContent(">")).toBe("&gt;");
});

test("XSS attempt", () => {
  expect(renderContent("<script>alert(-1)</script>")).toBe(
    "&lt;script&gt;alert(-1)&lt;/script&gt;"
  );
});

test("auto link URL", () => {
  expect(renderContent("https://example.com")).toBe(
    `<a href="https://example.com" target="_blank" rel="noopener noreferrer">https://example.com</a>`
  );
});

test("XSS attempt via href", () => {
  expect(renderContent("javascript:alert(-1)")).toBe("javascript:alert(-1)");
});

test("invalid mention", () => {
  expect(renderContent("@foo")).toBe("@foo");
});

test("NIP-27 link", () => {
  expect(
    renderContent(
      "nostr:npub1q7qyk7rvdga5qzmmyrvmlj29qd0n45snmfuhkrzsj4rk0sm4c4psvqwt9c"
    )
  ).toBe(
    `<a href="nostr:npub1q7qyk7rvdga5qzmmyrvmlj29qd0n45snmfuhkrzsj4rk0sm4c4psvqwt9c" target="_blank" rel="noopener noreferrer">npub1q7qyk7r:svqwt9c</a>`
  );
});

test("do not link mailto", () => {
  expect(renderContent("mailto:foo@example.com")).toBe(
    "mailto:foo@example.com"
  );
});

test("do not link email address", () => {
  expect(renderContent("foo@example.com")).toBe("foo@example.com");
});

test("marqee not allowed", () => {
  expect(renderContent("<marquee>welcome</marquee>")).toBe(
    "&lt;marquee&gt;welcome&lt;/marquee&gt;"
  );
});
