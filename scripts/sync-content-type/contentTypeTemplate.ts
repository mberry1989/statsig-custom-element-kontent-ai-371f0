type CustomElement = Readonly<{
  name: string;
  codename: string;
  type: "custom";
  source_url: string;
  allowed_elements: ReadonlyArray<unknown>;
  is_required: boolean;
  is_non_localizable: boolean;
}>;

type ModularContentElement = Readonly<{
  name: string;
  codename: string;
  type: "modular_content";
  allowed_content_types: ReadonlyArray<{ codename: string }>;
  is_required: boolean;
  is_non_localizable: boolean;
}>;

type ContentTypeElement = CustomElement | ModularContentElement;

type ContentTypeDefinition = Readonly<{
  name: string;
  codename: string;
  content_groups: ReadonlyArray<unknown>;
  elements: ReadonlyArray<ContentTypeElement>;
}>;

export const createExperimentContentType = (
  codename: string,
  customElementUrl: string,
): ContentTypeDefinition => ({
  name: "Statsig Experiment",
  codename,
  content_groups: [],
  elements: [
    {
      name: "Statsig A/B Testing",
      codename: "statsig_a_b_testing",
      type: "custom",
      source_url: customElementUrl,
      allowed_elements: [],
      is_required: true,
      is_non_localizable: false,
    },
    {
      name: "Control",
      codename: "control",
      type: "modular_content",
      allowed_content_types: [],
      is_required: false,
      is_non_localizable: false,
    },
    {
      name: "Test",
      codename: "test",
      type: "modular_content",
      allowed_content_types: [],
      is_required: false,
      is_non_localizable: false,
    },
  ],
});
