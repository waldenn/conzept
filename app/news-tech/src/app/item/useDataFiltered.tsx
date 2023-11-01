"use client";
import { Story, StoryComment } from "@/api/use-hn-post";
import { useMemo } from "react";

export function useDataFiltered(
  data: Story | undefined,
  filterText: string
): { data: Story; markCount: number } | undefined {
  const dataFiltered = useMemo(() => {
    if (!data) {
      return undefined;
    }
    return markAndCountChildren(data, filterText);
  }, [data, filterText]);
  return dataFiltered;
}

function markAndCountChildren(
  data: Story,
  filterText: string
): { data: Story; markCount: number } {
  const markedStory: Story = { ...data };
  const markCount = markedStory.children.reduce((a, comment) => {
    const markCountFromChildren = recursiveMarkAndCountChildren(
      comment,
      filterText
    );
    return a + markCountFromChildren;
  }, 0);
  return { data: markedStory, markCount };
}

function recursiveMarkAndCountChildren(
  comment: StoryComment,
  filterText: string
) {
  let totalMarkCount = 0;
  if (filterText) {
    const res = markTheHtml(comment.text || "", filterText);
    totalMarkCount += res.numReplacements;
    comment._textMarked = res.htmlNew;
  } else {
    comment._textMarked = undefined;
  }
  comment.children.forEach((comment) => {
    totalMarkCount += recursiveMarkAndCountChildren(comment, filterText);
  });
  return totalMarkCount;
}

type ReplacementResult = {
  htmlNew: string | undefined;
  numReplacements: number;
};

export function markTheHtml(html: string, filterBy: string): ReplacementResult {
  const container = document.createElement("div");
  container.innerHTML = html;

  const textNodes = getTextNodes(container);
  let numReplacements = 0;

  textNodes.forEach((textNode) => {
    const regex = new RegExp(escapeRegex(filterBy), "ig");
    const parentElement = textNode.parentNode as HTMLElement;
    const replacedHtml = textNode.textContent!.replace(regex, (match) => {
      numReplacements++;
      return `<mark>${match}</mark>`;
    });

    const replacementNode = document.createElement("span");
    replacementNode.innerHTML = replacedHtml;

    parentElement.replaceChild(replacementNode, textNode);
  });

  return {
    htmlNew: numReplacements > 0 ? container.innerHTML : undefined,
    numReplacements,
  };
}

function getTextNodes(node: Node): Node[] {
  const textNodes: Node[] = [];

  function traverse(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node);
    } else {
      node.childNodes.forEach((child) => traverse(child));
    }
  }

  traverse(node);
  return textNodes;
}

function escapeRegex(str: string): string {
  return str.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
}
