/**
 * Kontent.ai Custom Element Selectors
 *
 * This file provides helper functions for interacting with Kontent.ai custom element APIs.
 * It was included from the Kontent.ai custom element template for reference.
 *
 * Currently unused in this project - the Statsig A/B Testing custom element only stores
 * an experiment ID and doesn't need to interact with other elements or prompt for selections.
 *
 * These utilities may be useful if you extend this custom element to:
 * - Read values from other elements in the same content item
 * - Prompt users to select content items or assets
 * - Watch for changes in other elements
 *
 * @see https://kontent.ai/learn/docs/custom-elements for Custom Element API documentation
 */
import { useCallback, useEffect, useState } from "react";

export const getElement = async (elementCodename: string): Promise<ElementValue> =>
  new Promise((resolve) => {
    CustomElement.getElementValue(elementCodename, resolve);
  });

export const useElements = (elementCodenames: ReadonlyArray<string>) => {
  const [watchedElements, setWatchedElements] = useState<ReadonlyMap<string, ElementValue> | null>(
    null,
  );

  const updateCodenames = useCallback(
    async (changedCodenames: ReadonlyArray<string>) =>
      Promise.all(changedCodenames.map(getElement))
        .then((els) => zip(changedCodenames, els))
        .then((newEntries) =>
          setWatchedElements((prev) => new Map([...(prev ?? []), ...newEntries])),
        ),
    [],
  );

  useEffect(() => {
    void updateCodenames(elementCodenames);
  }, [elementCodenames, updateCodenames]);

  useEffect(() => {
    CustomElement.observeElementChanges(
      elementCodenames,
      (codenames) => void updateCodenames(codenames),
    );
  }, [elementCodenames, updateCodenames]);

  return watchedElements;
};

export const promptToSelectItems = async (
  params: Readonly<{ allowMultiple: boolean }>,
): Promise<ReadonlyArray<ItemDetail>> =>
  CustomElement.selectItems(params)
    .then(onNonNull(async (items) => CustomElement.getItemDetails(items.map((i) => i.id))))
    .then(withFallback<ReadonlyArray<ItemDetail>>([]));

export const promptToSelectAssets = async (
  params: Readonly<{ allowMultiple: boolean; fileType: "all" | "images" }>,
): Promise<ReadonlyArray<AssetDetail>> =>
  CustomElement.selectAssets(params)
    .then(onNonNull(async (assets) => CustomElement.getAssetDetails(assets.map((a) => a.id))))
    .then(withFallback<ReadonlyArray<AssetDetail>>([]));

type ElementValue = string | ReadonlyArray<MultiChoiceOption>;

const zip = <V1, V2>(arr1: ReadonlyArray<V1>, arr2: ReadonlyArray<V2>): ReadonlyArray<[V1, V2]> =>
  arr1.slice(0, Math.min(arr1.length, arr2.length)).map((el, i) => [el, arr2[i] as V2] as const);

const onNonNull =
  <V, Res>(fnc: (v: V) => Res) =>
  (v: V | null): Res | null =>
    v === null ? null : fnc(v);

const withFallback =
  <V>(fallbackValue: V) =>
  (v: V | null) =>
    v ?? fallbackValue;
