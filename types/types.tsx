/* ---------- ADDONS ---------- */
export type Addons = {
  type?: string | null;
  count?: number;
  price?: string | null;
  details?: string | null;
  sheets?: string | null;
};

/* ---------- CLIENT DETAILS ---------- */
export type ClientDetails = {
  name?: string | null;
  mobileNumber?: string | null;
  email?: string | null;
  saved?: boolean | null;
};

/* ---------- OWNER DETAILS ---------- */
export type OwnerDetails = {
  name?: string | null;
  mobileNumber?: string | null;
  email?: string | null;
  saved?: boolean | null;
};

/* ---------- PHOTOGRAPHERS ---------- */
export type Photographers = {
  traditional?: number | null;
  candid?: number | null;
  price?: string | null;
  details?: string | null;
};

/* ---------- VIDEOGRAPHERS ---------- */
export type Videographers = {
  traditional?: number | null;
  candid?: number | null;
  price?: string | null;
  details?: string | null;
};

/* ---------- SUB EVENT DETAILS ---------- */
export type SubEventDetails = {
  subEvent?: string | null;
  photographers?: Photographers | null;
  videographers?: Videographers | null;
  date?: string | null;
  time?: string | null;
  addons?: Addons | null;
};

/* ---------- EVENT ITEM ---------- */
export type EventItem = {
  id?: string;
  title?: string;

  videoUri?: any;

  eventDetails: SubEventDetails[];

  ownerDetails?: OwnerDetails | null;
  clientDetails?: ClientDetails | null;

  termsAndConditions?: string | null;
  termsAndConditionsSaved?: boolean | null;

  totalPrice?: string | null;
  totalDiscount?: string | null;
};

/* ---------- GLOBAL STATE ---------- */
export type GlobalState = {
  isLoading: boolean;

  events: EventItem[];

  selectedEventItemIndex: number;
  selectedEventItem: EventItem | null;
  selectedEventId: string | null;

  eventDetails: SubEventDetails[];
  selectedLogo: string | null;
};
