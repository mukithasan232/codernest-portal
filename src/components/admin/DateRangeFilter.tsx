"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, ChevronDown } from "lucide-react";

export default function DateRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams?.get("range") || "today";

  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const options = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "this_month", label: "This Month" },
    { value: "custom", label: "Custom Date Range" },
  ];

  const handleSelect = (val: string) => {
    setIsOpen(false);
    if (val !== "custom") {
      router.push(`?range=${val}`);
    } else {
      router.push(`?range=custom`);
    }
  };

  const applyCustom = () => {
    if (customStart && customEnd) {
      router.push(`?range=custom&start=${customStart}&end=${customEnd}`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-accent transition-colors shadow-sm"
      >
        <Calendar className="w-4 h-4 text-muted-foreground" />
        {options.find((o) => o.value === currentRange)?.label || "Date Range"}
        <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-xl shadow-lg z-50 p-2 space-y-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentRange === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-popover-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}

          {currentRange === "custom" && (
            <div className="mt-3 p-3 border-t border-border space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <button
                onClick={applyCustom}
                disabled={!customStart || !customEnd}
                className="w-full py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg disabled:opacity-50 transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
