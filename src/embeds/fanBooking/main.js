import { createApp } from "vue";
import { createPinia } from "pinia";
import FanBookingEmbedApp from "@/embeds/fanBooking/FanBookingEmbedApp.vue";
import router from "@/embeds/fanBooking/router.js";
import "@/assets/main.css";

const app = createApp(FanBookingEmbedApp);

app.use(createPinia());
app.use(router);
app.mount("#fan-booking-embed-app");
