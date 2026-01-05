import type { IDeliveryClient } from "@kontent-ai/delivery-sdk";
import type {
  ContentTypeModels,
  ElementModels,
  LanguageVariantElements,
  LanguageVariantModels,
  ManagementClient,
} from "@kontent-ai/management-sdk";
import type { ComponentSearchResult, ExperimentScenario } from "../../../src/types/index.ts";
import { emptyUuid } from "./constants.ts";

const withErrorCatch =
  (scenario: string) =>
  <Res extends Unpromisify<Result<unknown>>, Args extends unknown[]>(
    fn: (...args: Args) => Res | Promise<Res>,
  ) =>
  async (...args: Args): Promise<Res> => {
    try {
      return await fn(...args);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : `Unknown error ${scenario}`,
      } as Res;
    }
  };

type UsageInfo = {
  readonly itemId: string;
  readonly itemCodename: string;
};

export const findExperimentUsages = withErrorCatch("finding usages")(
  async (client: IDeliveryClient, itemCodename: string): Result<ReadonlyArray<UsageInfo>> => {
    const response = await client.itemUsedIn(itemCodename).toAllPromise();

    const usages = response.data.items.map((item) => ({
      itemId: item.system.id,
      itemCodename: item.system.codename,
    }));

    return { success: true, result: usages };
  },
);

export const getWinningVariantItems = withErrorCatch("getting winning variant items")(
  (
    variant: LanguageVariantModels.ContentItemLanguageVariant,
    winningVariant: "control" | "test",
  ): SyncResult<ReadonlyArray<string>> => {
    const variantElement = variant.elements.find((el) => el.element.codename === winningVariant);

    if (!variantElement) {
      return { success: true, result: [] };
    }

    const linkedItems = variantElement.value as ReadonlyArray<{ id: string }>;
    const itemIds = linkedItems.map((item) => item.id);

    return { success: true, result: itemIds };
  },
);

export const replaceExperimentReference = withErrorCatch("replacing experiment reference")(
  async (
    client: ManagementClient,
    variant: LanguageVariantModels.ContentItemLanguageVariant,
    parentItemId: string,
    experimentItemId: string,
    winningItemIds: ReadonlyArray<string>,
  ): Result<null> => {
    // Try to create a new version (will fail if already in draft, which is fine)
    try {
      await client
        .createNewVersionOfLanguageVariant()
        .byItemId(parentItemId)
        .byLanguageId(emptyUuid)
        .toPromise();
    } catch {
      // Item might already be in draft - continue
    }

    const updatedElements = variant.elements.map((element) => {
      const elementInfo = element.element;
      const value = element.value;

      if (Array.isArray(value) && value.every((v) => typeof v === "object" && "id" in v)) {
        const linkedItems = value as ReadonlyArray<{ id: string }>;
        const experimentIndex = linkedItems.findIndex((item) => item.id === experimentItemId);

        if (experimentIndex === -1) {
          return element;
        }
        const newValue = [
          ...linkedItems.slice(0, experimentIndex),
          ...winningItemIds.map((id) => ({ id })),
          ...linkedItems.slice(experimentIndex + 1),
        ];

        return {
          element: elementInfo,
          value: newValue,
        };
      }

      if (typeof value === "string" && value.includes(experimentItemId)) {
        const winningItemsHtml = winningItemIds
          .map(
            (id) =>
              `<object type="application/kenticocloud" data-type="item" data-id="${id}"></object>`,
          )
          .join("");

        const componentPattern = new RegExp(
          `<object[^>]*data-type="(?:component|item)"[^>]*data-id="${experimentItemId}"[^>]*></object>`,
          "g",
        );

        const newValue = value.replace(componentPattern, winningItemsHtml);

        return {
          element: elementInfo,
          value: newValue,
        };
      }

      return element;
    });

    await client
      .upsertLanguageVariant()
      .byItemId(parentItemId)
      .byLanguageId(emptyUuid)
      .withData(() => ({
        elements: updatedElements as LanguageVariantElements.ILanguageVariantElementBase[],
      }))
      .toPromise();

    return { success: true, result: null };
  },
);

export const deleteExperimentItem = withErrorCatch("deleting experiment item")(
  async (client: ManagementClient, experimentItemId: string): Result<null> =>
    client
      .deleteContentItem()
      .byItemId(experimentItemId)
      .toPromise()
      .then(() => ({ success: true, result: null })),
);

type Result<R> = Promise<SyncResult<R>>;

type SyncResult<R> = Readonly<{ success: true; result: R } | { success: false; error: string }>;

type ExperimentElementValue = {
  readonly experimentId: string;
};

const parseExperimentValue = (value: unknown): ExperimentElementValue | null => {
  if (typeof value !== "string") {
    return null;
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    if (typeof parsed === "object" && parsed !== null && "experimentId" in parsed) {
      return parsed as ExperimentElementValue;
    }
    return null;
  } catch {
    return null;
  }
};

const extractLinkedItemIds = (value: unknown): ReadonlyArray<string> => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter(
      (item): item is { readonly id: string } =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        typeof (item as { id: unknown }).id === "string",
    )
    .map((item) => item.id);
};

const isExperimentComponent = (
  component: ElementModels.ContentItemElementComponent,
  experimentId: string,
  experimentTypeId: string,
  statsigElementId: string,
): boolean => {
  if (component.type.id !== experimentTypeId) {
    return false;
  }
  const statsigElement = component.elements.find((el) => el.element.id === statsigElementId);
  if (!statsigElement) {
    return false;
  }
  const parsedValue = parseExperimentValue(statsigElement.value);

  return parsedValue?.experimentId === experimentId;
};

