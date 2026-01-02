// The value stores the Statsig experiment ID
export type Value = Readonly<{
  experimentId: string;
}>;

export const parseValue = (input: string | null): Value | null | "invalidValue" => {
  if (input === null) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(input);

    return isValidValue(parsedValue) ? parsedValue : "invalidValue";
  } catch {
    return "invalidValue";
  }
};

const isValidValue = (obj: unknown): obj is Value =>
  typeof obj === "object" &&
  obj !== null &&
  "experimentId" in obj &&
  typeof (obj as Value).experimentId === "string";
