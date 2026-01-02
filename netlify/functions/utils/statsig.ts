const STATSIG_API_URL = "https://statsigapi.net/console/v1";
const API_VERSION = "20240601";

type StatsigApiResponse = { readonly data?: UnknownJson; readonly message?: string };

export const getExperiment = async (
  experimentId: string,
  apiKey: string,
): Result<UnknownJson | null> => {
  const response = await fetch(`${STATSIG_API_URL}/experiments/${experimentId}`, {
    headers: {
      "STATSIG-API-KEY": apiKey,
      "STATSIG-API-VERSION": API_VERSION,
    },
  });

  if (response.status === 404) {
    return { success: true, result: null };
  }
  if (!response.ok) {
    return { success: false, error: await response.text() };
  }

  const result = (await response.json()) as StatsigApiResponse;

  return { success: true, result: result.data ?? {} };
};

export const listExperiments = async (apiKey: string): Result<UnknownJson> => {
  const response = await fetch(`${STATSIG_API_URL}/experiments`, {
    headers: {
      "STATSIG-API-KEY": apiKey,
      "STATSIG-API-VERSION": API_VERSION,
    },
  });

  if (!response.ok) {
    return { success: false, error: await response.text() };
  }

  const result = (await response.json()) as UnknownJson;

  return { success: true, result };
};

type CreateParams = Readonly<{
  name: string;
  hypothesis?: string;
  description?: string;
}>;

export const createExperiment = async (
  apiKey: string,
  params: CreateParams,
): Result<UnknownJson> => {
  const response = await fetch(`${STATSIG_API_URL}/experiments`, {
    method: "POST",
    headers: {
      "STATSIG-API-KEY": apiKey,
      "STATSIG-API-VERSION": API_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: params.name,
      idType: "userID",
      hypothesis: params.hypothesis ?? "",
      description: params.description ?? "",
      groups: [
        { name: "control", size: 50, parameterValues: { variant: "control" } },
        { name: "test", size: 50, parameterValues: { variant: "test" } },
      ],
    }),
  });

  if (!response.ok) {
    return { success: false, error: await response.text() };
  }

  const result = (await response.json()) as StatsigApiResponse;

  return { success: true, result: result.data ?? {} };
};

export const concludeExperiment = async (
  experimentId: string,
  winningGroupId: string,
  decisionReason: string,
  apiKey: string,
): Result<null> => {
  try {
    const response = await fetch(`${STATSIG_API_URL}/experiments/${experimentId}/make_decision`, {
      method: "PUT",
      headers: {
        "STATSIG-API-KEY": apiKey,
        "STATSIG-API-VERSION": API_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: winningGroupId,
        decisionReason,
        removeTargeting: false,
      }),
    });

    if (!response.ok) {
      const data = (await response.json()) as StatsigApiResponse;
      return {
        success: false,
        error: data.message ?? `Failed to conclude experiment: ${response.status}`,
      };
    }

    return { success: true, result: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error concluding experiment",
    };
  }
};

type Result<R> = Promise<
  Readonly<{ success: true; result: R } | { success: false; error: string }>
>;

type UnknownJson = Readonly<Record<string, unknown>>;
