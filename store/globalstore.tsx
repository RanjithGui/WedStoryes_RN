import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ClientDetails,
  EventItem,
  OwnerDetails,
  selectedAddon,
  SubEventDetails,
} from "../types/types";
import { initialGlobalState } from "./initialstate";

type GlobalActions = {
  setLoading: (value: boolean) => void;

  selectEventByIndex: (index: number) => void;
  clearSelection: () => void;

  addCustomEvent: (event: EventItem) => void;
  updateEvent: (event: EventItem) => void;
  deleteEvent: (id: string) => void;
  addSubEvent: (eventid: string, subEvent: SubEventDetails) => void;
  updateSubEventDetails: (details: SubEventDetails[], index: number) => void;
  updatePhotoGraphersCount: (
    eventIndex: number,
    subEventIndex: number,
    type: "traditional" | "candid",
    count: number,
  ) => void;
  updateVideographersCount: (
    eventIndex: number,
    subEventIndex: number,
    type: "traditional" | "candid",
    count: number,
  ) => void;
  updateAddonsCount: (
    eventIndex: number,
    subEventIndex: number,
    type: string,
    count: number,
  ) => void;

  setEventDetails: (details: SubEventDetails[]) => void;
  setSelectedLogo: (uri: string | null) => void;
  setSelectedEventItem: (eventItem: EventItem) => void;

  resetToDefaults: () => void;
  setSelectedEventId: (id: string) => void;
  deletesubEvent: (eventid: string, subEventIndex: number) => void;
  addclientdetails: (
    eventid: string,
    clientDetails: ClientDetails,
    ownerDetails?: OwnerDetails,
  ) => void;
  addTerms: (eventid: string, terms: string) => void;
  addTotalPriceandDiscount: (
    eventid: string,
    price: string,
    discount: string,
  ) => void;
  selectedAddon: (
    eventIndex: number,
    subEventIndex: number,
    addon: selectedAddon[],
  ) => void;
};

export type GlobalStore = typeof initialGlobalState & GlobalActions;

