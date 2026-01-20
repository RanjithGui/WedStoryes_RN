import { GlobalState } from "../types/types";
import { DEFAULT_EVENTS } from "./defaultEvents";

export const initialGlobalState: GlobalState = {
  isLoading: false,
  events: DEFAULT_EVENTS,
  selectedEventItemIndex: -1,
  selectedEventItem: null,
  selectedEventId: null as string | null,
  eventDetails: [],
  selectedLogo: null,
};
