export const searchRelays =
  process.env.NEXT_PUBLIC_SEARCH_RELAYS?.split(",") || [];
export const regularRelays =
  process.env.NEXT_PUBLIC_REGULAR_RELAYS?.split(",") || [];
export const relays = [...searchRelays, ...regularRelays];
