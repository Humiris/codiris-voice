"use client";

import { useEffect, useRef } from "react";

export function CodirisWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !containerRef.current.querySelector('codiris-widget')) {
      const widget = document.createElement('codiris-widget');
      widget.setAttribute('agent-id', 'project-1764993332731');
      widget.setAttribute('width', '376');
      widget.setAttribute('prompt-bar', 'true');
      containerRef.current.appendChild(widget);
    }
  }, []);

  return <div ref={containerRef} suppressHydrationWarning />;
}
