import type { Handler, HandlerEvent } from "@netlify/functions";
import { expectEnvVars, handleCorsRequests, responses } from "./utils/http.ts";
import { getExperiment } from "./utils/statsig.ts";

const allowedMethods = ["GET"] as const;

export const handler: Handler = async (event: HandlerEvent) => {
  const corsResponse = handleCorsRequests(event, allowedMethods);
  if (corsResponse) {
    return corsResponse;
  }

  const id = event.queryStringParameters?.id;
  if (!id) {
    return responses.badRequest("Missing id parameter", allowedMethods);
  }

  const varsRes = expectEnvVars(allowedMethods, ["STATSIG_CONSOLE_KEY"]);
  if (!varsRes.success) {
    return varsRes.response;
  }
  const [apiKey] = varsRes.result;

  const result = await getExperiment(id, apiKey);

  if (!result.success) {
    return responses.internalError(`Statsig API error: ${result.error}`, allowedMethods);
  }

  if (result.result === null) {
    return responses.notFound("Experiment not found", allowedMethods);
  }

  return responses.ok(result.result, allowedMethods);
};
