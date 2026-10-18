import {
  Counter,
  Dialog,
  EmptyState,
  formatDate,
  fromDateInputValue,
  Icon,
  NavLink,
  NoEventSelected,
  PageSkeleton,
  plural,
  toDateInputValue,
  useSelectedEvent,
  useStoreHydrated,
  WebShell,
} from "@/components/web/ui";
import { useGlobalStore } from "@/store/globalstore";
import { Addons, SubEventDetails } from "@/types/types";
import { useRouter } from "expo-router";
import React, { useState } from "react";

const ADDONS = [
  { value: "drone", label: "Drone" },
  { value: "photobook", label: "Photobook" },
  { value: "ledscreens", label: "LED screen" },
  { value: "livestreaming", label: "Live streaming" },
  { value: "makeupartist", label: "Makeup artist" },
  { value: "decorations", label: "Decorations" },
  { value: "invitations", label: "Invitations" },
] as const;
type AddonKey = (typeof ADDONS)[number]["value"];

const addonLabel = (value: string) =>
  ADDONS.find((a) => a.value === value)?.label ?? value;

const SUB_EVENT_SUGGESTIONS = ["Engagement", "Haldi", "Mehendi", "Sangeet", "Wedding", "Reception"];

const selectedAddonsOf = (sub?: SubEventDetails | null) =>
  (sub?.selectedAddons ?? []).map((a) => a.type as AddonKey);

const addonCount = (sub: SubEventDetails | undefined, key: AddonKey) =>
  Number(sub?.addons?.[key as keyof Addons] ?? 0) || 0;

const crewTotal = (crew?: { traditional?: number | null; candid?: number | null } | null) =>
  (crew?.traditional ?? 0) + (crew?.candid ?? 0);

function summarize(sub: SubEventDetails) {
  const parts: string[] = [];
  const photo = crewTotal(sub.photographers);
  const video = crewTotal(sub.videographers);
  if (photo) parts.push(plural(photo, "photographer"));
  if (video) parts.push(plural(video, "videographer"));
  const addons = selectedAddonsOf(sub);
  if (addons.length) parts.push(addons.map(addonLabel).join(", "));
  return parts.length ? parts.join(" · ") : "No coverage yet";
}

// Read-modify-write a single sub-event from the latest store state, for the
// edits that don't have a dedicated store action (rename, date, add-ons).
function patchSubEvent(
  eventId: string,
  index: number,
  patch: (sub: SubEventDetails) => Partial<SubEventDetails>,
) {
  const state = useGlobalStore.getState();
  const eventIndex = state.events.findIndex((e) => e.id === eventId);
  const event = state.events[eventIndex];
  if (!event?.eventDetails?.[index]) return;
  const details = [...event.eventDetails];
  details[index] = { ...details[index], ...patch(details[index]) };
  state.updateSubEventDetails(details, eventIndex);
}

