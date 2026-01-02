import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { importAsync } from "@kontent-ai/migration-toolkit";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

type ContentItem = { readonly system: { readonly codename: string } };
type ContentData = { readonly items: ReadonlyArray<ContentItem> };

const contentItemsPath = resolve(__dirname, "../kontent-ai-data/contentItems.json");
const contentData = JSON.parse(readFileSync(contentItemsPath, "utf-8")) as ContentData;

console.log("Importing content items to Kontent.ai...");
console.log(`Items to import: ${contentData.items.map((item) => item.system.codename).join(", ")}`);

await importAsync({
  environmentId,
  apiKey,
  data: contentData as Parameters<typeof importAsync>[0]["data"],
});

console.log("Content items imported successfully!");
console.log(
  '\nNote: Content items are created in "draft" state. You need to publish them manually in Kontent.ai.',
);
