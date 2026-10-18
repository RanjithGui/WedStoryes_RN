import {
  assetUri,
  coverFor,
  CUSTOM_COVER,
  Dialog,
  Icon,
  PageSkeleton,
  plural,
  useStoreHydrated,
  WebShell,
} from "@/components/web/ui";
import { useGlobalStore } from "@/store/globalstore";
import { EventItem } from "@/types/types";
import { useRouter } from "expo-router";
import React, { useState } from "react";

const SUGGESTIONS = ["Wedding", "Engagement", "Reception", "Birthday", "Baby Shower", "Corporate"];

export default function EventsPage() {
  const router = useRouter();
  const hydrated = useStoreHydrated();
  const events = useGlobalStore((s) => s.events);
  const addCustomEvent = useGlobalStore((s) => s.addCustomEvent);
  const deleteEvent = useGlobalStore((s) => s.deleteEvent);
  const selectEventByIndex = useGlobalStore((s) => s.selectEventByIndex);
  const setSelectedEventId = useGlobalStore((s) => s.setSelectedEventId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // "customevent" is the built-in "add your own" tile, not a real event.
  const userEvents = events.filter((e) => e.id !== "customevent");

  const openEvent = (id: string) => {
    const index = useGlobalStore.getState().events.findIndex((e) => e.id === id);
    setSelectedEventId(id);
    selectEventByIndex(index);
    router.push("/eventdetailsscreen");
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setName("");
    setError(null);
  };

  const createEvent = () => {
    const title = name.trim();
    if (!title) {
      setError("Give the event a name.");
      return;
    }
    const taken = events.some(
      (e) => e.id?.toLowerCase() === title.toLowerCase() || title.toLowerCase() === "customevent",
    );
    if (taken) {
      setError("An event with this name already exists.");
      return;
    }
    const newEvent: EventItem = {
      id: title,
      title,
      videoUri: CUSTOM_COVER,
      eventDetails: [],
    };
    addCustomEvent(newEvent);
    closeDialog();
    openEvent(title);
  };

  const confirmDelete = (event: EventItem) => {
    if (
      window.confirm(
        `Delete "${event.title}"? Its sub-events, client details and pricing will be removed.`,
      )
    ) {
      deleteEvent(event.id ?? "");
    }
  };

  return (
    <WebShell step={0} title="Events">
      <div className="ws-page-head">
        <div>
          <span className="ws-eyebrow">Step 1</span>
          <h1 className="ws-title">Choose an occasion</h1>
          <p className="ws-lede">
            Open an event you&apos;re already quoting, or start a new one. Each event
            keeps its own sub-events, client details and quotation.
          </p>
        </div>
        <button
          type="button"
          className="ws-btn ws-btn-primary"
          onClick={() => setDialogOpen(true)}
        >
          <Icon name="plus" size={16} /> New event
        </button>
      </div>

      {!hydrated ? (
        <PageSkeleton />
      ) : (
        <div className="ws-event-grid">
          <button
            type="button"
            className="ws-event-card ws-event-new"
            onClick={() => setDialogOpen(true)}
          >
            <div className="ws-event-cover">
              <img src={assetUri(CUSTOM_COVER)} alt="" />
              <span className="ws-event-new-badge">
                <Icon name="plus" size={20} />
              </span>
            </div>
            <div className="ws-event-body">
              <span className="ws-event-name">New event</span>
              <span className="ws-event-meta">
                Wedding, engagement, birthday or anything else
              </span>
            </div>
          </button>

          {userEvents.map((event) => {
            const subEvents = event.eventDetails ?? [];
            const client = event.clientDetails?.name;
            return (
              <div
                key={event.id}
                role="button"
                tabIndex={0}
                className="ws-event-card"
                onClick={() => openEvent(event.id ?? "")}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openEvent(event.id ?? "");
                  }
                }}
              >
                <div className="ws-event-cover">
                  <img src={assetUri(coverFor(event.title))} alt="" />
                </div>
                <button
                  type="button"
                  className="ws-icon-btn is-danger ws-event-delete"
                  aria-label={`Delete ${event.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(event);
                  }}
                >
                  <Icon name="trash" size={16} />
                </button>
                <div className="ws-event-body">
                  <span className="ws-event-name">{event.title}</span>
                  <span className="ws-event-meta">
                    <span>{plural(subEvents.length, "sub-event")}</span>
                    {client && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{client}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        title="New event"
        description="You can add sub-events like Haldi or Reception next."
        submitLabel="Create event"
        onClose={closeDialog}
        onSubmit={createEvent}
      >
        <div className="ws-field">
          <label className="ws-label" htmlFor="event-name">
            Event name
          </label>
          <input
            id="event-name"
            className={`ws-input ${error ? "is-invalid" : ""}`}
            placeholder="e.g. Priya & Arjun's Wedding"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
          />
          {error && <span className="ws-error">{error}</span>}
        </div>
        <div className="ws-chips" aria-label="Suggestions">
          {SUGGESTIONS.map((s) => (
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
      </Dialog>
    </WebShell>
  );
}
