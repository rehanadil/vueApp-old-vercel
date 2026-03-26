import { mount } from "@vue/test-utils";
import { nextTick, reactive } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

const tokenGet = vi.fn();
const showToast = vi.fn();

function setByPath(target, path, value) {
  const segments = String(path).split(".");
  let cursor = target;

  while (segments.length > 1) {
    const key = segments.shift();
    if (!cursor[key] || typeof cursor[key] !== "object") {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }

  cursor[segments[0]] = value;
}

function getByPath(target, path) {
  return String(path).split(".").reduce((cursor, segment) => (
    cursor == null ? cursor : cursor[segment]
  ), target);
}

function createEngine() {
  const state = reactive({
    bookingDetails: {
      selectedDate: new Date("2026-03-24T00:00:00"),
      selectedTime: { value: "10:00", startHm: "10:00", offHours: false },
      selectedDuration: { value: 30, price: 1000 },
      addons: [],
      otherRequest: "",
      totalPrice: 1000,
      walletBalance: 0,
      formattedTimeRange: "10:00 AM-10:15 AM",
      headerDateDisplay: "March 24, 2026",
      selectedDateDisplay: "March 24, 2026",
    },
    fanBooking: {
      context: {
        creatorId: null,
        fanId: 2516,
        selectedEvent: {
          eventId: "evt_123",
          title: "Test Event",
          creatorName: "Creator Name",
          raw: {
            sessionDurationMinutes: 15,
          },
        },
      },
      temporaryHold: {
        temporaryHoldId: null,
        status: "none",
        expiresAt: null,
        secondsRemaining: 0,
      },
      booking: {},
    },
  });

  return reactive({
    state,
    substep: null,
    getState: vi.fn((path) => getByPath(state, path)),
    setState: vi.fn((path, value) => setByPath(state, path, value)),
    goToStep: vi.fn(),
    forceSubstep: vi.fn(async () => {}),
    callFlow: vi.fn(),
  });
}

async function flushAsync() {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

vi.mock("@/utils/TokenHandler.js", () => ({
  default: {
    get: tokenGet,
  },
}));

vi.mock("@/utils/toastBus.js", () => ({
  showToast,
}));

vi.mock("@/services/bookings/mappers/createBookingMapper.js", () => ({
  mapCreateBookingToRequest: () => ({
    payment: {
      lines: [
        { code: "base", amount: 900 },
        { code: "booking_fee", amount: 100 },
      ],
      total: 1000,
    },
  }),
}));

vi.mock("@/utils/contextIds.js", () => ({
  resolveCreatorIdFromContext: ({ fallback }) => fallback,
  resolveFanIdFromContext: ({ fallback }) => fallback,
}));

vi.mock("@/components/FanBookingFlow/HelperComponents/TopUpForm.vue", () => ({
  default: {
    name: "TopUpForm",
    template: "<div data-test='top-up-form' />",
  },
}));

vi.mock("@/components/FanBookingFlow/HelperComponents/OneOnOneBookingFlowLeftSideBar.vue", () => ({
  default: {
    name: "OneOnOneBookingFlowLeftSideBar",
    template: "<div data-test='left-sidebar' />",
  },
}));

vi.mock("@/components/FanBookingFlow/OneOnOneBookingFlow/oneOnOneBookingFlowAssets.js", () => ({
  bookingFlowArrowRightIcon: "/arrow.webp",
  bookingFlowBackgroundImage: "/background.webp",
  bookingFlowExBalanceImage: "/balance.webp",
  bookingFlowProfileImage: "/profile.webp",
  bookingFlowTokenIcon: "/token.webp",
}));

describe("BookingFlowStep3", () => {
  beforeEach(() => {
    tokenGet.mockReset();
    showToast.mockReset();
  });

  it("checks balance using engine context ids even if the shared resolver falls back", async () => {
    tokenGet.mockResolvedValue({
      data: {
        balance: 1900,
      },
    });

    const engine = createEngine();
    const { default: BookingFlowStep3 } = await import("@/components/FanBookingFlow/OneOnOneBookingFlow/BookingFlowStep3.vue");

    mount(BookingFlowStep3, {
      props: {
        engine,
        embedded: true,
      },
    });

    await flushAsync();

    expect(tokenGet).toHaveBeenCalledWith({
      userId: 2516,
      receiverId: null,
      defaultValue: null,
    });
    expect(engine.getState("bookingDetails.walletBalance")).toBe(1900);
  });

  it("renders dynamic booking summary details and navigates back to step 2 when changing schedule", async () => {
    tokenGet.mockResolvedValue({
      data: {
        balance: 1900,
      },
    });

    const engine = createEngine();
    const { default: BookingFlowStep3 } = await import("@/components/FanBookingFlow/OneOnOneBookingFlow/BookingFlowStep3.vue");

    const wrapper = mount(BookingFlowStep3, {
      props: {
        engine,
        embedded: true,
      },
    });

    await flushAsync();

    const text = wrapper.text();
    expect(text).toContain("March 24, 2026");
    expect(text).toContain("Creator Name");
    expect(text).toContain("15 Minute x 2 sessions (30 Min.)");
    expect(text).toContain("1,000");
    expect(text).toContain("USD$ 60.00");
    expect(text).not.toContain("@model");
    expect(text).not.toContain("09 Dec 2026");
    expect(text).not.toContain("224.99");

    await wrapper.get("button").trigger("click");

    expect(engine.forceSubstep).toHaveBeenCalledWith(null, { intent: "change-schedule" });
    expect(engine.goToStep).toHaveBeenCalledWith(2);
  });
});
