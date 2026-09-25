import { endOfDay, startOfDay, startOfMonth, subDays } from 'date-fns';

export type DatePreset = 'today' | 'yesterday' | 'this_month' | 'custom';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  preset: DatePreset;
}

export function getPresetRange(preset: Exclude<DatePreset, 'custom'>, now = new Date()): DateRange {
  if (preset === 'yesterday') {
    const day = subDays(now, 1);
    return { preset, startDate: startOfDay(day), endDate: endOfDay(day) };
  }
  if (preset === 'this_month') {
    return { preset, startDate: startOfMonth(now), endDate: endOfDay(now) };
  }
  return { preset: 'today', startDate: startOfDay(now), endDate: endOfDay(now) };
}

export function toIsoRange(range: Pick<DateRange, 'startDate' | 'endDate'>) {
  return {
    startDate: range.startDate.toISOString(),
    endDate: range.endDate.toISOString(),
  };
}