const searchComponentsForExperiment = (
  components: ReadonlyArray<ElementModels.ContentItemElementComponent>,
  experimentId: string,
  experimentTypeId: string,
  statsigElementId: string,
): ElementModels.ContentItemElementComponent | null => {
  for (const component of components) {
    if (isExperimentComponent(component, experimentId, experimentTypeId, statsigElementId)) {
      return component;
    }

    for (const element of component.elements) {
      const found = searchComponentsForExperiment(
        element.components,
        experimentId,
        experimentTypeId,
        statsigElementId,
      );
      if (found) {
        return found;
      }
    }
  }
  return null;
};

export const replaceComponentWithWinningVariant = withErrorCatch(
  "replacing component with winning variant",
)(
  async (
    client: ManagementClient,
    variant: LanguageVariantModels.ContentItemLanguageVariant,
    parentItemId: string,
    componentId: string,
    elementId: string,
    winningItemIds: ReadonlyArray<string>,
  ): Result<null> => {
    // Try to create a new version (will fail if already in draft, which is fine)
    await client
      .createNewVersionOfLanguageVariant()
      .byItemId(parentItemId)
      .byLanguageId(emptyUuid)
      .toPromise()
      .catch(() => {}); // Item might already be in draft - continue

    const updatedElements = variant.elements.map((element) => {
      if (element.element.id !== elementId) {
        return element;
      }

      const winningItemsHtml = winningItemIds
        .map(
          (id) =>
            `<object type="application/kenticocloud" data-type="item" data-id="${id}"></object>`,
        )
        .join("");

      const componentPattern = new RegExp(
        `<object[^>]*data-type="component"[^>]*data-id="${componentId}"[^>]*></object>`,
        "g",
      );

      const replacePatternInString = <V>(val: V): V => {
        return typeof val === "string"
          ? (val.replace(componentPattern, winningItemsHtml) as V)
          : val;
      };

      const processComponentsRecursively = (
        comps: ReadonlyArray<ElementModels.ContentItemElementComponent>,
      ): Array<ElementModels.ContentItemElementComponent> =>
        comps
          .filter((c) => c.id !== componentId)
          .map((c) => ({
            ...c,
            elements: c.elements.map((el) => ({
              ...el,
              value: replacePatternInString(el.value),
              components: processComponentsRecursively(el.components),
            })),
          }));

      const newValue = replacePatternInString(element.value);

      const newComponents = processComponentsRecursively(element.components);

      return {
        element: element.element,
        value: newValue,
        components: newComponents,
      };
    });

    await client
      .upsertLanguageVariant()
      .byItemId(parentItemId)
      .byLanguageId(emptyUuid)
      .withData(() => ({
        elements: updatedElements as LanguageVariantElements.ILanguageVariantElementBase[],
      }))
      .toPromise();

    return { success: true, result: null };
  },
);

export const findComponentWithExperiment = withErrorCatch("finding component with experiment")(
  (
    variant: LanguageVariantModels.ContentItemLanguageVariant,
    experimentType: ContentTypeModels.ContentType,
    experimentId: string,
    winningVariant: "control" | "test",
  ): SyncResult<ComponentSearchResult | null> => {
    const experimentCustomElementId =
      experimentType.elements.find((el) => el.codename === "statsig_a_b_testing")?.id ?? "";
    const experimentWinningVariantElementId =
      experimentType.elements.find((el) => el.codename === winningVariant)?.id ?? "";

    for (const element of variant.elements) {
      if (element.components.length === 0) {
        continue;
      }

      const foundComponent = searchComponentsForExperiment(
        element.components,
        experimentId,
        experimentType.id,
        experimentCustomElementId,
      );

      if (!foundComponent) {
        continue;
      }

      const variantElement = foundComponent.elements.find(
        (el) => el.element.id === experimentWinningVariantElementId,
      );

      const winningVariantItemIds = variantElement
        ? extractLinkedItemIds(variantElement.value)
        : [];

      return {
        success: true,
        result: {
          elementId: element.element.id ?? "",
          componentId: foundComponent.id,
          winningVariantItemIds,
        },
      };
    }

    return { success: true, result: null };
  },
);

export const determineExperimentScenario = withErrorCatch("determining experiment scenario")(
  async (
    client: ManagementClient,
    itemId: string,
    experimentId: string,
    experimentTypeCodename: string,
  ): Result<ExperimentScenario> => {
    const itemResponse = await client.viewContentItem().byItemId(itemId).toPromise();

    const typeResponse = await client
      .viewContentType()
      .byTypeId(itemResponse.data.type.id)
      .toPromise();

    if (typeResponse.data.codename !== experimentTypeCodename) {
      return {
        success: true,
        result: { type: "component", parentItemId: itemId },
      };
    }

    const variantResponse = await client
      .viewLanguageVariant()
      .byItemId(itemId)
      .byLanguageId(emptyUuid)
      .toPromise();

    const statsigElementId =
      typeResponse.data.elements.find((el) => el.codename === "statsig_a_b_testing")?.id ?? "";

    const statsigElement = variantResponse.data.elements.find(
      (el) => el.element.id === statsigElementId,
    );

    if (!statsigElement) {
      return {
        success: true,
        result: { type: "component", parentItemId: itemId },
      };
    }

    const parsedValue = parseExperimentValue(statsigElement.value);

    if (parsedValue?.experimentId === experimentId) {
      return {
        success: true,
        result: { type: "linked_item", experimentItemId: itemId },
      };
    }

    return {
      success: true,
      result: { type: "component", parentItemId: itemId },
    };
  },
);

type Unpromisify<T> = T extends Promise<infer U> ? U : T;
