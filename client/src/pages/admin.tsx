import { useState } from "react";
import { Eye, KeyRound, LogOut, RefreshCw, ShieldAlert } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ApiError, getAdminSubmissions, type AdminSubmissions } from "@/lib/api";

const TOKEN_KEY = "joltrevive:admin-token";

function dateTime(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

export function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [data, setData] = useState<AdminSubmissions | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const load = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) {
      setError("Enter the admin token to view submissions.");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      const submissions = await getAdminSubmissions(trimmed);
      localStorage.setItem(TOKEN_KEY, trimmed);
      setData(submissions);
    } catch (loadError) {
      setData(null);
      setError(
        loadError instanceof ApiError && loadError.status === 401
          ? "That admin token was not accepted."
          : loadError instanceof Error
            ? loadError.message
            : "Unable to load submissions.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setData(null);
    setError("");
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
          <div>
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><ShieldAlert className="size-3.5" /> Private owner view</span>
            <h1 className="mt-2 font-display text-2xl font-semibold">Submissions</h1>
            <p className="mt-2 text-sm text-muted-foreground">Contact messages, appointment requests, and repair records. This page is not linked from the public site.</p>
          </div>
          {data && (
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => load()} disabled={isLoading} className="gap-2" data-testid="admin-refresh">
                <RefreshCw className="size-4" /> Refresh
              </Button>
              <Button type="button" variant="ghost" onClick={clearToken} className="gap-2" data-testid="admin-clear-token">
                <LogOut className="size-4" /> Clear token
              </Button>
            </div>
          )}
        </div>

        {!data ? (
          <form onSubmit={load} className="mx-auto mt-10 max-w-lg rounded-xl border border-border bg-card p-6">
            <KeyRound className="size-6 text-primary" />
            <h2 className="mt-3 font-display text-lg font-semibold">Enter admin token</h2>
            <p className="mt-1 text-sm text-muted-foreground">The token is stored only in this browser until you clear it.</p>
            <label className="mt-5 block">
              <span className="text-xs font-medium text-muted-foreground">ADMIN_TOKEN</span>
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                type="password"
                autoComplete="current-password"
                required
                className="input mt-1"
                data-testid="admin-token"
              />
            </label>
            {error && <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" data-testid="admin-error">{error}</p>}
            <Button type="submit" disabled={isLoading} className="mt-5 w-full gap-2" data-testid="admin-submit">
              <Eye className="size-4" /> {isLoading ? "Loading…" : "View submissions"}
            </Button>
          </form>
        ) : (
          <div className="mt-8 space-y-8">
            <DataTable title={`Contact messages (${data.contactMessages.length})`} empty="No contact messages yet." hasRows={data.contactMessages.length > 0}>
              <thead><tr><th>Received</th><th>From</th><th>Phone</th><th>Message</th></tr></thead>
              <tbody>
                {data.contactMessages.map((message) => (
                  <tr key={message.id}>
                    <td>{dateTime(message.createdAt)}</td>
                    <td><strong>{message.name}</strong><br /><a className="text-primary underline" href={`mailto:${message.email}`}>{message.email}</a></td>
                    <td>{message.phone || "—"}</td>
                    <td className="min-w-72 whitespace-pre-wrap">{message.message}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>

            <DataTable title={`Appointments (${data.appointments.length})`} empty="No appointments yet." hasRows={data.appointments.length > 0}>
              <thead><tr><th>Created</th><th>Customer</th><th>Service</th><th>When</th><th>Notes</th></tr></thead>
              <tbody>
                {data.appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{dateTime(appointment.createdAt)}</td>
                    <td><strong>{appointment.name}</strong><br /><a className="text-primary underline" href={`mailto:${appointment.email}`}>{appointment.email}</a><br />{appointment.phone}</td>
                    <td>{appointment.service}<br /><span className="font-mono text-xs text-muted-foreground">{appointment.confirmation}</span></td>
                    <td>{appointment.date}<br />{appointment.time}</td>
                    <td className="min-w-64 whitespace-pre-wrap">{appointment.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>

            <DataTable title={`Repair records (${data.repairs.length})`} empty="No repair records yet." hasRows={data.repairs.length > 0}>
              <thead><tr><th>Repair</th><th>Vehicle</th><th>Service</th><th>Received</th><th>Estimated ready</th><th>Technician</th></tr></thead>
              <tbody>
                {data.repairs.map((repair) => (
                  <tr key={repair.repairNumber}>
                    <td className="font-mono">{repair.repairNumber}</td>
                    <td>{repair.vehicle}</td>
                    <td>{repair.service}</td>
                    <td>{repair.receivedAt}</td>
                    <td>{repair.estimatedReady}</td>
                    <td>{repair.technician}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function DataTable({
  title,
  empty,
  hasRows,
  children,
}: {
  title: string;
  empty: string;
  hasRows: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {hasRows ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            {children}
          </table>
        </div>
      ) : <p className="mt-3 text-sm text-muted-foreground">{empty}</p>}
    </section>
  );
}
