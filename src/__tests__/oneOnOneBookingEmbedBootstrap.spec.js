import { beforeEach, describe, expect, it, vi } from "vitest";

describe("one-on-one booking embed bootstrap", () => {
  beforeEach(() => {
    vi.resetModules();
    window.history.replaceState({}, "", "/");
  });

  it("normalizes bootstrap payloads from the parent page", async () => {
    const {
      applyOneOnOneBookingBootstrap,
      useOneOnOneBookingBootstrap,
    } = await import("@/embeds/fanBooking/bootstrap.js");

    applyOneOnOneBookingBootstrap({
      creatorId: "1407",
      fanId: "25",
      eventId: "evt_123",
      apiBaseUrl: "https://api.example.com",
      creatorData: {
        avatar: "https://example.com/avatar.webp",
        name: "Creator Name",
        isVerified: true,
      },
    });

    const state = useOneOnOneBookingBootstrap();
    expect(state.creatorId).toBe(1407);
    expect(state.fanId).toBe(25);
    expect(state.eventId).toBe("evt_123");
    expect(state.apiBaseUrl).toBe("https://api.example.com");
    expect(state.creatorData).toEqual({
      avatar: "https://example.com/avatar.webp",
      name: "Creator Name",
      isVerified: true,
    });
    expect(state.bootstrapped).toBe(true);
  });

  it("reads fallback bootstrap data from URL params", async () => {
    window.history.replaceState(
      {},
      "",
      "/?creatorId=1407&fanId=25&eventId=evt_query&apiBaseUrl=https%3A%2F%2Fapi.example.com&creatorAvatar=https%3A%2F%2Fexample.com%2Favatar.webp&creatorName=Creator%20Name&creatorVerified=true",
    );

    const { readOneOnOneBookingBootstrapFromUrl } = await import("@/embeds/fanBooking/bootstrap.js");
    const bootstrap = readOneOnOneBookingBootstrapFromUrl();

    expect(bootstrap).toEqual({
      creatorId: 1407,
      fanId: 25,
      eventId: "evt_query",
      apiBaseUrl: "https://api.example.com",
      creatorData: {
        avatar: "https://example.com/avatar.webp",
        name: "Creator Name",
        isVerified: true,
      },
    });
  });
});
