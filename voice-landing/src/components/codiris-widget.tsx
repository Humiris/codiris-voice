"use client";

import { useEffect, useRef } from "react";

export function CodirisWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Widget will be initialized by the external script
    // This component just renders the container client-side only
  }, []);

  return (
    <div ref={widgetRef} suppressHydrationWarning>
      <codiris-widget
        agent-id="project-1764993332731"
        width="376"
        prompt-bar="true"
        suppressHydrationWarning
      ></codiris-widget>
    </div>
  );
}
