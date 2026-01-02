import { createDeliveryClient, type IDeliveryClient } from "@kontent-ai/delivery-sdk";
import { createManagementClient, type ManagementClient } from "@kontent-ai/management-sdk";
import type { Handler } from "@netlify/functions";
import { z } from "zod";
import { expectEnvVars, handleCorsRequests, parseJsonBody, responses } from "./utils/http.ts";
import {
  deleteExperimentItem,
  determineExperimentScenario,
  findComponentWithExperiment,
  findExperimentUsages,
  getWinningVariantItems,
  replaceComponentWithWinningVariant,
  replaceExperimentReference,
} from "./utils/kontent.ts";
import { concludeExperiment } from "./utils/statsig.ts";

const allowedMethods = ["POST"] as const;

const CleanupExperimentBodySchema = z.object({
  experimentId: z.string().min(1, "Missing experimentId parameter"),
  experimentItemId: z.string().min(1, "Missing experimentItemId parameter"),
  experimentItemCodename: z.string().min(1, "Missing experimentItemCodename parameter"),
  environmentId: z.string().min(1, "Missing environmentId parameter"),
  winningVariant: z.enum(["control", "test"], {
    error: 'winningVariant must be "control" or "test"',
  }),
  variantGroupId: z.string().min(1, "Missing variantGroupId parameter"),
  decisionReason: z.string().min(1, "Missing decisionReason parameter"),
  experimentTypeCodename: z.string().optional().default("experiment"),
});

type CleanupExperimentBody = z.infer<typeof CleanupExperimentBodySchema>;

type CleanupResult = {
  readonly success: boolean;
  readonly statsigConcluded: boolean;
  readonly usagesFound: ReadonlyArray<string> | false;
  readonly usagesReplaced: ReadonlyArray<string>;
  readonly experimentDeleted: boolean;
  readonly errors: ReadonlyArray<{ readonly step: string; readonly message: string }>;
};

export const handler: Handler = async (event) => {
  const corsResponse = handleCorsRequests(event, allowedMethods);
  if (corsResponse) {
    return corsResponse;
  }

  const varsRes = expectEnvVars(allowedMethods, [
    "KONTENT_PREVIEW_API_KEY",
    "KONTENT_MANAGEMENT_API_KEY",
    "STATSIG_CONSOLE_KEY",
  ]);
  if (!varsRes.success) {
    return varsRes.response;
  }
  const [kontentPreviewApiKey, kontentManagementApiKey, statsigApiKey] = varsRes.result;

  const parseResult = CleanupExperimentBodySchema.safeParse(parseJsonBody(event.body));

  if (!parseResult.success) {
    return responses.badRequest(parseResult.error.message, allowedMethods);
  }

  const result = await performCleanup(
    parseResult.data,
    statsigApiKey,
    kontentManagementApiKey,
    kontentPreviewApiKey,
  );

  return result.success
    ? responses.ok(result, allowedMethods)
    : responses.internalError(JSON.stringify(result), allowedMethods);
};

const performCleanup = async (
  body: CleanupExperimentBody,
  statsigApiKey: string,
  kontentManagementApiKey: string,
  kontentPreviewApiKey: string,
): Promise<CleanupResult> => {
  const concludeResult = await concludeExperiment(
    body.experimentId,
    body.variantGroupId,
    body.decisionReason,
    statsigApiKey,
  );

  if (!concludeResult.success) {
    return {
      ...emptyResult,
      errors: [{ step: "statsig_conclude", message: concludeResult.error }],
    };
  }

  const managementClient = createManagementClient({
    environmentId: body.environmentId,
    apiKey: kontentManagementApiKey,
  });

  const deliveryClient = createDeliveryClient({
    environmentId: body.environmentId,
    previewApiKey: kontentPreviewApiKey,
    defaultQueryConfig: {
      usePreviewMode: true,
    },
  });

  const scenarioResult = await determineExperimentScenario(
    managementClient,
    body.experimentItemId,
    body.experimentId,
    body.experimentTypeCodename,
  );

  if (!scenarioResult.success) {
    return {
      ...emptyResult,
      statsigConcluded: true,
      errors: [{ step: "determine_scenario", message: scenarioResult.error }],
    };
  }

  if (scenarioResult.result.type === "linked_item") {
    return performLinkedItemCleanup(body, managementClient, deliveryClient);
  }

  return performComponentCleanup(body, managementClient, scenarioResult.result.parentItemId);
};

