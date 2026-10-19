// Shared building blocks for the *.web.tsx routes. Plain DOM + CSS (see
// web.css) so the web app gets real hover/focus states, CSS grid and native
// form controls instead of the mobile React Native layouts.
import "@/global.css";
import "./web.css";

import { useGlobalStore } from "@/store/globalstore";
import { Asset } from "expo-asset";
import { useRouter } from "expo-router";
import Head from "expo-router/head";
import React, { useEffect, useRef, useState } from "react";

/* ---------- Assets ---------- */

export const assetUri = (mod: number) => {
  try {
    return Asset.fromModule(mod).uri;
  } catch {
    return undefined;
  }
};

export const LOGO = require("../../assets/images/logo.png");

const COVERS: [RegExp, number][] = [
  [/wedding|marriage|reception|shaadi|vivah/i, require("../../assets/gifs/wedding.gif")],
  [/birthday|anniversary/i, require("../../assets/gifs/birthday.gif")],
  [/baby|shower|naming/i, require("../../assets/gifs/babyshower.gif")],
  [/corporate|conference|office|launch/i, require("../../assets/gifs/corporate.gif")],
];
export const CUSTOM_COVER = require("../../assets/gifs/customevent.gif");

// Persisted events store `videoUri` as a bundler asset id, which isn't stable
// across web builds, so web picks a cover from the event title instead.
export const coverFor = (title?: string | null) =>
  COVERS.find(([re]) => re.test(title ?? ""))?.[1] ?? CUSTOM_COVER;

/* ---------- Store helpers ---------- */

// Zustand's persist middleware rehydrates asynchronously, and the static
// HTML is rendered with the default state. Gate store-driven UI on this so
// the first paint shows a skeleton instead of a flash of "no event".
export function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsubscribe = useGlobalStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    setHydrated(useGlobalStore.persist.hasHydrated());
    return unsubscribe;
  }, []);
  return hydrated;
}

export const useSelectedEvent = () =>
  useGlobalStore((s) => s.events.find((e) => e.id === s.selectedEventId));

/* ---------- Formatting ---------- */

export const parseAmount = (value?: string | null) =>
  Number((value ?? "").replace(/\D/g, "") || 0);

