import { DeliveryClient } from "@kontent-ai/delivery-sdk";

const environmentId = import.meta.env.VITE_KONTENT_ENVIRONMENT_ID;

if (!environmentId) {
  throw new Error(
    "Missing VITE_KONTENT_ENVIRONMENT_ID environment variable. " +
      "Please copy .env.template to .env and configure your Kontent.ai environment ID.",
  );
}

export const deliveryClient = new DeliveryClient({
  environmentId,
});
