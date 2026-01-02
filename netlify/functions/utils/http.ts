import type { HandlerEvent, HandlerResponse } from "@netlify/functions";

export const handleCorsRequests = (
  event: HandlerEvent,
  allowedMethods: ReadonlyArray<string>,
): HandlerResponse | null => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: createCorsHeaders(allowedMethods) };
  }

  if (!allowedMethods.includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers: createCorsHeaders(allowedMethods),
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  return null;
};

const createCorsHeaders = (allowedMethods: ReadonlyArray<string>) => ({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": [...allowedMethods, "OPTIONS"].join(", "),
});

export const expectEnvVars = <VarNames extends ReadonlyArray<string>>(
  allowedMethods: ReadonlyArray<string>,
  varNames: VarNames,
): Readonly<
  { success: true; result: VarValues<VarNames> } | { success: false; response: HandlerResponse }
> => {
  const result = varNames.map((varName) => process.env[varName]);

  const missingVars = result.filter((v) => typeof v !== "string");

  if (missingVars.length) {
    return {
      success: false,
      response: {
        statusCode: 500,
        headers: createCorsHeaders(allowedMethods),
        body: JSON.stringify({
          error: `Environment variables ${missingVars.join(", ")} are not configured.`,
        }),
      },
    };
  }

  return { success: true, result: result as VarValues<VarNames> };
};

export const responses = {
  ok: (result: unknown, allowedMethods: ReadonlyArray<string>) => ({
    statusCode: 200,
    headers: { ...createCorsHeaders(allowedMethods), "Content-Type": "application/json" },
    body: JSON.stringify(result),
  }),
  internalError: (error: string, allowedMethods: ReadonlyArray<string>) => ({
    statusCode: 500,
    headers: createCorsHeaders(allowedMethods),
    body: JSON.stringify({ error }),
  }),
  notFound: (error: string, allowedMethods: ReadonlyArray<string>) => ({
    statusCode: 404,
    headers: createCorsHeaders(allowedMethods),
    body: JSON.stringify({ error }),
  }),
  badRequest: (error: string, allowedMethods: ReadonlyArray<string>) => ({
    statusCode: 400,
    headers: createCorsHeaders(allowedMethods),
    body: JSON.stringify({ error }),
  }),
} as const;

type VarValues<VarNames extends ReadonlyArray<string>> = {
  readonly [key in keyof VarNames]: string;
};

export const parseJsonBody = (body: string | null): unknown => {
  try {
    return JSON.parse(body ?? "{}");
  } catch {
    return null;
  }
};
