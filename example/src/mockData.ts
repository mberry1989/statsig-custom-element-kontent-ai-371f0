const experimentId = import.meta.env.VITE_EXPERIMENT_ID || 'homepage_cta_test';

export type ExperimentVariant = 'control' | 'test';

export type ContentItem = {
  readonly system: {
    readonly id: string;
    readonly codename: string;
    readonly type: string;
  };
  readonly elements: Record<string, unknown>;
};

export const mockRichTextValue = `
<p>Welcome to our website!</p>
<object type="application/kenticocloud" data-type="component" data-id="exp_001"></object>
<p>Thank you for visiting.</p>
`;

export const mockLinkedItems: ReadonlyArray<ContentItem> = [
  {
    system: {
      id: 'exp_001',
      codename: 'homepage_cta_experiment',
      type: 'experiment',
    },
    elements: {
      statsig_a_b_testing: {
        value: JSON.stringify({ experimentId }),
      },
      control: {
        linkedItems: [
          {
            system: {
              id: 'control_001',
              codename: 'control_content',
              type: 'text_block',
            },
            elements: {
              text: { value: 'Sign up for our newsletter!' },
            },
          },
        ],
      },
      test: {
        linkedItems: [
          {
            system: {
              id: 'test_001',
              codename: 'test_content',
              type: 'text_block',
            },
            elements: {
              text: { value: 'Get 20% off when you subscribe today!' },
            },
          },
        ],
      },
    },
  },
];