const asyncStorageAdapter = {
  getItem: async (name: string) => {
    const value = await AsyncStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (name: string, value: any) => {
    await AsyncStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: async (name: string) => {
    await AsyncStorage.removeItem(name);
  },
};

export const useGlobalStore = create<GlobalStore>()(
  persist(
    (set, get) => ({
      ...initialGlobalState,

      /* ---------- ACTIONS ---------- */
      setLoading: (value) => set({ isLoading: value }),

      selectEventByIndex: (index) => {
        const event = get().events[index] ?? null;
        set({
          selectedEventItemIndex: index,
          selectedEventItem: event,
          eventDetails: event?.eventDetails ?? [],
        });
      },

      clearSelection: () =>
        set({
          selectedEventItemIndex: -1,
          selectedEventItem: null,
          eventDetails: [],
        }),

      updatePhotoGraphersCount: (eventIndex, subEventIndex, type, count) => {
        const events = [...get().events];
        const event = events[eventIndex];
        if (event) {
          const details = event.eventDetails ? [...event.eventDetails] : [];
          const subEvent = details[subEventIndex];
          if (subEvent) {
            subEvent.photographers = {
              ...subEvent.photographers,
              [type]: count,
            };
            details[subEventIndex] = subEvent;
            events[eventIndex] = { ...event, eventDetails: details };
            set({ events });
          }
        }
      },
      updateVideographersCount: (eventIndex, subEventIndex, type, count) => {
        const events = [...get().events];
        const event = events[eventIndex];
        if (event) {
          const details = event.eventDetails ? [...event.eventDetails] : [];
          const subEvent = details[subEventIndex];
          if (subEvent) {
            subEvent.videographers = {
              ...subEvent.videographers,
              [type]: count,
            };
            details[subEventIndex] = subEvent;
            events[eventIndex] = { ...event, eventDetails: details };
            set({ events });
          }
        }
      },
      updateAddonsCount: (eventIndex, subEventIndex, type, count) => {
        const events = [...get().events];
        const event = events[eventIndex];
        if (event) {
          const details = event.eventDetails ? [...event.eventDetails] : [];
          const subEvent = details[subEventIndex];
          if (subEvent) {
            subEvent.addons = {
              ...subEvent.addons,
              [type]: count,
            };
            details[subEventIndex] = subEvent;
            events[eventIndex] = { ...event, eventDetails: details };
            set({ events });
          }
        }
      },

      addCustomEvent: (event) => {
        const events = [...get().events];
        events.splice(events.length - 1, 0, event);

        set({
          events,
          selectedEventItemIndex: events.length - 2,
          selectedEventItem: event,
          eventDetails: event.eventDetails ?? [],
        });
      },

      updateEvent: (updatedEvent) => {
        const events = get().events.map((e) =>
          e.id === updatedEvent.id ? updatedEvent : e,
        );

        const idx = get().selectedEventItemIndex;

        set({
          events,
          selectedEventItem: idx >= 0 ? events[idx] : null,
          eventDetails: idx >= 0 ? (events[idx].eventDetails ?? []) : [],
        });
      },

      addSubEvent: (eventid, subEvent) => {
        console.log("Incoming ID:", eventid);
        console.log("addSubEvent called at", Date.now(), eventid);

        const events = get().events.map((e) =>
          e.id === eventid
            ? { ...e, eventDetails: [...(e.eventDetails || []), subEvent] }
            : e,
        );
        set({ events });
      },

      deleteEvent: (id) =>
        set({
          events: get().events.filter((e) => e.id !== id),
          selectedEventItemIndex: -1,
          selectedEventItem: null,
          eventDetails: [],
        }),

      updateSubEventDetails: (details, index) => {
        const events = [...get().events];
        if (events[index]) {
          events[index] = { ...events[index], eventDetails: details };
        }

        set({
          events,
          eventDetails: details,
        });
      },
      deletesubEvent: (eventid, subEventIndex) => {
        console.log("deletesubEvent called at", Date.now(), eventid);

        const events = get().events.map((e) => {
          if (e.id === eventid) {
            const updatedDetails = e.eventDetails
              ? e.eventDetails.filter((_, index) => index !== subEventIndex)
              : [];
            return { ...e, eventDetails: updatedDetails };
          }
          return e;
        });
        set({ events });
      },

      setSelectedEventItem: (eventItem) =>
        set({ selectedEventItem: eventItem }),

      setEventDetails: (details) => set({ eventDetails: details }),

      setSelectedLogo: (uri) => set({ selectedLogo: uri }),

      resetToDefaults: () => set({ ...initialGlobalState }),
      setSelectedEventId: (id: string) => set({ selectedEventId: id }),
      addclientdetails: (
        eventid: string,
        clientDetails: any,
        ownerDetails?: any,
      ) => {
        const events = get().events.map((e) =>
          e.id === eventid ? { ...e, clientDetails, ownerDetails } : e,
        );
        set({ events });
      },
      addTerms: (eventid: string, terms: string) => {
        const events = get().events.map((e) =>
          e.id === eventid ? { ...e, termsAndConditions: terms } : e,
        );
        set({ events });
      },
      addTotalPriceandDiscount: (
        eventid: string,
        price: string,
        discount: string,
      ) => {
        const events = get().events.map((e) =>
          e.id === eventid
            ? { ...e, totalPrice: price, totalDiscount: discount }
            : e,
        );
        set({ events });
      },
      selectedAddon: (
        eventIndex: number,
        subEventIndex: number,
        addon: any,
      ) => {
        const events = get().events.map((e) => {
          if (e.id === get().events[eventIndex]?.id) {
            const details = e.eventDetails ? [...e.eventDetails] : [];
            const subEvent = details[subEventIndex];
            if (subEvent) {
              subEvent.selectedAddons = addon;
              details[subEventIndex] = subEvent;
              return { ...e, eventDetails: details };
            }
          }
          return e;
        });
        set({ events });
      },
    }),
    {
      name: "WEDSTOREYS_GLOBAL_STATE",
      storage: asyncStorageAdapter,
    },
  ),
);
