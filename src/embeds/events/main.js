import { createApp } from "vue";
import { createPinia } from "pinia";
import EventsEmbedApp from "@/embeds/events/EventsEmbedApp.vue";
import router from "@/embeds/events/router.js";
import "@/assets/main.css";

const app = createApp(EventsEmbedApp);

app.use(createPinia());
app.use(router);
app.mount("#events-embed-app");
