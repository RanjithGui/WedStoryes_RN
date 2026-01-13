import { EventItem } from "../types/types";

export const DEFAULT_EVENTS: EventItem[] = [
  {
    id: "wedding",
    title: "Wedding",
    videoUri: require("../assets/gifs/wedding.gif"),
    eventDetails: [],
  },
  {
    id: "baby_shower",
    title: "Baby Shower",
    videoUri: require("../assets/gifs/babyshower.gif"),
    eventDetails: [],
  },
  {
    id: "corporate",
    title: "Corporate",
    videoUri: require("../assets/gifs/corporate.gif"),
    eventDetails: [],
  },
  {
    id: "birthday",
    title: "Birthday Party",
    videoUri: require("../assets/gifs/birthday.gif"),
    eventDetails: [],
  },
  {
    id: "customevent",
    title: "Custom Event",
    videoUri: require("../assets/gifs/customevent.gif"),
    eventDetails: [],
  },
];
