import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { syncRun } from "@kontent-ai/data-ops";
import { config } from "dotenv";
import { createExperimentContentType } from "./contentTypeTemplate.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_CODENAME = "statsig_experiment";

type Config = Readonly<{
  environmentId: string;
  apiKey: string;
  customElementUrl: string;
  codename: string;
}>;

const loadConfig = (): Config => {
  config();

  const environmentId = process.env.KONTENT_ENVIRONMENT_ID;
  const apiKey = process.env.KONTENT_MANAGEMENT_API_KEY;
  const customElementUrl = process.env.CUSTOM_ELEMENT_URL;
  const codename = process.env.CONTENT_TYPE_CODENAME ?? DEFAULT_CODENAME;

  const missingVars = [
    !environmentId && "KONTENT_ENVIRONMENT_ID",
    !apiKey && "KONTENT_MANAGEMENT_API_KEY",
    !customElementUrl && "CUSTOM_ELEMENT_URL",
  ].filter(Boolean);

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(", ")}`);
    process.exit(1);
  }

  if (!(environmentId && apiKey && customElementUrl)) {
    throw new Error("Missing required environment variables");
  }

  if (!customElementUrl.startsWith("https://")) {
    console.error("CUSTOM_ELEMENT_URL must use HTTPS");
    process.exit(1);
  }

  return {
    environmentId,
    apiKey,
    customElementUrl,
    codename,
  };
};

const main = async (): Promise<void> => {
  const cfg = loadConfig();

  const contentType = createExperimentContentType(cfg.codename, cfg.customElementUrl);

  const tmpDir = path.join(__dirname, "tmp");
  await fs.mkdir(tmpDir, { recursive: true });

  await fs.writeFile(
    path.join(tmpDir, "contentTypes.json"),
    JSON.stringify([contentType], null, 2),
  );

  await fs.writeFile(path.join(tmpDir, "contentTypeSnippets.json"), "[]");
  await fs.writeFile(path.join(tmpDir, "taxonomyGroups.json"), "[]");

  console.log(`Syncing content type "${cfg.codename}" to environment ${cfg.environmentId}...`);

  try {
    await syncRun({
      targetEnvironmentId: cfg.environmentId,
      targetApiKey: cfg.apiKey,
      folderName: tmpDir,
      entities: {
        contentTypes: (ct) => ct.codename === cfg.codename,
        contentTypeSnippets: () => false,
        taxonomies: () => false,
      },
    });

    console.log("Content type synced successfully!");
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
};

main().catch((error) => {
  console.error("Sync failed:", error);
  process.exit(1);
});
