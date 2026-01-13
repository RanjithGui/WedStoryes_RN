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
  nop?: number | null;
  type?: string | null;
  price?: string | null;
  details?: string | null;
};

/* ---------- VIDEOGRAPHERS ---------- */
export type Videographers = {
  nop?: number | null;
  type?: string | null;
  price?: string | null;
  details?: string | null;
};

/* ---------- SUB EVENT DETAILS ---------- */
export type SubEventDetails = {
  subEvent?: string | null;
  photographers?: Photographers[] | null;
  videographers?: Videographers[] | null;
  date?: string | null;
  time?: string | null;
  addons?: Addons[] | null;
};

/* ---------- EVENT ITEM ---------- */
export type EventItem = {
  id?: string | null;
  title?: string | null;

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

  eventDetails: SubEventDetails[];
  selectedLogo: string | null;
};
