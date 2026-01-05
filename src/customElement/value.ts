import { z } from "zod";

const ValueSchema = z.object({
  experimentId: z.string(),
});

export type Value = z.infer<typeof ValueSchema>;

export const parseValue = (input: string | null): Value | null | "invalidValue" => {
  if (input === null) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(input);
    const result = ValueSchema.safeParse(parsedValue);
    return result.success ? result.data : "invalidValue";
  } catch {
    return "invalidValue";
  }
};
