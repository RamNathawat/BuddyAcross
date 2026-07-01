export const HYPERLOCAL_ZONES = [
  "Indiranagar",
  "Koramangala",
  "HSR Layout",
  "Whitefield",
  "Jayanagar",
  "MG Road",
  "Marathahalli",
  "Electronic City",
  "JP Nagar",
  "Bellandur",
  "Hebbal",
  "Malleshwaram",
] as const;

export type HyperlocalZone = (typeof HYPERLOCAL_ZONES)[number];
