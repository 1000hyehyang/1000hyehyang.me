"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} aria-label="인쇄" title="인쇄">
      <Printer size={20} aria-hidden="true" />
    </button>
  );
}
