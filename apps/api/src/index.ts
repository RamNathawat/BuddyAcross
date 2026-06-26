import { env } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`
  🚀 BuddyAcross API running
  ├─ Port:    ${env.PORT}
  ├─ Mode:    ${env.NODE_ENV}
  └─ Health:  http://localhost:${env.PORT}/health
  `);
});
