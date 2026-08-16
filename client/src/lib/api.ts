// Single data-access layer for the app.
//
// If VITE_API_BASE_URL is set at build time, calls go to the real Express API
// (deployed on Vercel, backed by Postgres) so bookings actually persist and are
// visible to the shop. If it is not set, everything falls back to the
// client-side shim in staticApi.ts, which keeps the site fully functional as a
// standalone static build with no backend.
//
// Every function below is signature-compatible with staticApi, so pages don't
// need to know which mode they're running in.

import * as staticApi from "./staticApi";
import type { RepairResponse, Appointment, AppointmentInput } from "./staticApi";

export type { RepairResponse, Appointment, AppointmentInput };
export { REPAIR_STEPS } from "./staticApi";

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL || "").trim();
// Tolerate a trailing slash in the env var.
const API_BASE = RAW_BASE.replace(/\/+$/, "");

export const isLive = API_BASE.length > 0;

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* non-JSON error body — keep the status text */
    }
    throw new ApiError(message, res.status);
  }

  return (await res.json()) as T;
}

export async function lookupRepair(number: string): Promise<RepairResponse | undefined> {
  if (!isLive) return staticApi.lookupRepair(number);
  const normalized = number.trim().toUpperCase();
  try {
    return await request<RepairResponse>(`/api/repairs/${encodeURIComponent(normalized)}`);
  } catch (err) {
    // A missing repair number is a normal outcome, not an error — the page
    // renders its "not found" state from `undefined`.
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}

export async function createAppointment(input: AppointmentInput): Promise<Appointment> {
  if (!isLive) return staticApi.createAppointment(input);
  return request<Appointment>("/api/appointments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getAppointment(confirmation: string): Promise<Appointment | undefined> {
  if (!isLive) return staticApi.getAppointment(confirmation);
  const normalized = confirmation.trim().toUpperCase();
  try {
    return await request<Appointment>(`/api/appointments/${encodeURIComponent(normalized)}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}
