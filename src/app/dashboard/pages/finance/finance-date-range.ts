/**
 * Shared date-range helpers for Finance report pages (Overview, Trial
 * Balance, and future P&L/Balance Sheet/Ageing pages) -- extracted after
 * being duplicated verbatim between finance-overview.component.ts and
 * trial-balance.component.ts (Story 2.2 review).
 */

export function getCurrentMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    startDate: toIsoDate(firstOfMonth),
    endDate: toIsoDate(now),
  };
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}
