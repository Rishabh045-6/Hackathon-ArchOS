import { seed } from "./src/lib/platform/seed";
seed().catch(console.error).then(() => process.exit(0));
