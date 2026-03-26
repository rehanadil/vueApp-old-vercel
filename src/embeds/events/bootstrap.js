import { reactive } from "vue";
import { toNumberOr } from "@/utils/contextIds.js";
import { normalizeCreatorPresentationInput } from "@/components/FanBookingFlow/OneOnOneBookingFlow/creatorPresentation.js";

const DEFAULT_BOOTSTRAP = {
  creatorId: null,
  fanId: null,
  userRole: "creator",
  apiBaseUrl: "",
  initialRoute: "events",
  creatorData: {
    avatar: null,
    name: null,
    isVerified: null,
  },
  bootstrapped: false,
};

const bootstrapState = reactive({ ...DEFAULT_BOOTSTRAP });

function normalizeInitialRoute(value) {
  const normalized = String(value || "events").trim().toLowerCase();
  if (["events", "create-private", "create-group"].includes(normalized)) {
    return normalized;
  }
  return "events";
}

export function normalizeEventsEmbedBootstrap(payload = {}) {
  const normalizedUserRole = typeof payload.userRole === "string" && payload.userRole
    ? payload.userRole
    : "creator";
  const normalizedFanId = toNumberOr(payload.fanId, null);

  return {
    creatorId: toNumberOr(payload.creatorId, null),
    fanId: normalizedFanId,
    userRole: normalizedUserRole,
    apiBaseUrl: typeof payload.apiBaseUrl === "string" ? payload.apiBaseUrl : "",
    initialRoute: normalizeInitialRoute(payload.initialRoute),
    creatorData: normalizeCreatorPresentationInput(payload.creatorData || {
      avatar: payload.creatorAvatar,
      name: payload.creatorName,
      isVerified: payload.creatorVerified,
    }),
  };
}

export function applyEventsEmbedBootstrap(payload = {}) {
  const normalized = normalizeEventsEmbedBootstrap(payload);
  bootstrapState.creatorId = normalized.creatorId;
  bootstrapState.fanId = normalized.fanId;
  bootstrapState.userRole = normalized.userRole;
  bootstrapState.apiBaseUrl = normalized.apiBaseUrl;
  bootstrapState.initialRoute = normalized.initialRoute;
  bootstrapState.creatorData = normalized.creatorData;
  bootstrapState.bootstrapped = String(normalized.userRole || "").toLowerCase() === "fan"
    ? normalized.fanId != null
    : normalized.creatorId != null;
  return normalized;
}

export function readEventsEmbedBootstrapFromUrl() {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const creatorId = toNumberOr(params.get("creatorId"), null);
  const userRole = params.get("userRole") || "creator";
  const fanId = toNumberOr(params.get("fanId"), null);

  if (String(userRole).toLowerCase() === "fan") {
    if (fanId == null) return null;
  } else if (creatorId == null) {
    return null;
  }

  return normalizeEventsEmbedBootstrap({
    creatorId,
    fanId,
    userRole,
    apiBaseUrl: params.get("apiBaseUrl") || "",
    initialRoute: params.get("initialRoute") || "events",
    creatorAvatar: params.get("creatorAvatar"),
    creatorName: params.get("creatorName"),
    creatorVerified: params.get("creatorVerified"),
  });
}

export function useEventsEmbedBootstrap() {
  return bootstrapState;
}