function SubEventCard({
  eventId,
  eventIndex,
  index,
  sub,
  photobookTakenBy,
}: {
  eventId: string;
  eventIndex: number;
  index: number;
  sub: SubEventDetails;
  photobookTakenBy: string | null;
}) {
  const updatePhotographers = useGlobalStore((s) => s.updatePhotoGraphersCount);
  const updateVideographers = useGlobalStore((s) => s.updateVideographersCount);
  const updateAddonsCount = useGlobalStore((s) => s.updateAddonsCount);
  const deleteSubEvent = useGlobalStore((s) => s.deletesubEvent);

  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(sub.subEvent ?? "");
  const [draftDate, setDraftDate] = useState(toDateInputValue(sub.date));

  const selected = selectedAddonsOf(sub);

  const toggleAddon = (key: AddonKey) => {
    const on = selected.includes(key);
    patchSubEvent(eventId, index, (cur) => {
      const current = selectedAddonsOf(cur);
      if (on) {
        // Deselecting also clears the count so it doesn't linger in the PDF.
        return {
          selectedAddons: current.filter((t) => t !== key).map((type) => ({ type })),
          addons: {
            ...cur.addons,
            [key]: 0,
            ...(key === "photobook" ? { sheets: null, sheetsDescription: null } : {}),
          },
        };
      }
      return {
        selectedAddons: [...current, key].map((type) => ({ type })),
        addons: { ...cur.addons, [key]: Math.max(1, addonCount(cur, key)) },
      };
    });
  };

  const saveEdit = () => {
    const name = draftName.trim();
    if (!name) return;
    patchSubEvent(eventId, index, () => ({
      subEvent: name,
      date: draftDate ? fromDateInputValue(draftDate).toDateString() : null,
    }));
    setEditing(false);
  };

  const remove = () => {
    if (window.confirm(`Remove "${sub.subEvent}" from this event?`)) {
      deleteSubEvent(eventId, index);
    }
  };

  return (
    <article className="ws-card ws-sub">
      <div className="ws-sub-head">
        {editing ? (
          <form
            className="ws-sub-edit"
            onSubmit={(e) => {
              e.preventDefault();
              saveEdit();
            }}
          >
            <div className="ws-field">
              <label className="ws-label" htmlFor={`sub-name-${index}`}>
                Name
              </label>
              <input
                id={`sub-name-${index}`}
                className="ws-input"
                value={draftName}
                autoFocus
                onChange={(e) => setDraftName(e.target.value)}
              />
            </div>
            <div className="ws-field">
              <label className="ws-label" htmlFor={`sub-date-${index}`}>
                Date
              </label>
              <input
                id={`sub-date-${index}`}
                type="date"
                className="ws-input"
                value={draftDate}
                onChange={(e) => setDraftDate(e.target.value)}
              />
            </div>
            <div className="ws-toolbar-group">
              <button type="button" className="ws-btn ws-btn-ghost" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="ws-btn ws-btn-dark">
                Save
              </button>
            </div>
          </form>
        ) : (
          <>
            <button
              type="button"
              className="ws-sub-toggle"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <span className="ws-sub-name">{sub.subEvent}</span>
              <span className="ws-sub-summary">
                <span className="ws-tag">
                  <Icon name="calendar" size={13} /> {formatDate(sub.date)}
                </span>
                {!open && <span>{summarize(sub)}</span>}
              </span>
            </button>
            <div className="ws-sub-actions">
              <button
                type="button"
                className="ws-icon-btn"
                aria-label={`Edit ${sub.subEvent}`}
                onClick={() => {
                  setDraftName(sub.subEvent ?? "");
                  setDraftDate(toDateInputValue(sub.date));
                  setEditing(true);
                }}
              >
                <Icon name="pencil" size={16} />
              </button>
              <button
                type="button"
                className="ws-icon-btn is-danger"
                aria-label={`Remove ${sub.subEvent}`}
                onClick={remove}
              >
                <Icon name="trash" size={16} />
              </button>
              <button
                type="button"
                className="ws-icon-btn"
                aria-label={open ? "Collapse" : "Expand"}
                onClick={() => setOpen(!open)}
              >
                <span className={`ws-chevron ${open ? "is-open" : ""}`}>
                  <Icon name="chevronDown" size={18} />
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {open && (
        <div className="ws-sub-body">
          <section className="ws-panel">
            <h3 className="ws-panel-title">
              <Icon name="camera" size={15} /> Photographers
            </h3>
            <Counter
              label="Traditional"
              value={sub.photographers?.traditional ?? 0}
              onChange={(v) => updatePhotographers(eventIndex, index, "traditional", v)}
            />
            <Counter
              label="Candid"
              value={sub.photographers?.candid ?? 0}
              onChange={(v) => updatePhotographers(eventIndex, index, "candid", v)}
            />
          </section>

          <section className="ws-panel">
            <h3 className="ws-panel-title">
              <Icon name="video" size={15} /> Videographers
            </h3>
            <Counter
              label="Traditional"
              value={sub.videographers?.traditional ?? 0}
              onChange={(v) => updateVideographers(eventIndex, index, "traditional", v)}
            />
            <Counter
              label="Candid"
              value={sub.videographers?.candid ?? 0}
              onChange={(v) => updateVideographers(eventIndex, index, "candid", v)}
            />
          </section>

          <section className="ws-panel ws-span-2">
            <h3 className="ws-panel-title">
              <Icon name="sparkles" size={15} /> Add-ons
            </h3>
            <div className="ws-chips">
              {ADDONS.map((addon) => {
                const on = selected.includes(addon.value);
                const locked = addon.value === "photobook" && !on && photobookTakenBy !== null;
                return (
                  <button
                    key={addon.value}
                    type="button"
                    className={`ws-chip ${on ? "is-on" : ""}`}
                    aria-pressed={on}
                    disabled={locked}
                    title={locked ? `Photobook is already part of ${photobookTakenBy}` : undefined}
                    onClick={() => toggleAddon(addon.value)}
                  >
                    {on ? <Icon name="check" size={14} /> : <Icon name="plus" size={14} />}
                    {addon.label}
                  </button>
                );
              })}
            </div>

            {selected.length > 0 && (
              <div className="ws-addon-rows">
                {selected.map((key) => (
                  <React.Fragment key={key}>
                    <Counter
                      label={addonLabel(key)}
                      min={1}
                      value={addonCount(sub, key)}
                      onChange={(v) =>
                        updateAddonsCount(
                          eventIndex,
                          index,
                          key,
                          v,
                          key === "photobook" ? sub.addons?.sheetsDescription ?? null : undefined,
                          key === "photobook" ? sub.addons?.sheets ?? null : undefined,
                        )
                      }
                    />
                    {key === "photobook" && (
                      <div className="ws-photobook">
                        <div className="ws-field">
                          <label className="ws-label" htmlFor={`pb-desc-${index}`}>
                            Description
                          </label>
                          <input
                            id={`pb-desc-${index}`}
                            className="ws-input"
                            placeholder="e.g. 3 premium albums, 12×36 matte"
                            value={sub.addons?.sheetsDescription ?? ""}
                            onChange={(e) =>
                              updateAddonsCount(
                                eventIndex,
                                index,
                                "photobook",
                                addonCount(sub, "photobook"),
                                e.target.value,
                                sub.addons?.sheets ?? null,
                              )
                            }
                          />
                        </div>
                        <div className="ws-field">
                          <label className="ws-label" htmlFor={`pb-sheets-${index}`}>
                            Sheets
                          </label>
                          <input
                            id={`pb-sheets-${index}`}
                            className="ws-input"
                            type="number"
                            min={0}
                            inputMode="numeric"
                            placeholder="75"
                            value={sub.addons?.sheets ?? ""}
                            onChange={(e) =>
                              updateAddonsCount(
                                eventIndex,
                                index,
                                "photobook",
                                addonCount(sub, "photobook"),
                                sub.addons?.sheetsDescription ?? null,
                                Math.max(0, Number(e.target.value) || 0),
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </article>
  );
}

export default function CoveragePage() {
  const router = useRouter();
  const hydrated = useStoreHydrated();
  const event = useSelectedEvent();
  const eventIndex = useGlobalStore((s) => s.events.findIndex((e) => e.id === s.selectedEventId));
  const addSubEvent = useGlobalStore((s) => s.addSubEvent);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState(toDateInputValue(null));
  const [error, setError] = useState<string | null>(null);

  const closeDialog = () => {
    setDialogOpen(false);
    setName("");
    setDate(toDateInputValue(null));
    setError(null);
  };

  const createSubEvent = () => {
    if (!event?.id) return;
    if (!name.trim()) {
      setError("Give the sub-event a name.");
      return;
    }
    addSubEvent(event.id, {
      subEvent: name.trim(),
      date: date ? fromDateInputValue(date).toDateString() : null,
    });
    closeDialog();
  };

  if (!hydrated) {
    return (
      <WebShell step={1} title="Coverage">
        <PageSkeleton />
      </WebShell>
    );
  }

  if (!event || event.id === "customevent") {
    return (
      <WebShell step={1} title="Coverage">
        <NoEventSelected />
      </WebShell>
    );
  }

  const subs = event.eventDetails ?? [];
  const photobookOwnerIndex = subs.findIndex((s) => selectedAddonsOf(s).includes("photobook"));

  const totals = subs.reduce(
    (acc, s) => {
      acc.tp += s.photographers?.traditional ?? 0;
      acc.cp += s.photographers?.candid ?? 0;
      acc.tv += s.videographers?.traditional ?? 0;
      acc.cv += s.videographers?.candid ?? 0;
      for (const key of selectedAddonsOf(s)) {
        acc.addons[key] = (acc.addons[key] ?? 0) + addonCount(s, key);
      }
      return acc;
    },
    { tp: 0, cp: 0, tv: 0, cv: 0, addons: {} as Record<string, number> },
  );

  return (
    <WebShell step={1} title={`${event.title} · Coverage`}>
      <div className="ws-page-head">
        <div>
          <span className="ws-eyebrow">Step 2 · Coverage</span>
          <h1 className="ws-title">{event.title}</h1>
          <p className="ws-lede">
            Add each sub-event with its date, crew and add-ons. Changes save automatically.
          </p>
        </div>
        <button type="button" className="ws-btn ws-btn-outline" onClick={() => setDialogOpen(true)}>
          <Icon name="plus" size={16} /> Add sub-event
        </button>
      </div>

      <div className="ws-layout">
        <div className="ws-stack">
          {subs.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="No sub-events yet"
              action={
                <button
                  type="button"
                  className="ws-btn ws-btn-primary"
                  onClick={() => setDialogOpen(true)}
                >
                  <Icon name="plus" size={16} /> Add the first sub-event
                </button>
              }
            >
              Break the event into parts — Haldi, Sangeet, Wedding, Reception — so each
              gets its own crew and date on the quotation.
            </EmptyState>
          ) : (
            subs.map((sub, index) => (
              <SubEventCard
                key={`${index}-${sub.subEvent}`}
                eventId={event.id ?? ""}
                eventIndex={eventIndex}
                index={index}
                sub={sub}
                photobookTakenBy={
                  photobookOwnerIndex >= 0 && photobookOwnerIndex !== index
                    ? (subs[photobookOwnerIndex].subEvent ?? "another sub-event")
                    : null
                }
              />
            ))
          )}
        </div>

        <aside className="ws-aside">
          <div className="ws-card ws-card-pad">
            <h2 className="ws-card-title">
              <Icon name="layers" /> Coverage summary
            </h2>
            <div className="ws-summary-row">
              <span>Sub-events</span>
              <span>{subs.length}</span>
            </div>
            <div className="ws-summary-row">
              <span>Photographers</span>
              <span>
                {totals.tp} traditional · {totals.cp} candid
              </span>
            </div>
            <div className="ws-summary-row">
              <span>Videographers</span>
              <span>
                {totals.tv} traditional · {totals.cv} candid
              </span>
            </div>
            {Object.keys(totals.addons).length > 0 && (
              <>
                <hr className="ws-divider" />
                {Object.entries(totals.addons).map(([key, count]) => (
                  <div className="ws-summary-row" key={key}>
                    <span>{addonLabel(key)}</span>
                    <span>× {count}</span>
                  </div>
                ))}
              </>
            )}
            <hr className="ws-divider" />
            <button
              type="button"
              className="ws-btn ws-btn-primary ws-btn-block"
              onClick={() => router.push("/clientandpdf")}
            >
              Continue to client & pricing <Icon name="arrowRight" size={16} />
            </button>
          </div>
          <NavLink href="/homepage" className="ws-btn ws-btn-ghost">
            <Icon name="arrowLeft" size={16} /> All events
          </NavLink>
        </aside>
      </div>

      <Dialog
        open={dialogOpen}
        title="Add sub-event"
        description={`Part of ${event.title}.`}
        submitLabel="Add sub-event"
        onClose={closeDialog}
        onSubmit={createSubEvent}
      >
        <div className="ws-field">
          <label className="ws-label" htmlFor="sub-name">
            Name
          </label>
          <input
            id="sub-name"
            className={`ws-input ${error ? "is-invalid" : ""}`}
            placeholder="e.g. Sangeet"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
          />
          {error && <span className="ws-error">{error}</span>}
        </div>
        <div className="ws-chips" aria-label="Suggestions">
          {SUB_EVENT_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className={`ws-chip ${name === s ? "is-on" : ""}`}
              onClick={() => {
                setName(s);
                setError(null);
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="ws-field">
          <label className="ws-label" htmlFor="sub-date">
            Date
          </label>
          <input
            id="sub-date"
            type="date"
            className="ws-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </Dialog>
    </WebShell>
  );
}
