import { useQuery } from '@tanstack/react-query';
import { deliveryClient } from './kontentClient';
import type { LandingPage, ArticlePage, StatsigExperiment } from './types';

export const useLandingPage = (codename: string) =>
  useQuery({
    queryKey: ['landingPage', codename],
    queryFn: () =>
      deliveryClient
        .item<LandingPage>(codename)
        .depthParameter(3)
        .toPromise()
        .then((response) => response.data.item),
  });

export const useArticlePage = (codename: string) =>
  useQuery({
    queryKey: ['articlePage', codename],
    queryFn: () =>
      deliveryClient
        .item<ArticlePage>(codename)
        .depthParameter(3)
        .toPromise()
        .then((response) => response.data.item),
  });

export const getLinkedItemsMap = <T extends StatsigExperiment>(
  linkedItems: ReadonlyArray<T>
): ReadonlyMap<string, T> => {
  return new Map(linkedItems.map((item) => [item.system.id, item]));
};
