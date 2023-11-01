import { sortChildren } from "./sorter";

type SimpleTreeRoot = SimpleTreeNode[];
type SimpleTreeNode = [string, SimpleTreeNode[]] | [string];

type ChildrenObjRoot = {
  children: ChildrenObjNode[];
};
type ChildrenObjNode = {
  value: string;
  children: ChildrenObjNode[];
};

describe("sortStory", () => {
  it("sorts stories byResponseCount", () => {
    const res = sortChildren(
      convertSimpleTree([
        ["a2"], //
        ["a1", [["a11"], ["a12"]]], //
        ["a3"], //
      ]),
      {
        byResponseCount: true,
        byThreadDepth: false,
      }
    );
    expect<ChildrenObjRoot>(res).toMatchObject(
      convertSimpleTree([
        ["a1", [["a11"], ["a12"]]], //
        ["a2"], //
        ["a3"], //
      ])
    );
  });
  it("sorts stories byThreadDepth", () => {
    const res = sortChildren(
      convertSimpleTree([
        ["a1", [["a11"]]], //
        ["a2", [["a11", [["a111"]]]]], //
        ["a3"], //
      ]),
      {
        byResponseCount: false,
        byThreadDepth: true,
      }
    );
    expect<ChildrenObjRoot>(res).toMatchObject(
      convertSimpleTree([
        ["a2", [["a11", [["a111"]]]]], //
        ["a1", [["a11"]]], //
        ["a3"], //
      ])
    );
  });
  it("sorts stories byThreadDepth sorts nested children too", () => {
    const res = sortChildren(
      convertSimpleTree([
        [
          "a2",
          [
            ["a11"], //
            ["a11", [["a111"]]], //
          ],
        ],
        ["a2"],
      ]),
      {
        byResponseCount: false,
        byThreadDepth: true,
      }
    );
    expect<ChildrenObjRoot>(res).toMatchObject(
      convertSimpleTree([
        [
          "a2",
          [
            ["a11", [["a111"]]], //
            ["a11"], //
          ],
        ],
        ["a2"],
      ])
    );
  });
});

function convertSimpleTree(simpleRoot: SimpleTreeRoot): ChildrenObjRoot {
  const root: ChildrenObjRoot = { children: [] };

  function buildTree(
    node: ChildrenObjRoot,
    data: SimpleTreeNode[]
  ): ChildrenObjNode[] {
    for (let i = 0; i < data.length; i++) {
      const [value, children] = data[i];
      const newNode: ChildrenObjNode = { value, children: [] };
      newNode.children = buildTree(newNode, children || []);
      node.children.push(newNode);
    }
    return node.children;
  }

  root.children = buildTree(root, simpleRoot);

  return root;
}
