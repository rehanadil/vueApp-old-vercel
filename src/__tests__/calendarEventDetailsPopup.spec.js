import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getBookingJoinState = vi.fn();

vi.mock("@/utils/bookingJoinUtils.js", () => ({
  getBookingJoinState,
}));

describe("CalendarEventDetailsPopup", () => {
  beforeEach(() => {
    getBookingJoinState.mockReset();
    getBookingJoinState.mockReturnValue({
      canJoin: false,
      joinUrl: "https://example.com/scheduled-meeting/?booking_id=booking_123",
    });
  });

  it("passes reminder and extension data to the join state helper", async () => {
    const { default: CalendarEventDetailsPopup } = await import("@/components/calendar/CalendarEventDetailsPopup.vue");

    mount(CalendarEventDetailsPopup, {
      props: {
        event: {
          bookingId: "booking_123",
          start: "2026-05-01T10:00:00Z",
          end: "2026-05-01T10:30:00Z",
          status: "confirmed",
          raw: {
            bookingId: "booking_123",
            status: "confirmed",
            eventSnapshot: {
              enableCallReminderMinutesBefore: true,
              callReminderMinutesBefore: 15,
            },
            extensions: [
              { status: "captured", endAtIso: "2026-05-01T10:45:00Z" },
            ],
          },
        },
      },
    });

    expect(getBookingJoinState).toHaveBeenCalledWith(expect.objectContaining({
      bookingId: "booking_123",
      status: "confirmed",
      enableCallReminderMinutesBefore: true,
      callReminderMinutesBefore: 15,
      extensions: [{ status: "captured", endAtIso: "2026-05-01T10:45:00Z" }],
    }));
  });
});
