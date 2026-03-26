export function toNumberOr(value, fallback = null) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" && value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readNumberFromStorage(key) {
  if (typeof window === "undefined") return null;
  return toNumberOr(window.localStorage?.getItem(key), null);
}

export function resolveCreatorIdFromContext({
  preferredId = null,
  extraCandidates = [],
  route = null,
  engine = null,
  fallback = 1,
} = {}) {
  const candidates = [
    preferredId,
    ...(Array.isArray(extraCandidates) ? extraCandidates : []),
    engine?.getState?.("creatorId"),
    engine?.getState?.("fanBooking.context.creatorId"),
    engine?.getState?.("fanBooking.catalog.creatorId"),
    route?.query?.creatorId,
    readNumberFromStorage("creatorId"),
  ];

  for (const candidate of candidates) {
    const numeric = toNumberOr(candidate, null);
    if (numeric != null) return numeric;
  }

  return fallback;
}

export function resolveFanIdFromContext({
  preferredId = null,
  extraCandidates = [],
  route = null,
  engine = null,
  fallback = 2,
} = {}) {
  const candidates = [
    preferredId,
    ...(Array.isArray(extraCandidates) ? extraCandidates : []),
    engine?.getState?.("fanId"),
    engine?.getState?.("fanBooking.context.fanId"),
    engine?.getState?.("userId"),
    route?.query?.fanId,
    route?.query?.userId,
    readNumberFromStorage("fanId"),
    readNumberFromStorage("userId"),
  ];

  for (const candidate of candidates) {
    const numeric = toNumberOr(candidate, null);
    if (numeric != null) return numeric;
  }

  return fallback;
}
