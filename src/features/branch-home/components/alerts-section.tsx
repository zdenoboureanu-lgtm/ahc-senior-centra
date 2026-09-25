import Link from "next/link";
import { AlertCircle, ArrowRight, Info, Megaphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Severity = "info" | "warning" | "important";

interface Alert {
  _id: string;
  title: string;
  body?: string;
  link_url?: string;
  link_label?: string;
  severity: Severity;
}

interface Props {
  alerts: Alert[];
}

const SEVERITY_STYLES: Record<
  Severity,
  { icon: LucideIcon; ring: string; bg: string; badge: string; label: string }
> = {
  important: {
    icon: AlertCircle,
    ring: "ring-red-200",
    bg: "bg-red-50",
    badge: "bg-red-600 text-white",
    label: "Důležité",
  },
  warning: {
    icon: Megaphone,
    ring: "ring-warm/30",
    bg: "bg-warm-light/50",
    badge: "bg-warm-dark text-warm-foreground",
    label: "Aktualita",
  },
  info: {
    icon: Info,
    ring: "ring-brand/20",
    bg: "bg-brand-light/60",
    badge: "bg-brand text-brand-foreground",
    label: "Informace",
  },
};

export function AlertsSection({ alerts }: Props) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <section className="relative mx-auto max-w-[1320px] px-6 pt-2 pb-10 lg:px-10 lg:pt-4 lg:pb-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-dark">
            Informace, aktuality
          </div>
          <h2 className="font-display mt-2 text-2xl text-foreground sm:text-3xl">
            Co je u nás nového
          </h2>
        </div>
        <Link
          href="/novinky"
          className="hidden text-xs font-bold uppercase tracking-wider text-brand hover:underline sm:inline-flex items-center gap-1"
        >
          Všechny novinky <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <ul className="grid gap-4 lg:grid-cols-2">
        {alerts.map((a) => {
          const s = SEVERITY_STYLES[a.severity] ?? SEVERITY_STYLES.info;
          const Icon = s.icon;
          const content = (
            <div
              className={`relative flex h-full items-start gap-4 rounded-2xl ${s.bg} p-5 ring-1 ${s.ring} transition-all hover:ring-2`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${s.badge}`}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.badge}`}
                  >
                    {s.label}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg leading-snug text-foreground">
                  {a.title}
                </h3>
                {a.body ? (
                  <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                    {a.body}
                  </p>
                ) : null}
                {a.link_url ? (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand">
                    {a.link_label ?? "Více informací"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                ) : null}
              </div>
            </div>
          );
          return (
            <li key={a._id}>
              {a.link_url ? (
                <Link href={a.link_url} className="block h-full">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