const performLinkedItemCleanup = async (
  body: CleanupExperimentBody,
  managementClient: ManagementClient,
  deliveryClient: IDeliveryClient,
): Promise<CleanupResult> => {
  const usagesResult = await findExperimentUsages(deliveryClient, body.experimentItemCodename);

  if (!usagesResult.success) {
    return {
      ...emptyResult,
      statsigConcluded: true,
      errors: [{ step: "find_usages", message: usagesResult.error }],
    };
  }

  const experimentVariant = await managementClient
    .viewLanguageVariant()
    .byItemId(body.experimentItemId)
    .byLanguageCodename("default")
    .toPromise()
    .then((res) => res.data);

  const winningItemsResult = await getWinningVariantItems(experimentVariant, body.winningVariant);

  if (!winningItemsResult.success) {
    return {
      ...emptyResult,
      statsigConcluded: true,
      usagesFound: usagesResult.result.map((u) => u.itemCodename),
      errors: [{ step: "get_winning_items", message: winningItemsResult.error }],
    };
  }

  const replaceResults = await Promise.all(
    usagesResult.result.map(async (usage) => ({
      ...(await replaceExperimentReference(
        managementClient,
        experimentVariant,
        usage.itemId,
        body.experimentItemId,
        winningItemsResult.result,
      )),
      parentCodename: usage.itemCodename,
    })),
  );

  const replaceErrors = replaceResults
    .map((result) =>
      result.success
        ? null
        : {
            step: `replace_${result.parentCodename}`,
            message: result.error,
          },
    )
    .filter(notNull);
  const replaced = replaceResults
    .map((res) => (res.success ? res.parentCodename : null))
    .filter(notNull);

  if (replaceErrors.length) {
    return {
      ...emptyResult,
      statsigConcluded: true,
      usagesFound: usagesResult.result.map((u) => u.itemCodename),
      usagesReplaced: replaced,
      errors: replaceErrors,
    };
  }

  const deleteResult = await deleteExperimentItem(managementClient, body.experimentItemId);

  if (!deleteResult.success) {
    return {
      ...emptyResult,
      statsigConcluded: true,
      usagesFound: usagesResult.result.map((u) => u.itemCodename),
      usagesReplaced: replaced,
      errors: [{ step: "delete_experiment", message: deleteResult.error }],
    };
  }

  return {
    success: true,
    statsigConcluded: true,
    usagesFound: usagesResult.result.map((u) => u.itemCodename),
    usagesReplaced: replaced,
    experimentDeleted: true,
    errors: [],
  };
};

const performComponentCleanup = async (
  body: CleanupExperimentBody,
  managementClient: ManagementClient,
  parentItemId: string,
): Promise<CleanupResult> => {
  const experimentVariant = await managementClient
    .viewLanguageVariant()
    .byItemId(body.experimentItemId)
    .byLanguageCodename("default")
    .toPromise()
    .then((res) => res.data);

  const experimentType = await managementClient
    .viewContentType()
    .byTypeCodename(body.experimentTypeCodename)
    .toPromise()
    .then((res) => res.data);

  const componentResult = await findComponentWithExperiment(
    experimentVariant,
    experimentType,
    body.experimentId,
    body.winningVariant,
  );

  if (!(componentResult.success && componentResult.result)) {
    return {
      ...emptyResult,
      statsigConcluded: true,
      errors: [
        {
          step: "find_component",
          message: componentResult.success
            ? `Experiment component not found in parent item ${parentItemId}`
            : componentResult.error,
        },
      ],
    };
  }

  const { componentId, elementId, winningVariantItemIds } = componentResult.result;

  const replaceResult = await replaceComponentWithWinningVariant(
    managementClient,
    experimentVariant,
    parentItemId,
    componentId,
    elementId,
    winningVariantItemIds,
  );

  if (!replaceResult.success) {
    return {
      ...emptyResult,
      statsigConcluded: true,
      usagesFound: [body.experimentItemCodename],
      errors: [{ step: "replace_component", message: replaceResult.error }],
    };
  }

  return {
    success: true,
    statsigConcluded: true,
    usagesFound: [body.experimentItemCodename],
    usagesReplaced: [body.experimentItemCodename],
    experimentDeleted: false,
    errors: [],
  };
};

const emptyResult = {
  success: false,
  statsigConcluded: false,
  usagesFound: false,
  usagesReplaced: [],
  experimentDeleted: false,
  errors: [],
} as const satisfies CleanupResult;

const notNull = <NonNull>(value: NonNull | null): value is NonNull => value !== null;
