import "dotenv/config";
import { syncRun } from "@kontent-ai/data-ops";

const environmentId = process.env.VITE_KONTENT_ENVIRONMENT_ID;
const apiKey = process.env.KONTENT_MANAGEMENT_API_KEY;

if (!(environmentId && apiKey)) {
  console.error("Missing required environment variables:");
  if (!environmentId) {
    console.error("  - VITE_KONTENT_ENVIRONMENT_ID");
  }
  if (!apiKey) {
    console.error("  - KONTENT_MANAGEMENT_API_KEY");
  }
  console.error("\nPlease copy .env.template to .env and configure the values.");
  process.exit(1);
}

const OUR_TYPES = ["text_block", "statsig_experiment", "landing_page", "article_page"];

console.log("Syncing content types to Kontent.ai...");
console.log(`Types to sync: ${OUR_TYPES.join(", ")}`);

await syncRun({
  targetEnvironmentId: environmentId,
  targetApiKey: apiKey,
  folderName: "./kontent-ai-data",
  entities: {
    contentTypes: (type) => OUR_TYPES.includes(type.codename),
  },
});

console.log("Content types synced successfully!");
