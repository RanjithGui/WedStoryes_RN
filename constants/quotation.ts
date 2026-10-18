import { OwnerDetails } from "@/types/types";

export const STUDIO_OWNER: OwnerDetails = {
  name: "The WedStoryes",
  email: "wedstoryes@gmail.com",
  mobileNumber: "9030709090",
  saved: true,
};

export const DEFAULT_TERMS =
  [
    "1. A non-refundable booking advance of 75,000/- is required to confirm the booking.",
    "2. Balance amount: 1,50,000/- on the wedding day and 75,000/- before album printing.",
    "3. Package includes 3 premium Albums, 75 sheets in total. Additional sheet cost 650/- per sheet.",
    "4. Client must complete album photo selection within 30 days of receiving the selection gallery. Delay beyond this may result in revised album pricing.",
    "5. Album design will be shared for approval. Reasonable revisions will be made before final printing.",
    "6. Edited photos and videos will be delivered in 30-45 days after client's photo selection is completed. Wedding videos will be delivered in 15-20 days.",
    "7. Package includes one cinematic documentary Teaser and three traditional full length wedding videos.",
    "8. Client have to purchase 2 hard disks for final data delivery.",
    "9. Stay, food and local transportation for the photography team, if required, client only Accommodate.",
    "10. Advance amount not refundable, not applicable for another event.",
    "11. By confirming the booking, client agrees to all the above terms and conditions.",
  ].join("\n") + "\n";
