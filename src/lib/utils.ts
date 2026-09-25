import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

export function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(price);
}

const BLOCKED_INJECTED_SCRIPT_MARKERS = [
    'profitableratecpmnetwork',
    'highrevenueformat',
    'stretchadjoiningperspective',
    'adsterra',
    'atoptions',
    'popunder',
    'pl31346216',
];

/** Returns markup only if it does not reference known spam ad-network injectors. */
export function sanitizeCustomMarkup(html?: string | null): string | null {
    if (!html) return null;
    const lower = html.toLowerCase();
    if (BLOCKED_INJECTED_SCRIPT_MARKERS.some((marker) => lower.includes(marker))) {
        return null;
    }
    return html;
}
