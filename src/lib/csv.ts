/**
 * Minimal CSV serialiser + browser download trigger.
 *
 * Keeps everything client-side so the admin export does not need an extra
 * Supabase Edge Function or a serverless route. Compliant with RFC 4180:
 * commas, quotes, and newlines inside a field are escaped by wrapping the
 * field in double quotes and doubling any embedded quotes.
 */

export interface CsvColumn<T> {
  /** Header label that appears in the first row of the CSV. */
  header: string;
  /** Map a row object to its scalar value for this column. */
  value: (row: T) => string | number | boolean | null | undefined;
}

const NEEDS_ESCAPE = /[",\r\n]/;

function escapeCell(input: string | number | boolean | null | undefined): string {
  if (input === null || input === undefined) return "";
  const str = typeof input === "string" ? input : String(input);
  if (NEEDS_ESCAPE.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCell(c.header)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCell(c.value(row))).join(","))
    .join("\r\n");
  return body ? `${header}\r\n${body}` : header;
}

/**
 * Trigger a browser download of the given CSV text under the given filename.
 * Adds a UTF-8 BOM so Excel opens it without garbling non-ASCII characters
 * (Australian founder names, descriptions, etc.).
 */
export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === "undefined") return;
  const bom = "﻿";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
