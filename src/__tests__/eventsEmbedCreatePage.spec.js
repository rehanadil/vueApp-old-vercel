import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const mockBootstrap = {
  creatorId: 1407,
  userRole: "creator",
  apiBaseUrl: "https://api.example.com",
  initialRoute: "create-private",
  creatorData: {
    avatar: "https://example.com/avatar.webp",
    name: "Creator Name",
    isVerified: true,
  },
  bootstrapped: true,
};

const push = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/embeds/events/bootstrap.js", () => ({
  useEventsEmbedBootstrap: () => mockBootstrap,
}));

vi.mock("@/components/ui/form/BookingForm/UnifiedBookingForm.vue", () => ({
  default: {
    name: "UnifiedBookingForm",
    props: ["type", "creatorId", "apiBaseUrl", "creatorData", "embedded"],
    template: "<div data-test='booking-form' />",
  },
}));

describe("EventsEmbedCreatePage", () => {
  it("passes creatorData into UnifiedBookingForm", async () => {
    const { default: EventsEmbedCreatePage } = await import("@/embeds/events/pages/EventsEmbedCreatePage.vue");

    const wrapper = mount(EventsEmbedCreatePage, {
      props: {
        type: "private",
      },
    });

    const bookingForm = wrapper.getComponent({ name: "UnifiedBookingForm" });
    expect(bookingForm.props("creatorData")).toEqual(mockBootstrap.creatorData);
    expect(bookingForm.props("creatorId")).toBe(1407);
    expect(bookingForm.props("apiBaseUrl")).toBe("https://api.example.com");
    expect(bookingForm.props("embedded")).toBe(true);
  });
});