export const formatINR = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export const formatDate = (value?: string | null) => {
  if (!value) return "No date";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const toDateInputValue = (value?: string | null) => {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

export const fromDateInputValue = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const plural = (n: number, word: string) =>
  `${n} ${word}${n === 1 ? "" : "s"}`;

/* ---------- Icons ---------- */

const ICONS = {
  arrowLeft: "M19 12H5 M12 19l-7-7 7-7",
  arrowRight: "M5 12h14 M12 5l7 7-7 7",
  plus: "M12 5v14 M5 12h14",
  minus: "M5 12h14",
  trash: "M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6 M10 11v6 M14 11v6",
  check: "M20 6 9 17l-5-5",
  x: "M18 6 6 18 M6 6l12 12",
  calendar:
    "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  camera:
    "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  video:
    "M22 8l-6 4 6 4V8z M4 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",
  sparkles: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z M19 16v4 M17 18h4",
  pencil: "M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z",
  chevronDown: "M6 9l6 6 6-6",
  download: "M12 3v12 M7 10l5 5 5-5 M5 21h14",
  printer:
    "M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  wallet:
    "M3 7a2 2 0 0 1 2-2h14v4 M3 7v10a2 2 0 0 0 2 2h16V9H5a2 2 0 0 1-2-2z M17 14h.01",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h5",
  fit: "M8 3H5a2 2 0 0 0-2 2v3 M21 8V5a2 2 0 0 0-2-2h-3 M3 16v3a2 2 0 0 0 2 2h3 M16 21h3a2 2 0 0 0 2-2v-3",
  layers: "M12 2 2 7l10 5 10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

/* ---------- Navigation ---------- */

type Href = "/" | "/homepage" | "/eventdetailsscreen" | "/clientandpdf" | "/pdfpreview";

// A real <a href> (so middle-click / open-in-new-tab work) that does a
// client-side navigation on a plain left click.
export function NavLink({
  href,
  className,
  children,
  ...rest
}: {
  href: Href;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const router = useRouter();
  return (
    <a
      {...rest}
      href={href}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        router.navigate(href);
      }}
    >
      {children}
    </a>
  );
}

const STEPS: { label: string; href: Href }[] = [
  { label: "Event", href: "/homepage" },
  { label: "Coverage", href: "/eventdetailsscreen" },
  { label: "Client & pricing", href: "/clientandpdf" },
  { label: "Quotation", href: "/pdfpreview" },
];

function Stepper({ current }: { current: number }) {
  const hasEvent = useGlobalStore((s) =>
    s.events.some((e) => e.id === s.selectedEventId && e.id !== "customevent"),
  );

  return (
    <ol className="ws-steps" aria-label="Quotation steps">
      {STEPS.map((step, index) => {
        const state =
          index === current ? "is-current" : index < current ? "is-done" : "";
        const enabled = index === 0 || hasEvent;
        const content = (
          <>
            <span className="ws-step-num">
              {index < current ? <Icon name="check" size={13} /> : index + 1}
            </span>
            <span className="ws-step-label">{step.label}</span>
          </>
        );
        return (
          <React.Fragment key={step.href}>
            {index > 0 && <li className="ws-step-sep" aria-hidden="true" />}
            <li>
              {enabled && index !== current ? (
                <NavLink href={step.href} className={`ws-step ${state}`}>
                  {content}
                </NavLink>
              ) : (
                <span
                  className={`ws-step ${state} ${enabled ? "" : "is-disabled"}`}
                  aria-current={index === current ? "step" : undefined}
                >
                  {content}
                </span>
              )}
            </li>
          </React.Fragment>
        );
      })}
    </ol>
  );
}

export function Brand() {
  return (
    <NavLink href="/" className="ws-brand" aria-label="WedStoryes home">
      WedStoryes<span>.</span>
    </NavLink>
  );
}

export function WebShell({
  step,
  title,
  children,
  mainClassName = "ws-main",
}: {
  step: number;
  title: string;
  children: React.ReactNode;
  mainClassName?: string;
}) {
  return (
    <div className="ws-app">
      <Head>
        <title>{`${title} · WedStoryes`}</title>
      </Head>
      <header className="ws-header">
        <Brand />
        <Stepper current={step} />
        <div className="ws-header-end" />
      </header>
      <main className={mainClassName}>{children}</main>
    </div>
  );
}

/* ---------- Controls ---------- */

export function Counter({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="ws-counter-row">
      <span>{label}</span>
      <div className="ws-counter" role="group" aria-label={label}>
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Icon name="minus" size={16} />
        </button>
        <output aria-live="polite">{value}</output>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Icon name="plus" size={16} />
        </button>
      </div>
    </div>
  );
}

export function Dialog({
  open,
  title,
  description,
  onClose,
  onSubmit,
  submitLabel,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="ws-dialog-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        ref={panelRef}
        className="ws-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <h2>{title}</h2>
        {description && <p className="ws-muted">{description}</p>}
        <div className="ws-dialog-body">{children}</div>
        <div className="ws-dialog-actions">
          <button type="button" className="ws-btn ws-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="ws-btn ws-btn-primary">
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: IconName;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="ws-empty">
      <div className="ws-empty-icon">
        <Icon name={icon} size={24} />
      </div>
      <h2>{title}</h2>
      {children && <p className="ws-muted">{children}</p>}
      {action}
    </div>
  );
}

export function NoEventSelected() {
  return (
    <EmptyState
      icon="layers"
      title="No event selected"
      action={
        <NavLink href="/homepage" className="ws-btn ws-btn-primary">
          Choose an event <Icon name="arrowRight" size={16} />
        </NavLink>
      }
    >
      Pick or create an event first, then come back here.
    </EmptyState>
  );
}

export function PageSkeleton() {
  return (
    <div className="ws-stack" aria-busy="true">
      <div className="ws-skeleton" style={{ height: 56, width: 320 }} />
      <div className="ws-skeleton" style={{ height: 220 }} />
      <div className="ws-skeleton" style={{ height: 220 }} />
    </div>
  );
}
