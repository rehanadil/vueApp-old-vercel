import { describe, expect, it } from "vitest";
import {
  DEFAULT_CREATOR_NAME,
  normalizeCreatorPresentationInput,
  resolveCreatorPresentation,
} from "@/components/FanBookingFlow/OneOnOneBookingFlow/creatorPresentation.js";

describe("creatorPresentation", () => {
  it("normalizes explicit creator data and drops empty values", () => {
    expect(normalizeCreatorPresentationInput({
      avatar: "  ",
      name: "  Creator  ",
      isVerified: "true",
    })).toEqual({
      avatar: null,
      name: "Creator",
      isVerified: true,
    });
  });

  it("prefers explicit creator data field-by-field", () => {
    const resolved = resolveCreatorPresentation({
      explicitCreatorData: {
        name: "Provided Name",
      },
      selectedEvent: {
        creatorName: "Event Name",
        creatorAvatarUrl: "https://example.com/event.webp",
        creatorIsVerified: true,
      },
    });

    expect(resolved.name).toBe("Provided Name");
    expect(resolved.avatar).toBe("https://example.com/event.webp");
    expect(resolved.isVerified).toBe(true);
  });

  it("falls back to defaults when no creator data exists", () => {
    const resolved = resolveCreatorPresentation();

    expect(resolved.name).toBe(DEFAULT_CREATOR_NAME);
    expect(typeof resolved.avatar).toBe("string");
    expect(resolved.avatar.length).toBeGreaterThan(0);
    expect(resolved.isVerified).toBe(false);
  });
});
