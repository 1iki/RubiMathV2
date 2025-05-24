// src/components/ui/button.jsx
import React from "react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`rounded-xl px-4 py-2 font-semibold shadow-md transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
