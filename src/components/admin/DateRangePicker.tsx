'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarRange, Check, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { DatePreset, DateRange, getPresetRange } from '@/lib/date-range';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const PRESETS: { id: Exclude<DatePreset, 'custom'>; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_month', label: 'This Month' },
];

function toDateInputValue(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState(toDateInputValue(value.startDate));
  const [customEnd, setCustomEnd] = useState(toDateInputValue(value.endDate));
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCustomStart(toDateInputValue(value.startDate));
    setCustomEnd(toDateInputValue(value.endDate));
  }, [value.startDate, value.endDate]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const summary =
    value.preset === 'today'
      ? 'Today'
      : value.preset === 'yesterday'
        ? 'Yesterday'
        : value.preset === 'this_month'
          ? 'This Month'
          : `${format(value.startDate, 'MMM d')} – ${format(value.endDate, 'MMM d, yyyy')}`;

  const applyCustom = () => {
    const startDate = new Date(`${customStart}T00:00:00`);
    const endDate = new Date(`${customEnd}T23:59:59`);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
      return;
    }
    onChange({ preset: 'custom', startDate, endDate });
    setOpen(false);
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent"
      >
        <CalendarRange className="h-4 w-4 text-muted-foreground" />
        <span>{summary}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-[320px] rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-2xl">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Date range
          </p>
          <div className="space-y-1">
            {PRESETS.map((preset) => {
              const active = value.preset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onChange(getPresetRange(preset.id));
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  {preset.label}
                  {active && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>

          <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
            <p className="mb-2 text-xs font-semibold text-foreground">Custom Date Range</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Start
                </span>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground outline-none ring-ring focus:ring-2"
                />
              </label>
              <label className="space-y-1">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  End
                </span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground outline-none ring-ring focus:ring-2"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={applyCustom}
              className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Apply custom range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
