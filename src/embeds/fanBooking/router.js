import { createMemoryHistory, createRouter } from "vue-router";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: "/",
      name: "fan-booking-embed",
      component: { template: "<div />" },
    },
  ],
});

export default router;
