"use client";
import React from "react";

const face = ["⊖_⊖", "⊜_⊜", "⊙_⊙"];

export function LoadingScreen() {
  const [faceIndex, setFaceIndex] = React.useState(0);

  useTimeout(() => {
    const newIndex = (faceIndex + 1) % face.length;
    setFaceIndex(newIndex);
  }, 2000 * Math.random());

  return (
    <div className="flex flex-col items-center py-40 w-full">
      <p className="text-3xl font-mono text-gray-600 pb-10">Loading...</p>
      <p className="text-4xl font-mono whitespace-pre text-gray-400">
        {face[faceIndex]}
      </p>
    </div>
  );
}

function useTimeout(cb: () => void, ms: number) {
  React.useEffect(() => {
    const ref = setTimeout(() => {
      cb();
    }, ms);
    return () => {
      clearTimeout(ref);
    };
  }, [cb, ms]);
}
