// src/components/PageContainer.jsx
import React from "react";

/**
 * Wraps page content with consistent max-width and padding for mobile/desktop.
 * Use so every page has the same structure when opened on phone or desktop.
 */
export default function PageContainer({ children, className = "", noPadding = false }) {
  return (
    <div
      className={`
        w-full max-w-7xl mx-auto
        ${noPadding ? "" : "px-4 sm:px-5"}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
}
