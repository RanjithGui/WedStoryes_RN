import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EventItem, SubEventDetails } from "../types/types";
import { initialGlobalState } from "./initialstate";

type GlobalActions = {
  setLoading: (value: boolean) => void;

  selectEventByIndex: (index: number) => void;
  clearSelection: () => void;

  addCustomEvent: (event: EventItem) => void;
  updateEvent: (event: EventItem) => void;
  deleteEvent: (id: string) => void;

  setEventDetails: (details: SubEventDetails[]) => void;
  setSelectedLogo: (uri: string | null) => void;

  resetToDefaults: () => void;
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
          e.id === updatedEvent.id ? updatedEvent : e
        );

        const idx = get().selectedEventItemIndex;

        set({
          events,
          selectedEventItem: idx >= 0 ? events[idx] : null,
          eventDetails: idx >= 0 ? events[idx].eventDetails ?? [] : [],
        });
      },

      deleteEvent: (id) =>
        set({
          events: get().events.filter((e) => e.id !== id),
          selectedEventItemIndex: -1,
          selectedEventItem: null,
          eventDetails: [],
        }),

      setEventDetails: (details) => set({ eventDetails: details }),

      setSelectedLogo: (uri) => set({ selectedLogo: uri }),

      resetToDefaults: () => set({ ...initialGlobalState }),
    }),
    {
      name: "WEDSTOREYS_GLOBAL_STATE",
      storage: asyncStorageAdapter,
    }
  )
);
